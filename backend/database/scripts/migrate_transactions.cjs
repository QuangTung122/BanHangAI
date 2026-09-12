const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    // 1. Recover full payment orders
    db.each(`SELECT * FROM orders WHERE payment_type = 'full'`, (err, order) => {
        if (err) return console.error(err);
        const yymmdd = new Date(order.created_at).toISOString().slice(2, 10).replace(/-/g, '');
        const invoiceCode = `INV-${yymmdd}-${String(order.id).padStart(4, '0')}`;
        db.run(
            `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['income', order.total_amount, 'Bán hàng', `Bán hàng hóa đơn ${invoiceCode}`, order.id, order.user_id, order.payment_method || 'cash', 'auto', invoiceCode, order.created_at]
        );
    });

    // 2. Recover installment payments
    db.each(`SELECT p.*, o.created_at as order_date FROM installment_payments p JOIN orders o ON p.order_id = o.id`, (err, payment) => {
        if (err) return console.error(err);
        const yymmdd = new Date(payment.order_date).toISOString().slice(2, 10).replace(/-/g, '');
        const invoiceCode = `INV-${yymmdd}-${String(payment.order_id).padStart(4, '0')}`;
        db.run(
            `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['income', payment.amount, 'Thu tiền trả góp', `Thu tiền trả góp hóa đơn ${invoiceCode}`, payment.order_id, payment.cashier_id, payment.payment_method || 'cash', 'auto', invoiceCode, payment.created_at]
        );
    });
    
    console.log("Migration complete.");
});
