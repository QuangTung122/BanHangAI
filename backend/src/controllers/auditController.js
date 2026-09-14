import * as db from '../services/db.js';

// Hàm log dùng nội bộ cho các Controller khác
export const logAction = async (user_id, action_type, action_desc, details = null) => {
    try {
        const detailsStr = details ? JSON.stringify(details) : null;
        await db.run(
            'INSERT INTO audit_logs (user_id, action_type, action_desc, details) VALUES (?, ?, ?, ?)',
            [user_id, action_type, action_desc, detailsStr]
        );
    } catch (error) {
        console.error('Lỗi khi ghi Audit Log:', error);
    }
};

// API lấy danh sách log
export const getLogs = async (req, res) => {
    try {
        const { action_type, user_id, from_date, to_date, page = 1, limit = 20 } = req.query;
        
        let conditions = [];
        let params = [];
        
        if (action_type) {
            conditions.push('l.action_type = ?');
            params.push(action_type);
        }
        if (user_id) {
            conditions.push('l.user_id = ?');
            params.push(user_id);
        }
        if (from_date) {
            conditions.push('l.created_at >= ?');
            params.push(from_date + ' 00:00:00');
        }
        if (to_date) {
            conditions.push('l.created_at <= ?');
            params.push(to_date + ' 23:59:59');
        }
        
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        
        // Đếm tổng số
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs l ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = countResult[0].total;
        
        // Lấy dữ liệu
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        
        const query = `
            SELECT l.id, l.user_id, u.username, l.action_type, l.action_desc, l.details, l.created_at
            FROM audit_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ${whereClause}
            ORDER BY l.id DESC
            LIMIT ? OFFSET ?
        `;
        
        const logs = await db.query(query, params);
        
        res.status(200).json({
            success: true,
            data: logs,
            meta: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Lỗi lấy audit logs:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy logs' });
    }
};
