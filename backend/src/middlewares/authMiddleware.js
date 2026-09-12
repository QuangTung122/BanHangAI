import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_banhangai';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided', data: null });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check concurrent login
    const { get } = await import('../services/db.js');
    const user = await get('SELECT current_token, is_active FROM users WHERE id = ?', [decoded.id]);
    
    if (!user || user.current_token !== token) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã đăng nhập ở một thiết bị khác', data: null });
    }

    if (user.is_active === 0) {
      return res.status(401).json({ success: false, message: 'tài khoản đã bị khóa liên hệ admin để được xử lý', data: null });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid token', data: null });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Không đủ quyền thao tác', data: null });
    }
    next();
  };
};
