import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database/ecom_ai.db');
db.serialize(() => {
    db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='products'", [], (err, rows) => {
        if(err) console.error(err);
        else console.log(rows[0].sql);
    });
    db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='order_items'", [], (err, rows) => {
        if(err) console.error(err);
        else console.log(rows[0].sql);
    });
});
db.close();
