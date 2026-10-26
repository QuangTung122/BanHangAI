import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as db from '../services/db.js';
import { logAction } from './auditController.js';
import { runBotAgent } from '../services/botAgentService.js';
import {
    cancelPendingAction, executePendingAction, peekPendingAction
} from '../services/botActionService.js';
import { parseCommand, publicCommandList, resolveCommand, startText } from '../services/botCommandService.js';
import { runCustomerFallback, runQuickCommand } from '../services/botQuickService.js';
import { createRequest as createBotSupportRequest } from './botSupportController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_banhangai';
const BOT_TOKEN_TTL = '12h';

const rateBuckets = new Map();
const demoRegistrationEnabled = process.env.NODE_ENV !== 'production';

/** Giới hạn tần suất đơn giản theo khóa (bộ nhớ). Trả về true nếu vượt giới hạn. */
const isRateLimited = (key, limit, windowMs) => {
    const now = Date.now();
    const bucket = (rateBuckets.get(key) || []).filter((time) => now - time < windowMs);
    bucket.push(now);
    if (bucket.length > limit + 1) bucket.splice(0, bucket.length - limit - 1);
    rateBuckets.set(key, bucket);
    if (rateBuckets.size > 10000) {
        for (const [bucketKey, timestamps] of rateBuckets) {
            if (!timestamps.some((time) => now - time < windowMs)) rateBuckets.delete(bucketKey);
        }
    }
    return bucket.length > limit;
};

const signBotToken = (payload) => jwt.sign({ ...payload, aud: 'bot' }, JWT_SECRET, { expiresIn: BOT_TOKEN_TTL });
const setCustomerSession = (req, res, token) => {
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `bot_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/api/bot; Max-Age=43200${secure}`);
};
const clearCustomerSession = (req, res) => {
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `bot_session=; HttpOnly; SameSite=Lax; Path=/api/bot; Max-Age=0${secure}`);
};

const fail = (res, status, message) => res.status(status).json({ success: false, message, data: null });

export const requestHumanHelp = async (req, res) => {
    if (isRateLimited(`handoff:${req.ip}`, 3, 10 * 60 * 1000)) {
        return fail(res, 429, 'Bạn đã gửi yêu cầu hỗ trợ gần đây. Vui lòng chờ cửa hàng phản hồi.');
    }
    return createBotSupportRequest(req, res);
};

export const registerCustomer = async (req, res) => {
    try {
        if (demoRegistrationEnabled) {
            return fail(res, 400, 'Bản demo không cần OTP. Hãy gửi trực tiếp biểu mẫu tạo tài khoản.');
        }
        const phone = String(req.body?.phone || '').trim();
        if (!/^\d{10}$/.test(phone)) return fail(res, 400, 'Số điện thoại phải gồm 10 chữ số.');
        if (isRateLimited(`register:${req.ip}`, 5, 10 * 60 * 1000) || isRateLimited(`register-phone:${phone}`, 3, 10 * 60 * 60 * 1000)) {
            return fail(res, 429, 'Bạn đã yêu cầu mã xác minh quá nhiều lần. Vui lòng thử lại sau.');
        }

        const gatewayUrl = process.env.SMS_GATEWAY_URL;
        const gatewayToken = process.env.SMS_GATEWAY_TOKEN;
        const otpSecret = process.env.BOT_OTP_SECRET;
        if (!otpSecret || otpSecret.length < 32) {
            return fail(res, 503, 'Tính năng đăng ký đang chờ cấu hình khóa OTP bảo mật. Vui lòng liên hệ cửa hàng.');
        }
        if (!gatewayUrl || !gatewayToken) {
            return fail(res, 503, 'Tính năng đăng ký đang chờ cấu hình cổng gửi SMS bảo mật. Vui lòng liên hệ cửa hàng.');
        }
        let parsedGatewayUrl;
        try { parsedGatewayUrl = new URL(gatewayUrl); } catch { return fail(res, 503, 'Cổng gửi SMS chưa được cấu hình hợp lệ.'); }
        if (parsedGatewayUrl.protocol !== 'https:' && process.env.NODE_ENV !== 'development') {
            return fail(res, 503, 'Cổng gửi SMS cần sử dụng HTTPS.');
        }

        const existingChallenge = await db.get(
            "SELECT phone FROM bot_phone_verifications WHERE phone = ? AND last_sent_at > datetime('now', '-60 seconds')", [phone]);
        if (existingChallenge) return fail(res, 429, 'Vui lòng chờ 60 giây trước khi yêu cầu mã mới.');

        const ipHash = crypto.createHmac('sha256', otpSecret).update(String(req.ip || 'unknown')).digest('hex');
        await db.transaction(async () => {
            await db.run("DELETE FROM bot_otp_send_log WHERE created_at < datetime('now', '-1 day')");
            const phoneCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE phone = ? AND created_at >= datetime('now', '-1 day')", [phone]);
            const ipHourCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')", [ipHash]);
            const ipDayCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE ip_hash = ? AND created_at >= datetime('now', '-1 day')", [ipHash]);
            if (phoneCount.total >= 5 || ipHourCount.total >= 5 || ipDayCount.total >= 15) {
                throw Object.assign(new Error('Đã vượt số lần yêu cầu mã xác minh cho phép. Vui lòng thử lại sau.'), { statusCode: 429 });
            }
            await db.run('INSERT INTO bot_otp_send_log (phone, ip_hash) VALUES (?, ?)', [phone, ipHash]);
        });

        const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        const otpHash = crypto.createHmac('sha256', otpSecret).update(`${phone}:${otp}`).digest('hex');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let smsResponse;
        try {
            smsResponse = await fetch(parsedGatewayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gatewayToken}` },
                body: JSON.stringify({ to: phone, message: `Ma xac minh BanHangAI: ${otp}. Ma co hieu luc trong 5 phut.` }),
                signal: controller.signal
            });
        } finally { clearTimeout(timeout); }
        if (!smsResponse.ok) {
            console.error('Bot SMS gateway rejected verification message:', smsResponse.status);
            return fail(res, 502, 'Chưa gửi được mã xác minh. Vui lòng thử lại sau.');
        }
        await db.run(
            `INSERT INTO bot_phone_verifications (phone, otp_hash, expires_at, attempts, last_sent_at)
             VALUES (?, ?, datetime('now', '+5 minutes'), 0, CURRENT_TIMESTAMP)
             ON CONFLICT(phone) DO UPDATE SET otp_hash = excluded.otp_hash, expires_at = excluded.expires_at,
               attempts = 0, last_sent_at = CURRENT_TIMESTAMP`, [phone, otpHash]);
        return res.status(202).json({ success: true, message: 'Nếu gửi được SMS, mã xác minh sẽ đến số điện thoại của bạn.' });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Bot register error:', error);
        return fail(res, 500, 'Chưa thể gửi mã xác minh lúc này.');
    }
};

export const verifyCustomerRegistration = async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        const fullName = String(req.body?.full_name || '').trim();
        const phone = String(req.body?.phone || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const address = String(req.body?.address || '').replace(/[<>]/g, '').trim().replace(/\s+/g, ' ');
        const code = String(req.body?.code || '').trim();
        const requiresOtp = !demoRegistrationEnabled;
        if ((phone && !/^\d{10}$/.test(phone)) || (requiresOtp && (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)))) {
            return fail(res, 400, 'Số điện thoại hoặc mã xác minh không hợp lệ.');
        }
        if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) return fail(res, 400, 'Tên đăng nhập 3-30 ký tự, chỉ gồm chữ, số, dấu chấm hoặc gạch dưới.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(res, 400, 'Vui lòng nhập địa chỉ email hợp lệ.');
        if (address.length < 10 || address.length > 250) return fail(res, 400, 'Địa chỉ cần từ 10 đến 250 ký tự.');
        const minimumPasswordLength = demoRegistrationEnabled ? 6 : 10;
        if (password.length < minimumPasswordLength || password.length > 72) {
            return fail(res, 400, `Mật khẩu cần từ ${minimumPasswordLength} đến 72 ký tự.`);
        }
        if (fullName.length < 2 || fullName.length > 120) return fail(res, 400, 'Vui lòng nhập họ tên hợp lệ.');
        const registrationLimitKey = demoRegistrationEnabled ? `demo-register:${req.ip}` : `verify-register:${req.ip}:${phone}`;
        if (isRateLimited(registrationLimitKey, demoRegistrationEnabled ? 12 : 8, 10 * 60 * 1000)) {
            return fail(res, 429, demoRegistrationEnabled
                ? 'Bạn đã tạo quá nhiều tài khoản demo. Vui lòng thử lại sau.'
                : 'Bạn nhập mã sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
        }

        let challenge = null;
        if (requiresOtp) {
            challenge = await db.get('SELECT otp_hash, expires_at, attempts FROM bot_phone_verifications WHERE phone = ?', [phone]);
            if (!challenge || new Date(`${challenge.expires_at.replace(' ', 'T')}Z`).getTime() < Date.now() || challenge.attempts >= 5) {
                return fail(res, 400, 'Mã xác minh đã hết hạn hoặc không còn hiệu lực. Hãy yêu cầu mã mới.');
            }
            const otpSecret = process.env.BOT_OTP_SECRET;
            if (!otpSecret) return fail(res, 503, 'Tính năng đăng ký đang chờ cấu hình bảo mật.');
            const suppliedHash = crypto.createHmac('sha256', otpSecret).update(`${phone}:${code}`).digest('hex');
            const expected = Buffer.from(challenge.otp_hash, 'hex');
            const supplied = Buffer.from(suppliedHash, 'hex');
            if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
                await db.run('UPDATE bot_phone_verifications SET attempts = attempts + 1 WHERE phone = ?', [phone]);
                return fail(res, 400, 'Mã xác minh không chính xác.');
            }
        }

        const duplicate = await db.get(
            'SELECT 1 AS found FROM users WHERE username = ? UNION SELECT 1 FROM customer_accounts WHERE username = ?', [username, username]);
        if (duplicate) return fail(res, 409, 'Tên đăng nhập đã tồn tại.');
        const passwordHash = await bcrypt.hash(password, 12);
        let account;
        await db.transaction(async () => {
            if (requiresOtp) {
                const currentChallenge = await db.get(
                    'SELECT otp_hash, expires_at, attempts FROM bot_phone_verifications WHERE phone = ? AND expires_at > CURRENT_TIMESTAMP', [phone]);
                if (!currentChallenge || currentChallenge.otp_hash !== challenge.otp_hash || currentChallenge.attempts >= 5) {
                    throw Object.assign(new Error('Mã xác minh đã được sử dụng hoặc không còn hiệu lực.'), { statusCode: 400 });
                }
                await db.run('DELETE FROM bot_phone_verifications WHERE phone = ?', [phone]);
            }
            let customer = phone ? await db.get('SELECT id, full_name FROM customers WHERE phone = ?', [phone]) : null;
            if (customer) {
                const linked = await db.get('SELECT id FROM customer_accounts WHERE customer_id = ?', [customer.id]);
                if (linked) throw Object.assign(new Error('Số điện thoại này đã được liên kết với tài khoản khác.'), { statusCode: 409 });
                await db.run('UPDATE customers SET email = COALESCE(NULLIF(email, ?), ?), address = COALESCE(NULLIF(address, ?), ?) WHERE id = ?', ['', email, '', address, customer.id]);
            } else {
                const created = await db.run('INSERT INTO customers (full_name, phone, email, address) VALUES (?, ?, ?, ?)', [fullName, phone || null, email, address]);
                customer = { id: created.lastID, full_name: fullName };
            }
            const inserted = await db.run(
                'INSERT INTO customer_accounts (customer_id, username, password_hash) VALUES (?, ?, ?)', [customer.id, username, passwordHash]);
            account = { id: inserted.lastID, customer_id: customer.id, full_name: customer.full_name };
        });

        await logAction(null, 'AUTH', demoRegistrationEnabled ? 'Khách hàng tạo tài khoản Bot demo' : 'Khách hàng đăng ký Bot sau khi xác minh số điện thoại', { username, customer_id: account.customer_id });
        const token = signBotToken({ id: account.id, username, role: 'customer', customer_id: account.customer_id });
        setCustomerSession(req, res, token);
        return res.status(201).json({ success: true, message: 'Đăng ký thành công', data: { token, user: { id: account.id, username, full_name: account.full_name, role: 'customer' } } });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Bot registration verification error:', error);
        return fail(res, 500, 'Chưa thể hoàn tất đăng ký lúc này.');
    }
};

export const loginBot = async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        if (!username || !password) return fail(res, 400, 'Thiếu tên đăng nhập hoặc mật khẩu.');
        if (isRateLimited(`login:${req.ip}:${username.toLowerCase()}`, 8, 5 * 60 * 1000)) {
            return fail(res, 429, 'Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 5 phút.');
        }

        const account = await db.get(
            `SELECT a.*, c.full_name FROM customer_accounts a JOIN customers c ON c.id = a.customer_id WHERE a.username = ?`, [username]);
        if (!account || !(await bcrypt.compare(password, account.password_hash))) {
            await logAction(null, 'AUTH', 'Đăng nhập Bot thất bại', { username });
            return fail(res, 401, 'Sai tên đăng nhập hoặc mật khẩu.');
        }
        if (!account.is_active) return fail(res, 403, 'Tài khoản đã bị khóa, liên hệ cửa hàng để được xử lý.');

        await logAction(null, 'AUTH', 'Khách hàng đăng nhập Bot thành công', { username, customer_id: account.customer_id });
        const token = signBotToken({ id: account.id, username, role: 'customer', customer_id: account.customer_id });
        setCustomerSession(req, res, token);
        return res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: { token, user: { id: account.id, username, full_name: account.full_name, role: 'customer' } }
        });
    } catch (error) {
        console.error('Bot login error:', error);
        return fail(res, 500, 'Lỗi hệ thống máy chủ');
    }
};

export const logoutBot = (req, res) => {
    clearCustomerSession(req, res);
    return res.json({ success: true, message: 'Đã đăng xuất.' });
};

export const confirmCustomerAction = async (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chỉ khách hàng đăng nhập mới xác nhận thao tác tại đây.');
    const actionId = String(req.params.id || '');
    if (!/^[a-f0-9]{6}$/i.test(actionId)) return fail(res, 400, 'Mã xác nhận không hợp lệ.');
    const result = await executePendingAction(req.botUser, actionId);
    return res.status(result.ok ? 200 : 409).json({ success: result.ok, message: result.message, data: null });
};

export const cancelCustomerAction = (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chỉ khách hàng đăng nhập mới hủy thao tác tại đây.');
    const action = peekPendingAction(req.botUser);
    if (!action || action.id !== String(req.params.id || '')) return fail(res, 409, 'Thao tác đã hết hạn hoặc không còn chờ xác nhận.');
    cancelPendingAction(req.botUser);
    return res.json({ success: true, message: 'Đã hủy thao tác đang chờ.', data: null });
};

export const getBotProfile = (req, res) => {
    const user = req.botUser;
    res.json({
        success: true,
        data: {
            user: user ? { id: user.id, username: user.username, full_name: user.full_name, role: user.role } : null,
            commands: publicCommandList(user?.role || 'guest'),
            registrationRequiresOtp: !demoRegistrationEnabled
        }
    });
};

export const getCustomerUpdates = async (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chỉ tài khoản khách hàng mới xem được thông báo đơn hàng.');
    try {
        const updates = await db.query(
            `SELECT id, title, message, order_id, created_at,
                    CASE WHEN order_id IS NOT NULL THEN '/api/bot/orders/' || order_id || '/invoice.svg' ELSE NULL END AS invoice_image_url
             FROM bot_customer_notifications WHERE customer_account_id = ? AND read_at IS NULL ORDER BY id ASC LIMIT 20`,
            [req.botUser.id]
        );
        if (updates.length) {
            await db.run(
                `UPDATE bot_customer_notifications SET read_at = CURRENT_TIMESTAMP WHERE customer_account_id = ? AND id IN (${updates.map(() => '?').join(',')})`,
                [req.botUser.id, ...updates.map((update) => update.id)]
            );
        }
        return res.json({ success: true, data: updates });
    } catch (error) {
        console.error('Get customer bot updates failed:', error);
        return fail(res, 500, 'Không tải được thông báo đơn hàng.');
    }
};

const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[character]));

export const getCustomerInvoiceImage = async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isSafeInteger(orderId) || orderId < 1) return fail(res, 400, 'Mã đơn hàng không hợp lệ.');
    try {
        let order;
        if (req.botUser?.role === 'customer') {
            order = await db.get(
                `SELECT id, customer_id, customer_name, created_at, total_amount, payment_method, shipping_fee, status,
                        EXISTS (SELECT 1 FROM transactions t WHERE t.reference_id = orders.id AND t.type = 'income' AND t.source = 'auto') AS has_payment
                 FROM orders WHERE id = ? AND customer_id = ? AND status IN ('processing', 'shipped', 'delivered')`,
                [orderId, req.botUser.customer_id]);
        } else if (['staff', 'owner', 'admin'].includes(req.botUser?.role)) {
            order = await db.get(
                `SELECT id, customer_id, customer_name, created_at, total_amount, payment_method, shipping_fee, status,
                        EXISTS (SELECT 1 FROM transactions t WHERE t.reference_id = orders.id AND t.type = 'income' AND t.source = 'auto') AS has_payment
                 FROM orders WHERE id = ? AND status IN ('processing', 'shipped', 'delivered')`,
                [orderId]);
        } else {
            return fail(res, 403, 'Chỉ khách hàng hoặc nhân viên đăng nhập mới xem được hóa đơn này.');
        }
        if (!order) return fail(res, 404, 'Chưa có hóa đơn được cửa hàng xác nhận cho đơn này.');
        const items = await db.query(
            `SELECT COALESCE(oi.product_name, p.name) AS name, oi.quantity, oi.unit_price
             FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ? ORDER BY oi.id`, [orderId]);
        if (!items.length) return fail(res, 404, 'Không tìm thấy sản phẩm trên hóa đơn.');

        const invoiceCode = `INV-${new Date(`${String(order.created_at).replace(' ', 'T')}Z`).toISOString().slice(2, 10).replace(/-/g, '')}-${String(order.id).padStart(4, '0')}`;
        const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
        const height = 410 + items.length * 54;
        const itemRows = items.map((item, index) => {
            const y = 268 + index * 54;
            const lineTotal = Number(item.quantity) * Number(item.unit_price);
            return `<text x="42" y="${y}" class="item">${escapeXml(item.name)}</text><text x="42" y="${y + 22}" class="muted">${Number(item.quantity)} × ${money(item.unit_price)}</text><text x="598" y="${y + 8}" text-anchor="end" class="amount">${money(lineTotal)}</text><line x1="42" y1="${y + 36}" x2="598" y2="${y + 36}" class="rule"/>`;
        }).join('');
        const shippingY = 286 + items.length * 54;
        const totalY = shippingY + 28;
        const date = new Date(`${String(order.created_at).replace(' ', 'T')}Z`).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const paymentMethod = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ' }[order.payment_method] || 'Chưa chọn';
        const paymentStatus = order.has_payment ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${height}" viewBox="0 0 640 ${height}" role="img" aria-labelledby="title desc"><title id="title">Hóa đơn ${escapeXml(invoiceCode)}</title><desc id="desc">Đơn hàng đã được cửa hàng xác nhận, ${escapeXml(paymentStatus.toLowerCase())}.</desc><rect width="640" height="${height}" rx="24" fill="#f1f5f9"/><rect x="16" y="16" width="608" height="${height - 32}" rx="18" fill="#fff"/><rect x="16" y="16" width="608" height="12" rx="6" fill="#4f46e5"/><text x="42" y="72" class="brand">HTH SMART SALES</text><text x="42" y="112" class="heading">HÓA ĐƠN BÁN HÀNG</text><text x="42" y="145" class="muted">Mã hóa đơn: ${escapeXml(invoiceCode)}</text><text x="42" y="171" class="muted">Ngày tạo: ${escapeXml(date)}</text><text x="42" y="197" class="muted">Khách hàng: ${escapeXml(order.customer_name || 'Khách hàng')}</text><rect x="42" y="216" width="556" height="30" rx="8" fill="#eef2ff"/><text x="54" y="236" class="status">ĐƠN ĐÃ ĐƯỢC XÁC NHẬN · ${escapeXml(paymentStatus)} · ${escapeXml(paymentMethod.toUpperCase())}</text>${itemRows}<text x="42" y="${shippingY}" class="muted">Phí giao hàng</text><text x="598" y="${shippingY}" text-anchor="end" class="amount">${money(order.shipping_fee)}</text><text x="42" y="${totalY}" class="total-label">TỔNG CỘNG</text><text x="598" y="${totalY}" text-anchor="end" class="total">${money(order.total_amount)}</text><text x="42" y="${totalY + 40}" class="footer">Cảm ơn bạn đã mua sắm tại cửa hàng.</text><style>text{font-family:Arial,'DejaVu Sans',sans-serif;fill:#0f172a}.brand{font-size:14px;font-weight:700;letter-spacing:2px;fill:#4f46e5}.heading{font-size:25px;font-weight:800}.muted{font-size:13px;fill:#64748b}.status{font-size:11px;font-weight:700;fill:#4338ca}.item{font-size:15px;font-weight:700}.amount{font-size:14px;font-weight:700}.rule{stroke:#e2e8f0}.total-label{font-size:14px;font-weight:800;fill:#334155}.total{font-size:21px;font-weight:800;fill:#4f46e5}.footer{font-size:13px;fill:#64748b}</style></svg>`;
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${invoiceCode}.svg"`);
        res.setHeader('Cache-Control', 'private, no-store');
        return res.status(200).send(svg);
    } catch (error) {
        console.error('Get customer invoice image failed:', error);
        return fail(res, 500, 'Không tải được ảnh hóa đơn.');
    }
};

const broadcastSystemMessage = async (message) => db.transaction(async () => {
    const employeeResult = await db.run(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         SELECT id, 'Thông báo hệ thống', ?, 'system', NULL FROM users WHERE is_active = 1`,
        [message]
    );
    const customerResult = await db.run(
        `INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message)
         SELECT id, NULL, 'Thông báo hệ thống', ? FROM customer_accounts WHERE is_active = 1`,
        [message]
    );
    return { employees: employeeResult.changes || 0, customers: customerResult.changes || 0 };
});

const friendlyAiError = (error, role) => {
    const text = [error?.message, error?.status, error?.statusText, error?.code].filter(Boolean).join(' ');
    if (/\b503\b|UNAVAILABLE|overload|temporarily unavailable|deadline exceeded/i.test(text)) {
        return 'Dịch vụ AI đang tạm thời quá tải (503). Dữ liệu đơn hàng và sản phẩm vẫn an toàn; vui lòng thử lại sau ít phút hoặc nhờ nhân viên hỗ trợ.';
    }
    if (!['guest', 'customer'].includes(role)) {
        if (/GEMINI_API_KEY|API key/i.test(text)) return 'Bot chưa được cấu hình khóa Gemini. Vui lòng liên hệ quản trị viên.';
        if (/429|quota|RESOURCE_EXHAUSTED/i.test(text)) return 'Gemini đang quá tải hoặc hết hạn mức, vui lòng thử lại sau ít phút.';
        return 'Bot tạm thời không phản hồi được, vui lòng thử lại sau.';
    }
    if (/429|quota|RESOURCE_EXHAUSTED/i.test(text)) return 'Hiện tôi đang quá tải, bạn dùng các nút bên dưới hoặc chờ nhân viên hỗ trợ nhé.';
    if (/GEMINI_API_KEY|API key/i.test(text)) return 'Hiện tôi chưa thể trả lời tự do. Bạn có thể dùng các nút bên dưới hoặc gặp nhân viên hỗ trợ.';
    return 'Hiện tôi chưa thể xử lý câu hỏi này. Bạn thử lại hoặc dùng các nút bên dưới để được hỗ trợ.';
};

const sanitizeHistory = (history) => (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((entry) => ['user', 'assistant'].includes(entry?.role) && typeof entry?.content === 'string' && entry.content.trim())
    .map((entry) => ({ role: entry.role, content: redactPhone(redactCccd(entry.content)).slice(0, 1200) }));

const redactCccd = (value) => String(value).replace(/(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)/g, '[đã ẩn CCCD]');
const redactPhone = (value) => String(value).replace(/(?<!\d)(?:\+?84|0)\d{9}(?!\d)/g, '[đã ẩn số điện thoại]');

export const streamBot = async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const attachment = req.file && ['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)
        ? { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') }
        : null;
    const effectiveMessage = message || (attachment ? 'Hãy xem ảnh tôi gửi và giúp tôi đọc thông tin trên đó.' : '');
    if (!effectiveMessage || effectiveMessage.length > 2000) {
        return fail(res, 400, 'Tin nhắn phải có nội dung và không vượt quá 2.000 ký tự.');
    }
    if (redactCccd(effectiveMessage) !== effectiveMessage) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: 'Không gửi CCCD hoặc ảnh giấy tờ trong chat. Với hồ sơ trả góp, hãy nhập thông tin trực tiếp trên kênh chính thức của đối tác tài chính hoặc liên hệ nhân viên.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
    }
    if (redactPhone(effectiveMessage) !== effectiveMessage) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: 'Không gửi số điện thoại trong chat. Hãy dùng biểu mẫu đăng ký để xác minh số hoặc liên hệ nhân viên nếu cần cập nhật thông tin.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
    }
    const user = req.botUser || { id: `guest:${req.ip}`, username: 'guest', full_name: 'Khách', role: 'guest' };
    const limiterKey = req.botUser ? `${user.role}:${user.id}` : `guest:${req.ip}`;
    if (isRateLimited(`chat:${limiterKey}`, 30, 60 * 1000)) {
        return fail(res, 429, 'Bạn nhắn quá nhanh, vui lòng chờ một chút.');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
    const finish = () => { res.write('data: [DONE]\n\n'); res.end(); };

    try {
        let prompt = effectiveMessage;

        if (message.startsWith('/') && !attachment) {
            const command = parseCommand(message);
            if (!command) {
                send({ content: 'Cú pháp lệnh chưa đúng. Gõ /trogiup để xem danh sách lệnh.' });
                return finish();
            }
            const resolved = resolveCommand({ ...command, user });
            if (resolved.type === 'text') {
                send({ content: resolved.text });
                return finish();
            }
            if (resolved.type === 'broadcast') {
                const delivered = await broadcastSystemMessage(resolved.message);
                await logAction(user.id, 'BOT', 'Gửi thông báo hệ thống qua Bot', delivered);
                send({ content: `✅ Đã gửi thông báo đến ${delivered.employees} tài khoản nhân viên/quản trị và ${delivered.customers} tài khoản khách hàng.` });
                return finish();
            }
            if (resolved.type === 'confirm') {
                if (user.role === 'customer') {
                    send({ content: 'Để an toàn, hãy bấm nút xác nhận trên thẻ tóm tắt đơn hàng.' });
                    return finish();
                }
                const result = await executePendingAction(user);
                send({ content: `${result.ok ? '✅' : '⚠️'} ${result.message}`, ...(result.ok ? { executed: true } : {}) });
                return finish();
            }
            if (resolved.type === 'cancel') {
                if (user.role === 'customer') {
                    send({ content: 'Hãy dùng nút Hủy trên thẻ thao tác đang chờ.' });
                    return finish();
                }
                const cancelled = cancelPendingAction(user);
                send({ content: cancelled ? 'Đã hủy thao tác đang chờ.' : 'Không có thao tác nào đang chờ để hủy.' });
                return finish();
            }
            const quick = await runQuickCommand({ ...command, name: resolved.commandName || command.name, user });
            if (quick) {
                send({ content: quick });
                return finish();
            }
            prompt = resolved.prompt;
        }

        const pendingBefore = peekPendingAction(user)?.id;
        let suppliedHistory = req.body?.history;
        if (typeof suppliedHistory === 'string') {
            try { suppliedHistory = JSON.parse(suppliedHistory); } catch { suppliedHistory = []; }
        }
        const history = [...sanitizeHistory(suppliedHistory), { role: 'user', content: prompt }];
        for await (const chunk of runBotAgent({ user, history, attachment })) {
            if (chunk) send({ content: chunk });
        }
        const pendingAfter = peekPendingAction(user);
        if (pendingAfter && pendingAfter.id !== pendingBefore) {
            if (user.role === 'customer') send({ pending: { id: pendingAfter.id, summary: pendingAfter.summary } });
        }
        return finish();
    } catch (error) {
        console.error('Bot stream error:', error);
        if (req.botUser?.role === 'customer' || !req.botUser) {
            try {
                const fallback = await runCustomerFallback({ message: effectiveMessage, user });
                if (fallback) {
                    send({ content: `${fallback}\n\n_(AI đang tạm quá tải; đây là kết quả tra cứu trực tiếp từ dữ liệu cửa hàng.)_` });
                    return finish();
                }
            } catch (fallbackError) {
                console.error('Bot fallback error:', fallbackError);
            }
        }
        send({ error: friendlyAiError(error, req.botUser?.role || 'guest') });
        return finish();
    }
};
