import { notifyRoles } from '../services/notificationService.js';

const RESOURCE_LABELS = {
    attendance: 'chấm công',
    'warranty-claims': 'bảo hành',
    orders: 'đơn hàng',
    products: 'sản phẩm/kho hàng',
    returns: 'đổi trả',
    transactions: 'sổ quỹ',
    users: 'tài khoản',
    system: 'cấu hình hệ thống',
    profile: 'thông tin cá nhân'
};

// Chỉ gửi hoạt động đến các vai trò cần xử lý hoặc theo dõi nghiệp vụ đó.
const RESOURCE_RECIPIENTS = {
    attendance: ['owner'],
    'warranty-claims': ['owner', 'staff'],
    orders: ['owner', 'staff'],
    products: ['owner', 'staff'],
    returns: ['owner', 'staff'],
    transactions: ['owner'],
    users: ['owner', 'admin'],
    system: ['admin'],
    profile: []
};

const getMutation = (req) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return null;

    const pathname = req.originalUrl.split('?')[0];
    if (/^\/api\/(auth|chat|notifications|bot|support)(\/|$)/.test(pathname)) return null;
    if (/^\/api\/products\/(assist|bundle-suggestions)(\/|$)/.test(pathname)) return null;
    if (/^\/api\/system\/check-ollama(?:\/|$)/.test(pathname)) return null;

    const resourceKey = pathname.split('/')[2];
    const resource = RESOURCE_LABELS[resourceKey];
    if (!resource) return null;

    return { pathname, resource };
};

export default function activityNotificationMiddleware(req, res, next) {
    const mutation = getMutation(req);
    if (!mutation) return next();

    const sendJson = res.json.bind(res);
    res.json = (body) => {
        const roles = RESOURCE_RECIPIENTS[mutation.pathname.split('/')[2]] || [];
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false && req.user?.id && roles.length) {
            const actorRole = req.user.role;
            const actorName = req.user.full_name || req.user.username || 'Người dùng';
            const action = req.method === 'POST'
                ? 'đã tạo/cập nhật'
                : req.method === 'DELETE'
                    ? 'đã xóa'
                    : 'đã cập nhật';
            const responseMessage = typeof body?.message === 'string' ? body.message.trim() : '';
            const notificationMessage = `${actorName} (${actorRole}) ${action} ${mutation.resource}.${responseMessage ? ` ${responseMessage}` : ''}`;
            const data = body?.data;
            const relatedId = data?.id ?? data?.return_id ?? data?.warranty_claim_id ?? data?.order_id ?? data?.product_id ?? null;

            void notifyRoles({
                roles,
                title: `Cập nhật ${mutation.resource}`,
                message: notificationMessage.slice(0, 1000),
                type: req.method === 'DELETE' || mutation.pathname.endsWith('/reset-data') ? 'warning' : 'system',
                relatedId,
                excludeUserId: req.user.id
            });
        }
        return sendJson(body);
    };

    next();
}
