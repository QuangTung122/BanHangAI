import bcrypt from 'bcrypt';
import * as db from '../services/db.js';
import { logAction } from './auditController.js';

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
    let { hourly_wage } = req.body;
    
    hourly_wage = Number(hourly_wage);
    if (isNaN(hourly_wage) || hourly_wage < 0) {
        return res.status(400).json({ success: false, message: 'Mức lương không hợp lệ' });
    }

    try {
        await db.run('UPDATE users SET hourly_wage = ? WHERE id = ?', [hourly_wage, id]);
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

// Cập nhật thông tin tài khoản & cấp lại mật khẩu mới (nếu có)
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, role, is_active, password } = req.body;

    try {
        const user = await db.get('SELECT id, username, role, is_active, email, full_name, phone FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng' });
        }

        // Kiểm tra trùng email nếu email được cập nhật
        if (email && email.trim() !== '' && email.trim() !== user.email) {
            const checkEmail = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim(), id]);
            if (checkEmail) {
                return res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi tài khoản khác' });
            }
        }

        // Kiểm tra tính hợp lệ của vai trò
        if (role && !['admin', 'owner', 'staff'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Vai trò người dùng không hợp lệ' });
        }

        // Không cho phép tự đổi quyền của bản thân hoặc tự khóa tài khoản của bản thân
        if (req.user.id == id) {
            if (role && role !== user.role) {
                return res.status(400).json({ success: false, message: 'Bạn không thể tự thay đổi vai trò của chính mình' });
            }
            if (is_active !== undefined && (is_active === 0 || is_active === false)) {
                return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản đang đăng nhập của chính mình' });
            }
        }

        // Không cho phép hạ quyền hoặc khóa Admin duy nhất còn lại trong hệ thống
        if (user.role === 'admin' && ((role && role !== 'admin') || (is_active !== undefined && (is_active === 0 || is_active === false)))) {
            const adminCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1");
            if (adminCount && adminCount.count <= 1) {
                return res.status(400).json({ success: false, message: 'Hệ thống phải có ít nhất một Quản trị viên (Admin) đang hoạt động' });
            }
        }

        const newFullName = full_name !== undefined ? (full_name ? full_name.trim() : null) : user.full_name;
        const newEmail = email !== undefined ? (email ? email.trim() : null) : user.email;
        const newPhone = phone !== undefined ? (phone ? phone.trim() : null) : user.phone;
        const newRole = role || user.role;
        const newIsActive = is_active !== undefined ? (is_active ? 1 : 0) : user.is_active;

        let passwordQuery = '';
        let params = [newFullName, newEmail, newPhone, newRole, newIsActive];

        if (password && password.trim().length > 0) {
            if (password.trim().length < 6) {
                return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
            }
            const hashedPassword = await bcrypt.hash(password.trim(), 10);
            passwordQuery = ', password_hash = ?, current_token = NULL';
            params.push(hashedPassword);
        }

        params.push(id);

        await db.run(
            `UPDATE users 
             SET full_name = ?, email = ?, phone = ?, role = ?, is_active = ? ${passwordQuery} 
             WHERE id = ?`,
            params
        );

        await logAction(req.user.id, 'USER_UPDATE', `Cập nhật thông tin tài khoản "${user.username}"`, {
            target_user_id: id,
            username: user.username,
            role: newRole,
            is_active: newIsActive,
            password_updated: !!(password && password.trim().length > 0)
        });

        const updatedUser = await db.get(
            `SELECT id, username, full_name, email, phone, role, is_active, created_at, hourly_wage 
             FROM users WHERE id = ?`,
            [id]
        );

        res.status(200).json({ 
            success: true, 
            message: `Cập nhật tài khoản "${user.username}" thành công${password && password.trim() ? ' (kèm cấp mật khẩu mới)' : ''}`, 
            data: updatedUser 
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật tài khoản' });
    }
};

// Đặt lại mật khẩu (mặc định 123456 hoặc theo mật khẩu truyền lên)
export const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body || {};
    const defaultPassword = new_password && new_password.trim().length > 0 ? new_password.trim() : '123456';

    if (defaultPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự' });
    }

    try {
        const user = await db.get('SELECT id, username FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng' });
        }

        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await db.run('UPDATE users SET password_hash = ?, current_token = NULL WHERE id = ?', [hashedPassword, id]);

        await logAction(req.user.id, 'PASSWORD_RESET', `Đặt lại mật khẩu tài khoản "${user.username}"`, {
            target_user_id: id,
            username: user.username
        });

        res.status(200).json({ 
            success: true, 
            message: `Đã cấp lại mật khẩu cho tài khoản "${user.username}" về: ${defaultPassword}` 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đặt lại mật khẩu' });
    }
};

// Xóa tài khoản người dùng
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        if (req.user.id == id) {
            return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản đang đăng nhập của bản thân' });
        }

        let user;
        await db.transaction(async () => {
            user = await db.get('SELECT id, username, role FROM users WHERE id = ?', [id]);
            if (!user) {
                const error = new Error('Tài khoản không tồn tại hoặc đã bị xóa trước đó');
                error.statusCode = 404;
                throw error;
            }

            if (user.role === 'admin') {
                const adminCount = await db.get("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
                if (adminCount && adminCount.count <= 1) {
                    const error = new Error('Không thể xóa tài khoản Quản trị viên (Admin) duy nhất của hệ thống');
                    error.statusCode = 400;
                    throw error;
                }
            }

            const transactions = await db.get('SELECT id FROM transactions WHERE user_id = ? LIMIT 1', [id]);
            if (transactions) {
                const error = new Error('Tài khoản đã có lịch sử thu chi. Hãy khóa tài khoản để giữ nguyên dấu vết kế toán.');
                error.statusCode = 400;
                throw error;
            }
            const orders = await db.get('SELECT id FROM orders WHERE user_id = ? LIMIT 1', [id]);
            if (orders) {
                const error = new Error('Tài khoản đã có lịch sử đơn hàng. Hãy khóa tài khoản để giữ nguyên lịch sử bán hàng.');
                error.statusCode = 400;
                throw error;
            }

            const operationalRefs = await db.get(`
                SELECT
                    (SELECT COUNT(*) FROM returns WHERE created_by = ? OR approved_by = ? OR customer_id = ?) +
                    (SELECT COUNT(*) FROM warranty_claims WHERE created_by = ? OR approved_by = ? OR customer_id = ?) +
                    (SELECT COUNT(*) FROM installment_payments WHERE cashier_id = ?) AS count
            `, [id, id, id, id, id, id, id]);
            if (operationalRefs?.count > 0) {
                const error = new Error('Tài khoản đã được ghi nhận trong hồ sơ đổi trả, bảo hành hoặc trả góp. Hãy khóa tài khoản để bảo toàn lịch sử.');
                error.statusCode = 400;
                throw error;
            }

            await db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [id, id]);
            await db.run('DELETE FROM notifications WHERE user_id = ?', [id]);
            await db.run('DELETE FROM attendance WHERE user_id = ?', [id]);
            await db.run('DELETE FROM chat_sessions WHERE user_id = ?', [id]);
            await db.run('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?', [id]);
            await db.run('DELETE FROM users WHERE id = ?', [id]);
        });

        await logAction(req.user.id, 'USER_DELETE', `Đã xóa tài khoản "${user.username}" (ID: ${id})`, {
            deleted_user_id: id,
            username: user.username,
            role: user.role
        });

        res.status(200).json({ success: true, message: `Đã xóa vĩnh viễn tài khoản "${user.username}" thành công` });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Lỗi máy chủ khi xóa tài khoản', data: null });
    }
};
