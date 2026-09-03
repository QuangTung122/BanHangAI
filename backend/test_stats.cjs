const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/ecom_ai.db');

db.all('SELECT payment_type, created_at FROM orders WHERE user_id = 9', (err, orders) => {
    if (err) throw err;
    console.log("Total orders for user 9:", orders.length);
    
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const monthStr = now.toISOString().slice(0, 7); // YYYY-MM
    
    console.log("Today string:", todayStr);
    console.log("Month string:", monthStr);
    
    let stats = {
        today: { full: 0, installment: 0 },
        month: { full: 0, installment: 0 }
    };
    
    orders.forEach(o => {
        const dateStr = o.created_at.slice(0, 10);
        const mStr = o.created_at.slice(0, 7);
        console.log("Order created_at:", o.created_at, "-> dateStr:", dateStr, "mStr:", mStr);
        
        if (dateStr === todayStr) {
            if (o.payment_type === 'full') stats.today.full++;
            if (o.payment_type === 'installment') stats.today.installment++;
        }
        if (mStr === monthStr) {
            if (o.payment_type === 'full') stats.month.full++;
            if (o.payment_type === 'installment') stats.month.installment++;
        }
    });
    
    console.log("Calculated stats:", stats);
});
