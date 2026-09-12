import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database/ecom_ai.db');
db.all("SELECT created_at, strftime('%Y-%m', created_at) as month FROM transactions LIMIT 5;", (err, rows) => {
    console.log(rows);
});
