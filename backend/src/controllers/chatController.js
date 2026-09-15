import * as db from '../services/db.js';
import * as aiService from '../services/aiService.js';

export const streamChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tin nhắn', data: null });
        }

        const role = req.user ? req.user.role : 'staff';
        let systemPrompt = '';

        if (role === 'owner') {
            // 1. Phân quyền Owner: Lấy dữ liệu kinh doanh phân tích (Che giấu thông tin cá nhân khách hàng)
            const revenueResult = await db.query("SELECT SUM(total_amount) as total FROM orders WHERE date(created_at) >= date('now', 'start of month') AND status != 'cancelled'");
            const totalRevenue = revenueResult[0]?.total || 0;

            const topProducts = await db.query(`
                SELECT p.name, SUM(oi.quantity) as sold 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                GROUP BY p.id ORDER BY sold DESC LIMIT 5
            `);
            const topProductsStr = topProducts.map(p => `- ${p.name}: Đã bán ${p.sold}`).join('\n') || 'Chưa có dữ liệu';

            const lowStock = await db.query("SELECT name, stock_quantity FROM products WHERE stock_quantity <= 5 AND is_active = 1");
            const lowStockStr = lowStock.map(p => `- ${p.name}: Còn ${p.stock_quantity}`).join('\n') || 'Kho hàng dồi dào, không có cảnh báo';

            systemPrompt = `Bạn là Giám đốc Tài chính (CFO) và Chuyên viên Phân tích Dữ liệu của hệ thống BanHangAI.
Nhiệm vụ của bạn là đọc các số liệu thực tế dưới đây, phân tích xu hướng, cảnh báo rủi ro (hàng tồn kho thấp, doanh thu giảm) và đưa ra chiến lược kinh doanh cực kỳ sắc bén, chuyên nghiệp.

[DỮ LIỆU KINH DOANH THỰC TẾ]:
- Doanh thu tháng này: ${totalRevenue.toLocaleString()} VNĐ
- Top 5 bán chạy:
${topProductsStr}
- Cảnh báo sắp hết hàng:
${lowStockStr}

[QUY TẮC BẢO MẬT]:
- Không bao giờ yêu cầu người dùng cung cấp thông tin cá nhân.
- Tuyệt đối không tiết lộ thông tin khách hàng.
- Xưng hô là "Tôi" và gọi người dùng là "Sếp" hoặc "Giám đốc".
- Trả lời bằng định dạng Markdown, có bảng biểu rõ ràng.`;
        } else {
            // 2. Phân quyền Staff/Admin: Lấy dữ liệu sản phẩm tư vấn
            const products = await db.query('SELECT name, price, description, stock_quantity FROM products WHERE is_active = 1 LIMIT 30');
            const productContext = products.map(p => 
                `- ${p.name}: Giá ${p.price} VNĐ, Tồn kho: ${p.stock_quantity}. Mô tả: ${p.description || 'Không có'}`
            ).join('\n');

            systemPrompt = `Bạn là Trợ lý Tư vấn Bán hàng xuất sắc của hệ thống BanHangAI.
Nhiệm vụ của bạn là hỗ trợ nhân viên bán hàng tra cứu thông tin sản phẩm, giá cả và tồn kho một cách nhanh chóng nhất.

[DỮ LIỆU SẢN PHẨM HIỆN TẠI]:
${productContext}

[QUY TẮC BẢO MẬT & NGHIỆP VỤ]:
- Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp. Tuyệt đối không bịa đặt sản phẩm hoặc tự ý giảm giá.
- Nếu sản phẩm hết hàng (Tồn kho = 0), hãy báo ngay cho nhân viên biết để tư vấn sản phẩm khác.
- KHÔNG tiết lộ bất kỳ thông tin nào về doanh thu cửa hàng hay thông tin quản trị.
- Xưng hô là "Em/Mình" và gọi người dùng là "Bạn/Anh/Chị". Trả lời ngắn gọn, thân thiện.
- Trả lời bằng định dạng Markdown.`;
        }

        // 3. Chuẩn bị Messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(history)) {
            messages.push(...history);
        }

        messages.push({ role: 'user', content: message });

        // 3. Gọi AI API (Ollama hoặc Gemini)
        const chatStream = aiService.generateChatStream(messages);

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
        const errorMsg = error.message || 'Lỗi hệ thống hoặc mất kết nối AI';
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
