import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('database/ecom_ai.db');
db.serialize(() => {
    db.run('ALTER TABLE orders ADD COLUMN payment_type TEXT DEFAULT "full"');
    db.run('ALTER TABLE orders ADD COLUMN customer_cccd TEXT');
    db.run('ALTER TABLE orders ADD COLUMN installment_term INTEGER');
    db.run('ALTER TABLE orders ADD COLUMN monthly_fee INTEGER');
});
db.close();
