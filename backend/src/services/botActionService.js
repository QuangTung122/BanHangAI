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

/** Gá»i láº¡i controller Express hiá»‡n cÃ³ (khÃ´ng qua HTTP) Ä‘á»ƒ tÃ¡i sá»­ dá»¥ng nguyÃªn logic nghiá»‡p vá»¥ & kiá»ƒm tra quyá»n. */
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

/** Chuáº©n hÃ³a & kiá»ƒm tra giá» hÃ ng tá»« DB; tráº£ vá» dÃ²ng hÃ ng, tá»•ng tiá»n Ä‘á»ƒ hiá»ƒn thá»‹ trÆ°á»›c khi xÃ¡c nháº­n. */
export const buildCart = async (rawItems) => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw botError('ChÆ°a cÃ³ sáº£n pháº©m nÃ o Ä‘á»ƒ Ä‘áº·t.');
    const quantities = new Map();
    for (const item of rawItems) {
        const productId = Number(item?.product_id);
        const quantity = Number(item?.quantity ?? 1);
        if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
            throw botError('MÃ£ sáº£n pháº©m hoáº·c sá»‘ lÆ°á»£ng khÃ´ng há»£p lá»‡ (sá»‘ lÆ°á»£ng tá»« 1 Ä‘áº¿n 100).');
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
        if (!product) throw botError(`KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m mÃ£ ${productId}.`, 404);
        if (!product.is_active) throw botError(`Sáº£n pháº©m "${product.name}" Ä‘Ã£ ngá»«ng kinh doanh.`, 409);
        if (product.stock_quantity < quantity) throw botError(`"${product.name}" chá»‰ cÃ²n ${product.stock_quantity} sáº£n pháº©m trong kho.`, 409);
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
            throw botError(result.body?.message || 'KhÃ´ng thá»ƒ xÃ¡c nháº­n Ä‘Æ¡n hÃ ng.', result.status);
        }
        const invoiceCode = result.body.data.invoice_code;
        return `ÄÃ£ xÃ¡c nháº­n Ä‘Æ¡n #${order_id} vÃ  táº¡o hÃ³a Ä‘Æ¡n ${invoiceCode}. áº¢nh hÃ³a Ä‘Æ¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i vÃ o Bot cá»§a khÃ¡ch hÃ ng; tráº¡ng thÃ¡i thanh toÃ¡n chÆ°a Ä‘Æ°á»£c xÃ¡c nháº­n.`;
    },
    async create_order_customer(user, { items, payment_method, address, shipping_method = 'standard', shipping_fee = 0, price_snapshot }) {
        const cleanAddress = typeof address === 'string' ? address.replace(/[<>]/g, '').trim().replace(/\s+/g, ' ') : '';
        if (cleanAddress.length < 10 || cleanAddress.length > 250 || /^(test|abc|na|n\/a|khong co|khÃ´ng cÃ³|dia chi|Ä‘á»‹a chá»‰)$/i.test(cleanAddress)) {
            throw botError('Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰ giao hÃ ng cá»¥ thá»ƒ tá»« 10 Ä‘áº¿n 250 kÃ½ tá»±.');
        }
        await expireBotReservations();
        const customer = await db.get('SELECT id, full_name, phone, address FROM customers WHERE id = ?', [user.customer_id]);
        if (!customer) throw botError('KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ khÃ¡ch hÃ ng.', 404);
        let created;
        await db.transaction(async () => {
            const activeReservations = await db.get(
                `SELECT COUNT(*) AS total FROM orders
                 WHERE customer_id = ? AND status = 'pending' AND bot_reservation_expires_at > CURRENT_TIMESTAMP`, [customer.id]);
            if ((activeReservations?.total || 0) >= 2) {
                throw botError('Báº¡n Ä‘ang cÃ³ 2 Ä‘Æ¡n chá» xÃ¡c nháº­n. HÃ£y chá» cá»­a hÃ ng xá»­ lÃ½ hoáº·c há»§y má»™t Ä‘Æ¡n trÆ°á»›c khi Ä‘áº·t tiáº¿p.', 429);
            }
            const cart = await buildCart(items);
            const changedPrice = cart.lines.find((line) => Number(price_snapshot?.[line.product_id]) !== line.unit_price);
            if (changedPrice) {
                throw botError(`GiÃ¡ sáº£n pháº©m "${changedPrice.name}" Ä‘Ã£ thay Ä‘á»•i. ÄÆ¡n chÆ°a Ä‘Æ°á»£c táº¡o; vui lÃ²ng chuáº©n bá»‹ láº¡i Ä‘Æ¡n Ä‘á»ƒ xem vÃ  xÃ¡c nháº­n má»©c giÃ¡ má»›i.`, 409);
            }
            if (!['pickup', 'standard', 'express'].includes(shipping_method)) throw botError('HÃ¬nh thá»©c giao hÃ ng khÃ´ng há»£p lá»‡.');
            const expectedShippingFee = shipping_method === 'pickup' || cart.total >= 5000000
                ? 0 : shipping_method === 'express' ? 50000 : 30000;
            if (Number(shipping_fee) !== expectedShippingFee) {
                throw botError('PhÃ­ giao hÃ ng Ä‘Ã£ thay Ä‘á»•i. Vui lÃ²ng chuáº©n bá»‹ láº¡i Ä‘Æ¡n Ä‘á»ƒ xem má»©c phÃ­ má»›i.', 409);
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
                if (update.changes !== 1) throw botError(`Tá»“n kho "${line.name}" vá»«a thay Ä‘á»•i, vui lÃ²ng Ä‘áº·t láº¡i.`, 409);
                await db.run(
                    `INSERT INTO order_items (order_id, product_id, product_name, sku, warranty_months, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, line.product_id, line.name, product?.sku || null, product?.warranty_months || 0, line.quantity, line.unit_price]
                );
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'sale', ?, ?, 'order', ?, NULL, ?)`,
                    [line.product_id, -line.quantity, product?.import_price || null, orderId, 'KhÃ¡ch Ä‘áº·t hÃ ng qua Bot (chá» xÃ¡c nháº­n)']
                );
            }
            created = { orderId, subtotal: cart.total, shippingFee: expectedShippingFee, total: cart.total + expectedShippingFee };
        });
        await logAction(null, 'BOT', 'KhÃ¡ch Ä‘áº·t hÃ ng qua Bot', { customer_id: customer.id, order_id: created.orderId });
        await notifyRoles({
            roles: ['staff', 'owner'],
            title: 'ÄÆ¡n Bot chá» xÃ¡c nháº­n',
            message: `KhÃ¡ch ${customer.full_name} vá»«a Ä‘áº·t Ä‘Æ¡n #${created.orderId}, tá»•ng ${formatMoney(created.total)} (phÃ­ giao ${formatMoney(created.shippingFee)}). HÃ£y má»Ÿ má»¥c â€œÄÆ¡n hÃ ng & xÃ¡c nháº­n Botâ€ trong há»‡ thá»‘ng ná»™i bá»™ Ä‘á»ƒ xá»­ lÃ½ trÆ°á»›c khi háº¿t háº¡n giá»¯ hÃ ng.`,
            type: 'order', relatedId: created.orderId
        });
        return `ÄÃ£ táº¡o Ä‘Æ¡n #${created.orderId}, tiá»n hÃ ng ${formatMoney(created.subtotal)}, phÃ­ giao ${formatMoney(created.shippingFee)}, tá»•ng ${formatMoney(created.total)}. ÄÆ¡n Ä‘ang chá» cá»­a hÃ ng xÃ¡c nháº­n trong 30 phÃºt.`;
    },

    async create_order_staff(user, { items, payment_method, customer_name, customer_phone }) {
        const result = await callController(createOrder, {
            user,
            body: { items, payment_type: 'full', payment_method, customer_name, customer_phone }
        });
        if (result.status >= 400 || !result.body?.success) throw botError(result.body?.message || 'KhÃ´ng thá»ƒ táº¡o Ä‘Æ¡n hÃ ng.', result.status);
        const data = result.body.data;
        await logAction(user.id, 'BOT', 'Táº¡o Ä‘Æ¡n hÃ ng qua Bot', { order_id: data.order_id, invoice_code: data.invoice_code });
        return `ÄÃ£ láº­p hÃ³a Ä‘Æ¡n ${data.invoice_code} (Ä‘Æ¡n #${data.order_id}), tá»•ng ${formatMoney(data.total_amount)}.`;
    },

    async ship_order(user, { order_id, shipping_carrier, tracking_code, estimated_delivery_at }) {
        let customerId;
        let invoiceCode;
        await db.transaction(async () => {
            const order = await db.get('SELECT id, customer_id, status, created_at FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.', 404);
            if (order.status !== 'processing') throw botError('Chá»‰ bÃ n giao Ä‘Æ°á»£c Ä‘Æ¡n Ä‘ang á»Ÿ tráº¡ng thÃ¡i processing.', 409);
            const result = await db.run(
                `UPDATE orders SET status = 'shipped', shipping_carrier = ?, tracking_code = ?, estimated_delivery_at = ?
                 WHERE id = ? AND status = 'processing'`,
                [shipping_carrier.trim(), tracking_code.trim(), estimated_delivery_at || null, order_id]
            );
            if (result.changes !== 1) throw botError('ÄÆ¡n vá»«a Ä‘Æ°á»£c cáº­p nháº­t bá»Ÿi ngÆ°á»i khÃ¡c. HÃ£y táº£i láº¡i vÃ  thá»­ láº¡i.', 409);
            customerId = order.customer_id;
            invoiceCode = invoiceCodeOf(order.id, order.created_at);
            await notifyCustomer(customerId, order_id, `ÄÆ¡n ${invoiceCode} Ä‘ang Ä‘Æ°á»£c giao`,
                `ÄÆ¡n hÃ ng #${invoiceCode} Ä‘Ã£ Ä‘Æ°á»£c bÃ n giao cho ${shipping_carrier.trim()}, mÃ£ váº­n Ä‘Æ¡n ${tracking_code.trim()}${estimated_delivery_at ? `. Dá»± kiáº¿n giao ${estimated_delivery_at}.` : '.'}`);
        });
        await logAction(user.id, 'BOT', 'Cáº­p nháº­t váº­n Ä‘Æ¡n qua Bot', { order_id, shipping_carrier, tracking_code });
        return `ÄÆ¡n #${order_id} Ä‘Ã£ chuyá»ƒn sang tráº¡ng thÃ¡i Ä‘ang giao. MÃ£ váº­n Ä‘Æ¡n ${tracking_code} (${shipping_carrier}).`;
    },

    async cancel_returned_shipment(user, { order_id, reason }) {
        await db.transaction(async () => {
            const order = await db.get('SELECT id, customer_id, status FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.', 404);
            if (!['shipped', 'processing'].includes(order.status)) throw botError('Chá»‰ ghi nháº­n hoÃ n kho cho Ä‘Æ¡n Ä‘ang giao hoáº·c Ä‘ang chuáº©n bá»‹.', 409);
            const changed = await db.run("UPDATE orders SET status = 'cancelled', bot_reservation_expires_at = NULL WHERE id = ? AND status = ?", [order_id, order.status]);
            if (changed.changes !== 1) throw botError('ÄÆ¡n vá»«a Ä‘Æ°á»£c cáº­p nháº­t bá»Ÿi ngÆ°á»i khÃ¡c.', 409);
            const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order_id]);
            for (const item of items) {
                await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                     VALUES (?, 'return', ?, 'order', ?, ?, ?)`,
                    [item.product_id, item.quantity, order_id, user.id, `HoÃ n kho do giao hÃ ng tháº¥t báº¡i: ${String(reason).slice(0, 200)}`]
                );
            }
            await notifyCustomer(order.customer_id, order_id, `ÄÆ¡n #${order_id} Ä‘Ã£ Ä‘Æ°á»£c hoÃ n vá» cá»­a hÃ ng`,
                `ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c há»§y vÃ  nháº­p láº¡i kho sau khi giao tháº¥t báº¡i. LÃ½ do: ${String(reason).slice(0, 200)}.`);
        });
        await logAction(user.id, 'BOT', 'HoÃ n kho Ä‘Æ¡n giao tháº¥t báº¡i', { order_id, reason });
        return `ÄÃ£ há»§y Ä‘Æ¡n #${order_id} vÃ  nháº­p láº¡i cÃ¡c sáº£n pháº©m vÃ o kho.`;
    },

    async cancel_order_customer(user, { order_id }) {
        await db.transaction(async () => {
            await expireBotReservations();
            const order = await db.get('SELECT id, status, customer_id FROM orders WHERE id = ?', [order_id]);
            if (!order || order.customer_id !== user.customer_id) throw botError('KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng cá»§a báº¡n.', 404);
            if (order.status !== 'pending') throw botError('Chá»‰ há»§y Ä‘Æ°á»£c Ä‘Æ¡n Ä‘ang chá» xÃ¡c nháº­n.', 409);
            const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order_id]);
            for (const item of items) {
                await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                     VALUES (?, 'return', ?, 'order', ?, NULL, 'KhÃ¡ch há»§y Ä‘Æ¡n chá» xÃ¡c nháº­n qua Bot')`,
                    [item.product_id, item.quantity, order_id]
                );
            }
            await db.run("UPDATE orders SET status = 'cancelled', bot_reservation_expires_at = NULL WHERE id = ?", [order_id]);
        });
        await logAction(null, 'BOT', 'KhÃ¡ch há»§y Ä‘Æ¡n qua Bot', { customer_id: user.customer_id, order_id });
        return `ÄÃ£ há»§y Ä‘Æ¡n #${order_id} vÃ  hoÃ n hÃ ng vá» kho.`;
    },

    async confirm_payment(user, { order_id }) {
        let invoiceCode;
        let customerAccount;
        let orderItems;
        await db.transaction(async () => {
            const order = await db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
            if (!order) throw botError('KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.', 404);
            if (!['pending', 'processing', 'shipped'].includes(order.status) || order.payment_type !== 'full') {
                throw botError('Chá»‰ xÃ¡c nháº­n thanh toÃ¡n cho Ä‘Æ¡n tráº£ má»™t láº§n Ä‘ang chá» xÃ¡c nháº­n.', 409);
            }
            const paid = await db.get(
                `SELECT id FROM transactions WHERE reference_id = ? AND type = 'income' AND source = 'auto' AND category = 'BÃ¡n hÃ ng'`,
                [order_id]
            );
            if (paid) throw botError('ÄÆ¡n nÃ y Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n thanh toÃ¡n.', 409);
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
                 VALUES ('income', ?, 'BÃ¡n hÃ ng', ?, ?, ?, ?, 'auto', ?)`,
                [order.total_amount, `BÃ¡n hÃ ng hÃ³a Ä‘Æ¡n ${invoiceCode}`, order.id, user.id, order.payment_method || 'cash', invoiceCode]
            );
            if (customerAccount) {
                const lines = orderItems.map((item) => `- ${item.quantity} Ã— ${item.name}: ${formatMoney(item.quantity * item.unit_price)}`).join('\n');
                const paymentLabel = { cash: 'Tiá»n máº·t', transfer: 'Chuyá»ƒn khoáº£n', card: 'Tháº»' }[order.payment_method] || order.payment_method || 'Tiá»n máº·t';
                const invoice = `ðŸ§¾ **HÃ³a Ä‘Æ¡n ${invoiceCode}**\nÄÆ¡n hÃ ng: #${order.id}\n${lines}\nTá»•ng thanh toÃ¡n: **${formatMoney(order.total_amount)}**\nThanh toÃ¡n: ${paymentLabel}\nTráº¡ng thÃ¡i: ÄÃ£ Ä‘Æ°á»£c cá»­a hÃ ng xÃ¡c nháº­n.`;
                await db.run(
                    'INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message) VALUES (?, ?, ?, ?)',
                    [customerAccount.id, order.id, `HÃ³a Ä‘Æ¡n ${invoiceCode} Ä‘Ã£ xÃ¡c nháº­n`, invoice]
                );
            }
        });
        await logAction(user.id, 'BOT', 'XÃ¡c nháº­n thanh toÃ¡n Ä‘Æ¡n qua Bot', { order_id, invoice_code: invoiceCode });
        if (customerAccount) {
            return `ÄÃ£ xÃ¡c nháº­n thanh toÃ¡n. HÃ³a Ä‘Æ¡n ${invoiceCode} Ä‘Ã£ Ä‘Æ°á»£c gá»­i vÃ o Bot cá»§a khÃ¡ch hÃ ng.`;
        }
        return `ÄÃ£ xÃ¡c nháº­n thanh toÃ¡n, Ä‘Æ¡n ${invoiceCode} chuyá»ƒn sang hoÃ n thÃ nh.`;
    },

    async create_return(user, { order_id, return_type, reason, items }) {
        const result = await callController(createReturnRequest, {
            user,
            body: { order_id, return_type, reason, items }
        });
        if (result.status >= 400 || result.body?.success === false) throw botError(result.body?.message || 'KhÃ´ng thá»ƒ táº¡o phiáº¿u Ä‘á»•i tráº£.', result.status);
        await logAction(user.id, 'BOT', 'Táº¡o phiáº¿u Ä‘á»•i tráº£ qua Bot', { order_id, return_type });
        return `ÄÃ£ táº¡o phiáº¿u Ä‘á»•i tráº£ cho Ä‘Æ¡n #${order_id}${result.body?.data?.id ? ` (phiáº¿u #${result.body.data.id})` : ''}, Ä‘ang chá» chá»§ cá»­a hÃ ng duyá»‡t.`;
    },

    async decide_return(user, { return_id, status, notes }) {
        const result = await callController(approveReturnRequest, {
            user,
            params: { id: String(return_id) },
            body: { status, notes }
        });
        if (result.status >= 400 || result.body?.success === false) throw botError(result.body?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t phiáº¿u Ä‘á»•i tráº£.', result.status);
        await logAction(user.id, 'BOT', 'Duyá»‡t Ä‘á»•i tráº£ qua Bot', { return_id, status });
        return status === 'approved'
            ? `ÄÃ£ duyá»‡t phiáº¿u Ä‘á»•i tráº£ #${return_id}. NhÃ¢n viÃªn cÃ³ thá»ƒ hoÃ n táº¥t phiáº¿u Ä‘á»ƒ hoÃ n tiá»n/Ä‘á»•i hÃ ng.`
            : `ÄÃ£ tá»« chá»‘i phiáº¿u Ä‘á»•i tráº£ #${return_id}.`;
    },

    async update_ai_config(user, configArgs) {
        if (user.role !== 'admin') throw botError('Chá»‰ Quáº£n trá»‹ viÃªn má»›i Ä‘Æ°á»£c Ä‘á»•i cáº¥u hÃ¬nh AI.', 403);
        await db.transaction(async () => {
            for (const [key, value] of Object.entries(configArgs)) {
                await db.run(
                    'INSERT INTO system_configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                    [key, String(value)]
                );
            }
        });
        await logAction(user.id, 'BOT', 'Cáº­p nháº­t cáº¥u hÃ¬nh AI qua Bot', configArgs);
        return `ÄÃ£ lÆ°u cáº¥u hÃ¬nh AI má»›i. Há»‡ thá»‘ng sáº½ Ã¡p dá»¥ng ngay á»Ÿ cÃ¢u tiáº¿p theo!`;
    }
};

export const executePendingAction = async (user, expectedActionId = null) => {
    const action = peekPendingAction(user);
    if (!action) return { ok: false, message: 'KhÃ´ng cÃ³ thao tÃ¡c nÃ o Ä‘ang chá» xÃ¡c nháº­n (hoáº·c Ä‘Ã£ háº¿t háº¡n sau 10 phÃºt).' };
    if (expectedActionId && action.id !== expectedActionId) {
        return { ok: false, message: 'Thao tÃ¡c xÃ¡c nháº­n Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng cÃ²n khá»›p vá»›i báº£n tÃ³m táº¯t.' };
    }
    pendingActions.delete(pendingKey(user));
    try {
        const message = await executors[action.type](user, action.payload);
        return { ok: true, message };
    } catch (error) {
        return { ok: false, message: error.statusCode ? error.message : 'KhÃ´ng thá»ƒ thá»±c hiá»‡n thao tÃ¡c lÃºc nÃ y.' };
    }
};
