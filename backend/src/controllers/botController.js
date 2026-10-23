import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as db from '../services/db.js';
import { logAction } from './auditController.js';
import { runBotAgent } from '../services/botAgentService.js';
import {
    cancelPendingAction, executePendingAction, peekPendingAction
} from '../services/botActionService.js';
import { parseCommand, publicCommandList, resolveCommand, startText } from '../services/botCommandService.js';
import { runCustomerFallback, runQuickCommand } from '../services/botQuickService.js';
import { createRequest as createBotSupportRequest } from './botSupportController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_banhangai';
const BOT_TOKEN_TTL = '12h';

const rateBuckets = new Map();
const demoRegistrationEnabled = process.env.NODE_ENV !== 'production';

/** Giá»›i háº¡n táº§n suáº¥t Ä‘Æ¡n giáº£n theo khÃ³a (bá»™ nhá»›). Tráº£ vá» true náº¿u vÆ°á»£t giá»›i háº¡n. */
const isRateLimited = (key, limit, windowMs) => {
    const now = Date.now();
    const bucket = (rateBuckets.get(key) || []).filter((time) => now - time < windowMs);
    bucket.push(now);
    if (bucket.length > limit + 1) bucket.splice(0, bucket.length - limit - 1);
    rateBuckets.set(key, bucket);
    if (rateBuckets.size > 10000) {
        for (const [bucketKey, timestamps] of rateBuckets) {
            if (!timestamps.some((time) => now - time < windowMs)) rateBuckets.delete(bucketKey);
        }
    }
    return bucket.length > limit;
};

const signBotToken = (payload) => jwt.sign({ ...payload, aud: 'bot' }, JWT_SECRET, { expiresIn: BOT_TOKEN_TTL });
const setCustomerSession = (req, res, token) => {
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `bot_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/api/bot; Max-Age=43200${secure}`);
};
const clearCustomerSession = (req, res) => {
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `bot_session=; HttpOnly; SameSite=Lax; Path=/api/bot; Max-Age=0${secure}`);
};

const fail = (res, status, message) => res.status(status).json({ success: false, message, data: null });

export const requestHumanHelp = async (req, res) => {
    if (isRateLimited(`handoff:${req.ip}`, 3, 10 * 60 * 1000)) {
        return fail(res, 429, 'Báº¡n Ä‘Ã£ gá»­i yÃªu cáº§u há»— trá»£ gáº§n Ä‘Ã¢y. Vui lÃ²ng chá» cá»­a hÃ ng pháº£n há»“i.');
    }
    return createBotSupportRequest(req, res);
};

export const registerCustomer = async (req, res) => {
    try {
        if (demoRegistrationEnabled) {
            return fail(res, 400, 'Báº£n demo khÃ´ng cáº§n OTP. HÃ£y gá»­i trá»±c tiáº¿p biá»ƒu máº«u táº¡o tÃ i khoáº£n.');
        }
        const phone = String(req.body?.phone || '').trim();
        if (!/^\d{10}$/.test(phone)) return fail(res, 400, 'Sá»‘ Ä‘iá»‡n thoáº¡i pháº£i gá»“m 10 chá»¯ sá»‘.');
        if (isRateLimited(`register:${req.ip}`, 5, 10 * 60 * 1000) || isRateLimited(`register-phone:${phone}`, 3, 10 * 60 * 60 * 1000)) {
            return fail(res, 429, 'Báº¡n Ä‘Ã£ yÃªu cáº§u mÃ£ xÃ¡c minh quÃ¡ nhiá»u láº§n. Vui lÃ²ng thá»­ láº¡i sau.');
        }

        const gatewayUrl = process.env.SMS_GATEWAY_URL;
        const gatewayToken = process.env.SMS_GATEWAY_TOKEN;
        const otpSecret = process.env.BOT_OTP_SECRET;
        if (!otpSecret || otpSecret.length < 32) {
            return fail(res, 503, 'TÃ­nh nÄƒng Ä‘Äƒng kÃ½ Ä‘ang chá» cáº¥u hÃ¬nh khÃ³a OTP báº£o máº­t. Vui lÃ²ng liÃªn há»‡ cá»­a hÃ ng.');
        }
        if (!gatewayUrl || !gatewayToken) {
            return fail(res, 503, 'TÃ­nh nÄƒng Ä‘Äƒng kÃ½ Ä‘ang chá» cáº¥u hÃ¬nh cá»•ng gá»­i SMS báº£o máº­t. Vui lÃ²ng liÃªn há»‡ cá»­a hÃ ng.');
        }
        let parsedGatewayUrl;
        try { parsedGatewayUrl = new URL(gatewayUrl); } catch { return fail(res, 503, 'Cá»•ng gá»­i SMS chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh há»£p lá»‡.'); }
        if (parsedGatewayUrl.protocol !== 'https:' && process.env.NODE_ENV !== 'development') {
            return fail(res, 503, 'Cá»•ng gá»­i SMS cáº§n sá»­ dá»¥ng HTTPS.');
        }

        const existingChallenge = await db.get(
            "SELECT phone FROM bot_phone_verifications WHERE phone = ? AND last_sent_at > datetime('now', '-60 seconds')", [phone]);
        if (existingChallenge) return fail(res, 429, 'Vui lÃ²ng chá» 60 giÃ¢y trÆ°á»›c khi yÃªu cáº§u mÃ£ má»›i.');

        const ipHash = crypto.createHmac('sha256', otpSecret).update(String(req.ip || 'unknown')).digest('hex');
        await db.transaction(async () => {
            await db.run("DELETE FROM bot_otp_send_log WHERE created_at < datetime('now', '-1 day')");
            const phoneCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE phone = ? AND created_at >= datetime('now', '-1 day')", [phone]);
            const ipHourCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')", [ipHash]);
            const ipDayCount = await db.get("SELECT COUNT(*) AS total FROM bot_otp_send_log WHERE ip_hash = ? AND created_at >= datetime('now', '-1 day')", [ipHash]);
            if (phoneCount.total >= 5 || ipHourCount.total >= 5 || ipDayCount.total >= 15) {
                throw Object.assign(new Error('ÄÃ£ vÆ°á»£t sá»‘ láº§n yÃªu cáº§u mÃ£ xÃ¡c minh cho phÃ©p. Vui lÃ²ng thá»­ láº¡i sau.'), { statusCode: 429 });
            }
            await db.run('INSERT INTO bot_otp_send_log (phone, ip_hash) VALUES (?, ?)', [phone, ipHash]);
        });

        const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        const otpHash = crypto.createHmac('sha256', otpSecret).update(`${phone}:${otp}`).digest('hex');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let smsResponse;
        try {
            smsResponse = await fetch(parsedGatewayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gatewayToken}` },
                body: JSON.stringify({ to: phone, message: `Ma xac minh BanHangAI: ${otp}. Ma co hieu luc trong 5 phut.` }),
                signal: controller.signal
            });
        } finally { clearTimeout(timeout); }
        if (!smsResponse.ok) {
            console.error('Bot SMS gateway rejected verification message:', smsResponse.status);
            return fail(res, 502, 'ChÆ°a gá»­i Ä‘Æ°á»£c mÃ£ xÃ¡c minh. Vui lÃ²ng thá»­ láº¡i sau.');
        }
        await db.run(
            `INSERT INTO bot_phone_verifications (phone, otp_hash, expires_at, attempts, last_sent_at)
             VALUES (?, ?, datetime('now', '+5 minutes'), 0, CURRENT_TIMESTAMP)
             ON CONFLICT(phone) DO UPDATE SET otp_hash = excluded.otp_hash, expires_at = excluded.expires_at,
               attempts = 0, last_sent_at = CURRENT_TIMESTAMP`, [phone, otpHash]);
        return res.status(202).json({ success: true, message: 'Náº¿u gá»­i Ä‘Æ°á»£c SMS, mÃ£ xÃ¡c minh sáº½ Ä‘áº¿n sá»‘ Ä‘iá»‡n thoáº¡i cá»§a báº¡n.' });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Bot register error:', error);
        return fail(res, 500, 'ChÆ°a thá»ƒ gá»­i mÃ£ xÃ¡c minh lÃºc nÃ y.');
    }
};

export const verifyCustomerRegistration = async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        const fullName = String(req.body?.full_name || '').trim();
        const phone = String(req.body?.phone || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const address = String(req.body?.address || '').replace(/[<>]/g, '').trim().replace(/\s+/g, ' ');
        const code = String(req.body?.code || '').trim();
        const requiresOtp = !demoRegistrationEnabled;
        if ((phone && !/^\d{10}$/.test(phone)) || (requiresOtp && (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)))) {
            return fail(res, 400, 'Sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c mÃ£ xÃ¡c minh khÃ´ng há»£p lá»‡.');
        }
        if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) return fail(res, 400, 'TÃªn Ä‘Äƒng nháº­p 3-30 kÃ½ tá»±, chá»‰ gá»“m chá»¯, sá»‘, dáº¥u cháº¥m hoáº·c gáº¡ch dÆ°á»›i.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(res, 400, 'Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰ email há»£p lá»‡.');
        if (address.length < 10 || address.length > 250) return fail(res, 400, 'Äá»‹a chá»‰ cáº§n tá»« 10 Ä‘áº¿n 250 kÃ½ tá»±.');
        const minimumPasswordLength = demoRegistrationEnabled ? 6 : 10;
        if (password.length < minimumPasswordLength || password.length > 72) {
            return fail(res, 400, `Máº­t kháº©u cáº§n tá»« ${minimumPasswordLength} Ä‘áº¿n 72 kÃ½ tá»±.`);
        }
        if (fullName.length < 2 || fullName.length > 120) return fail(res, 400, 'Vui lÃ²ng nháº­p há» tÃªn há»£p lá»‡.');
        const registrationLimitKey = demoRegistrationEnabled ? `demo-register:${req.ip}` : `verify-register:${req.ip}:${phone}`;
        if (isRateLimited(registrationLimitKey, demoRegistrationEnabled ? 12 : 8, 10 * 60 * 1000)) {
            return fail(res, 429, demoRegistrationEnabled
                ? 'Báº¡n Ä‘Ã£ táº¡o quÃ¡ nhiá»u tÃ i khoáº£n demo. Vui lÃ²ng thá»­ láº¡i sau.'
                : 'Báº¡n nháº­p mÃ£ sai quÃ¡ nhiá»u láº§n. Vui lÃ²ng yÃªu cáº§u mÃ£ má»›i.');
        }

        let challenge = null;
        if (requiresOtp) {
            challenge = await db.get('SELECT otp_hash, expires_at, attempts FROM bot_phone_verifications WHERE phone = ?', [phone]);
            if (!challenge || new Date(`${challenge.expires_at.replace(' ', 'T')}Z`).getTime() < Date.now() || challenge.attempts >= 5) {
                return fail(res, 400, 'MÃ£ xÃ¡c minh Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng cÃ²n hiá»‡u lá»±c. HÃ£y yÃªu cáº§u mÃ£ má»›i.');
            }
            const otpSecret = process.env.BOT_OTP_SECRET;
            if (!otpSecret) return fail(res, 503, 'TÃ­nh nÄƒng Ä‘Äƒng kÃ½ Ä‘ang chá» cáº¥u hÃ¬nh báº£o máº­t.');
            const suppliedHash = crypto.createHmac('sha256', otpSecret).update(`${phone}:${code}`).digest('hex');
            const expected = Buffer.from(challenge.otp_hash, 'hex');
            const supplied = Buffer.from(suppliedHash, 'hex');
            if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
                await db.run('UPDATE bot_phone_verifications SET attempts = attempts + 1 WHERE phone = ?', [phone]);
                return fail(res, 400, 'MÃ£ xÃ¡c minh khÃ´ng chÃ­nh xÃ¡c.');
            }
        }

        const duplicate = await db.get(
            'SELECT 1 AS found FROM users WHERE username = ? UNION SELECT 1 FROM customer_accounts WHERE username = ?', [username, username]);
        if (duplicate) return fail(res, 409, 'TÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i.');
        const passwordHash = await bcrypt.hash(password, 12);
        let account;
        await db.transaction(async () => {
            if (requiresOtp) {
                const currentChallenge = await db.get(
                    'SELECT otp_hash, expires_at, attempts FROM bot_phone_verifications WHERE phone = ? AND expires_at > CURRENT_TIMESTAMP', [phone]);
                if (!currentChallenge || currentChallenge.otp_hash !== challenge.otp_hash || currentChallenge.attempts >= 5) {
                    throw Object.assign(new Error('MÃ£ xÃ¡c minh Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng hoáº·c khÃ´ng cÃ²n hiá»‡u lá»±c.'), { statusCode: 400 });
                }
                await db.run('DELETE FROM bot_phone_verifications WHERE phone = ?', [phone]);
            }
            let customer = phone ? await db.get('SELECT id, full_name FROM customers WHERE phone = ?', [phone]) : null;
            if (customer) {
                const linked = await db.get('SELECT id FROM customer_accounts WHERE customer_id = ?', [customer.id]);
                if (linked) throw Object.assign(new Error('Sá»‘ Ä‘iá»‡n thoáº¡i nÃ y Ä‘Ã£ Ä‘Æ°á»£c liÃªn káº¿t vá»›i tÃ i khoáº£n khÃ¡c.'), { statusCode: 409 });
                await db.run('UPDATE customers SET email = COALESCE(NULLIF(email, ?), ?), address = COALESCE(NULLIF(address, ?), ?) WHERE id = ?', ['', email, '', address, customer.id]);
            } else {
                const created = await db.run('INSERT INTO customers (full_name, phone, email, address) VALUES (?, ?, ?, ?)', [fullName, phone || null, email, address]);
                customer = { id: created.lastID, full_name: fullName };
            }
            const inserted = await db.run(
                'INSERT INTO customer_accounts (customer_id, username, password_hash) VALUES (?, ?, ?)', [customer.id, username, passwordHash]);
            account = { id: inserted.lastID, customer_id: customer.id, full_name: customer.full_name };
        });

        await logAction(null, 'AUTH', demoRegistrationEnabled ? 'KhÃ¡ch hÃ ng táº¡o tÃ i khoáº£n Bot demo' : 'KhÃ¡ch hÃ ng Ä‘Äƒng kÃ½ Bot sau khi xÃ¡c minh sá»‘ Ä‘iá»‡n thoáº¡i', { username, customer_id: account.customer_id });
        const token = signBotToken({ id: account.id, username, role: 'customer', customer_id: account.customer_id });
        setCustomerSession(req, res, token);
        return res.status(201).json({ success: true, message: 'ÄÄƒng kÃ½ thÃ nh cÃ´ng', data: { token, user: { id: account.id, username, full_name: account.full_name, role: 'customer' } } });
    } catch (error) {
        if (error.statusCode) return fail(res, error.statusCode, error.message);
        console.error('Bot registration verification error:', error);
        return fail(res, 500, 'ChÆ°a thá»ƒ hoÃ n táº¥t Ä‘Äƒng kÃ½ lÃºc nÃ y.');
    }
};

export const loginBot = async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        if (!username || !password) return fail(res, 400, 'Thiáº¿u tÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u.');
        if (isRateLimited(`login:${req.ip}:${username.toLowerCase()}`, 8, 5 * 60 * 1000)) {
            return fail(res, 429, 'ÄÄƒng nháº­p sai quÃ¡ nhiá»u láº§n, vui lÃ²ng thá»­ láº¡i sau 5 phÃºt.');
        }

        const account = await db.get(
            `SELECT a.*, c.full_name FROM customer_accounts a JOIN customers c ON c.id = a.customer_id WHERE a.username = ?`, [username]);
        if (!account || !(await bcrypt.compare(password, account.password_hash))) {
            await logAction(null, 'AUTH', 'ÄÄƒng nháº­p Bot tháº¥t báº¡i', { username });
            return fail(res, 401, 'Sai tÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u.');
        }
        if (!account.is_active) return fail(res, 403, 'TÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³a, liÃªn há»‡ cá»­a hÃ ng Ä‘á»ƒ Ä‘Æ°á»£c xá»­ lÃ½.');

        await logAction(null, 'AUTH', 'KhÃ¡ch hÃ ng Ä‘Äƒng nháº­p Bot thÃ nh cÃ´ng', { username, customer_id: account.customer_id });
        const token = signBotToken({ id: account.id, username, role: 'customer', customer_id: account.customer_id });
        setCustomerSession(req, res, token);
        return res.json({
            success: true,
            message: 'ÄÄƒng nháº­p thÃ nh cÃ´ng',
            data: { token, user: { id: account.id, username, full_name: account.full_name, role: 'customer' } }
        });
    } catch (error) {
        console.error('Bot login error:', error);
        return fail(res, 500, 'Lá»—i há»‡ thá»‘ng mÃ¡y chá»§');
    }
};

export const logoutBot = (req, res) => {
    clearCustomerSession(req, res);
    return res.json({ success: true, message: 'ÄÃ£ Ä‘Äƒng xuáº¥t.' });
};

export const confirmCustomerAction = async (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chá»‰ khÃ¡ch hÃ ng Ä‘Äƒng nháº­p má»›i xÃ¡c nháº­n thao tÃ¡c táº¡i Ä‘Ã¢y.');
    const actionId = String(req.params.id || '');
    if (!/^[a-f0-9]{6}$/i.test(actionId)) return fail(res, 400, 'MÃ£ xÃ¡c nháº­n khÃ´ng há»£p lá»‡.');
    const result = await executePendingAction(req.botUser, actionId);
    return res.status(result.ok ? 200 : 409).json({ success: result.ok, message: result.message, data: null });
};

export const cancelCustomerAction = (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chá»‰ khÃ¡ch hÃ ng Ä‘Äƒng nháº­p má»›i há»§y thao tÃ¡c táº¡i Ä‘Ã¢y.');
    const action = peekPendingAction(req.botUser);
    if (!action || action.id !== String(req.params.id || '')) return fail(res, 409, 'Thao tÃ¡c Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng cÃ²n chá» xÃ¡c nháº­n.');
    cancelPendingAction(req.botUser);
    return res.json({ success: true, message: 'ÄÃ£ há»§y thao tÃ¡c Ä‘ang chá».', data: null });
};

export const getBotProfile = (req, res) => {
    const user = req.botUser;
    res.json({
        success: true,
        data: {
            user: user ? { id: user.id, username: user.username, full_name: user.full_name, role: user.role } : null,
            commands: publicCommandList(user?.role || 'guest'),
            registrationRequiresOtp: !demoRegistrationEnabled
        }
    });
};

export const getCustomerUpdates = async (req, res) => {
    if (req.botUser?.role !== 'customer') return fail(res, 403, 'Chá»‰ tÃ i khoáº£n khÃ¡ch hÃ ng má»›i xem Ä‘Æ°á»£c thÃ´ng bÃ¡o Ä‘Æ¡n hÃ ng.');
    try {
        const updates = await db.query(
            `SELECT id, title, message, order_id, created_at,
                    CASE WHEN order_id IS NOT NULL THEN '/api/bot/orders/' || order_id || '/invoice.svg' ELSE NULL END AS invoice_image_url
             FROM bot_customer_notifications WHERE customer_account_id = ? AND read_at IS NULL ORDER BY id ASC LIMIT 20`,
            [req.botUser.id]
        );
        if (updates.length) {
            await db.run(
                `UPDATE bot_customer_notifications SET read_at = CURRENT_TIMESTAMP WHERE customer_account_id = ? AND id IN (${updates.map(() => '?').join(',')})`,
                [req.botUser.id, ...updates.map((update) => update.id)]
            );
        }
        return res.json({ success: true, data: updates });
    } catch (error) {
        console.error('Get customer bot updates failed:', error);
        return fail(res, 500, 'KhÃ´ng táº£i Ä‘Æ°á»£c thÃ´ng bÃ¡o Ä‘Æ¡n hÃ ng.');
    }
};

const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[character]));

export const getCustomerInvoiceImage = async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isSafeInteger(orderId) || orderId < 1) return fail(res, 400, 'Mã đơn hàng không hợp lệ.');
    try {
        let order;
        if (req.botUser?.role === 'customer') {
            order = await db.get(
                `SELECT id, customer_id, customer_name, created_at, total_amount, payment_method, shipping_fee, status,
                        EXISTS (SELECT 1 FROM transactions t WHERE t.reference_id = orders.id AND t.type = 'income' AND t.source = 'auto') AS has_payment
                 FROM orders WHERE id = ? AND customer_id = ? AND status IN ('processing', 'shipped', 'delivered')`,
                [orderId, req.botUser.customer_id]);
        } else if (['staff', 'owner', 'admin'].includes(req.botUser?.role)) {
            order = await db.get(
                `SELECT id, customer_id, customer_name, created_at, total_amount, payment_method, shipping_fee, status,
                        EXISTS (SELECT 1 FROM transactions t WHERE t.reference_id = orders.id AND t.type = 'income' AND t.source = 'auto') AS has_payment
                 FROM orders WHERE id = ? AND status IN ('processing', 'shipped', 'delivered')`,
                [orderId]);
        } else {
            return fail(res, 403, 'Chỉ khách hàng hoặc nhân viên đăng nhập mới xem được hóa đơn này.');
        }
        if (!order) return fail(res, 404, 'Chưa có hóa đơn được cửa hàng xác nhận cho đơn này.');
        const items = await db.query(
            `SELECT COALESCE(oi.product_name, p.name) AS name, oi.quantity, oi.unit_price
             FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ? ORDER BY oi.id`, [orderId]);
        if (!items.length) return fail(res, 404, 'KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m trÃªn hÃ³a Ä‘Æ¡n.');

        const invoiceCode = `INV-${new Date(`${String(order.created_at).replace(' ', 'T')}Z`).toISOString().slice(2, 10).replace(/-/g, '')}-${String(order.id).padStart(4, '0')}`;
        const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}Ä‘`;
        const height = 410 + items.length * 54;
        const itemRows = items.map((item, index) => {
            const y = 268 + index * 54;
            const lineTotal = Number(item.quantity) * Number(item.unit_price);
            return `<text x="42" y="${y}" class="item">${escapeXml(item.name)}</text><text x="42" y="${y + 22}" class="muted">${Number(item.quantity)} Ã— ${money(item.unit_price)}</text><text x="598" y="${y + 8}" text-anchor="end" class="amount">${money(lineTotal)}</text><line x1="42" y1="${y + 36}" x2="598" y2="${y + 36}" class="rule"/>`;
        }).join('');
        const shippingY = 286 + items.length * 54;
        const totalY = shippingY + 28;
        const date = new Date(`${String(order.created_at).replace(' ', 'T')}Z`).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const paymentMethod = { cash: 'Tiá»n máº·t', transfer: 'Chuyá»ƒn khoáº£n', card: 'Tháº»' }[order.payment_method] || 'ChÆ°a chá»n';
        const paymentStatus = order.has_payment ? 'ÄÃƒ THANH TOÃN' : 'CHá»œ THANH TOÃN';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${height}" viewBox="0 0 640 ${height}" role="img" aria-labelledby="title desc"><title id="title">HÃ³a Ä‘Æ¡n ${escapeXml(invoiceCode)}</title><desc id="desc">ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c cá»­a hÃ ng xÃ¡c nháº­n, ${escapeXml(paymentStatus.toLowerCase())}.</desc><rect width="640" height="${height}" rx="24" fill="#f1f5f9"/><rect x="16" y="16" width="608" height="${height - 32}" rx="18" fill="#fff"/><rect x="16" y="16" width="608" height="12" rx="6" fill="#4f46e5"/><text x="42" y="72" class="brand">HTH SMART SALES</text><text x="42" y="112" class="heading">HÃ“A ÄÆ N BÃN HÃ€NG</text><text x="42" y="145" class="muted">MÃ£ hÃ³a Ä‘Æ¡n: ${escapeXml(invoiceCode)}</text><text x="42" y="171" class="muted">NgÃ y táº¡o: ${escapeXml(date)}</text><text x="42" y="197" class="muted">KhÃ¡ch hÃ ng: ${escapeXml(order.customer_name || 'KhÃ¡ch hÃ ng')}</text><rect x="42" y="216" width="556" height="30" rx="8" fill="#eef2ff"/><text x="54" y="236" class="status">ÄÆ N ÄÃƒ ÄÆ¯á»¢C XÃC NHáº¬N Â· ${escapeXml(paymentStatus)} Â· ${escapeXml(paymentMethod.toUpperCase())}</text>${itemRows}<text x="42" y="${shippingY}" class="muted">PhÃ­ giao hÃ ng</text><text x="598" y="${shippingY}" text-anchor="end" class="amount">${money(order.shipping_fee)}</text><text x="42" y="${totalY}" class="total-label">Tá»”NG Cá»˜NG</text><text x="598" y="${totalY}" text-anchor="end" class="total">${money(order.total_amount)}</text><text x="42" y="${totalY + 40}" class="footer">Cáº£m Æ¡n báº¡n Ä‘Ã£ mua sáº¯m táº¡i cá»­a hÃ ng.</text><style>text{font-family:Arial,'DejaVu Sans',sans-serif;fill:#0f172a}.brand{font-size:14px;font-weight:700;letter-spacing:2px;fill:#4f46e5}.heading{font-size:25px;font-weight:800}.muted{font-size:13px;fill:#64748b}.status{font-size:11px;font-weight:700;fill:#4338ca}.item{font-size:15px;font-weight:700}.amount{font-size:14px;font-weight:700}.rule{stroke:#e2e8f0}.total-label{font-size:14px;font-weight:800;fill:#334155}.total{font-size:21px;font-weight:800;fill:#4f46e5}.footer{font-size:13px;fill:#64748b}</style></svg>`;
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${invoiceCode}.svg"`);
        res.setHeader('Cache-Control', 'private, no-store');
        return res.status(200).send(svg);
    } catch (error) {
        console.error('Get customer invoice image failed:', error);
        return fail(res, 500, 'KhÃ´ng táº£i Ä‘Æ°á»£c áº£nh hÃ³a Ä‘Æ¡n.');
    }
};

const broadcastSystemMessage = async (message) => db.transaction(async () => {
    const employeeResult = await db.run(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         SELECT id, 'ThÃ´ng bÃ¡o há»‡ thá»‘ng', ?, 'system', NULL FROM users WHERE is_active = 1`,
        [message]
    );
    const customerResult = await db.run(
        `INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message)
         SELECT id, NULL, 'ThÃ´ng bÃ¡o há»‡ thá»‘ng', ? FROM customer_accounts WHERE is_active = 1`,
        [message]
    );
    return { employees: employeeResult.changes || 0, customers: customerResult.changes || 0 };
});

const friendlyAiError = (error, role) => {
    const text = [error?.message, error?.status, error?.statusText, error?.code].filter(Boolean).join(' ');
    if (/\b503\b|UNAVAILABLE|overload|temporarily unavailable|deadline exceeded/i.test(text)) {
        return 'Dá»‹ch vá»¥ AI Ä‘ang táº¡m thá»i quÃ¡ táº£i (503). Dá»¯ liá»‡u Ä‘Æ¡n hÃ ng vÃ  sáº£n pháº©m váº«n an toÃ n; vui lÃ²ng thá»­ láº¡i sau Ã­t phÃºt hoáº·c nhá» nhÃ¢n viÃªn há»— trá»£.';
    }
    if (!['guest', 'customer'].includes(role)) {
        if (/GEMINI_API_KEY|API key/i.test(text)) return 'Bot chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh khÃ³a Gemini. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.';
        if (/429|quota|RESOURCE_EXHAUSTED/i.test(text)) return 'Gemini Ä‘ang quÃ¡ táº£i hoáº·c háº¿t háº¡n má»©c, vui lÃ²ng thá»­ láº¡i sau Ã­t phÃºt.';
        return 'Bot táº¡m thá»i khÃ´ng pháº£n há»“i Ä‘Æ°á»£c, vui lÃ²ng thá»­ láº¡i sau.';
    }
    if (/429|quota|RESOURCE_EXHAUSTED/i.test(text)) return 'Hiá»‡n tÃ´i Ä‘ang quÃ¡ táº£i, báº¡n dÃ¹ng cÃ¡c nÃºt bÃªn dÆ°á»›i hoáº·c chá» nhÃ¢n viÃªn há»— trá»£ nhÃ©.';
    if (/GEMINI_API_KEY|API key/i.test(text)) return 'Hiá»‡n tÃ´i chÆ°a thá»ƒ tráº£ lá»i tá»± do. Báº¡n cÃ³ thá»ƒ dÃ¹ng cÃ¡c nÃºt bÃªn dÆ°á»›i hoáº·c gáº·p nhÃ¢n viÃªn há»— trá»£.';
    return 'Hiá»‡n tÃ´i chÆ°a thá»ƒ xá»­ lÃ½ cÃ¢u há»i nÃ y. Báº¡n thá»­ láº¡i hoáº·c dÃ¹ng cÃ¡c nÃºt bÃªn dÆ°á»›i Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£.';
};

const sanitizeHistory = (history) => (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((entry) => ['user', 'assistant'].includes(entry?.role) && typeof entry?.content === 'string' && entry.content.trim())
    .map((entry) => ({ role: entry.role, content: redactPhone(redactCccd(entry.content)).slice(0, 1200) }));

const redactCccd = (value) => String(value).replace(/(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)/g, '[Ä‘Ã£ áº©n CCCD]');
const redactPhone = (value) => String(value).replace(/(?<!\d)(?:\+?84|0)\d{9}(?!\d)/g, '[Ä‘Ã£ áº©n sá»‘ Ä‘iá»‡n thoáº¡i]');

export const streamBot = async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const attachment = req.file && ['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)
        ? { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') }
        : null;
    const effectiveMessage = message || (attachment ? 'HÃ£y xem áº£nh tÃ´i gá»­i vÃ  giÃºp tÃ´i Ä‘á»c thÃ´ng tin trÃªn Ä‘Ã³.' : '');
    if (!effectiveMessage || effectiveMessage.length > 2000) {
        return fail(res, 400, 'Tin nháº¯n pháº£i cÃ³ ná»™i dung vÃ  khÃ´ng vÆ°á»£t quÃ¡ 2.000 kÃ½ tá»±.');
    }
    if (redactCccd(effectiveMessage) !== effectiveMessage) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: 'KhÃ´ng gá»­i CCCD hoáº·c áº£nh giáº¥y tá» trong chat. Vá»›i há»“ sÆ¡ tráº£ gÃ³p, hÃ£y nháº­p thÃ´ng tin trá»±c tiáº¿p trÃªn kÃªnh chÃ­nh thá»©c cá»§a Ä‘á»‘i tÃ¡c tÃ i chÃ­nh hoáº·c liÃªn há»‡ nhÃ¢n viÃªn.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
    }
    if (redactPhone(effectiveMessage) !== effectiveMessage) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: 'KhÃ´ng gá»­i sá»‘ Ä‘iá»‡n thoáº¡i trong chat. HÃ£y dÃ¹ng biá»ƒu máº«u Ä‘Äƒng kÃ½ Ä‘á»ƒ xÃ¡c minh sá»‘ hoáº·c liÃªn há»‡ nhÃ¢n viÃªn náº¿u cáº§n cáº­p nháº­t thÃ´ng tin.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
    }
    const user = req.botUser || { id: `guest:${req.ip}`, username: 'guest', full_name: 'KhÃ¡ch', role: 'guest' };
    const limiterKey = req.botUser ? `${user.role}:${user.id}` : `guest:${req.ip}`;
    if (isRateLimited(`chat:${limiterKey}`, 30, 60 * 1000)) {
        return fail(res, 429, 'Báº¡n nháº¯n quÃ¡ nhanh, vui lÃ²ng chá» má»™t chÃºt.');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
    const finish = () => { res.write('data: [DONE]\n\n'); res.end(); };

    try {
        let prompt = effectiveMessage;

        if (message.startsWith('/') && !attachment) {
            const command = parseCommand(message);
            if (!command) {
                send({ content: 'CÃº phÃ¡p lá»‡nh chÆ°a Ä‘Ãºng. GÃµ /trogiup Ä‘á»ƒ xem danh sÃ¡ch lá»‡nh.' });
                return finish();
            }
            const resolved = resolveCommand({ ...command, user });
            if (resolved.type === 'text') {
                send({ content: resolved.text });
                return finish();
            }
            if (resolved.type === 'broadcast') {
                const delivered = await broadcastSystemMessage(resolved.message);
                await logAction(user.id, 'BOT', 'Gá»­i thÃ´ng bÃ¡o há»‡ thá»‘ng qua Bot', delivered);
                send({ content: `âœ… ÄÃ£ gá»­i thÃ´ng bÃ¡o Ä‘áº¿n ${delivered.employees} tÃ i khoáº£n nhÃ¢n viÃªn/quáº£n trá»‹ vÃ  ${delivered.customers} tÃ i khoáº£n khÃ¡ch hÃ ng.` });
                return finish();
            }
            if (resolved.type === 'confirm') {
                if (user.role === 'customer') {
                    send({ content: 'Äá»ƒ an toÃ n, hÃ£y báº¥m nÃºt xÃ¡c nháº­n trÃªn tháº» tÃ³m táº¯t Ä‘Æ¡n hÃ ng.' });
                    return finish();
                }
                const result = await executePendingAction(user);
                send({ content: `${result.ok ? 'âœ…' : 'âš ï¸'} ${result.message}`, ...(result.ok ? { executed: true } : {}) });
                return finish();
            }
            if (resolved.type === 'cancel') {
                if (user.role === 'customer') {
                    send({ content: 'HÃ£y dÃ¹ng nÃºt Há»§y trÃªn tháº» thao tÃ¡c Ä‘ang chá».' });
                    return finish();
                }
                const cancelled = cancelPendingAction(user);
                send({ content: cancelled ? 'ÄÃ£ há»§y thao tÃ¡c Ä‘ang chá».' : 'KhÃ´ng cÃ³ thao tÃ¡c nÃ o Ä‘ang chá» Ä‘á»ƒ há»§y.' });
                return finish();
            }
            const quick = await runQuickCommand({ ...command, name: resolved.commandName || command.name, user });
            if (quick) {
                send({ content: quick });
                return finish();
            }
            prompt = resolved.prompt;
        }

        const pendingBefore = peekPendingAction(user)?.id;
        let suppliedHistory = req.body?.history;
        if (typeof suppliedHistory === 'string') {
            try { suppliedHistory = JSON.parse(suppliedHistory); } catch { suppliedHistory = []; }
        }
        const history = [...sanitizeHistory(suppliedHistory), { role: 'user', content: prompt }];
        for await (const chunk of runBotAgent({ user, history, attachment })) {
            if (chunk) send({ content: chunk });
        }
        const pendingAfter = peekPendingAction(user);
        if (pendingAfter && pendingAfter.id !== pendingBefore) {
            if (user.role === 'customer') send({ pending: { id: pendingAfter.id, summary: pendingAfter.summary } });
        }
        return finish();
    } catch (error) {
        console.error('Bot stream error:', error);
        if (req.botUser?.role === 'customer' || !req.botUser) {
            try {
                const fallback = await runCustomerFallback({ message: effectiveMessage, user });
                if (fallback) {
                    send({ content: `${fallback}\n\n_(AI đang tạm quá tải; đây là kết quả tra cứu trực tiếp từ dữ liệu cửa hàng.)_` });
                    return finish();
                }
            } catch (fallbackError) {
                console.error('Bot fallback error:', fallbackError);
            }
        }
        send({ error: friendlyAiError(error, req.botUser?.role || 'guest') });
        return finish();
    }
};
