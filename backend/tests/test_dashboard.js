import * as db from '../src/services/db.js';

async function test() {
    try {
        const now = new Date();
        const [{ total_revenue, completed_orders }] = await db.query(`
            SELECT 
                SUM(total_amount) as total_revenue,
                COUNT(id) as completed_orders
            FROM orders
        `);
        console.log({total_revenue, completed_orders});

        const [{ low_stock_products }] = await db.query(`
            SELECT COUNT(id) as low_stock_products
            FROM products
            WHERE stock_quantity <= low_stock_threshold AND is_active = 1
        `);
        console.log({low_stock_products});

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
        console.log(revenue_chart);

        const top_products = await db.query(`
            SELECT p.name, SUM(oi.quantity) as sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY sold DESC
            LIMIT 5
        `);
        console.log(top_products);
    } catch (err) {
        console.error(err);
    }
}
test();
