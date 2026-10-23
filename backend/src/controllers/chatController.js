import * as db from '../services/db.js';


// --- CHAT NỘI BỘ (INTERNAL CHAT) ---
export const getChatUsers = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        let sql = '';
        let params = [];

        if (!['owner', 'admin', 'staff'].includes(role)) {
            return res.status(403).json({ success: false, message: 'Chat nội bộ chỉ dành cho nhân sự hệ thống' });
        }
        sql = "SELECT id, username, full_name, role FROM users WHERE id != ? AND role IN ('owner', 'admin', 'staff') AND is_active = 1 ORDER BY role, full_name, username";
        params = [userId];

        const users = await db.query(sql, params);
        res.status(200).json({ success: true, data: [{ id: 'all', username: 'all', full_name: 'Toàn hệ thống', role: 'all' }, ...users] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerId } = req.params;

        if (!['owner', 'admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Chat nội bộ chỉ dành cho nhân sự hệ thống' });
        }
        if (partnerId === 'all') {
            const messages = await db.query(`SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
                FROM messages m LEFT JOIN users u ON u.id = m.sender_id
                WHERE m.receiver_id IS NULL ORDER BY m.created_at DESC, m.id DESC LIMIT 100`);
            messages.reverse();
            return res.status(200).json({ success: true, data: messages });
        }
        const target = Number(partnerId);
        if (!Number.isSafeInteger(target) || target < 1) return res.status(400).json({ success: false, message: 'Người nhận không hợp lệ' });
        const sql = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
            LIMIT 100
        `;
        const messages = await db.query(sql, [userId, target, target, userId]);

        await db.run('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0', [userId, partnerId]);

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content = '' } = req.body;
        const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

        if (!['owner', 'admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Chat nội bộ chỉ dành cho nhân sự hệ thống' });
        }
        if ((!String(content).trim() && !imageUrl) || String(content).length > 4000) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        }

        const broadcast = receiverId === 'all';
        if (!broadcast) {
            const receiver = await db.get("SELECT id FROM users WHERE id = ? AND is_active = 1 AND role IN ('owner', 'admin', 'staff')", [Number(receiverId)]);
            if (!receiver || Number(receiverId) === Number(senderId)) {
                return res.status(403).json({ success: false, message: 'Người nhận không hợp lệ' });
            }
        }

        const sql = `INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES (?, ?, ?, ?)`;
        const result = await db.run(sql, [senderId, broadcast ? null : Number(receiverId), String(content).trim(), imageUrl]);

        res.status(201).json({ 
            success: true, 
            data: { id: result.lastID, sender_id: senderId, receiver_id: broadcast ? null : Number(receiverId), content: String(content).trim(), image_url: imageUrl, is_read: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
