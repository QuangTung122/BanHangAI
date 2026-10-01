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
        // Append Z to created_at to ensure correct parsing in the frontend
        transactions.forEach(t => {
            if (t.created_at && !t.created_at.includes('Z')) {
                t.created_at += 'Z';
            }
        });
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
                SUM(CASE WHEN payment_method = 'transfer' AND type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN payment_method = 'transfer' AND type = 'expense' THEN amount ELSE 0 END) as total_transfer,
                SUM(CASE WHEN payment_method = 'card' AND type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN payment_method = 'card' AND type = 'expense' THEN amount ELSE 0 END) as total_card
            FROM transactions
        `;
        const balanceResult = await db.query(balanceQuery, []);
        const balanceSummary = balanceResult[0] || { total_cash: 0, total_transfer: 0, total_card: 0 };
        const balance = (balanceSummary.total_cash || 0) + (balanceSummary.total_transfer || 0) + (balanceSummary.total_card || 0);

        // 3. Get All-Time Cash Breakdown per User (counters)
        let breakdownQuery = `
            SELECT 
                u.id, u.full_name, u.username, u.role, t.user_id,
                SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) - SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as cash_balance
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.payment_method = 'cash'
            GROUP BY t.user_id HAVING cash_balance <> 0 ORDER BY cash_balance DESC
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
                    user_id: row.user_id || row.id,
                    name: row.full_name || row.username || 'Nhân viên vô danh',
                    username: row.username || 'unknown',
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
                total_card: balanceSummary.total_card || 0,
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
    const { type, amount, category, description, payment_method = 'cash' } = req.body;
    const user_id = req.user.id;
    const numericAmount = Number(amount);
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';
    
    // Nếu có file upload, tạo đường dẫn (URL) cho file đó
    let attachment_url = null;
    if (req.file) {
        attachment_url = `/uploads/${req.file.filename}`;
    }
    
    if (!['income', 'expense'].includes(type) || !normalizedCategory || normalizedCategory.length > 100) {
        return res.status(400).json({ success: false, message: 'Loại phiếu hoặc danh mục không hợp lệ', data: null });
    }
    
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Số tiền phải là số nguyên lớn hơn 0', data: null });
    }
    if (!['cash', 'transfer', 'card'].includes(payment_method)) {
        return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ', data: null });
    }

    try {
        await db.run(
            `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, attachment_url) VALUES (?, ?, ?, ?, ?, ?, 'manual', ?)`,
            [type, numericAmount, normalizedCategory, String(description || '').trim().slice(0, 500), user_id, payment_method, attachment_url]
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
    const numericAmount = Number(amount);
    const receiveMethod = receive_method || 'cash';
    
    if (!Number.isSafeInteger(Number(staff_id)) || Number(staff_id) < 1 || !Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', data: null });
    }
    if (!['cash', 'transfer'].includes(receiveMethod)) {
        return res.status(400).json({ success: false, message: 'Hình thức nhận tiền không hợp lệ', data: null });
    }
    
    try {
        await db.transaction(async () => {
            const staff = await db.get('SELECT id FROM users WHERE id = ? AND role = ? AND is_active = 1', [staff_id, 'staff']);
            if (!staff) {
                const error = new Error('Không tìm thấy nhân viên đang hoạt động');
                error.statusCode = 404;
                throw error;
            }

            const balanceRow = await db.get(`
                SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
                FROM transactions
                WHERE user_id = ? AND payment_method = 'cash'
            `, [staff_id]);
            if (numericAmount > Number(balanceRow?.balance || 0)) {
                const error = new Error('Số tiền bàn giao vượt quá số tiền mặt nhân viên đang giữ');
                error.statusCode = 409;
                throw error;
            }

            const note = String(description || '').trim().slice(0, 300);
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source)
                 VALUES ('expense', ?, 'Điều chuyển nội bộ', ?, ?, 'cash', 'manual')`,
                [numericAmount, note || 'Nộp tiền về két', staff_id]
            );
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source)
                 VALUES ('income', ?, 'Điều chuyển nội bộ', ?, ?, ?, 'manual')`,
                [numericAmount, note || 'Thu tiền từ nhân viên', owner_id, receiveMethod]
            );
        });
        res.json({ success: true, message: 'Thu tiền từ nhân viên thành công' });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Lỗi server khi thu tiền', data: null });
    }
};
