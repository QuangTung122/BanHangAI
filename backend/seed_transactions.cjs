const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecom_ai.db');

const ownerId = 1;
const staffId = 2; // Giả sử user 2 là staff

db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, invoice_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`);
    
    // Auto generated
    stmt.run('income', 15500000, 'Bán hàng', 'Bán hàng hóa đơn INV-260901-0012', staffId, 'transfer', 'auto', 'INV-260901-0012', '-1 hours');
    stmt.run('income', 5000000, 'Bán hàng', 'Bán hàng hóa đơn INV-260901-0013', staffId, 'cash', 'auto', 'INV-260901-0013', '-2 hours');
    stmt.run('income', 2000000, 'Thu tiền trả góp', 'Thu tiền trả góp kỳ 1', staffId, 'cash', 'auto', 'INV-260815-0005', '-3 hours');
    
    // Manual
    stmt.run('expense', 10000000, 'Nhập hàng', 'Thanh toán tiền nhập lô hàng Dell', ownerId, 'transfer', 'manual', null, '-4 hours');
    stmt.run('expense', 500000, 'Điện nước', 'Đóng tiền điện tháng 8', ownerId, 'cash', 'manual', null, '-5 hours');
    
    stmt.finalize();
    console.log('Seeded transactions with new columns');
});
