import crypto from 'crypto';
import * as db from '../services/db.js';

export const getDemandInsights = async (_req, res) => {
    try {
        const rows = await db.query(
            `SELECT category, COUNT(*) AS request_count, AVG(budget_min) AS average_budget_min,
                    AVG(budget_max) AS average_budget_max, GROUP_CONCAT(DISTINCT preferred_brand) AS preferred_brands
             FROM bot_customer_needs
             WHERE created_at >= datetime('now', '-90 days')
             GROUP BY category ORDER BY request_count DESC LIMIT 30`
        );
        const recent = await db.query(
            `SELECT category, use_case, budget_min, budget_max, preferred_brand, notes, created_at
             FROM bot_customer_needs WHERE created_at >= datetime('now', '-30 days')
             ORDER BY id DESC LIMIT 100`
        );
        const reviewSummary = await db.get(
            `SELECT COUNT(*) AS review_count, AVG(rating) AS average_rating,
                    SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_count
             FROM bot_customer_reviews WHERE created_at >= datetime('now', '-90 days')`
        );
        return res.json({ success: true, data: { by_category: rows, recent, reviews: reviewSummary } });
    } catch (error) {
        console.error('Load Bot demand insights failed:', error);
        return res.status(500).json({ success: false, message: 'Không tải được dữ liệu nhu cầu khách hàng.', data: null });
    }
};

const fail = (res, status, message) => res.status(status).json({ success: false, message, data: null });
const customerMessageBuckets = new Map();
const customerMessageLimited = (key) => {
    const now = Date.now();
    const times = (customerMessageBuckets.get(key) || []).filter((time) => now - time < 60_000);
    times.push(now);
    customerMessageBuckets.set(key, times.slice(-31));
    if (customerMessageBuckets.size > 5000) {
        for (const [bucketKey, bucket] of customerMessageBuckets) {
            if (!bucket.length || now - bucket[bucket.length - 1] > 60_000) customerMessageBuckets.delete(bucketKey);
        }
    }
    return times.length > 30;
};
const redactSensitive = (value) => String(value || '')
    .replace(/(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)/g, '[đã ẩn CCCD]')
    .replace(/(?<!\d)(?:\+?84|0)\d{9}(?!\d)/g, '[đã ẩn số điện thoại]')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);

const verifyAccessKey = (provided, storedHash) => {
    if (typeof provided !== 'string' || provided.length < 40 || !storedHash) return false;
    const providedHash = crypto.createHash('sha256').update(provided).digest();
    const expectedHash = Buffer.from(storedHash, 'hex');
    return providedHash.length === expectedHash.length && crypto.timingSafeEqual(providedHash, expectedHash);
};

const publicRequest = async (id, key) => {
    const ticket = await db.get('SELECT id, access_key_hash, status FROM bot_support_requests WHERE id = ?', [id]);
    return ticket && verifyAccessKey(key, ticket.access_key_hash) ? ticket : null;
};

const positiveId = (value) => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const getNotificationSummary = async (req, res) => {
    try {
        const summary = await db.get(
            `SELECT
                (SELECT COUNT(*) FROM bot_support_requests WHERE status = 'open') AS pending_count,
                (SELECT COUNT(*)
                 FROM bot_support_messages m
                 JOIN bot_support_requests r ON r.id = m.request_id
                 LEFT JOIN bot_support_staff_reads sr ON sr.request_id = r.id AND sr.staff_id = ?
                 WHERE r.status = 'in_progress' AND r.assigned_staff_id = ?
                   AND m.sender_type = 'customer' AND m.id > COALESCE(sr.last_read_message_id, 0)) AS unread_message_count`,
            [req.user.id, req.user.id]);
        const pendingCount = Number(summary?.pending_count) || 0;
        const unreadMessageCount = Number(summary?.unread_message_count) || 0;
        return res.json({
            success: true,
            data: { pending_count: pendingCount, unread_message_count: unreadMessageCount, total: pendingCount + unreadMessageCount }
        });
    } catch (error) {
        console.error('Get bot support notification summary failed:', error);
        return fail(res, 500, 'Không tải được thông báo hỗ trợ Bot.');
    }
};

export const listRequests = async (req, res) => {
    try {
        const requests = await db.query(
            `SELECT r.id, r.customer_name, r.status, r.decision, r.assigned_staff_id,
                    assigned.full_name AS assigned_staff_name,
                    CASE WHEN r.assigned_staff_id = ? THEN 1 ELSE 0 END AS assigned_to_me,
                    r.created_at, r.updated_at,
                    (SELECT COALESCE(NULLIF(content, ''), CASE WHEN image_url IS NOT NULL THEN '[Ảnh]' END) FROM bot_support_messages m WHERE m.request_id = r.id ORDER BY m.id DESC LIMIT 1) AS last_message,
                    (SELECT sender_type FROM bot_support_messages m WHERE m.request_id = r.id ORDER BY m.id DESC LIMIT 1) AS last_sender_type
             FROM bot_support_requests r LEFT JOIN users assigned ON assigned.id = r.assigned_staff_id
             ORDER BY CASE r.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, r.updated_at DESC
             LIMIT 100`, [req.user.id]);
        return res.json({ success: true, data: requests });
    } catch (error) {
        console.error('List bot support requests failed:', error);
        return fail(res, 500, 'Không tải được danh sách yêu cầu hỗ trợ.');
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        if (!id) return fail(res, 400, 'Mã yêu cầu không hợp lệ.');
        await db.transaction(async () => {
            const ticket = await db.get('SELECT id, status, decision, assigned_staff_id FROM bot_support_requests WHERE id = ?', [id]);
            if (!ticket) throw Object.assign(new Error('Không tìm thấy yêu cầu hỗ trợ.'), { statusCode: 404 });
            if (ticket.status === 'closed' || ticket.decision === 'declined') {
                throw Object.assign(new Error('Yêu cầu này đã kết thúc hoặc bị từ chối.'), { statusCode: 409 });
            }
            if (ticket.assigned_staff_id && Number(ticket.assigned_staff_id) !== Number(req.user.id)) {
                throw Object.assign(new Error('Nhân viên khác đã nhận yêu cầu này.'), { statusCode: 409 });
            }
            if (ticket.decision !== 'accepted') {
                await db.run(
                    "UPDATE bot_support_requests SET status = 'in_progress', decision = 'accepted', assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [req.user.id, id]);
                await db.run(
                    "INSERT INTO bot_support_messages (request_id, sender_type, sender_id, content) VALUES (?, 'system', ?, 'Nhân viên đã nhận và tham gia phiên hỗ trợ.')",
                    [id, req.user.id]);
            }
        });
        return res.json({ success: true, message: 'Bạn đã nhận phiên hỗ trợ.' });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Accept bot support request failed:', error);
        return fail(res, 500, 'Không thể nhận yêu cầu hỗ trợ.');
    }
};

export const declineRequest = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        if (!id) return fail(res, 400, 'Mã yêu cầu không hợp lệ.');
        await db.transaction(async () => {
            const ticket = await db.get('SELECT id, status, decision, assigned_staff_id FROM bot_support_requests WHERE id = ?', [id]);
            if (!ticket) throw Object.assign(new Error('Không tìm thấy yêu cầu hỗ trợ.'), { statusCode: 404 });
            if (ticket.decision === 'accepted' || ticket.status === 'in_progress') {
                throw Object.assign(new Error('Phiên này đã được nhân viên nhận.'), { statusCode: 409 });
            }
            if (ticket.status === 'closed') return;
            if (ticket.assigned_staff_id && Number(ticket.assigned_staff_id) !== Number(req.user.id)) {
                throw Object.assign(new Error('Nhân viên khác đang xử lý yêu cầu này.'), { statusCode: 409 });
            }
            await db.run(
                "UPDATE bot_support_requests SET status = 'closed', decision = 'declined', assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [req.user.id, id]);
            await db.run(
                "INSERT INTO bot_support_messages (request_id, sender_type, sender_id, content) VALUES (?, 'system', ?, 'Nhân viên hiện chưa thể tiếp nhận phiên hỗ trợ. Phiên trò chuyện đã kết thúc.')",
                [id, req.user.id]);
        });
        return res.json({ success: true, message: 'Đã từ chối yêu cầu hỗ trợ.' });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Decline bot support request failed:', error);
        return fail(res, 500, 'Không thể từ chối yêu cầu hỗ trợ.');
    }
};

export const getStaffMessages = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        if (!id) return fail(res, 400, 'Mã yêu cầu không hợp lệ.');
        const exists = await db.get('SELECT id FROM bot_support_requests WHERE id = ?', [id]);
        if (!exists) return fail(res, 404, 'Không tìm thấy yêu cầu hỗ trợ.');
        const afterId = Math.max(0, Number(req.query.after) || 0);
        const messages = await db.query(
            'SELECT id, sender_type, sender_id, content, image_url, created_at FROM bot_support_messages WHERE request_id = ? AND id > ? ORDER BY id ASC LIMIT 200',
            [id, afterId]);
        if (messages.length) {
            const lastReadMessageId = Math.max(...messages.map((message) => Number(message.id) || 0));
            await db.run(
                `INSERT INTO bot_support_staff_reads (request_id, staff_id, last_read_message_id)
                 VALUES (?, ?, ?)
                 ON CONFLICT(request_id, staff_id) DO UPDATE SET
                   last_read_message_id = MAX(last_read_message_id, excluded.last_read_message_id),
                   updated_at = CURRENT_TIMESTAMP`,
                [id, req.user.id, lastReadMessageId]);
        }
        return res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get bot support messages failed:', error);
        return fail(res, 500, 'Không tải được nội dung hỗ trợ.');
    }
};

export const sendStaffMessage = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        const content = redactSensitive(req.body?.content).trim();
        const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;
        if (!id || (!content && !imageUrl) || content.length > 1000) return fail(res, 400, 'Tin nhắn không hợp lệ hoặc vượt quá 1.000 ký tự.');
        let message;
        await db.transaction(async () => {
            const ticket = await db.get('SELECT id, status, decision, assigned_staff_id FROM bot_support_requests WHERE id = ?', [id]);
            if (!ticket) throw Object.assign(new Error('Không tìm thấy yêu cầu hỗ trợ.'), { statusCode: 404 });
            if (ticket.status !== 'in_progress' || ticket.decision !== 'accepted' || Number(ticket.assigned_staff_id) !== Number(req.user.id)) {
                throw Object.assign(new Error('Bạn cần nhận phiên này trước khi trả lời.'), { statusCode: 409 });
            }
            const result = await db.run(
                'INSERT INTO bot_support_messages (request_id, sender_type, sender_id, content, image_url) VALUES (?, \'staff\', ?, ?, ?)',
                [id, req.user.id, content, imageUrl]);
            await db.run('UPDATE bot_support_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
            message = await db.get('SELECT id, sender_type, sender_id, content, image_url, created_at FROM bot_support_messages WHERE id = ?', [result.lastID]);
        });
        return res.status(201).json({ success: true, data: message });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Send staff support message failed:', error);
        return fail(res, 500, 'Không gửi được tin nhắn.');
    }
};

export const closeRequest = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        if (!id) return fail(res, 400, 'Mã yêu cầu không hợp lệ.');
        await db.transaction(async () => {
            const ticket = await db.get('SELECT id, status, decision, assigned_staff_id FROM bot_support_requests WHERE id = ?', [id]);
            if (!ticket) throw Object.assign(new Error('Không tìm thấy yêu cầu hỗ trợ.'), { statusCode: 404 });
            if (ticket.status === 'closed') return;
            if (ticket.status !== 'in_progress' || ticket.decision !== 'accepted' || Number(ticket.assigned_staff_id) !== Number(req.user.id)) {
                throw Object.assign(new Error('Chỉ nhân viên đã nhận phiên mới có thể kết thúc phiên.'), { statusCode: 409 });
            }
            await db.run("UPDATE bot_support_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
            await db.run(
                "INSERT INTO bot_support_messages (request_id, sender_type, sender_id, content) VALUES (?, 'system', ?, 'Nhân viên đã kết thúc phiên hỗ trợ.')",
                [id, req.user.id]);
        });
        return res.json({ success: true, message: 'Đã đóng yêu cầu hỗ trợ.' });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Close bot support request failed:', error);
        return fail(res, 500, 'Không đóng được yêu cầu hỗ trợ.');
    }
};

export const getCustomerMessages = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        const ticket = id && await publicRequest(id, req.get('X-Support-Key'));
        if (!ticket) return fail(res, 404, 'Không tìm thấy phiên hỗ trợ.');
        const afterId = Math.max(0, Number(req.query.after) || 0);
        const messages = await db.query(
            'SELECT id, sender_type, content, image_url, created_at FROM bot_support_messages WHERE request_id = ? AND id > ? ORDER BY id ASC LIMIT 200',
            [id, afterId]);
        return res.json({ success: true, data: { status: ticket.status, messages } });
    } catch (error) {
        console.error('Get customer support messages failed:', error);
        return fail(res, 500, 'Không tải được tin nhắn hỗ trợ.');
    }
};

export const sendCustomerMessage = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        const ticket = id && await publicRequest(id, req.get('X-Support-Key'));
        if (!ticket) return fail(res, 404, 'Không tìm thấy phiên hỗ trợ.');
        if (ticket.status === 'closed') return fail(res, 409, 'Phiên hỗ trợ đã kết thúc.');
        if (customerMessageLimited(`${id}:${req.ip}`)) return fail(res, 429, 'Bạn gửi tin nhắn quá nhanh. Vui lòng chờ một chút.');
        const rawContent = String(req.body?.content || '').trim();
        const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;
        if (/(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)|(?<!\d)(?:\+?84|0)\d{9}(?!\d)/.test(rawContent)) {
            return fail(res, 400, 'Không gửi số điện thoại hoặc CCCD trong chat.');
        }
        if ((!rawContent && !imageUrl) || rawContent.length > 1000) return fail(res, 400, 'Tin nhắn cần có nội dung hoặc ảnh và tối đa 1.000 ký tự.');
        const content = redactSensitive(rawContent);
        const result = await db.run(
            "INSERT INTO bot_support_messages (request_id, sender_type, content, image_url) VALUES (?, 'customer', ?, ?)", [id, content, imageUrl]);
        await db.run('UPDATE bot_support_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        const message = await db.get('SELECT id, sender_type, content, image_url, created_at FROM bot_support_messages WHERE id = ?', [result.lastID]);
        return res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('Send customer support message failed:', error);
        return fail(res, 500, 'Không gửi được tin nhắn.');
    }
};

export const closeCustomerSession = async (req, res) => {
    try {
        const id = positiveId(req.params.id);
        const ticket = id && await publicRequest(id, req.get('X-Support-Key'));
        if (!ticket) return fail(res, 404, 'Không tìm thấy phiên hỗ trợ.');
        if (ticket.status === 'closed') {
            return res.json({ success: true, message: 'Phiên hỗ trợ đã kết thúc.' });
        }
        await db.transaction(async () => {
            const current = await db.get('SELECT status FROM bot_support_requests WHERE id = ?', [id]);
            if (!current || current.status === 'closed') return;
            await db.run("UPDATE bot_support_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
            await db.run(
                "INSERT INTO bot_support_messages (request_id, sender_type, content) VALUES (?, 'system', 'Khách hàng đã kết thúc phiên hỗ trợ.')",
                [id]);
        });
        return res.json({ success: true, message: 'Đã kết thúc phiên hỗ trợ. Bạn có thể tiếp tục trò chuyện với bot.' });
    } catch (error) {
        console.error('Close customer support session failed:', error);
        return fail(res, 500, 'Chưa kết thúc được phiên hỗ trợ. Vui lòng thử lại.');
    }
};

export const createRequest = async (req, res) => {
    try {
        const accessKey = crypto.randomBytes(32).toString('base64url');
        const accessKeyHash = crypto.createHash('sha256').update(accessKey).digest('hex');
        const customer = req.botUser?.role === 'customer' ? req.botUser : null;
        const context = redactSensitive(req.body?.context);
        let requestId;
        let lastMessageId;
        await db.transaction(async () => {
            const created = await db.run(
                'INSERT INTO bot_support_requests (access_key_hash, customer_account_id, customer_name) VALUES (?, ?, ?)',
                [accessKeyHash, customer?.id || null, customer?.full_name || 'Khách vãng lai']);
            requestId = created.lastID;
            const initialMessage = await db.run(
                'INSERT INTO bot_support_messages (request_id, sender_type, content) VALUES (?, ?, ?)',
                [requestId, context ? 'customer' : 'system', context || 'Khách yêu cầu gặp nhân viên.']);
            lastMessageId = initialMessage.lastID;
        });
        return res.status(202).json({
            success: true,
            message: 'Đã mở phiên hỗ trợ. Bạn có thể nhắn tiếp tại đây; nhân viên sẽ trả lời trong cuộc trò chuyện này.',
            data: { request_id: requestId, access_key: accessKey, last_message_id: lastMessageId }
        });
    } catch (error) {
        console.error('Create bot support request failed:', error);
        return fail(res, 500, 'Chưa mở được phiên hỗ trợ, vui lòng thử lại.');
    }
};
