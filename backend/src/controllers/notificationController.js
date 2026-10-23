import * as db from '../services/db.js';

const VISIBLE_ACTIVITY_TITLES = {
    staff: ['Cập nhật đơn hàng', 'Cập nhật sản phẩm/kho hàng', 'Cập nhật đổi trả', 'Cập nhật bảo hành'],
    owner: ['Cập nhật chấm công', 'Cập nhật đơn hàng', 'Cập nhật sản phẩm/kho hàng', 'Cập nhật đổi trả', 'Cập nhật bảo hành', 'Cập nhật sổ quỹ', 'Cập nhật tài khoản'],
    admin: ['Cập nhật cấu hình hệ thống', 'Cập nhật tài khoản']
};

const notificationVisibility = (role) => {
    const titles = VISIBLE_ACTIVITY_TITLES[role] || [];
    const titleList = titles.length ? `title IN (${titles.map(() => '?').join(', ')})` : '0 = 1';
    return {
        sql: ` AND type <> 'customer_support'
               AND (title NOT LIKE 'Cập nhật %' OR ${titleList})`,
        params: titles
    };
};

// Lấy danh sách thông báo cho user hiện tại
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const visibility = notificationVisibility(req.user.role);

        // Lấy thông báo gửi đích danh user_id
        // Giới hạn 20 thông báo mới nhất
        const sql = `
            SELECT * FROM notifications 
            WHERE user_id = ? ${visibility.sql}
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const notifications = await db.query(sql, [userId, ...visibility.params]);

        // Đếm số lượng chưa đọc
        const unreadCountSql = `
            SELECT COUNT(id) as count FROM notifications 
            WHERE user_id = ? AND is_read = 0 ${visibility.sql}
        `;
        const countResult = await db.get(unreadCountSql, [userId, ...visibility.params]);
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
        await db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
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
