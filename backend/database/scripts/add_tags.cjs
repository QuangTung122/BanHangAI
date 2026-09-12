const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecom_ai.db');
db.serialize(() => {
    db.run("ALTER TABLE products ADD COLUMN tags TEXT", (err) => {
        if(err) {
            if(err.message.includes("duplicate column name")) {
                console.log("tags column already exists.");
            } else {
                console.error(err.message);
            }
        } else {
            console.log('Added tags to products');
        }
    });
});
