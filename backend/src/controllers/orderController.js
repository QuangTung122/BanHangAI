import * as db from '../services/db.js';
import { logAction } from './auditController.js';
import { expireBotReservations } from '../services/botReservationService.js';

const PAYMENT_METHODS = new Set(['cash', 'transfer', 'card']);
const FINANCE_PARTNERS = new Set(['Home Credit (mô phỏng)', 'FE CREDIT (mô phỏng)', 'Ngân hàng liên kết (mô phỏng)']);

const requestError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const createInvoiceCode = (orderId, date = new Date()) => {
    const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
    return `INV-${yymmdd}-${String(orderId).padStart(4, '0')}`;
};

export const createOrder = async (req, res) => {
    try {
        const {
            items,
            payment_type = 'full',
            payment_method = 'cash',
            customer_name,
            customer_phone,
            customer_cccd,
            installment_term,
            finance_partner,
            finance_application_code,
            down_payment
        } = req.body || {};
        const userId = req.user.id;
        const customerName = typeof customer_name === 'string' ? customer_name.trim() : '';
        const customerPhone = typeof customer_phone === 'string' ? customer_phone.trim() : '';
        const customerCccd = typeof customer_cccd === 'string' ? customer_cccd.trim() : '';

        if (!Array.isArray(items) || items.length === 0) {
            throw requestError('Giỏ hàng đang trống');
        }
        if (!['full', 'installment'].includes(payment_type)) {
            throw requestError('Hình thức thanh toán không hợp lệ');
        }
        if (!PAYMENT_METHODS.has(payment_method)) {
            throw requestError('Phương thức thanh toán không hợp lệ');
        }
        if (customerName.length > 120 || customerPhone.length > 20) {
            throw requestError('Thông tin khách hàng vượt quá độ dài cho phép');
        }
        if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
            throw requestError('Số điện thoại phải gồm 10 chữ số');
        }

        const quantityByProduct = new Map();
        for (const item of items) {
            const productId = Number(item?.product_id);
            const quantity = Number(item?.quantity);
            if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1) {
                throw requestError('Sản phẩm hoặc số lượng trong giỏ hàng không hợp lệ');
            }
            quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity);
        }

        let createdOrder;
        const requestedFinanceCode = String(finance_application_code || '').trim().slice(0, 80);
        const financeApplicationCode = payment_type === 'installment'
            ? (requestedFinanceCode || `DEMO-${Date.now()}`)
            : null;
        await db.transaction(async () => {
            const productIds = [...quantityByProduct.keys()];
            const placeholders = productIds.map(() => '?').join(', ');
            const products = await db.query(
                `SELECT id, name, sku, price, import_price, discount_percent, stock_quantity, is_active, warranty_months
                 FROM products WHERE id IN (${placeholders})`,
                productIds
            );
            const productsById = new Map(products.map((product) => [product.id, product]));
            if (productsById.size !== productIds.length) {
                throw requestError('Một hoặc nhiều sản phẩm không còn tồn tại', 404);
            }

            let totalAmount = 0;
            const orderItems = [];
            for (const [productId, quantity] of quantityByProduct) {
                const product = productsById.get(productId);
                if (!product.is_active) throw requestError(`Sản phẩm ${product.name} đã ngừng kinh doanh`, 409);
                if (product.stock_quantity < quantity) {
                    throw requestError(`Sản phẩm ${product.name} chỉ còn ${product.stock_quantity} sản phẩm trong kho`, 409);
                }
                const basePrice = Number(product.price);
                const discountPercent = Number(product.discount_percent) || 0;
                if (!Number.isSafeInteger(basePrice) || basePrice < 0 || discountPercent < 0 || discountPercent > 100) {
                    throw requestError(`Giá bán của sản phẩm ${product.name} chưa hợp lệ`, 409);
                }
                const unitPrice = Math.round(basePrice * (100 - discountPercent) / 100);
                totalAmount += unitPrice * quantity;
                orderItems.push({ product, productId, quantity, unitPrice });
            }
            if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
                throw requestError('Tổng tiền đơn hàng không hợp lệ');
            }

            let installmentTerm = null;
            let monthlyFee = null;
            let financedTotal = null;
            let downPayment = 0;
            let financedAmount = null;
            if (payment_type === 'installment') {
                installmentTerm = Number(installment_term);
                if (![3, 6, 9, 12, 18, 24].includes(installmentTerm)) {
                    throw requestError('Kỳ hạn đăng ký không hợp lệ');
                }
                if (!customerName || !customerPhone || !/^\d{12}$/.test(customerCccd)) {
                    throw requestError('Trả góp cần họ tên, số điện thoại 10 số và CCCD 12 số');
                }
                if (!FINANCE_PARTNERS.has(finance_partner)) {
                    throw requestError('Vui lòng chọn đối tác tài chính demo');
                }
                downPayment = Number(down_payment || 0);
                if (!Number.isSafeInteger(downPayment) || downPayment < 0 || downPayment >= totalAmount) {
                    throw requestError('Tiền trả trước phải nhỏ hơn tổng hóa đơn để phát sinh khoản giải ngân');
                }
                financedAmount = totalAmount - downPayment;
                financedTotal = totalAmount;
            }

            let customerId = null;
            if (customerName || customerPhone) {
                if (customerPhone) {
                    const existingCustomer = await db.get('SELECT id FROM customers WHERE phone = ?', [customerPhone]);
                    if (existingCustomer) {
                        customerId = existingCustomer.id;
                        if (customerName) {
                            await db.run('UPDATE customers SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [customerName, customerId]);
                        }
                    }
                }
                if (!customerId) {
                    const customer = await db.run(
                        'INSERT INTO customers (full_name, phone) VALUES (?, ?)',
                        [customerName || 'Khách lẻ', customerPhone || null]
                    );
                    customerId = customer.lastID;
                }
            }

            const order = await db.run(
                `INSERT INTO orders (
                    user_id, customer_id, total_amount, financed_total, customer_name, customer_phone,
                    status, payment_type, payment_method, customer_cccd, installment_term, monthly_fee,
                    finance_partner, finance_application_code, financing_status, down_payment, financed_amount
                 ) VALUES (?, ?, ?, ?, ?, ?, 'delivered', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, customerId, totalAmount, financedTotal, customerName || null, customerPhone || null,
                    payment_type, payment_method, payment_type === 'installment' ? customerCccd : null,
                    installmentTerm, monthlyFee, payment_type === 'installment' ? finance_partner : null,
                    financeApplicationCode,
                    payment_type === 'installment' ? 'approved' : null, downPayment, financedAmount]
            );
            const orderId = order.lastID;
            const createdAt = new Date();
            const invoiceCode = createInvoiceCode(orderId, createdAt);

            for (const item of orderItems) {
                const update = await db.run(
                    `UPDATE products SET stock_quantity = stock_quantity - ?
                     WHERE id = ? AND is_active = 1 AND stock_quantity >= ?`,
                    [item.quantity, item.productId, item.quantity]
                );
                if (update.changes !== 1) {
                    throw requestError(`Tồn kho sản phẩm ${item.product.name} vừa thay đổi. Vui lòng tải lại giỏ hàng.`, 409);
                }
                await db.run(
                    `INSERT INTO order_items (order_id, product_id, product_name, sku, warranty_months, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, item.productId, item.product.name, item.product.sku || null, item.product.warranty_months || 0, item.quantity, item.unitPrice]
                );
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'sale', ?, ?, 'order', ?, ?, ?)`,
                    [item.productId, -item.quantity, item.product.import_price || null, orderId, userId, `Xuất bán theo hóa đơn ${invoiceCode}`]
                );
            }

            if (payment_type === 'full') {
                await db.run(
                    `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id)
                     VALUES ('income', ?, 'Bán hàng', ?, ?, ?, ?, 'auto', ?)`,
                    [totalAmount, `Bán hàng hóa đơn ${invoiceCode}`, orderId, userId, payment_method, invoiceCode]
                );
            } else {
                if (downPayment > 0) {
                    await db.run(
                        `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id)
                         VALUES ('income', ?, 'Bán hàng', ?, ?, ?, ?, 'auto', ?)`,
                        [downPayment, `Khách trả trước theo hồ sơ ${finance_partner} hóa đơn ${invoiceCode}`, orderId, userId, payment_method, invoiceCode]
                    );
                }
                await db.run(
                    `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id)
                     VALUES ('income', ?, 'Bán hàng', ?, ?, ?, 'transfer', 'auto', ?)`,
                    [financedAmount, `${finance_partner} giải ngân demo hóa đơn ${invoiceCode}`, orderId, userId, invoiceCode]
                );
            }

            createdOrder = {
                orderId,
                invoiceCode,
                createdAt: createdAt.toISOString(),
                totalAmount,
                monthlyFee,
                downPayment,
                financedAmount,
                financePartner: payment_type === 'installment' ? finance_partner : null,
                financeApplicationCode,
                items: orderItems.map((item) => ({ name: item.product.name, quantity: item.quantity, unit_price: item.unitPrice }))
            };
        });

        res.status(201).json({
            success: true,
            data: {
                order_id: createdOrder.orderId,
                invoice_code: createdOrder.invoiceCode,
                created_at: createdOrder.createdAt,
                total_amount: createdOrder.totalAmount,
                monthly_fee: createdOrder.monthlyFee,
                down_payment: createdOrder.downPayment,
                financed_amount: createdOrder.financedAmount,
                finance_partner: createdOrder.financePartner,
                finance_application_code: createdOrder.financeApplicationCode,
                items: createdOrder.items
            }
        });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Lỗi khi tạo đơn hàng',
            data: null
        });
    }
};

export const confirmBotOrder = async (req, res) => {
    try {
        if (!['staff', 'owner', 'admin'].includes(req.user?.role)) {
            throw requestError('Bạn không có quyền xác nhận đơn hàng.', 403);
        }
        const orderId = Number(req.params.id);
        if (!Number.isSafeInteger(orderId) || orderId < 1) throw requestError('Mã đơn hàng không hợp lệ.');

        let confirmed;
        await db.transaction(async () => {
            const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
            if (!order) throw requestError('Không tìm thấy đơn hàng.', 404);
            if (order.status !== 'pending' || !order.bot_reservation_expires_at) {
                throw requestError('Đơn này không còn ở trạng thái chờ xác nhận qua Bot.', 409);
            }
            if (new Date(`${String(order.bot_reservation_expires_at).replace(' ', 'T')}Z`) <= new Date()) {
                throw requestError('Đơn đã hết thời gian giữ hàng. Khách cần tạo lại đơn.', 409);
            }

            const items = await db.query(
                `SELECT oi.product_name, oi.quantity, oi.unit_price, COALESCE(oi.warranty_months, 0) AS warranty_months
                 FROM order_items oi WHERE oi.order_id = ? ORDER BY oi.id`, [orderId]);
            if (!items.length) throw requestError('Đơn hàng chưa có sản phẩm.', 409);

            const changed = await db.run(
                `UPDATE orders SET status = 'processing', user_id = ?, bot_reservation_expires_at = NULL
                 WHERE id = ? AND status = 'pending' AND bot_reservation_expires_at > CURRENT_TIMESTAMP`,
                [req.user.id, orderId]);
            if (changed.changes !== 1) throw requestError('Đơn vừa được nhân viên khác xử lý. Hãy tải lại danh sách.', 409);

            const invoiceCode = createInvoiceCode(orderId, new Date(`${String(order.created_at).replace(' ', 'T')}Z`));
            const customerAccount = order.customer_id
                ? await db.get('SELECT id FROM customer_accounts WHERE customer_id = ? AND is_active = 1', [order.customer_id])
                : null;
            if (customerAccount) {
                const lines = items.map((item) => `- ${item.quantity} × ${item.product_name}: ${new Intl.NumberFormat('vi-VN').format(item.quantity * item.unit_price)}đ`).join('\n');
                const message = `Đơn hàng #${orderId} đã được cửa hàng xác nhận. Hóa đơn ${invoiceCode}:\n${lines}\nTổng cộng: ${new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ. Đơn đang được chuẩn bị; khoản thanh toán sẽ được xác nhận riêng.`;
                await db.run(
                    'INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message) VALUES (?, ?, ?, ?)',
                    [customerAccount.id, orderId, `Đơn đã xác nhận · ${invoiceCode}`, message]);
            }
            confirmed = { order_id: orderId, invoice_code: invoiceCode, total_amount: order.total_amount, customer_account_id: customerAccount?.id || null };
        });

        await logAction(req.user.id, 'bot_order_confirmed', 'Nhân viên xác nhận đơn đặt qua Bot', confirmed);
        res.json({
            success: true,
            message: 'Đã xác nhận đơn hàng và tạo hóa đơn.',
            data: confirmed
        });
    } catch (error) {
        console.error('Confirm Bot order failed:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Không thể xác nhận đơn hàng.',
            data: null
        });
    }
};

export const confirmOrderPayment = async (req, res) => {
    try {
        if (!['staff', 'owner', 'admin'].includes(req.user?.role)) {
            throw requestError('Bạn không có quyền xác nhận thanh toán đơn hàng.', 403);
        }
        const orderId = Number(req.params.id);
        if (!Number.isSafeInteger(orderId) || orderId < 1) throw requestError('Mã đơn hàng không hợp lệ.');

        let confirmed;
        await db.transaction(async () => {
            const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
            if (!order) throw requestError('Không tìm thấy đơn hàng.', 404);
            if (!['pending', 'processing', 'shipped'].includes(order.status) || order.payment_type !== 'full') {
                throw requestError('Chỉ xác nhận thanh toán cho đơn hàng trả một lần đang chờ xử lý.', 409);
            }
            const existingPaid = await db.get(
                "SELECT id FROM transactions WHERE reference_id = ? AND type = 'income' AND source = 'auto' AND category = 'Bán hàng'",
                [orderId]
            );
            if (existingPaid) throw requestError('Đơn hàng này đã được ghi nhận thanh toán.', 409);

            const items = await db.query(
                `SELECT oi.product_name, oi.quantity, oi.unit_price, COALESCE(oi.warranty_months, 0) AS warranty_months
                 FROM order_items oi WHERE oi.order_id = ? ORDER BY oi.id`, [orderId]);

            const invoiceCode = createInvoiceCode(orderId, new Date(`${String(order.created_at).replace(' ', 'T')}Z`));

            await db.run(
                `UPDATE orders SET status = 'delivered', bot_reservation_expires_at = NULL, user_id = COALESCE(user_id, ?)
                 WHERE id = ?`,
                [req.user.id, orderId]
            );

            await db.run(
                `INSERT INTO transactions (type, amount, category, description, reference_id, user_id, payment_method, source, invoice_id)
                 VALUES ('income', ?, 'Bán hàng', ?, ?, ?, ?, 'auto', ?)`,
                [order.total_amount, `Bán hàng hóa đơn ${invoiceCode}`, order.id, req.user.id, order.payment_method || 'cash', invoiceCode]
            );

            const customerAccount = order.customer_id
                ? await db.get('SELECT id FROM customer_accounts WHERE customer_id = ? AND is_active = 1', [order.customer_id])
                : null;
            if (customerAccount) {
                const lines = items.map((item) => `- ${item.quantity} × ${item.product_name}: ${new Intl.NumberFormat('vi-VN').format(item.quantity * item.unit_price)}đ`).join('\n');
                const paymentLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ' }[order.payment_method] || order.payment_method || 'Tiền mặt';
                const message = `🧾 Hóa đơn ${invoiceCode} đã thanh toán & hoàn tất.\nĐơn hàng #${order.id}\n${lines}\nPhí giao hàng: ${new Intl.NumberFormat('vi-VN').format(order.shipping_fee || 0)}đ\nTổng thanh toán: ${new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ\nPhương thức: ${paymentLabel}\nCửa hàng đã xác nhận thanh toán thành công. Cảm ơn bạn đã mua hàng!`;
                await db.run(
                    'INSERT INTO bot_customer_notifications (customer_account_id, order_id, title, message) VALUES (?, ?, ?, ?)',
                    [customerAccount.id, orderId, `Hóa đơn ${invoiceCode} đã thanh toán`, message]
                );
            }
            confirmed = { order_id: orderId, invoice_code: invoiceCode, total_amount: order.total_amount, status: 'delivered', customer_account_id: customerAccount?.id || null };
        });

        await logAction(req.user.id, 'order_payment_confirmed', 'Nhân viên xác nhận thanh toán đơn hàng', confirmed);
        res.json({
            success: true,
            message: 'Đã xác nhận thanh toán và hoàn tất đơn hàng.',
            data: confirmed
        });
    } catch (error) {
        console.error('Confirm order payment failed:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Không thể xác nhận thanh toán đơn hàng.',
            data: null
        });
    }
};

export const getOrders = async (req, res, options = {}) => {
    try {
        const type = options.type || req.query.type; // 'full' or 'installment'
        const botPendingOnly = options.botPendingOnly === true || req.query.bot_pending === '1';
        if (botPendingOnly) await expireBotReservations();
        let query = `
            SELECT o.*, COALESCE(u.full_name, u.username) as cashier_name,
                   (SELECT COUNT(*) FROM installment_payments ip WHERE ip.order_id = o.id) as paid_months,
                   COALESCE((SELECT SUM(ip.amount) FROM installment_payments ip WHERE ip.order_id = o.id), 0) AS total_paid,
                   EXISTS (
                       SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income'
                         AND t.source = 'auto' AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                   ) AS has_payment,
                   date(o.created_at, '+' || (SELECT COUNT(*) FROM installment_payments ip WHERE ip.order_id = o.id) || ' month') as next_due_date
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
        `;
        const params = [];
        const conditions = [];
        if (type) {
            conditions.push('o.payment_type = ?');
            params.push(type);
        }
        if (botPendingOnly) {
            conditions.push("o.status = 'pending' AND o.bot_reservation_expires_at IS NOT NULL AND o.bot_reservation_expires_at > CURRENT_TIMESTAMP AND o.user_id IS NULL AND o.customer_id IS NOT NULL");
        }
        if (conditions.length) query += ` WHERE ${conditions.join(' AND ')} `;
        query += ` ORDER BY o.created_at DESC${botPendingOnly ? '' : ' LIMIT 100'}`;
        
        const orders = await db.query(query, params);
        
        // Lấy items và payments cho mỗi order
        for (let order of orders) {
            order.items = await db.query(`
                SELECT oi.*, COALESCE(oi.product_name, p.name) AS product_name,
                       COALESCE(oi.warranty_months, p.warranty_months, 0) AS warranty_months,
                       MAX(0, oi.quantity - COALESCE((
                           SELECT SUM(ri.quantity)
                           FROM return_items ri JOIN returns r ON r.id = ri.return_id
                           WHERE ri.order_item_id = oi.id AND r.is_active = 1
                             AND r.status IN ('pending', 'approved', 'completed')
                       ), 0)) AS returnable_quantity
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            
            if (order.payment_type === 'installment') {
                order.payments = await db.query(`
                    SELECT ip.*, COALESCE(u.full_name, u.username) as cashier_name
                    FROM installment_payments ip
                    LEFT JOIN users u ON ip.cashier_id = u.id
                    WHERE ip.order_id = ?
                    ORDER BY ip.created_at ASC
                `, [order.id]);
            }
            
            // Generate invoice code cho response
            // Thêm 'Z' để Node.js parse đúng múi giờ UTC từ SQLite
            const dateStr = order.created_at.includes('Z') ? order.created_at : order.created_at + 'Z';
            const date = new Date(dateStr);
            const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
            order.invoice_code = `INV-${yymmdd}-${String(order.id).padStart(4, '0')}`;
            // Cập nhật lại created_at thành chuẩn ISO có Z để frontend hiển thị đúng giờ local
            order.created_at = date.toISOString();
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đơn hàng' });
    }
};

export const getMyStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        // Lấy tất cả đơn hàng của user này
        const orders = await db.query("SELECT payment_type, created_at FROM orders WHERE user_id = ? AND status <> 'cancelled'", [user_id]);
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const monthStr = `${yyyy}-${mm}`;
        
        let stats = {
            today: { full: 0, installment: 0 },
            month: { full: 0, installment: 0 }
        };
        
        orders.forEach(o => {
            const dateStr = o.created_at.slice(0, 10);
            const mStr = o.created_at.slice(0, 7);
            
            if (dateStr === todayStr) {
                if (o.payment_type === 'full') stats.today.full++;
                if (o.payment_type === 'installment') stats.today.installment++;
            }
            if (mStr === monthStr) {
                if (o.payment_type === 'full') stats.month.full++;
                if (o.payment_type === 'installment') stats.month.installment++;
            }
        });
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê cá nhân' });
    }
};
