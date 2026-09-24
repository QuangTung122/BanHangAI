import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.sqlite');
db.all("PRAGMA table_info(returns);", (err, rows) => {
    console.log(rows);
});
