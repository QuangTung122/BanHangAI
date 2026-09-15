import * as db from '../services/db.js';

// Lấy danh sách thông báo cho user hiện tại
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy thông báo gửi đích danh user_id
        // Giới hạn 20 thông báo mới nhất
        const sql = `
            SELECT * FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const notifications = await db.query(sql, [userId]);

        // Đếm số lượng chưa đọc
        const unreadCountSql = `
            SELECT COUNT(id) as count FROM notifications 
            WHERE user_id = ? AND is_read = 0
        `;
        const countResult = await db.get(unreadCountSql, [userId]);
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
        const sql = `
            UPDATE notifications 
            SET is_read = 1 
            WHERE user_id = ? AND is_read = 0
        `;
        await db.run(sql, [userId]);
        res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Hàm tiện ích nội bộ để các controller khác gọi khi muốn tạo thông báo
export const createNotification = async (title, message, type = 'system', userId, relatedId = null) => {
    try {
        const sql = `INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)`;
        await db.run(sql, [userId, title, message, type, relatedId]);
    } catch (error) {
        console.error('Lỗi tạo thông báo:', error);
    }
};
