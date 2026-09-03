import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'ecom_ai.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
    
    const users = [
        { username: 'admin', email: 'admin@demo.com', role: 'admin', fullname: 'Administrator' },
        { username: 'owner', email: 'owner@demo.com', role: 'owner', fullname: 'Store Owner' },
        { username: 'staff', email: 'staff@demo.com', role: 'staff', fullname: 'Store Staff' },
    ];
    
    for (const u of users) {
        db.run(
            `INSERT INTO users (username, password_hash, email, full_name, role) 
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(username) DO UPDATE SET 
             password_hash = excluded.password_hash,
             role = excluded.role`,
            [u.username, hash, u.email, u.fullname, u.role],
            function(err) {
                if (err) {
                    // Ignore UNIQUE constraint failed
                    if(err.message.includes('UNIQUE')) {
                        console.log(`User ${u.username} already exists.`);
                    } else {
                        console.error(`Error creating ${u.username}:`, err.message);
                    }
                }
                else console.log(`Created user: ${u.username} with role: ${u.role}`);
            }
        );
    }
    
    setTimeout(() => db.close(), 1000);
}

seed();
