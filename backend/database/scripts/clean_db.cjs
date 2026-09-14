const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'ecom_ai.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("PRAGMA foreign_keys=off;");
    db.run("BEGIN TRANSACTION;");
    
    // Create new users table without customer role
    db.run(`
        CREATE TABLE IF NOT EXISTS new_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            role TEXT DEFAULT 'staff' CHECK(role IN ('admin', 'owner', 'staff')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            hourly_wage REAL DEFAULT 25000,
            current_token TEXT
        );
    `);
    
    // Copy data excluding customers
    db.run(`
        INSERT INTO new_users (id, username, password_hash, full_name, email, phone, role, created_at, is_active, hourly_wage, current_token) 
        SELECT id, username, password_hash, full_name, email, phone, role, created_at, is_active, hourly_wage, current_token 
        FROM users WHERE role != 'customer';
    `);
    
    // Drop old and rename
    db.run("DROP TABLE users;");
    db.run("ALTER TABLE new_users RENAME TO users;");
    
    db.run("COMMIT;", (err) => {
        if (err) console.error(err);
        else console.log("Cleaned up users table and removed customer garbage.");
    });
    db.run("PRAGMA foreign_keys=on;");
});

db.close();
