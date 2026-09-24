import bcrypt from 'bcrypt';
import * as db from '../services/db.js';
import { logAction } from './auditController.js';

export const getProfile = async (req, res) => {
    try {
        const user = await db.get(
            `SELECT id, username, full_name, email, phone, role, created_at 
             FROM users WHERE id = ?`, [req.user.id]
        );
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

export const updateProfile = async (req, res) => {
    const { full_name, email, phone } = req.body;
    try {
        const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

        if (email && email.trim() !== '' && email.trim() !== user.email) {
            const checkEmail = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim(), req.user.id]);
            if (checkEmail) return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }

        await db.run(
            `UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?`,
            [full_name || null, email || null, phone || null, req.user.id]
        );

        await logAction(req.user.id, 'PROFILE_UPDATE', `Người dùng "${user.username}" đã cập nhật thông tin cá nhân`);

        res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

export const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
        if (!current_password || !new_password || new_password.trim().length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = await db.get('SELECT id, username, password_hash FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

        const isMatch = await bcrypt.compare(current_password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = await bcrypt.hash(new_password.trim(), 10);
        await db.run('UPDATE users SET password_hash = ?, current_token = NULL WHERE id = ?', [hashedPassword, req.user.id]);

        await logAction(req.user.id, 'PASSWORD_CHANGE', `Người dùng "${user.username}" đã đổi mật khẩu cá nhân`);

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
