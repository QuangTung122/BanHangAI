import * as db from '../services/db.js';

export const createOrder = async (req, res) => {
    try {
        const { items, total_amount, payment_type, payment_method = 'cash', customer_name, customer_phone, customer_cccd, installment_term, monthly_fee } = req.body;
        const user_id = req.user.id; 

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống' });
        }

        // Tạo order
        const result = await db.run(
            `INSERT INTO orders (user_id, total_amount, customer_name, customer_phone, payment_type, payment_method, customer_cccd, installment_term, monthly_fee)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, total_amount, customer_name, customer_phone, payment_type, payment_method, customer_cccd, installment_term, monthly_fee]
        );

        const orderId = result.lastID;
        const date = new Date();
        const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
        const invoiceCode = `INV-${yymmdd}-${String(orderId).padStart(4, '0')}`;
        
        // Tạo order_items
        for (const item of items) {
            await db.run(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.unit_price]
            );
            
            // Trừ tồn kho
            await db.run(
                `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
                [item.quantity, item.product_id]
            );
        }

        if (payment_type === 'full') {
            // Ghi vào Sổ quỹ
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['income', total_amount, 'Bán hàng', `Bán hàng hóa đơn ${invoiceCode}`, orderId, user_id, payment_method, 'auto', invoiceCode]
            );
        }

        // Tự động đóng tháng đầu tiên nếu là trả góp
        if (payment_type === 'installment' && monthly_fee > 0) {
            await db.run(
                `INSERT INTO installment_payments (order_id, amount, cashier_id, payment_method) VALUES (?, ?, ?, ?)`,
                [orderId, monthly_fee, user_id, payment_method]
            );

            // Ghi vào Sổ quỹ
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['income', monthly_fee, 'Thu tiền trả góp', `Thu tiền trả góp kỳ 1 hóa đơn ${invoiceCode}`, orderId, user_id, payment_method, 'auto', invoiceCode]
            );
        }

        res.status(201).json({
            success: true,
            data: {
                order_id: orderId,
                invoice_code: invoiceCode,
                created_at: date.toISOString()
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn hàng' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { type } = req.query; // 'full' or 'installment'
        let query = `
            SELECT o.*, COALESCE(u.full_name, u.username) as cashier_name,
                   (SELECT COUNT(*) FROM installment_payments ip WHERE ip.order_id = o.id) as paid_months,
                   date(o.created_at, '+' || (SELECT COUNT(*) FROM installment_payments ip WHERE ip.order_id = o.id) || ' month') as next_due_date
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
        `;
        const params = [];
        if (type) {
            query += ` WHERE o.payment_type = ? `;
            params.push(type);
        }
        query += ` ORDER BY o.created_at DESC LIMIT 100`; // Limit to last 100 for now
        
        const orders = await db.query(query, params);
        
        // Lấy items và payments cho mỗi order
        for (let order of orders) {
            order.items = await db.query(`
                SELECT oi.*, p.name as product_name 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            
            if (order.payment_type === 'installment') {
                order.payments = await db.query(`
                    SELECT ip.*, COALESCE(u.full_name, u.username) as cashier_name
                    FROM installment_payments ip
                    LEFT JOIN users u ON ip.cashier_id = u.id
                    WHERE ip.order_id = ?
                    ORDER BY ip.created_at ASC
                `, [order.id]);
            }
            
            // Generate invoice code cho response
            // Thêm 'Z' để Node.js parse đúng múi giờ UTC từ SQLite
            const dateStr = order.created_at.includes('Z') ? order.created_at : order.created_at + 'Z';
            const date = new Date(dateStr);
            const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
            order.invoice_code = `INV-${yymmdd}-${String(order.id).padStart(4, '0')}`;
            // Cập nhật lại created_at thành chuẩn ISO có Z để frontend hiển thị đúng giờ local
            order.created_at = date.toISOString();
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng' });
    }
};

export const addInstallmentPayment = async (req, res) => {
    try {
        const { id } = req.params; 
        const { pay_all, payment_method = 'cash' } = req.body || {};
        const user_id = req.user.id;
        
        const orders = await db.query('SELECT * FROM orders WHERE id = ? AND payment_type = ?', [id, 'installment']);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ trả góp' });
        }
        const order = orders[0];
        
        const [{ count }] = await db.query('SELECT COUNT(*) as count FROM installment_payments WHERE order_id = ?', [id]);
        
        if (count >= order.installment_term) {
            return res.status(400).json({ success: false, message: 'Khách hàng đã thanh toán đủ các kỳ hạn' });
        }
        
        const remainingMonths = order.installment_term - count;
        const monthsToPay = pay_all ? remainingMonths : 1;
        
        const date = new Date(order.created_at);
        const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
        const invoiceCode = `INV-${yymmdd}-${String(order.id).padStart(4, '0')}`;

        for (let i = 0; i < monthsToPay; i++) {
            const currentPeriod = count + 1 + i;
            
            await db.run(
                'INSERT INTO installment_payments (order_id, amount, cashier_id, payment_method) VALUES (?, ?, ?, ?)',
                [id, order.monthly_fee, user_id, payment_method]
            );

            // Ghi vào sổ quỹ
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['income', order.monthly_fee, 'Thu tiền trả góp', `Thu tiền trả góp kỳ ${currentPeriod} hóa đơn ${invoiceCode}`, id, user_id, payment_method, 'auto', invoiceCode]
            );
        }
        
        res.json({ success: true, message: 'Thu cước thành công', data: { paid_months: count + monthsToPay, total_term: order.installment_term } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi thu cước trả góp' });
    }
};

export const getMyStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        // Lấy tất cả đơn hàng của user này
        const orders = await db.query('SELECT payment_type, created_at FROM orders WHERE user_id = ?', [user_id]);
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const monthStr = `${yyyy}-${mm}`;
        
        let stats = {
            today: { full: 0, installment: 0 },
            month: { full: 0, installment: 0 }
        };
        
        orders.forEach(o => {
            const dateStr = o.created_at.slice(0, 10);
            const mStr = o.created_at.slice(0, 7);
            
            if (dateStr === todayStr) {
                if (o.payment_type === 'full') stats.today.full++;
                if (o.payment_type === 'installment') stats.today.installment++;
            }
            if (mStr === monthStr) {
                if (o.payment_type === 'full') stats.month.full++;
                if (o.payment_type === 'installment') stats.month.installment++;
            }
        });
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê cá nhân' });
    }
};
