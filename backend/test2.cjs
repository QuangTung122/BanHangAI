const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');
db.all("SELECT strftime('%Y-%m', created_at) as m FROM orders", (err, res) => console.log(res));
db.all("SELECT strftime('%Y', 'now', 'localtime') || '-09' as now", (err, res) => console.log(res));
