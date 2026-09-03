import * as db from '../services/db.js';

export const getTransactions = async (req, res) => {
    try {
        const { month, type, source, payment_method, user_id } = req.query; 
        
        let query = `
            SELECT t.*, u.full_name, u.username 
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (month) {
            query += ` AND strftime('%Y-%m', datetime(t.created_at, 'localtime')) = ?`;
            params.push(month);
        }
        if (type) {
            query += ` AND t.type = ?`;
            params.push(type);
        }
        if (source) {
            query += ` AND t.source = ?`;
            params.push(source);
        }
        if (payment_method) {
            query += ` AND t.payment_method = ?`;
            params.push(payment_method);
        }
        if (user_id) {
            query += ` AND t.user_id = ?`;
            params.push(user_id);
        }
        
        query += ` ORDER BY t.created_at DESC`;
        
        const transactions = await db.query(query, params);
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy sổ quỹ' });
    }
};

export const getSummary = async (req, res) => {
    try {
        const { month } = req.query; 
        
        // 1. Get Monthly Income/Expense
        let monthlyQuery = `
            SELECT 
                SUM(CASE WHEN type = 'income' AND category != 'Điều chuyển nội bộ' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' AND category != 'Điều chuyển nội bộ' THEN amount ELSE 0 END) as total_expense
            FROM transactions
            WHERE 1=1
        `;
        const monthlyParams = [];
        if (month) {
            monthlyQuery += ` AND strftime('%Y-%m', datetime(created_at, 'localtime')) = ?`;
            monthlyParams.push(month);
        }
        const monthlyResult = await db.query(monthlyQuery, monthlyParams);
        const monthlySummary = monthlyResult[0] || { total_income: 0, total_expense: 0 };

        // 2. Get All-Time Balance (Cash & Transfer)
        let balanceQuery = `
            SELECT 
                SUM(CASE WHEN payment_method = 'cash' AND type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN payment_method = 'cash' AND type = 'expense' THEN amount ELSE 0 END) as total_cash,
                SUM(CASE WHEN payment_method = 'transfer' AND type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN payment_method = 'transfer' AND type = 'expense' THEN amount ELSE 0 END) as total_transfer
            FROM transactions
        `;
        const balanceResult = await db.query(balanceQuery, []);
        const balanceSummary = balanceResult[0] || { total_cash: 0, total_transfer: 0 };
        const balance = (balanceSummary.total_cash || 0) + (balanceSummary.total_transfer || 0);

        // 3. Get All-Time Cash Breakdown per User (counters)
        let breakdownQuery = `
            SELECT 
                u.id, u.full_name, u.username, u.role,
                SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) - SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as cash_balance
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.payment_method = 'cash'
            GROUP BY u.id HAVING cash_balance <> 0 ORDER BY cash_balance DESC
        `;
        const breakdownResult = await db.query(breakdownQuery, []);

        // Separate owner (safe) vs staff (counters)
        let safeCash = 0;
        let counters = [];

        breakdownResult.forEach(row => {
            if (row.role === 'owner' || row.role === 'admin') {
                safeCash += row.cash_balance;
            } else {
                counters.push({
                    user_id: row.id,
                    name: row.full_name || row.username,
                    username: row.username,
                    amount: row.cash_balance
                });
            }
        });
        
        res.json({ 
            success: true, 
            data: {
                total_income: monthlySummary.total_income || 0,
                total_expense: monthlySummary.total_expense || 0,
                balance: balance,
                total_cash: balanceSummary.total_cash || 0,
                total_transfer: balanceSummary.total_transfer || 0,
                cash_breakdown: {
                    safe: safeCash,
                    counters: counters
                }
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
    }
};

export const createTransaction = async (req, res) => {
    const { type, amount, category, description, payment_method = 'cash', source = 'manual', invoice_id = null } = req.body;
    const user_id = req.user.id;
    
    if (!type || !amount || !category) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin' });
    }
    
    if (amount <= 0) {
        return res.status(400).json({ success: false, message: 'Số tiền phải lớn hơn 0' });
    }

    try {
        await db.run(
            `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [type, amount, category, description || '', user_id, payment_method, source, invoice_id]
        );
        res.status(201).json({ success: true, message: 'Tạo phiếu thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo phiếu' });
    }
};

export const collectFromStaff = async (req, res) => {
    const { staff_id, amount, receive_method, description } = req.body;
    const owner_id = req.user.id; 
    
    if (!staff_id || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }
    
    try {
        await db.run('BEGIN TRANSACTION');
        
        // 1. Expense for Staff (Tiền mặt) - Reduces their cash balance
        await db.run(
            `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['expense', amount, 'Điều chuyển nội bộ', description || 'Nộp tiền về két', staff_id, 'cash', 'manual']
        );
        
        // 2. Income for Owner - Increases owner's safe or transfer balance
        await db.run(
            `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['income', amount, 'Điều chuyển nội bộ', description || 'Thu tiền từ nhân viên', owner_id, receive_method || 'cash', 'manual']
        );
        
        await db.run('COMMIT');
        res.json({ success: true, message: 'Thu tiền từ nhân viên thành công' });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thu tiền' });
    }
};
