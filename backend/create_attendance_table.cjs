const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    // Tạo bảng attendance
    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            check_in_time TEXT NOT NULL,
            check_out_time TEXT,
            total_hours REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error("Lỗi khi tạo bảng attendance:", err.message);
        } else {
            console.log("Đã tạo bảng attendance thành công!");
        }
    });
});
