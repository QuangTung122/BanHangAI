import bcrypt from 'bcrypt';
import * as db from '../services/db.js';

// Lấy danh sách tài khoản
export const getUsers = async (req, res) => {
    try {
        const users = await db.query(
            `SELECT id, username, full_name, email, phone, role, is_active, created_at, hourly_wage 
             FROM users ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Cập nhật lương theo giờ
export const updateWage = async (req, res) => {
    const { id } = req.params;
    const { hourly_wage } = req.body;
    try {
        await db.run('UPDATE users SET hourly_wage = ? WHERE id = ?', [hourly_wage || 0, id]);
        res.status(200).json({ success: true, message: 'Cập nhật mức lương thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Tạo tài khoản mới
export const createUser = async (req, res) => {
    const { username, password, email, full_name, role } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin bắt buộc' });
    }

    try {
        const checkExist = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (checkExist) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.run(
            `INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)`,
            [username, hashedPassword, email || null, full_name || null, role]
        );
        
        res.status(201).json({ success: true, message: 'Tạo tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Đổi quyền nhanh
export const changeRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'owner', 'staff'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Quyền không hợp lệ' });
    }

    try {
        // Không cho phép tự đổi quyền của chính mình
        if (req.user.id == id) {
            return res.status(400).json({ success: false, message: 'Không thể tự đổi quyền của bản thân' });
        }

        await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.status(200).json({ success: true, message: 'Cập nhật quyền thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Khóa / Mở khóa tài khoản
export const toggleStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
        if (req.user.id == id) {
            return res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản của bản thân' });
        }

        await db.run('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.status(200).json({ success: true, message: is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Đặt lại mật khẩu (mặc định 123456)
export const resetPassword = async (req, res) => {
    const { id } = req.params;
    const defaultPassword = '123456';

    try {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, id]);
        res.status(200).json({ success: true, message: 'Đã đặt lại mật khẩu về: 123456' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

// Xóa tài khoản
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        if (req.user.id == id) {
            return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của bản thân' });
        }

        // Kiểm tra xem user có dữ liệu liên quan không
        const transactions = await db.get('SELECT id FROM transactions WHERE user_id = ? LIMIT 1', [id]);
        if (transactions) {
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản đã có lịch sử giao dịch. Vui lòng chọn Khóa tài khoản thay thế.' });
        }

        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Đã xóa tài khoản vĩnh viễn' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa tài khoản' });
    }
};
