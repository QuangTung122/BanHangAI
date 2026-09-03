import * as db from '../services/db.js';

export const getOwnerDashboard = async (req, res) => {
    try {
        const now = new Date();
        // Giả sử doanh thu lấy từ orders
        const [{ total_revenue, completed_orders }] = await db.query(`
            SELECT 
                SUM(total_amount) as total_revenue,
                COUNT(id) as completed_orders
            FROM orders
        `);

        const [{ low_stock_products }] = await db.query(`
            SELECT COUNT(id) as low_stock_products
            FROM products
            WHERE stock_quantity <= low_stock_threshold AND is_active = 1
        `);

        // 7 ngày qua
        const revenue_chart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            const [{ daily_rev }] = await db.query(`
                SELECT SUM(total_amount) as daily_rev 
                FROM orders 
                WHERE date(created_at) = ?
            `, [dateStr]);
            
            revenue_chart.push({
                date: d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
                revenue: daily_rev || 0
            });
        }

        // Top sản phẩm bán chạy
        const top_products = await db.query(`
            SELECT p.name, SUM(oi.quantity) as sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY sold DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                total_revenue: total_revenue || 0,
                completed_orders: completed_orders || 0,
                low_stock_products: low_stock_products || 0,
                revenue_chart,
                top_products
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy dashboard' });
    }
};

import * as aiService from '../services/aiService.js';

export const getDashboardInsight = async (req, res) => {
    try {
        const { message } = req.body;
        
        const systemPrompt = `Bạn là Giám đốc Tài chính (CFO) chuyên tư vấn cho chủ cửa hàng bán lẻ.
Nhiệm vụ: Dựa vào số liệu doanh thu, đơn hàng và tồn kho mà hệ thống cung cấp, hãy phân tích nhanh tình hình kinh doanh hiện tại trong tối đa 3-4 câu.
- Đưa ra đúng 1-2 lời khuyên hành động thực tế và trực tiếp để tối ưu hóa doanh thu, xử lý hàng tồn hoặc cải thiện hiệu suất.
- Giữ phong cách chuyên nghiệp, đi thẳng vào vấn đề, không dài dòng. Không dùng format phức tạp (như markdown đậm nghiêng quá nhiều).`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ];

        const aiResponse = await aiService.generateChatResponse(messages, { stream: false });
        const data = await aiResponse.json();

        res.json({
            success: true,
            data: { reply: data.message.content }
        });

    } catch (error) {
        console.error('AI Insight Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi kết nối máy chủ AI' });
    }
};
