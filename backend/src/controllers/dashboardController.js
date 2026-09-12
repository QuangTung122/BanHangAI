import * as db from '../services/db.js';

export const getOwnerDashboard = async (req, res) => {
    try {
        const now = new Date();
        // Giả sử doanh thu lấy từ orders
        const [{ total_revenue }] = await db.query(`
            SELECT SUM(amount) as total_revenue
            FROM transactions
            WHERE type = 'income'
        `);
        const [{ completed_orders }] = await db.query(`
            SELECT COUNT(id) as completed_orders
            FROM orders
        `);

        const [{ low_stock_products }] = await db.query(`
            SELECT COUNT(id) as low_stock_products
            FROM products
            WHERE stock_quantity <= low_stock_threshold AND is_active = 1
        `);

        const { start_date, end_date } = req.query;
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // 7 ngày qua by default
        let endDate = new Date();

        if (start_date && end_date) {
            startDate = new Date(start_date);
            endDate = new Date(end_date);
        }

        const revenue_chart = [];
        let currentDate = new Date(startDate);
        let daysCount = 0;

        while (currentDate <= endDate && daysCount <= 60) { // Giới hạn 60 ngày
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            const [{ daily_rev }] = await db.query(`
                SELECT SUM(amount) as daily_rev 
                FROM transactions 
                WHERE type = 'income' AND date(created_at) = ?
            `, [dateStr]);
            
            revenue_chart.push({
                date: currentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
                revenue: daily_rev || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
            daysCount++;
        }

        // Top sản phẩm bán chạy
        const top_products = await db.query(`
            SELECT p.name, p.image_url, SUM(oi.quantity) as sold, SUM(oi.quantity * oi.unit_price) as revenue
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

        let reply = '';
        const stream = aiService.generateChatStream(messages);
        for await (const chunk of stream) {
            reply += chunk;
        }

        res.json({
            success: true,
            data: { reply }
        });

    } catch (error) {
        console.error('AI Insight Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi kết nối máy chủ AI' });
    }
};
