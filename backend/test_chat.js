import * as db from './src/services/db.js';
import * as aiService from './src/services/aiService.js';

async function runTest() {
    console.log('--- BẮT ĐẦU TEST CHAT AI ---');
    try {
        const config = await aiService.getAiConfig();
        console.log('1. Cấu hình AI:', config);

        console.log('2. Lấy dữ liệu sản phẩm...');
        const products = await db.query('SELECT name, price, description, stock_quantity FROM products WHERE is_active = 1 LIMIT 5');
        console.log(`=> Lấy thành công ${products.length} sản phẩm.`);

        const productContext = products.map(p => 
            `- ${p.name}: Giá ${p.price} VNĐ, Tồn kho: ${p.stock_quantity}. Mô tả: ${p.description || 'Không có'}`
        ).join('\n');

        const systemPrompt = `Bạn là Trợ lý tư vấn bán hàng của cửa hàng BanHangAI.\nDữ liệu sản phẩm hiện có:\n${productContext}\n\nQuy tắc:\n- Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp.\n- Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.`;
        
        console.log('3. Gửi Request lên Ollama (Model:', config.model, ')...');
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Cửa hàng có tai nghe nào không?' }
        ];

        const aiResponse = await aiService.generateChatResponse(messages, { stream: true });
        
        console.log('4. Bắt đầu nhận Stream trả về:');
        let fullText = '';
        for await (const chunk of aiResponse.body) {
             const chunkStr = Buffer.from(chunk).toString('utf-8');
             const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
             for (const line of lines) {
                 try {
                     const parsed = JSON.parse(line);
                     if (parsed.message && parsed.message.content) {
                         process.stdout.write(parsed.message.content);
                         fullText += parsed.message.content;
                     }
                 } catch(e) {}
             }
        }
        console.log('\n\n--- KẾT THÚC STREAM ---');
        
    } catch (error) {
        console.error('\n[LỖI TEST]:', error.message);
    }
}

runTest();
