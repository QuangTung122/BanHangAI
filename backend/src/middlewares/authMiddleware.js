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

/**
 * Xác thực cho Bot (tùy chọn). Chấp nhận:
 *  - Token riêng của Bot (aud = 'bot'): khách hàng, không đá phiên đăng nhập hệ thống.
 *  - Header Authorization: Bearer <token>
 *  - Query param ?token=<token> (dùng cho <img> SVG hóa đơn)
 *  - Cookie bot_session=<token>
 * Không có token => req.botUser = null (khách chưa đăng nhập).
 */
export const attachBotUser = async (req, res, next) => {
  req.botUser = null;
  const authHeader = req.headers.authorization;
  const cookieToken = String(req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith('bot_session='))?.slice('bot_session='.length);
  const queryToken = req.query?.token;
  const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (queryToken || cookieToken);
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  if (!token) return next();
  const unauthorized = () => res.status(401).json({ success: false, message: 'Phiên đăng nhập Bot đã hết hạn, hãy gõ /login', data: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { get } = await import('../services/db.js');

    if (decoded.aud === 'bot' && decoded.role === 'customer') {
      const account = await get(
        `SELECT a.id, a.username, a.is_active, a.customer_id, c.full_name
         FROM customer_accounts a JOIN customers c ON c.id = a.customer_id WHERE a.id = ?`, [decoded.id]);
      if (!account || !account.is_active) return unauthorized();
      req.botUser = { id: account.id, username: account.username, full_name: account.full_name, role: 'customer', customer_id: account.customer_id };
      return next();
    }

    if (['staff', 'owner', 'admin'].includes(decoded.role)) {
      const user = await get('SELECT id, username, full_name, role, is_active FROM users WHERE id = ?', [decoded.id]);
      if (!user || !user.is_active) return unauthorized();
      req.botUser = { id: user.id, username: user.username, full_name: user.full_name, role: user.role };
      return next();
    }

    return unauthorized();
  } catch (error) {
    console.log('Bot Auth Failed: jwt verify error:', error.message);
    return unauthorized();
  }
};

export const requireBotUser = (req, res, next) => {
  if (!req.botUser) {
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập Bot, hãy gõ /login', data: null });
  }
  next();
};
