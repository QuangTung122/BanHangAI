import * as db from '../services/db.js';

// Lấy danh sách thông báo cho user hiện tại (dựa vào id hoặc role)
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Lấy thông báo gửi đích danh user_id HOẶC gửi chung cho role
        // Giới hạn 20 thông báo mới nhất
        const sql = `
            SELECT * FROM notifications 
            WHERE (user_id = ? OR role = ?)
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const notifications = await db.query(sql, [userId, userRole]);

        // Đếm số lượng chưa đọc
        const unreadCountSql = `
            SELECT COUNT(id) as count FROM notifications 
            WHERE (user_id = ? OR role = ?) AND is_read = 0
        `;
        const countResult = await db.get(unreadCountSql, [userId, userRole]);
        const unreadCount = countResult ? countResult.count : 0;

        res.status(200).json({ 
            success: true, 
            data: { notifications, unreadCount } 
        });
    } catch (error) {
        console.error('Lỗi lấy thông báo:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Đánh dấu 1 thông báo đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Đã đánh dấu đọc' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Đánh dấu tất cả đã đọc
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const sql = `
            UPDATE notifications 
            SET is_read = 1 
            WHERE (user_id = ? OR role = ?) AND is_read = 0
        `;
        await db.run(sql, [userId, userRole]);
        res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Hàm tiện ích nội bộ để các controller khác gọi khi muốn tạo thông báo
export const createNotification = async (message, type = 'info', userId = null, role = null) => {
    try {
        const sql = `INSERT INTO notifications (user_id, role, message, type) VALUES (?, ?, ?, ?)`;
        await db.run(sql, [userId, role, message, type]);
    } catch (error) {
        console.error('Lỗi tạo thông báo:', error);
    }
};
