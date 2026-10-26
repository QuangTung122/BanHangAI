import crypto from 'crypto';
import * as db from './db.js';
import { logAction } from '../controllers/auditController.js';
import { confirmBotOrder, confirmOrderPayment, createOrder } from '../controllers/orderController.js';
import { createReturnRequest, approveReturnRequest } from '../controllers/returnWarrantyController.js';
import { notifyRoles } from './notificationService.js';
import { expireBotReservations } from './botReservationService.js';

const PENDING_TTL_MS = 10 * 60 * 1000;
const PAYMENT_METHODS = ['cash', 'transfer', 'card'];
const pendingActions = new Map();

const botError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

export const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} ₫`;

export const unitPriceOf = (product) => {
    const discount = Number(product.discount_percent) || 0;
    return Math.round(Number(product.price) * (100 - discount) / 100);
};

export const invoiceCodeOf = (orderId, createdAt) => {
    const raw = String(createdAt || '');
    const date = new Date(raw.includes('Z') ? raw : `${raw.replace(' ', 'T')}Z`);
    if (Number.isNaN(date.getTime())) return `INV-${orderId}`;
    return `INV-${date.toISOString().slice(2, 10).replace(/-/g, '')}-${String(orderId).padStart(4, '0')}`;
};

const pendingKey = (user) => `${user.role}:${user.id}`;

/** Gọi lại controller Express hiện có (không qua HTTP) để tái sử dụng nguyên logic nghiệp vụ & kiểm tra quyền. */
const callController = (handler, { user, body = {}, params = {}, query = {} }) => new Promise((resolve) => {
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(payload) { resolve({ status: this.statusCode, body: payload }); return this; },
        setHeader() {}
    };
    Promise.resolve(handler({ user, body, params, query }, res))
        .catch((error) => resolve({ status: 500, body: { success: false, message: error.message } }));
});

const notifyCustomer = async (customerId, orderId, title, message) => {
    if (!customerId) return;
    const account = await db.get('SELECT id FROM customer_accounts WHERE customer_id = ? AND is_active = 1', [customerId]);
    if (account) await db.run(
        'INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message) VALUES (?, ?, ?, ?)',
        [account.id, orderId, title, message]
    );
};

export const normalizePaymentMethod = (method) => (PAYMENT_METHODS.includes(method) ? method : 'cash');

/** Chuẩn hóa & kiểm tra giỏ hàng từ DB; trả về dòng hàng, tổng tiền để hiển thị trước khi xác nhận. */
export const buildCart = async (rawItems) => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw botError('Chưa có sản phẩm nào để đặt.');
    const quantities = new Map();
    for (const item of rawItems) {
        const productId = Number(item?.product_id);
        const quantity = Number(item?.quantity ?? 1);
        if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
            throw botError('Mã sản phẩm hoặc số lượng không hợp lệ (số lượng từ 1 đến 100).');
        }
        quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }
    const ids = [...quantities.keys()];
    const products = await db.query(
        `SELECT id, name, price, discount_percent, stock_quantity, is_active FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
    );
    const byId = new Map(products.map((product) => [product.id, product]));
    const lines = [];
    let total = 0;
    for (const [productId, quantity] of quantities) {
        const product = byId.get(productId);
        if (!product) throw botError(`Không tìm thấy sản phẩm mã ${productId}.`, 404);
        if (!product.is_active) throw botError(`Sản phẩm "${product.name}" đã ngừng kinh doanh.`, 409);
        if (product.stock_quantity < quantity) throw botError(`"${product.name}" chỉ còn ${product.stock_quantity} sản phẩm trong kho.`, 409);
        const unitPrice = unitPriceOf(product);
        total += unitPrice * quantity;
        lines.push({ product_id: productId, name: product.name, quantity, unit_price: unitPrice });
    }
    return { lines, total };
};

export const createPendingAction = (user, type, payload, summary) => {
    const action = {
        id: crypto.randomBytes(3).toString('hex'),
        type,
        payload,
        summary,
        expiresAt: Date.now() + PENDING_TTL_MS
    };
    pendingActions.set(pendingKey(user), action);
    return { action_id: action.id, summary };
};

export const peekPendingAction = (user) => {
    const action = pendingActions.get(pendingKey(user));
    if (action && action.expiresAt < Date.now()) {
        pendingActions.delete(pendingKey(user));
        return null;
    }
    return action || null;
};

export const cancelPendingAction = (user) => {
    const action = peekPendingAction(user);
    pendingActions.delete(pendingKey(user));
    return action;
};

const executors = {
    async accept_customer_order(user, { order_id }) {
        const result = await callController(confirmBotOrder, {
            user,
            params: { id: String(order_id) }
        });
        if (result.status >= 400 || !result.body?.success) {
            throw botError(result.body?.message || 'Không thể xác nhận đơn hàng.', result.status);
        }
        const invoiceCode = result.body.data.invoice_code;
        return `Đã xác nhận đơn #${order_id} và tạo hóa đơn ${invoiceCode}. Ảnh hóa đơn đã được gửi vào Bot của khách hàng; trạng thái thanh toán chưa được xác nhận.`;
    },
    async create_order_customer(user, { items, payment_method, address, shipping_method = 'standard', shipping_fee = 0, price_snapshot }) {
        const cleanAddress = typeof address === 'string' ? address.replace(/[<>]/g, '').trim().replace(/\s+/g, ' ') : '';
        if (cleanAddress.length < 10 || cleanAddress.length > 250 || /^(test|abc|na|n\/a|khong co|không có|dia chi|địa chỉ)$/i.test(cleanAddress)) {
            throw botError('Vui lòng nhập địa chỉ giao hàng cụ thể từ 10 đến 250 ký tự.');
        }
        await expireBotReservations();
        const customer = await db.get('SELECT id, full_name, phone, address FROM customers WHERE id = ?', [user.customer_id]);
        if (!customer) throw botError('Không tìm thấy hồ sơ khách hàng.', 404);
        let created;
        await db.transaction(async () => {
            const activeReservations = await db.get(
                `SELECT COUNT(*) AS total FROM orders
                 WHERE customer_id = ? AND status = 'pending' AND bot_reservation_expires_at > CURRENT_TIMESTAMP`, [customer.id]);
            if ((activeReservations?.total || 0) >= 2) {
                throw botError('Bạn đang có 2 đơn chờ xác nhận. Hãy chờ cửa hàng xử lý hoặc hủy một đơn trước khi đặt tiếp.', 429);
            }
            const cart = await buildCart(items);
            const changedPrice = cart.lines.find((line) => Number(price_snapshot?.[line.product_id]) !== line.unit_price);
            if (changedPrice) {
                throw botError(`Giá sản phẩm "${changedPrice.name}" đã thay đổi. Đơn chưa được tạo; vui lòng chuẩn bị lại đơn để xem và xác nhận mức giá mới.`, 409);
            }
            if (!['pickup', 'standard', 'express'].includes(shipping_method)) throw botError('Hình thức giao hàng không hợp lệ.');
            const expectedShippingFee = shipping_method === 'pickup' || cart.total >= 5000000
                ? 0 : shipping_method === 'express' ? 50000 : 30000;
            if (Number(shipping_fee) !== expectedShippingFee) {
                throw botError('Phí giao hàng đã thay đổi. Vui lòng chuẩn bị lại đơn để xem mức phí mới.', 409);
            }
            const order = await db.run(
                `INSERT INTO orders (user_id, customer_id, total_amount, customer_name, customer_phone, shipping_address,
                                     status, payment_type, payment_method, shipping_method, shipping_fee, bot_reservation_expires_at)
                 VALUES (NULL, ?, ?, ?, ?, ?, 'pending', 'full', ?, ?, ?, datetime('now', '+30 minutes'))`,
                [customer.id, cart.total + expectedShippingFee, customer.full_name, customer.phone, cleanAddress,
                    payment_method, shipping_method, expectedShippingFee]
            );
            const orderId = order.lastID;
            for (const line of cart.lines) {
                const product = await db.get('SELECT sku, warranty_months, import_price FROM products WHERE id = ?', [line.product_id]);
                const update = await db.run(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND is_active = 1 AND stock_quantity >= ?',
                    [line.quantity, line.product_id, line.quantity]
                );
                if (update.changes !== 1) throw botError(`Tồn kho "${line.name}" vừa thay đổi, vui lòng đặt lại.`, 409);
                await db.run(
                    `INSERT INTO order_items (order_id, product_id, product_name, sku, warranty_months, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, line.product_id, line.name, product?.sku || null, product?.warranty_months || 0, line.quantity, line.unit_price]
                );
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'sale', ?, ?, 'order', ?, NULL, ?)`,
                    [line.product_id, -line.quantity, product?.import_price || null, orderId, 'Khách đặt hàng qua Bot (chờ xác nhận)']
                );
            }
            created = { orderId, subtotal: cart.total, shippingFee: expectedShippingFee, total: cart.total + expectedShippingFee };
        });
        await logAction(null, 'BOT', 'Khách đặt hàng qua Bot', { customer_id: customer.id, order_id: created.orderId });
        await notifyRoles({
            roles: ['staff', 'owner'],
            title: 'Đơn Bot chờ xác nhận',
            message: `Khách ${customer.full_name} vừa đặt đơn #${created.orderId}, tổng ${formatMoney(created.total)} (phí giao ${formatMoney(created.shippingFee)}). Hãy mở mục “Đơn hàng & xác nhận Bot” trong hệ thống nội bộ để xử lý trước khi hết hạn giữ hàng.`,
            type: 'order', relatedId: created.orderId
        });
        return `Đã tạo đơn #${created.orderId}, tiền hàng ${formatMoney(created.subtotal)}, phí giao ${formatMoney(created.shippingFee)}, tổng ${formatMoney(created.total)}. Đơn đang chờ cửa hàng xác nhận trong 30 phút.`;
    },

    async create_order_staff(user, { items, payment_method, customer_name, customer_phone }) {
        const result = await callController(createOrder, {
            user,
            body: { items, payment_type: 'full', payment_method, customer_name, customer_phone }
        });
        if (result.status >= 400 || !result.body?.success) throw botError(result.body?.message || 'Không thể tạo đơn hàng.', result.status);
        const data = result.body.data;
        await logAction(user.id, 'BOT', 'Tạo đơn hàng qua Bot', { order_id: data.order_id, invoice_code: data.invoice_code });
        return `Đã lập hóa đơn ${data.invoice_code} (đơn #${data.order_id}), tổng ${formatMoney(data.total_amount)}.`;
    },

    async ship_order(user, { order_id, shipping_carrier, tracking_code, estimated_delivery_at }) {
        let customerId;
        let invoiceCode;
        await db.transaction(async () => {
            const order = await db.get('SELECT id, customer_id, status, created_at FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('Không tìm thấy đơn hàng.', 404);
            if (order.status !== 'processing') throw botError('Chỉ bàn giao được đơn đang ở trạng thái processing.', 409);
            const result = await db.run(
                `UPDATE orders SET status = 'shipped', shipping_carrier = ?, tracking_code = ?, estimated_delivery_at = ?
                 WHERE id = ? AND status = 'processing'`,
                [shipping_carrier.trim(), tracking_code.trim(), estimated_delivery_at || null, order_id]
            );
            if (result.changes !== 1) throw botError('Đơn vừa được cập nhật bởi người khác. Hãy tải lại và thử lại.', 409);
            customerId = order.customer_id;
            invoiceCode = invoiceCodeOf(order.id, order.created_at);
            await notifyCustomer(customerId, order_id, `Đơn ${invoiceCode} đang được giao`,
                `Đơn hàng #${invoiceCode} đã được bàn giao cho ${shipping_carrier.trim()}, mã vận đơn ${tracking_code.trim()}${estimated_delivery_at ? `. Dự kiến giao ${estimated_delivery_at}.` : '.'}`);
        });
        await logAction(user.id, 'BOT', 'Cập nhật vận đơn qua Bot', { order_id, shipping_carrier, tracking_code });
        return `Đơn #${order_id} đã chuyển sang trạng thái đang giao. Mã vận đơn ${tracking_code} (${shipping_carrier}).`;
    },

    async cancel_returned_shipment(user, { order_id, reason }) {
        await db.transaction(async () => {
            const order = await db.get('SELECT id, customer_id, status FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('Không tìm thấy đơn hàng.', 404);
            if (!['shipped', 'processing'].includes(order.status)) throw botError('Chỉ ghi nhận hoàn kho cho đơn đang giao hoặc đang chuẩn bị.', 409);
            const changed = await db.run("UPDATE orders SET status = 'cancelled', bot_reservation_expires_at = NULL WHERE id = ? AND status = ?", [order_id, order.status]);
            if (changed.changes !== 1) throw botError('Đơn vừa được cập nhật bởi người khác.', 409);
            const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order_id]);
            for (const item of items) {
                await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                     VALUES (?, 'return', ?, 'order', ?, ?, ?)`,
                    [item.product_id, item.quantity, order_id, user.id, `Hoàn kho do giao hàng thất bại: ${String(reason).slice(0, 200)}`]
                );
            }
            await notifyCustomer(order.customer_id, order_id, `Đơn #${order_id} đã được hoàn về cửa hàng`,
                `Đơn hàng đã được hủy và nhập lại kho sau khi giao thất bại. Lý do: ${String(reason).slice(0, 200)}.`);
        });
        await logAction(user.id, 'BOT', 'Hoàn kho đơn giao thất bại', { order_id, reason });
        return `Đã hủy đơn #${order_id} và nhập lại các sản phẩm vào kho.`;
    },

    async cancel_order_customer(user, { order_id }) {
        await db.transaction(async () => {
            await expireBotReservations();
            const order = await db.get('SELECT id, status, customer_id FROM orders WHERE id = ?', [order_id]);
            if (!order || order.customer_id !== user.customer_id) throw botError('Không tìm thấy đơn hàng của bạn.', 404);
            if (order.status !== 'pending') throw botError('Chỉ hủy được đơn đang chờ xác nhận.', 409);
            const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order_id]);
            for (const item of items) {
                await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                     VALUES (?, 'return', ?, 'order', ?, NULL, 'Khách hủy đơn chờ xác nhận qua Bot')`,
                    [item.product_id, item.quantity, order_id]
                );
            }
            await db.run("UPDATE orders SET status = 'cancelled', bot_reservation_expires_at = NULL WHERE id = ?", [order_id]);
        });
        await logAction(null, 'BOT', 'Khách hủy đơn qua Bot', { customer_id: user.customer_id, order_id });
        return `Đã hủy đơn #${order_id} và hoàn hàng về kho.`;
    },

    async confirm_payment(user, { order_id }) {
        let invoiceCode;
        let customerAccount;
        let orderItems;
        await db.transaction(async () => {
            const order = await db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('Không tìm thấy đơn hàng.', 404);
            if (!['pending', 'processing', 'shipped'].includes(order.status) || order.payment_type !== 'full') {
                throw botError('Chỉ xác nhận thanh toán cho đơn trả một lần đang chờ xác nhận.', 409);
            }
            const paid = await db.get(
                `SELECT id FROM transactions WHERE reference_id = ? AND type = 'income' AND source = 'auto' AND category = 'Bán hàng'`,
                [order_id]
            );
            if (paid) throw botError('Đơn này đã được ghi nhận thanh toán.', 409);
            invoiceCode = invoiceCodeOf(order.id, order.created_at);
            customerAccount = order.customer_id
                ? await db.get('SELECT id FROM customer_accounts WHERE customer_id = ? AND is_active = 1', [order.customer_id])
                : null;
            orderItems = await db.query(
                'SELECT COALESCE(product_name, (SELECT name FROM products WHERE id = order_items.product_id)) AS name, quantity, unit_price FROM order_items WHERE order_id = ?',
                [order.id]
            );
            await db.run("UPDATE orders SET status = 'delivered', bot_reservation_expires_at = NULL WHERE id = ?", [order_id]);
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id)
                 VALUES ('income', ?, 'Bán hàng', ?, ?, ?, ?, 'auto', ?)`,
                [order.total_amount, `Bán hàng hóa đơn ${invoiceCode}`, order.id, user.id, order.payment_method || 'cash', invoiceCode]
            );
            if (customerAccount) {
                const lines = orderItems.map((item) => `- ${item.quantity} × ${item.name}: ${formatMoney(item.quantity * item.unit_price)}`).join('\n');
                const paymentLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ' }[order.payment_method] || order.payment_method || 'Tiền mặt';
                const invoice = `🧾 **Hóa đơn ${invoiceCode}**\nĐơn hàng: #${order.id}\n${lines}\nTổng thanh toán: **${formatMoney(order.total_amount)}**\nThanh toán: ${paymentLabel}\nTrạng thái: Đã được cửa hàng xác nhận.`;
                await db.run(
                    'INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message) VALUES (?, ?, ?, ?)',
                    [customerAccount.id, order.id, `Hóa đơn ${invoiceCode} đã xác nhận`, invoice]
                );
            }
        });
        await logAction(user.id, 'BOT', 'Xác nhận thanh toán đơn qua Bot', { order_id, invoice_code: invoiceCode });
        if (customerAccount) {
            return `Đã xác nhận thanh toán. Hóa đơn ${invoiceCode} đã được gửi vào Bot của khách hàng.`;
        }
        return `Đã xác nhận thanh toán, đơn ${invoiceCode} chuyển sang hoàn thành.`;
    },

    async create_return(user, { order_id, return_type, reason, items }) {
        const result = await callController(createReturnRequest, {
            user,
            body: { order_id, return_type, reason, items }
        });
        if (result.status >= 400 || result.body?.success === false) throw botError(result.body?.message || 'Không thể tạo phiếu đổi trả.', result.status);
        await logAction(user.id, 'BOT', 'Tạo phiếu đổi trả qua Bot', { order_id, return_type });
        return `Đã tạo phiếu đổi trả cho đơn #${order_id}${result.body?.data?.id ? ` (phiếu #${result.body.data.id})` : ''}, đang chờ chủ cửa hàng duyệt.`;
    },

    async decide_return(user, { return_id, status, notes }) {
        const result = await callController(approveReturnRequest, {
            user,
            params: { id: String(return_id) },
            body: { status, notes }
        });
        if (result.status >= 400 || result.body?.success === false) throw botError(result.body?.message || 'Không thể cập nhật phiếu đổi trả.', result.status);
        await logAction(user.id, 'BOT', 'Duyệt đổi trả qua Bot', { return_id, status });
        return status === 'approved'
            ? `Đã duyệt phiếu đổi trả #${return_id}. Nhân viên có thể hoàn tất phiếu để hoàn tiền/đổi hàng.`
            : `Đã từ chối phiếu đổi trả #${return_id}.`;
    },

    async update_ai_config(user, configArgs) {
        if (user.role !== 'admin') throw botError('Chỉ Quản trị viên mới được đổi cấu hình AI.', 403);
        await db.transaction(async () => {
            for (const [key, value] of Object.entries(configArgs)) {
                await db.run(
                    'INSERT INTO system_configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                    [key, String(value)]
                );
            }
        });
        await logAction(user.id, 'BOT', 'Cập nhật cấu hình AI qua Bot', configArgs);
        return `Đã lưu cấu hình AI mới. Hệ thống sẽ áp dụng ngay ở câu tiếp theo!`;
    }
};

export const executePendingAction = async (user, expectedActionId = null) => {
    const action = peekPendingAction(user);
    if (!action) return { ok: false, message: 'Không có thao tác nào đang chờ xác nhận (hoặc đã hết hạn sau 10 phút).' };
    if (expectedActionId && action.id !== expectedActionId) {
        return { ok: false, message: 'Thao tác xác nhận đã hết hạn hoặc không còn khớp với bản tóm tắt.' };
    }
    pendingActions.delete(pendingKey(user));
    try {
        const message = await executors[action.type](user, action.payload);
        return { ok: true, message };
    } catch (error) {
        return { ok: false, message: error.statusCode ? error.message : 'Không thể thực hiện thao tác lúc này.' };
    }
};
