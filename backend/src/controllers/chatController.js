import * as db from '../services/db.js';
import * as aiService from '../services/aiService.js';
import { processSlashCommand } from '../services/aiTool.js';

export const streamChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
            return res.status(400).json({ success: false, message: 'Tin nhắn phải có nội dung và không vượt quá 2.000 ký tự', data: null });
        }

        // Lấy prompt cơ bản từ cấu hình hệ thống hoặc dùng mặc định
        let systemPrompt = 'Bạn là trợ lý AI của cửa hàng BanHangAI. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.';
        const configRow = await db.get("SELECT value FROM system_configs WHERE key = 'ai_system_prompt'");
        if (configRow && configRow.value && configRow.value.trim() !== '') {
            systemPrompt = configRow.value;
        }

        // Bổ sung thông tin phân quyền của người dùng hiện tại
        const userRole = req.user.role;
        const now = new Date();
        const currentTimeString = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        let roleInstruction = `\n\nBạn là trợ lý bán hàng nội bộ của BanHangAI. Thời gian hiện tại: ${currentTimeString}.
Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu. Chỉ nêu giá, tồn kho, đặc tính hoặc chính sách có trong dữ liệu hệ thống được cung cấp. Nếu dữ liệu không có hoặc không đủ, nói rõ điều đó; không đoán và không bịa.
Vai trò người dùng: ${userRole.toUpperCase()}.`;
        
        if (userRole === 'admin' || userRole === 'owner') {
            const revenueRow = await db.get(`
                SELECT COUNT(DISTINCT o.id) AS tong_don_hang, COALESCE(SUM(o.total_amount), 0) AS tong_doanh_thu
                FROM orders o
                WHERE o.status <> 'cancelled' AND EXISTS (
                    SELECT 1 FROM transactions t
                    WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
                      AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                )
            `);
            const totalRevenue = revenueRow?.tong_doanh_thu || 0;
            const totalOrders = revenueRow?.tong_don_hang || 0;
            
            roleInstruction += `\nDữ liệu bán hàng đã xác nhận: ${totalOrders} đơn có ghi nhận thanh toán, tổng giá trị ${totalRevenue} VNĐ. Khi cần kỳ cụ thể, chỉ dùng dữ liệu truy vấn tương ứng.`;
        } else if (userRole === 'staff') {
            roleInstruction += 'Bạn CHỈ ĐƯỢC tư vấn bán hàng. TUYỆT ĐỐI TỪ CHỐI mọi yêu cầu liên quan đến doanh thu hay quản lý.';
        }
        
        // ---------------------------------------------------------
        // INTENT ROUTER (SLASH COMMANDS) & RAG PRE-FETCH
        // ---------------------------------------------------------
        const { directAnswer, preFetchContext } = await processSlashCommand(message, userRole, req.user.id);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (directAnswer) {
            res.write(`data: ${JSON.stringify({ content: directAnswer })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        }

        if (preFetchContext) {
            roleInstruction += `\n\n[DỮ LIỆU SẢN PHẨM KHỚP TỪ CSDL]:\n${preFetchContext}\nChỉ giới thiệu sản phẩm có trong dữ liệu này. Không tự thêm thông số hoặc cam kết.`;
        }
        
        systemPrompt += roleInstruction;

        // Chuẩn bị Messages
        // Chuẩn bị Messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(history)) {
            const safeHistory = history.slice(-8)
                .filter((entry) => ['user', 'assistant'].includes(entry?.role) && typeof entry?.content === 'string')
                .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 1200) }));
            messages.push(...safeHistory);
        }

        messages.push({ role: 'user', content: message.trim() });

        // 3. Gọi AI API (Ollama hoặc Gemini)
        const chatStream = aiService.generateChatStream(messages, userRole);

        for await (const chunkText of chatStream) {
            if (chunkText) {
                res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
            }
        }
        
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        let errorMsg = error.message || 'Lỗi hệ thống hoặc mất kết nối AI';
        if (errorMsg.includes('403 Forbidden') || errorMsg.includes('denied access') || errorMsg.includes('PERMISSION_DENIED')) {
            errorMsg = 'Lỗi Google Gemini (403 Forbidden): Dự án Google Cloud / API Key của bạn đã bị từ chối quyền truy cập. Vui lòng tạo API Key mới tại Google AI Studio (https://aistudio.google.com) và cập nhật vào file backend/.env, hoặc chuyển sang dùng Ollama trong phần Quản trị Hệ thống.';
        } else if (errorMsg.includes('404 Not Found') || errorMsg.includes('is no longer available')) {
            errorMsg = 'Mô hình AI hiện tại không khả dụng hoặc đã bị ngừng hỗ trợ. Vui lòng chọn mô hình khác trong Thiết lập Hệ thống.';
        } else if (errorMsg.includes('503 Service Unavailable') || errorMsg.includes('high demand')) {
            errorMsg = 'Hệ thống AI của Google hiện đang quá tải do lượng truy cập cao. Quý khách vui lòng thử lại sau ít phút nhé!';
        } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
            errorMsg = 'API Key Google Gemini không hợp lệ. Vui lòng kiểm tra lại cấu hình GEMINI_API_KEY trong file backend/.env.';
        } else if (errorMsg.includes('429 Too Many Requests') || errorMsg.includes('Quota exceeded') || errorMsg.includes('rate-limit')) {
            errorMsg = 'Tài khoản API của bạn đã đạt giới hạn truy cập miễn phí của Google (quá số lượt mỗi phút). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc dùng API Key có trả phí/đổi sang Ollama.';
        }

        if (!res.headersSent) {
            res.status(500).json({ success: false, message: errorMsg, data: null });
        } else {
            res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
            res.end();
        }
    }
};
// --- CHAT NỘI BỘ (INTERNAL CHAT) ---

// Lấy danh sách người dùng để chat (Tùy theo role)
export const getChatUsers = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        let sql = '';
        let params = [];

        if (role === 'staff') {
            // Staff chỉ lấy Owner và Admin
            sql = 'SELECT id, username, full_name, role FROM users WHERE role IN ("owner", "admin") AND is_active = 1';
        } else {
            // Owner và Admin có thể lấy tất cả trừ bản thân
            sql = 'SELECT id, username, full_name, role FROM users WHERE id != ? AND is_active = 1';
            params = [userId];
        }

        const users = await db.query(sql, params);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
// Lấy lịch sử chat với 1 người dùng khác
export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerId } = req.params;

        const sql = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
            LIMIT 100
        `;
        const messages = await db.query(sql, [userId, partnerId, partnerId, userId]);

        // Đánh dấu là đã đọc nếu mình là người nhận
        await db.run('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0', [userId, partnerId]);

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        }

        // TODO: Phân quyền Staff chỉ gửi được cho Admin/Owner
        if (req.user.role === 'staff') {
            const receiver = await db.get('SELECT role FROM users WHERE id = ?', [receiverId]);
            if (!receiver || receiver.role === 'staff') {
                return res.status(403).json({ success: false, message: 'Không được phép gửi tin nhắn cho người này' });
            }
        }

        const sql = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
        const result = await db.run(sql, [senderId, receiverId, content]);

        // Tạo luôn một thông báo cho người nhận (Optional)
        const notificationSql = `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`;
        await db.run(notificationSql, [
            receiverId, 
            'Tin nhắn mới', 
            `Bạn có tin nhắn mới từ ${req.user.username}`, 
            'chat'
        ]);

        res.status(201).json({ 
            success: true, 
            data: { id: result.lastID, sender_id: senderId, receiver_id: receiverId, content, is_read: 0 } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
