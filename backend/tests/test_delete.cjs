const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.serialize(() => {
    db.run('BEGIN TRANSACTION', function(err) { if(err) console.error('BEGIN err:', err); });
    
    db.run('DELETE FROM order_items', function(err) { if(err) console.error('order_items err:', err); });
    db.run('DELETE FROM installment_payments', function(err) { if(err) console.error('installment err:', err); });
    db.run('DELETE FROM orders', function(err) { if(err) console.error('orders err:', err); });
    db.run('DELETE FROM transactions', function(err) { if(err) console.error('transactions err:', err); });
    db.run('DELETE FROM attendance', function(err) { if(err) console.error('attendance err:', err); });
    db.run('DELETE FROM products', function(err) { if(err) console.error('products err:', err); });
    
    db.run('ROLLBACK', function(err) { if(err) console.error('ROLLBACK err:', err); else console.log('Done without errors'); });
});
