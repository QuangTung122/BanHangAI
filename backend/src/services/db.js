import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the database file (backend/database/ecom_ai.db)
const dbPath = path.resolve(__dirname, '../../database/ecom_ai.db');

import fs from 'fs';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Tự động khởi tạo database nếu file db trống (khi mang sang máy khác)
    db.get("SELECT count(*) AS count FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("Database trống. Đang tự động tạo các bảng từ init.sql...");
            const initSqlPath = path.resolve(__dirname, '../../database/init.sql');
            if (fs.existsSync(initSqlPath)) {
                const initSql = fs.readFileSync(initSqlPath, 'utf8');
                db.exec(initSql, (err) => {
                    if (err) console.error("Lỗi khi khởi tạo Database:", err);
                    else console.log("Khởi tạo Database thành công! Các bảng đã sẵn sàng.");
                });
            } else {
                console.warn("Không tìm thấy file init.sql để khởi tạo data.");
            }
        }
    });
  }
});

// Promisify sqlite3 methods
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export default db;
