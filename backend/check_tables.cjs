const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    console.log(rows);
});
