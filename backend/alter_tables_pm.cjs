const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    // Thêm cột payment_method vào transactions
    db.run("ALTER TABLE transactions ADD COLUMN payment_method TEXT DEFAULT 'cash'", (err) => {
        if(err) console.log(err.message);
        else console.log('Added payment_method to transactions');
    });

    // Thêm cột payment_method vào orders (dành cho phần thanh toán lúc mới mua)
    db.run("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash'", (err) => {
        if(err) console.log(err.message);
        else console.log('Added payment_method to orders');
    });

    // Thêm cột payment_method vào installment_payments (dành cho đóng họ hàng tháng)
    db.run("ALTER TABLE installment_payments ADD COLUMN payment_method TEXT DEFAULT 'cash'", (err) => {
        if(err) console.log(err.message);
        else console.log('Added payment_method to installment_payments');
    });
});
