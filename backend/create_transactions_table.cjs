const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    // Tạo bảng transactions (Sổ quỹ)
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            reference_id INTEGER,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error("Lỗi khi tạo bảng transactions:", err.message);
        } else {
            console.log("Đã tạo bảng transactions thành công!");
        }
    });
});
