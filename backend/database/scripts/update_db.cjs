const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/ecom_ai.db');
db.run("UPDATE system_configs SET value = 'gemini-3.7-flash' WHERE key IN ('gemini_model', 'ai_model')", (err) => {
    if (err) console.error(err);
    else console.log('DB Updated');
});
