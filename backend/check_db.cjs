const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if (err) throw err;
    let count = 0;
    tables.forEach(t => {
        db.all(`SELECT COUNT(*) as count FROM ${t.name}`, (err, res) => {
            console.log(`Table: ${t.name} - Rows: ${res[0].count}`);
            db.all(`PRAGMA table_info(${t.name})`, (err, cols) => {
                console.log(`  Columns: ${cols.map(c => c.name + ' (' + c.type + ')').join(', ')}\n`);
                count++;
                if (count === tables.length) {
                    console.log('Done');
                }
            });
        });
    });
});
