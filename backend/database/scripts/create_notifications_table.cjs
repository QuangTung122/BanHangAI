const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            role TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error("Lỗi khi tạo bảng notifications:", err.message);
        } else {
            console.log("Đã tạo bảng notifications thành công!");
        }
    });
});
