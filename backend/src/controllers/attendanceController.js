import * as db from '../services/db.js';

export const checkIn = async (req, res) => {
    try {
        const user_id = req.user.id;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-CA'); 
        const timeStr = now.toLocaleTimeString('en-GB'); 
        
        // Kiểm tra xem có ca nào đang mở (chưa checkout) không
        const activeShift = await db.query('SELECT * FROM attendance WHERE user_id = ? AND date = ? AND check_out_time IS NULL', [user_id, dateStr]);
        
        if (activeShift.length > 0) {
            return res.status(400).json({ success: false, message: 'Bạn đang trong ca làm việc, hãy Tan ca trước khi Vào ca mới!' });
        }
        
        await db.run(
            'INSERT INTO attendance (user_id, date, check_in_time) VALUES (?, ?, ?)',
            [user_id, dateStr, timeStr]
        );
        
        res.json({ success: true, message: `Check-in ca mới lúc ${timeStr}`, data: { check_in_time: timeStr } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi check-in' });
    }
};

export const checkOut = async (req, res) => {
    try {
        const user_id = req.user.id;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-CA');
        const timeStr = now.toLocaleTimeString('en-GB');
        
        // Tìm ca đang mở
        const activeShift = await db.query('SELECT * FROM attendance WHERE user_id = ? AND date = ? AND check_out_time IS NULL ORDER BY id DESC LIMIT 1', [user_id, dateStr]);
        
        if (activeShift.length === 0) {
            return res.status(400).json({ success: false, message: 'Bạn chưa có ca làm việc nào đang mở!' });
        }
        
        const record = activeShift[0];
        
        const checkInDate = new Date(`1970-01-01T${record.check_in_time}Z`);
        const checkOutDate = new Date(`1970-01-01T${timeStr}Z`);
        let diffHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
        if (diffHours < 0) diffHours += 24; 
        
        await db.run(
            'UPDATE attendance SET check_out_time = ?, total_hours = ? WHERE id = ?',
            [timeStr, diffHours.toFixed(2), record.id]
        );
        
        res.json({ success: true, message: `Check-out lúc ${timeStr}. Thời lượng ca: ${diffHours.toFixed(2)} giờ`, data: { check_out_time: timeStr, total_hours: diffHours } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi check-out' });
    }
};

// Hàm dùng chung để lấy dữ liệu group theo ngày
async function getAggregatedAttendance(userIdFilter = null, monthFilter = null) {
    let query = `
        SELECT a.user_id, a.date, 
               GROUP_CONCAT(a.check_in_time || ' - ' || COALESCE(a.check_out_time, 'Đang làm'), ', ') as shifts,
               SUM(a.total_hours) as total_daily_hours,
               u.full_name, u.username, u.role, u.hourly_wage,
               MAX(CASE WHEN a.check_out_time IS NULL THEN 1 ELSE 0 END) as is_working
        FROM attendance a
        JOIN users u ON a.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (userIdFilter) {
        conditions.push(`a.user_id = ?`);
        params.push(userIdFilter);
    }
    if (monthFilter) {
        conditions.push(`a.date LIKE ?`);
        params.push(`${monthFilter}%`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY a.user_id, a.date, u.full_name, u.username, u.role, u.hourly_wage ORDER BY a.date DESC`;
    
    const rawData = await db.query(query, params);

    // Tính toán OT
    return rawData.map(row => {
        const total = parseFloat(row.total_daily_hours || 0);
        let standardHours = total;
        let otHours = 0;

        if (total > 8) {
            standardHours = 8;
            otHours = total - 8;
        }

        return {
            ...row,
            total_daily_hours: total,
            standard_hours: standardHours,
            ot_hours: otHours,
            is_working: row.is_working === 1
        };
    });
}

export const getMyAttendance = async (req, res) => {
    try {
        const data = await getAggregatedAttendance(req.user.id, null);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const getAllAttendance = async (req, res) => {
    try {
        const { month } = req.query; 
        const data = await getAggregatedAttendance(null, month);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
