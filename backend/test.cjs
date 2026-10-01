const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.all("SELECT COUNT(id) as total_orders, SUM(total_amount) as total_revenue FROM orders WHERE status = 'completed' AND strftime('%Y-%m', created_at) = strftime('%Y', 'now', 'localtime') || '-09'", (err, res) => console.log('Query with ||:', res));
db.all("SELECT created_at FROM orders", (err, res) => console.log('Created_at:', res));
