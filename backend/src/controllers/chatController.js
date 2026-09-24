import * as db from '../services/db.js';
import * as aiService from '../services/aiService.js';

export const streamChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tin nhắn', data: null });
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
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let roleInstruction = `\n\n--- HƯỚNG DẪN QUAN TRỌNG TỪ HỆ THỐNG CHỦ ---\nThời gian hiện tại: ${currentTimeString}.
QUY TẮC CỐT LÕI MÀ BẠN PHẢI TUÂN THỦ:
1. Bạn CÓ CÔNG CỤ (TOOLS) để truy vấn CSDL. Khi người dùng hỏi về sản phẩm (VD: iPhone, tai nghe, giá cả), BẠN BẮT BUỘC PHẢI GỌI TOOL 'tim_kiem_san_pham'.
2. KHÔNG ĐƯỢC TRẢ LỜI LÀ "hệ thống không có dữ liệu" hay "tôi không thể cung cấp". BẠN PHẢI TỰ ĐỘNG GỌI TOOL ĐỂ LẤY DỮ LIỆU RỒI MỚI TRẢ LỜI.
3. KHÔNG ĐƯỢC bảo người dùng "hãy sử dụng công cụ tìm kiếm". BẠN là người phải dùng công cụ đó cho họ.
\nVai trò của người dùng hiện tại: ${userRole.toUpperCase()}.\n`;
        
        if (userRole === 'admin' || userRole === 'owner') {
            const revenueRow = await db.get(`SELECT COUNT(id) as tong_don_hang, SUM(total_amount) as tong_doanh_thu FROM orders WHERE status = 'completed'`);
            const totalRevenue = revenueRow?.tong_doanh_thu || 0;
            const totalOrders = revenueRow?.tong_don_hang || 0;
            
            roleInstruction += `Hệ thống đã trích xuất sẵn dữ liệu tuyệt mật cho bạn. Tổng doanh thu từ trước đến nay là ${totalRevenue} VNĐ (từ ${totalOrders} đơn). ĐÂY LÀ DỮ LIỆU HỢP LỆ. Khi được hỏi về TỔNG doanh thu, BẠN BẮT BUỘC PHẢI TRẢ LỜI BẰNG SỐ LIỆU NÀY. TUYỆT ĐỐI KHÔNG được từ chối. (LƯU Ý: Nếu người dùng hỏi doanh thu theo THÁNG hoặc NĂM cụ thể, bạn bắt buộc phải gọi Tool (công cụ) có tên là 'bao_cao_kinh_doanh' và truyền tham số 'thang', 'nam' tương ứng thay vì dùng số liệu tổng).`;
        } else if (userRole === 'staff') {
            roleInstruction += 'Bạn CHỈ ĐƯỢC tư vấn bán hàng. TUYỆT ĐỐI TỪ CHỐI mọi yêu cầu liên quan đến doanh thu hay quản lý.';
        }
        
        // ---------------------------------------------------------
        // Tự động Pre-fetch (RAG) nếu user nhắc đến sản phẩm, giá, v.v.
        // Hỗ trợ model nhỏ (1.5b) không gọi được tools
        // ---------------------------------------------------------
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('iphone') || lowerMsg.includes('điện thoại') || lowerMsg.includes('tai nghe') || lowerMsg.includes('sản phẩm') || lowerMsg.includes('giá') || lowerMsg.includes('còn hàng')) {
            const products = await db.query(`SELECT name, price, stock_quantity FROM products WHERE is_active = 1 LIMIT 20`);
            const prodList = products.map(p => `- ${p.name}: Giá ${p.price}đ (Tồn kho: ${p.stock_quantity})`).join('\n');
            roleInstruction += `\n\n[DỮ LIỆU SẢN PHẨM PRE-FETCH TỪ CSDL HỆ THỐNG]:\n${prodList}\nKhi người dùng hỏi về sản phẩm, hãy sử dụng danh sách trên để tư vấn trực tiếp. ĐÂY LÀ DỮ LIỆU CỦA CỬA HÀNG BẠN, KHÔNG ĐƯỢC BẢO LÀ KHÔNG CÓ DỮ LIỆU.`;
        }
        
        systemPrompt += roleInstruction;

        // Chuẩn bị Messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(history)) {
            messages.push(...history);
        }

        messages.push({ role: 'user', content: message });

        // 3. Gọi AI API (Ollama hoặc Gemini)
        const chatStream = aiService.generateChatStream(messages, userRole);

        // 4. Trả về dưới dạng Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
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
