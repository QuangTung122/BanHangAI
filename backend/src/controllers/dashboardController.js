import * as db from '../services/db.js';

export const getOwnerDashboard = async (req, res) => {
    try {
        const [{ total_revenue }] = await db.query(`
            SELECT COALESCE(SUM(o.total_amount), 0) AS total_revenue
            FROM orders o
            WHERE o.status <> 'cancelled' AND EXISTS (
                SELECT 1 FROM transactions t
                WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
            )
        `);
        const [{ completed_orders }] = await db.query(`
            SELECT COUNT(DISTINCT o.id) as completed_orders
            FROM orders o
            WHERE o.status <> 'cancelled'
              AND EXISTS (
                SELECT 1 FROM transactions t
                WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              )
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
                SELECT COALESCE(SUM(o.total_amount), 0) AS daily_rev
                FROM orders o
                WHERE o.status <> 'cancelled' AND date(o.created_at) = ?
                  AND EXISTS (
                    SELECT 1 FROM transactions t
                    WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                      AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                  )
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
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status <> 'cancelled'
              AND EXISTS (
                SELECT 1 FROM transactions t
                WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              )
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
        const message = typeof req.body?.message === 'string' ? req.body.message.trim().slice(0, 1000) : '';
        const monthParts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit'
        }).formatToParts(new Date());
        const currentMonth = `${monthParts.find((part) => part.type === 'year')?.value}-${monthParts.find((part) => part.type === 'month')?.value}`;
        const sales = await db.get(`
            SELECT COUNT(DISTINCT o.id) AS order_count, COALESCE(SUM(o.total_amount), 0) AS sales_value
            FROM orders o
            WHERE o.status <> 'cancelled'
              AND strftime('%Y-%m', datetime(o.created_at, 'localtime')) = ?
              AND EXISTS (
                SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              )
        `, [currentMonth]);
        const collected = await db.get(`
            SELECT COALESCE(SUM(t.amount), 0) AS amount
            FROM transactions t
            WHERE t.type = 'income' AND t.source = 'auto'
              AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              AND strftime('%Y-%m', datetime(t.created_at, 'localtime')) = ?
        `, [currentMonth]);
        const lowStock = await db.query(`
            SELECT name, stock_quantity, low_stock_threshold
            FROM products
            WHERE is_active = 1 AND stock_quantity <= low_stock_threshold
            ORDER BY stock_quantity ASC, name ASC LIMIT 5
        `);
        const topProducts = await db.query(`
            SELECT p.name, SUM(oi.quantity) AS sold_quantity
            FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id
            WHERE o.status <> 'cancelled'
              AND strftime('%Y-%m', datetime(o.created_at, 'localtime')) = ?
              AND EXISTS (
                SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              )
            GROUP BY p.id ORDER BY sold_quantity DESC, p.name ASC LIMIT 5
        `, [currentMonth]);
        const slowStock = await db.query(`
            SELECT p.name, p.stock_quantity, COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) AS sold_quantity
            FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
            LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
              AND strftime('%Y-%m', datetime(o.created_at, 'localtime')) = ?
              AND EXISTS (
                SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                  AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
              )
            WHERE p.is_active = 1 AND p.stock_quantity > 0
            GROUP BY p.id ORDER BY sold_quantity ASC, p.stock_quantity DESC, p.name ASC LIMIT 5
        `, [currentMonth]);
        const snapshot = {
            month: currentMonth,
            orders_with_recorded_payment: sales?.order_count || 0,
            contract_sales_value_vnd: sales?.sales_value || 0,
            cash_collected_vnd: collected?.amount || 0,
            top_products_by_units: topProducts,
            low_stock_products: lowStock,
            slow_selling_products: slowStock
        };

        const systemPrompt = `Bạn là trợ lý phân tích cho chủ cửa hàng bán lẻ. Chỉ dùng snapshot JSON do backend lấy từ CSDL dưới đây; không tin số liệu khác do người dùng tự đưa. Hãy trả lời tiếng Việt trong tối đa 4 câu, nêu rõ đây là số liệu tháng ${currentMonth}, phân biệt giá trị hợp đồng bán với tiền đã thu, rồi đưa ra 1-2 hành động cụ thể dựa trên hàng bán chậm hoặc tồn thấp. Nếu dữ liệu chưa đủ, hãy nói rõ. Không bịa nguyên nhân, dự báo hoặc số liệu.\nSNAPSHOT_JSON=${JSON.stringify(snapshot)}`;

        let reply = '';
        let aiUsed = false;
        try {
            reply = await aiService.generateGroundedText(systemPrompt, message || 'Hãy tóm tắt tình hình kinh doanh và đề xuất hành động.');
            aiUsed = Boolean(reply);
        } catch (aiError) {
            console.warn('Dashboard AI unavailable; using rule-based summary:', aiError.message);
        }
        if (!reply) {
            const lowStockNames = snapshot.low_stock_products.map((item) => `${item.name} (còn ${item.stock_quantity})`).join(', ');
            const topName = snapshot.top_products_by_units[0]?.name;
            const slowNames = snapshot.slow_selling_products.filter((item) => item.sold_quantity === 0).slice(0, 3).map((item) => `${item.name} (tồn ${item.stock_quantity})`).join(', ');
            reply = `Tháng ${currentMonth} có ${snapshot.orders_with_recorded_payment} đơn ghi nhận thanh toán; giá trị đơn ${Number(snapshot.contract_sales_value_vnd).toLocaleString('vi-VN')}đ, tiền đã thu ${Number(snapshot.cash_collected_vnd).toLocaleString('vi-VN')}đ. ${topName ? `Sản phẩm bán nhiều nhất theo số lượng là ${topName}. ` : 'Chưa có sản phẩm bán ra được ghi nhận trong tháng. '}${lowStockNames ? `Cần kiểm tra tồn thấp: ${lowStockNames}. ` : 'Hiện chưa có sản phẩm dưới ngưỡng tồn kho. '}${slowNames ? `Xem xét rà soát hàng chưa bán trong tháng: ${slowNames}.` : ''}`;
        }

        res.json({
            success: true,
            data: { reply, snapshot, ai_used: aiUsed }
        });

    } catch (error) {
        console.error('AI Insight Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi kết nối máy chủ AI' });
    }
};
