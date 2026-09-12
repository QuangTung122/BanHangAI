const sqlite3 = require('sqlite3'); 
const db = new sqlite3.Database('database/ecom_ai.db'); 
db.all("SELECT o.created_at, date(o.created_at, '+' || (SELECT COUNT(*) FROM installment_payments ip WHERE ip.order_id = o.id) || ' month') as next_due_date FROM orders o WHERE o.payment_type = 'installment'", (err, rows) => { 
    console.log(rows); 
});
