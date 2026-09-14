import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logAction } from './auditController.js';
import { get, run } from '../services/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_banhangai';

export const register = async (req, res) => {
  try {
    const { username, password, email, full_name, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password', data: null });
    }

    // Check if user already exists
    const existingUser = await get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email || '']);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username hoặc email đã tồn tại', data: null });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert to DB
    const sql = `INSERT INTO users (username, password_hash, email, full_name, phone) VALUES (?, ?, ?, ?, ?)`;
    const result = await run(sql, [username, password_hash, email, full_name, phone]);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { id: result.lastID, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ', data: null });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password', data: null });
    }

    // Find user
    const user = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      await logAction(null, 'AUTH', 'Đăng nhập thất bại: Sai tên đăng nhập', { username });
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu', data: null });
    }

    if (user.is_active === 0) {
      await logAction(user.id, 'AUTH', 'Đăng nhập thất bại: Tài khoản bị khóa', { username });
      return res.status(403).json({ success: false, message: 'tài khoản đã bị khóa liên hệ admin để được xử lý', data: null });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logAction(user.id, 'AUTH', 'Đăng nhập thất bại: Sai mật khẩu', { username });
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu', data: null });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Save token to DB to restrict concurrent logins
    await run('UPDATE users SET current_token = ? WHERE id = ?', [token, user.id]);

    await logAction(user.id, 'AUTH', 'Đăng nhập thành công', { username });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ', data: null });
  }
};
