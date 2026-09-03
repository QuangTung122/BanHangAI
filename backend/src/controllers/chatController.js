import * as db from '../services/db.js';
import * as aiService from '../services/aiService.js';

export const streamChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tin nhắn', data: null });
        }

        // 1. Lấy danh sách sản phẩm (Context)
        const products = await db.query('SELECT name, price, description, stock_quantity FROM products WHERE is_active = 1 LIMIT 30');
        
        const productContext = products.map(p => 
            `- ${p.name}: Giá ${p.price} VNĐ, Tồn kho: ${p.stock_quantity}. Mô tả: ${p.description || 'Không có'}`
        ).join('\n');

        const systemPrompt = `Bạn là Trợ lý tư vấn bán hàng của cửa hàng BanHangAI.
Dữ liệu sản phẩm hiện có:
${productContext}

Quy tắc:
- Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp ở trên.
- Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
- Nếu sản phẩm hết hàng hoặc không có trong danh sách, hãy thông báo rõ ràng là cửa hàng không kinh doanh mặt hàng đó.
- Không tự ý sinh mã giảm giá ngoài chính sách hoặc hứa hẹn điều khoản không có.
- Trả lời bằng định dạng Markdown.`;

        // 2. Chuẩn bị Messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(history)) {
            messages.push(...history);
        }

        messages.push({ role: 'user', content: message });

        // 3. Gọi Ollama API
        const aiResponse = await aiService.generateChatResponse(messages, { stream: true });

        // 4. Trả về dưới dạng Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        for await (const chunk of aiResponse.body) {
             const chunkStr = Buffer.from(chunk).toString('utf-8');
             const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
             for (const line of lines) {
                 try {
                     const parsed = JSON.parse(line);
                     if (parsed.message && parsed.message.content) {
                         res.write(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`);
                     }
                 } catch(e) {
                     // Bỏ qua lỗi parse JSON cho các chunk dở dang
                 }
             }
        }
        
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Lỗi khi kết nối với mô hình AI', data: null });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Lỗi hệ thống hoặc mất kết nối AI' })}\n\n`);
            res.end();
        }
    }
};
