import * as db from './db.js';

export const notifyRoles = async ({ roles, title, message, type = 'system', relatedId = null, excludeUserId = null }) => {
    const validRoles = [...new Set((Array.isArray(roles) ? roles : []).filter((role) => ['admin', 'owner', 'staff'].includes(role)))];
    if (!validRoles.length) return;

    try {
        const placeholders = validRoles.map(() => '?').join(', ');
        const clauses = [`is_active = 1`, `role IN (${placeholders})`];
        const params = [...validRoles];
        if (excludeUserId != null) {
            clauses.push('id <> ?');
            params.push(excludeUserId);
        }
        const recipients = await db.query(`SELECT id FROM users WHERE ${clauses.join(' AND ')}`, params);
        await Promise.all(recipients.map(user => db.run(
            'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
            [user.id, title, message, type, relatedId]
        )));
    } catch (error) {
        console.error('Lỗi gửi thông báo nghiệp vụ:', error);
    }
};
