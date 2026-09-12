import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database/ecom_ai.db');
db.all("PRAGMA table_info(products);", (err, rows) => {
    console.log(rows);
});
