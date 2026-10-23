import * as db from '../services/db.js';
import { logAction } from './auditController.js';

const generateInvoiceCode = (orderId, createdAtStr) => {
            if (!createdAtStr) return 'INV-' + orderId;
            const dateStr = createdAtStr.includes('Z') ? createdAtStr : createdAtStr.replace(' ', 'T') + 'Z';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'INV-' + orderId;
            const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
            return `INV-${yymmdd}-${String(orderId).padStart(4, '0')}`;
        };

const getTicketStatusHistory = async (id, type) => {
    const isWarranty = type === 'warranty';
    const actionKey = isWarranty ? 'warranty_claim_id' : 'return_id';
    const createAction = isWarranty ? 'warranty_claim_created' : 'return_request_created';
    const updateAction = isWarranty ? 'warranty_claim_updated' : 'return_request_approved';
    const rows = await db.query(`
        SELECT l.id, l.action_type, l.action_desc, l.details, l.created_at,
               COALESCE(u.full_name, u.username, 'Người dùng') AS actor_name
        FROM audit_logs l
        LEFT JOIN users u ON u.id = l.user_id
        WHERE l.action_type IN (?, ?)
          AND json_valid(l.details) = 1
          AND CAST(json_extract(l.details, '$.${actionKey}') AS INTEGER) = ?
        ORDER BY l.created_at, l.id
    `, [createAction, updateAction, Number(id)]);

    return rows.map((row) => {
        let details = {};
        try { details = JSON.parse(row.details || '{}'); } catch { /* Ignore malformed legacy audit details. */ }
        return {
            status: details.status || (row.action_type === createAction ? 'pending' : null),
            description: row.action_desc,
            actor_name: row.actor_name,
            created_at: row.created_at
        };
    }).filter((entry) => entry.status);
};

export const createReturnRequest = async (req, res) => {
    try {
        const {
            order_id,
            customer_id,
            customer_name,
            customer_phone,
            return_type,
            reason,
            exchange_product_id,
            notes,
            items
        } = req.body;

        if (!order_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu đơn hàng hoặc danh sách sản phẩm cần xử lý'
            });
        }

        const validTypes = ['exchange', 'refund', 'store_credit'];
        if (!validTypes.includes(return_type)) {
            return res.status(400).json({
                success: false,
                message: 'Loại đổi trả không hợp lệ'
            });
        }

        let returnId;
        await db.transaction(async () => {
            const order = await db.get(`
                SELECT o.id, o.customer_id, o.customer_name, o.customer_phone
                FROM orders o
                WHERE o.id = ? AND o.status <> 'cancelled'
                  AND EXISTS (
                    SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
                      AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                  )
            `, [order_id]);
            if (!order) {
                const error = new Error('Không tìm thấy đơn hàng đã thanh toán để tiếp nhận đổi trả');
                error.statusCode = 404;
                throw error;
            }

            const productItems = [];
            const requestedItemIds = new Set();
            for (const item of items) {
                const orderItemId = Number(item?.order_item_id);
                const quantity = Number(item?.quantity ?? 1);
                if (!Number.isSafeInteger(orderItemId) || orderItemId < 1 || !Number.isSafeInteger(quantity) || quantity < 1) {
                    const error = new Error('Sản phẩm hoặc số lượng đổi trả không hợp lệ');
                    error.statusCode = 400;
                    throw error;
                }
                if (requestedItemIds.has(orderItemId)) {
                    const error = new Error('Không gửi trùng sản phẩm trong cùng một yêu cầu đổi trả');
                    error.statusCode = 400;
                    throw error;
                }
                requestedItemIds.add(orderItemId);

                const purchasedItem = await db.get(`
                    SELECT oi.id, oi.product_id, oi.quantity AS purchased_quantity, oi.unit_price,
                           COALESCE(oi.product_name, p.name) AS product_name
                    FROM order_items oi JOIN products p ON p.id = oi.product_id
                    WHERE oi.id = ? AND oi.order_id = ?
                `, [orderItemId, order_id]);
                if (!purchasedItem || (item.product_id && Number(item.product_id) !== purchasedItem.product_id)) {
                    const error = new Error('Sản phẩm đổi trả không thuộc hóa đơn đã chọn');
                    error.statusCode = 400;
                    throw error;
                }
                const alreadyRequested = await db.get(`
                    SELECT COALESCE(SUM(ri.quantity), 0) AS quantity
                    FROM return_items ri JOIN returns r ON r.id = ri.return_id
                    WHERE ri.order_item_id = ? AND r.is_active = 1
                      AND r.status IN ('pending', 'approved', 'completed')
                `, [orderItemId]);
                const remainingQuantity = purchasedItem.purchased_quantity - Number(alreadyRequested?.quantity || 0);
                if (quantity > remainingQuantity) {
                    const error = new Error(`Số lượng có thể đổi trả của ${purchasedItem.product_name} còn ${Math.max(0, remainingQuantity)}`);
                    error.statusCode = 409;
                    throw error;
                }

                const conditionStatus = item.condition_status || 'new';
                if (!['new', 'used', 'damaged', 'defective', 'wrong_item'].includes(conditionStatus)) {
                    const error = new Error('Tình trạng sản phẩm đổi trả không hợp lệ');
                    error.statusCode = 400;
                    throw error;
                }
                productItems.push({
                    orderItemId,
                    productId: purchasedItem.product_id,
                    productName: purchasedItem.product_name,
                    quantity,
                    unitPrice: purchasedItem.unit_price,
                    conditionStatus,
                    defectType: typeof item.defect_type === 'string' ? item.defect_type.slice(0, 100) : null,
                    warrantyRemainingDays: Math.max(0, Number(item.warranty_remaining_days) || 0),
                    exchangeToProductId: item.exchange_to_product_id || null,
                    exchangeDeltaAmount: Math.max(0, Number(item.exchange_delta_amount) || 0)
                });
            }

            const result = await db.run(
                `INSERT INTO returns (
                    order_id, customer_id, store_customer_id, customer_name, customer_phone,
                    return_type, reason, exchange_product_id, notes, created_by
                 ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order.id,
                    order.customer_id || null,
                    order.customer_name || customer_name || null,
                    order.customer_phone || customer_phone || null,
                    return_type,
                    String(reason || '').trim().slice(0, 500) || null,
                    exchange_product_id || null,
                    String(notes || '').trim().slice(0, 500) || null,
                    req.user.id
                ]
            );
            returnId = result.lastID;

            for (const item of productItems) {
                await db.run(
                    `INSERT INTO return_items (
                        return_id, order_item_id, product_id, product_name, quantity, unit_price,
                        condition_status, defect_type, warranty_remaining_days, refund_amount,
                        exchange_to_product_id, exchange_delta_amount
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [returnId, item.orderItemId, item.productId, item.productName, item.quantity, item.unitPrice,
                        item.conditionStatus, item.defectType, item.warrantyRemainingDays, 0,
                        item.exchangeToProductId, item.exchangeDeltaAmount]
                );
            }
        });

        await logAction(req.user.id, 'return_request_created', 'Tạo yêu cầu đổi trả', {
            return_id: returnId,
            order_id,
            return_type
        });

        res.status(201).json({
            success: true,
            data: {
                return_id: returnId,
                status: 'pending'
            },
            message: 'Yêu cầu đổi trả đã được tạo thành công'
        });
    } catch (error) {
        console.error('createReturnRequest error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Lỗi khi tạo yêu cầu đổi trả',
            data: null
        });
    }
};

export const getReturnRequests = async (req, res) => {
    try {
        const { status, customer_id, order_id } = req.query;
        let sql = `
            SELECT r.*, u.username as creator_name, o.created_at as order_created_at
            FROM returns r 
            LEFT JOIN users u ON r.created_by = u.id 
            LEFT JOIN orders o ON r.order_id = o.id 
            WHERE r.is_active = 1
        `;
        const params = [];

        if (status) {
            sql += ` AND r.status = ?`;
            params.push(status);
        }

        if (customer_id) {
            sql += ` AND r.store_customer_id = ?`;
            params.push(customer_id);
        }

        if (order_id) {
            sql += ` AND r.order_id = ?`;
            params.push(order_id);
        }

        sql += ` ORDER BY r.requested_at DESC`;

        const returns = await db.query(sql, params);



        for (const item of returns) {
            item.invoice_code = generateInvoiceCode(item.order_id, item.order_created_at);
            item.items = await db.query(`SELECT * FROM return_items WHERE return_id = ?`, [item.id]);
            item.status_history = await getTicketStatusHistory(item.id, 'return');
        }

        res.json({
            success: true,
            data: returns
        });
    } catch (error) {
        console.error('getReturnRequests error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đổi trả'
        });
    }
};

export const approveReturnRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, refund_amount, notes, action = 'none', payment_method = 'cash' } = req.body;

        const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái phê duyệt không hợp lệ'
            });
        }
        if (['approved', 'rejected'].includes(status) && req.user.role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Chỉ chủ cửa hàng được duyệt/từ chối đổi trả', data: null });
        }
        const amount = Number(refund_amount || 0);
        if (!Number.isSafeInteger(amount) || amount < 0 || !['none', 'refund', 'collect'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Số tiền hoặc loại xử lý đổi trả không hợp lệ', data: null });
        }
        if (action !== 'none' && status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Chỉ ghi nhận thu/hoàn tiền khi hoàn tất phiếu đổi trả', data: null });
        }
        if (!['cash', 'transfer', 'card'].includes(payment_method)) {
            return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ', data: null });
        }

        let alreadyCompleted = false;
        await db.transaction(async () => {
            const request = await db.get('SELECT * FROM returns WHERE id = ? AND is_active = 1', [id]);
            if (!request) {
                const error = new Error('Không tìm thấy phiếu đổi trả');
                error.statusCode = 404;
                throw error;
            }
            if (request.status === 'completed') {
                if (status !== 'completed') {
                    const error = new Error('Phiếu đổi trả đã hoàn tất và không thể đổi ngược trạng thái');
                    error.statusCode = 409;
                    throw error;
                }
                alreadyCompleted = true;
                return;
            }
            if (status === 'completed' && request.status !== 'approved') {
                const error = new Error('Phiếu đổi trả cần được chủ cửa hàng duyệt trước khi hoàn tiền hoặc đổi hàng');
                error.statusCode = 409;
                throw error;
            }
            if (['approved', 'rejected'].includes(status) && request.status !== 'pending') {
                const error = new Error('Chỉ phiếu đang chờ duyệt mới được duyệt hoặc từ chối');
                error.statusCode = 409;
                throw error;
            }
            if (['rejected', 'cancelled'].includes(request.status) && status !== request.status) {
                const error = new Error('Phiếu đã bị từ chối hoặc hủy và không thể mở lại');
                error.statusCode = 409;
                throw error;
            }

            const lineTotal = await db.get(
                'SELECT COALESCE(SUM(unit_price * quantity), 0) AS total FROM return_items WHERE return_id = ?',
                [id]
            );
            if (amount > Number(lineTotal?.total || 0)) {
                const error = new Error('Tiền hoàn/bù không được vượt quá giá trị các mặt hàng trong phiếu');
                error.statusCode = 400;
                throw error;
            }
            await db.run(
                `UPDATE returns SET status = ?, approved_by = CASE WHEN ? IN ('approved','rejected') THEN ? ELSE approved_by END,
                    refund_amount = ?, notes = ?, processed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE processed_at END WHERE id = ?`,
                [status, status, req.user.id, amount, String(notes || '').trim().slice(0, 500) || null, status, id]
            );

            if (status === 'completed') {
                const restockItems = await db.query(
                    `SELECT product_id, product_name, quantity FROM return_items
                     WHERE return_id = ? AND condition_status = 'new'`,
                    [id]
                );
                for (const item of restockItems) {
                    await db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                    await db.run(
                        `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                         VALUES (?, 'return', ?, 'return', ?, ?, ?)`,
                        [item.product_id, item.quantity, id, req.user.id, `Nhập lại hàng nguyên trạng từ phiếu đổi trả #${id}`]
                    );
                }
                const exchangeItems = await db.query(
                    `SELECT exchange_to_product_id, quantity FROM return_items
                     WHERE return_id = ? AND exchange_to_product_id IS NOT NULL`,
                    [id]
                );
                for (const item of exchangeItems) {
                    const update = await db.run(
                        `UPDATE products SET stock_quantity = stock_quantity - ?
                         WHERE id = ? AND is_active = 1 AND stock_quantity >= ?`,
                        [item.quantity, item.exchange_to_product_id, item.quantity]
                    );
                    if (update.changes !== 1) {
                        const error = new Error('Không đủ tồn kho cho sản phẩm đổi mới; cập nhật phiếu chưa được lưu');
                        error.statusCode = 409;
                        throw error;
                    }
                    await db.run(
                        `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, user_id, note)
                         VALUES (?, 'sale', ?, 'return', ?, ?, 'Xuất sản phẩm đổi mới theo phiếu đổi trả')`,
                        [item.exchange_to_product_id, -item.quantity, id, req.user.id]
                    );
                }
                await db.run("UPDATE return_items SET status = 'completed' WHERE return_id = ?", [id]);

                if (amount > 0 && action !== 'none') {
                    await db.run(
                        `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id)
                         VALUES (?, ?, 'Đổi trả', ?, ?, ?, 'auto', ?)`,
                        [action === 'refund' ? 'expense' : 'income', amount,
                            action === 'refund' ? `Hoàn tiền phiếu đổi trả #${id}` : `Thu thêm tiền phiếu đổi trả #${id}`,
                            req.user.id, payment_method, id]
                    );
                }
            } else if (status === 'rejected') {
                await db.run("UPDATE return_items SET status = 'rejected' WHERE return_id = ?", [id]);
            }
        });

        await logAction(req.user.id, 'return_request_approved', 'Cập nhật trạng thái đổi trả', {
            return_id: id,
            status,
            action: alreadyCompleted ? 'already_completed' : action
        });

        res.json({
            success: true,
            data: { return_id: Number(id), status },
            message: 'Cập nhật trạng thái đổi trả thành công'
        });
    } catch (error) {
        console.error('approveReturnRequest error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Lỗi khi phê duyệt đổi trả',
            data: null
        });
    }
};

export const createWarrantyClaim = async (req, res) => {
    try {
        const {
            order_id,
            order_item_id,
            product_id,
            customer_id,
            customer_name,
            customer_phone,
            serial_number,
            warranty_months,
            warranty_start_date,
            warranty_end_date,
            claim_type,
            issue_description,
            issue_code,
            service_provider,
            service_reference,
            created_by
        } = req.body;

        const validClaimTypes = ['repair', 'replace', 'inspection'];
        if (!product_id || !validClaimTypes.includes(claim_type) || typeof issue_description !== 'string' || !issue_description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm hoặc mô tả lỗi'
            });
        }
        let claimId;
        await db.transaction(async () => {
            let linkedOrder = null;
            let linkedItem = null;
            let storeCustomerId = null;
            let approvedWarrantyMonths = Number(warranty_months) || 0;
            let warrantyStart = warranty_start_date || null;
            let warrantyEnd = warranty_end_date || null;

            if (order_id || order_item_id) {
                if (!order_id || !order_item_id) {
                    const error = new Error('Hồ sơ bảo hành cần cả hóa đơn và dòng sản phẩm gốc');
                    error.statusCode = 400;
                    throw error;
                }
                linkedItem = await db.get(`
                    SELECT oi.id, oi.product_id, o.id AS order_id, o.created_at, o.customer_id,
                           o.customer_name, o.customer_phone, COALESCE(oi.warranty_months, p.warranty_months, 0) AS warranty_months
                    FROM order_items oi JOIN orders o ON o.id = oi.order_id
                    JOIN products p ON p.id = oi.product_id
                    WHERE oi.id = ? AND o.id = ? AND oi.product_id = ? AND o.status <> 'cancelled'
                      AND EXISTS (
                        SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income'
                          AND t.source = 'auto' AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                      )
                `, [order_item_id, order_id, product_id]);
                if (!linkedItem) {
                    const error = new Error('Sản phẩm không thuộc hóa đơn đã chọn');
                    error.statusCode = 400;
                    throw error;
                }
                approvedWarrantyMonths = Number(linkedItem.warranty_months) || 0;
                if (approvedWarrantyMonths <= 0) {
                    const error = new Error('Sản phẩm này không có thời hạn bảo hành được cấu hình');
                    error.statusCode = 409;
                    throw error;
                }
                warrantyStart = linkedItem.created_at;
                const expiry = new Date(`${String(linkedItem.created_at).replace(' ', 'T')}Z`);
                expiry.setMonth(expiry.getMonth() + approvedWarrantyMonths);
                if (Number.isNaN(expiry.getTime()) || expiry < new Date()) {
                    const error = new Error('Sản phẩm đã hết thời hạn bảo hành');
                    error.statusCode = 409;
                    throw error;
                }
                warrantyEnd = expiry.toISOString();
                linkedOrder = linkedItem;
                storeCustomerId = linkedOrder.customer_id || null;
            } else if (customer_phone) {
                const customer = await db.get('SELECT id FROM customers WHERE phone = ?', [String(customer_phone).trim()]);
                storeCustomerId = customer?.id || null;
            }

            const result = await db.run(
                `INSERT INTO warranty_claims (
                    order_id, order_item_id, product_id, customer_id, store_customer_id, customer_name, customer_phone,
                    serial_number, warranty_months, warranty_start_date, warranty_end_date,
                    claim_type, issue_description, issue_code, service_provider, service_reference, created_by
                 ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order_id || null,
                    order_item_id || null,
                    product_id,
                    storeCustomerId,
                    linkedOrder?.customer_name || customer_name || null,
                    linkedOrder?.customer_phone || customer_phone || null,
                    typeof serial_number === 'string' ? serial_number.trim().slice(0, 100) : null,
                    approvedWarrantyMonths,
                    warrantyStart,
                    warrantyEnd,
                    claim_type,
                    issue_description.trim().slice(0, 2000),
                    typeof issue_code === 'string' ? issue_code.slice(0, 100) : null,
                    typeof service_provider === 'string' ? service_provider.slice(0, 120) : 'Hãng/TTBH ủy quyền (mô phỏng)',
                    typeof service_reference === 'string' ? service_reference.trim().slice(0, 100) : null,
                    req.user.id
                ]
            );
            claimId = result.lastID;
        });

        await logAction(req.user.id, 'warranty_claim_created', 'Tạo yêu cầu bảo hành', {
            warranty_claim_id: claimId,
            product_id,
            claim_type
        });

        res.status(201).json({
            success: true,
            data: {
                warranty_claim_id: claimId,
                status: 'pending'
            },
            message: 'Yêu cầu bảo hành đã được tạo thành công'
        });
    } catch (error) {
        console.error('createWarrantyClaim error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Lỗi khi tạo yêu cầu bảo hành',
            data: null
        });
    }
};

export const getWarrantyClaims = async (req, res) => {
    try {
        const { status, customer_id, product_id } = req.query;
        let sql = `
            SELECT w.*, u.username as creator_name, o.created_at as order_created_at
            FROM warranty_claims w 
            LEFT JOIN users u ON w.created_by = u.id 
            LEFT JOIN orders o ON w.order_id = o.id 
            WHERE w.is_active = 1
        `;
        const params = [];

        if (status) {
            sql += ` AND w.status = ?`;
            params.push(status);
        }

        if (customer_id) {
            sql += ` AND w.store_customer_id = ?`;
            params.push(customer_id);
        }

        if (product_id) {
            sql += ` AND w.product_id = ?`;
            params.push(product_id);
        }

        sql += ` ORDER BY w.claimed_at DESC`;

        const claims = await db.query(sql, params);
        for (const item of claims) {
            item.invoice_code = generateInvoiceCode(item.order_id, item.order_created_at);
            item.status_history = await getTicketStatusHistory(item.id, 'warranty');
        }
        res.json({ success: true, data: claims });
    } catch (error) {
        console.error('getWarrantyClaims error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bảo hành'
        });
    }
};

export const updateWarrantyClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution_notes, notes, fee_amount } = req.body;

        const validStatuses = ['pending', 'in_review', 'approved', 'repairing', 'repaired', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái bảo hành không hợp lệ'
            });
        }
        if (['approved', 'rejected'].includes(status) && req.user.role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Chỉ chủ cửa hàng được duyệt/từ chối bảo hành', data: null });
        }
        const fee = Number(fee_amount || 0);
        if (!Number.isSafeInteger(fee) || fee < 0) {
            return res.status(400).json({ success: false, message: 'Phí dịch vụ phải là số nguyên không âm', data: null });
        }
        let alreadyCompleted = false;
        await db.transaction(async () => {
            const claim = await db.get('SELECT id, status FROM warranty_claims WHERE id = ? AND is_active = 1', [id]);
            if (!claim) {
                const error = new Error('Không tìm thấy hồ sơ bảo hành');
                error.statusCode = 404;
                throw error;
            }
            if (claim.status === 'completed') {
                if (status !== 'completed') {
                    const error = new Error('Hồ sơ bảo hành đã hoàn tất và không thể đổi ngược trạng thái');
                    error.statusCode = 409;
                    throw error;
                }
                alreadyCompleted = true;
                return;
            }
            if (['rejected', 'cancelled'].includes(claim.status) && status !== claim.status) {
                const error = new Error('Hồ sơ bảo hành đã bị từ chối hoặc hủy và không thể mở lại');
                error.statusCode = 409;
                throw error;
            }
            const allowedTransitions = {
                pending: ['in_review', 'cancelled'],
                in_review: ['approved', 'rejected', 'cancelled'],
                approved: ['repairing', 'cancelled'],
                repairing: ['repaired'],
                repaired: ['completed']
            };
            if (status !== claim.status && !(allowedTransitions[claim.status] || []).includes(status)) {
                const error = new Error(`Không thể chuyển hồ sơ bảo hành từ "${claim.status}" sang "${status}"`);
                error.statusCode = 409;
                throw error;
            }

            await db.run(
                `UPDATE warranty_claims SET status = ?, approved_by = CASE WHEN ? IN ('approved','rejected') THEN ? ELSE approved_by END, resolution_notes = ?, notes = ? WHERE id = ?`,
                [status, status, req.user.id, String(resolution_notes || '').trim().slice(0, 1000) || null,
                    String(notes || '').trim().slice(0, 1000) || null, id]
            );

            if (status === 'completed' && fee > 0) {
                await db.run(
                    `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id)
                     VALUES ('income', ?, 'Dịch vụ', ?, ?, 'cash', 'auto', ?)`,
                    [fee, `Thu phí sửa chữa/dịch vụ bảo hành phiếu #${id}`, req.user.id, id]
                );
            }
        });

        await logAction(req.user.id, 'warranty_claim_updated', 'Cập nhật trạng thái bảo hành', {
            warranty_claim_id: id,
            status,
            fee_amount: fee,
            already_completed: alreadyCompleted
        });

        res.json({
            success: true,
            data: { warranty_claim_id: Number(id), status },
            message: 'Cập nhật trạng thái bảo hành thành công'
        });
    } catch (error) {
        console.error('updateWarrantyClaimStatus error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Lỗi khi cập nhật trạng thái bảo hành',
            data: null
        });
    }
};

export const deleteReturnRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('UPDATE returns SET is_active = 0 WHERE id = ?', [id]);
        await logAction(req.user.id, 'return_request_deleted', 'X�a phi?u d?i tr?', { return_id: id });
        res.json({ success: true, message: '�� x�a phi?u d?i tr?' });
    } catch (error) {
        console.error('deleteReturnRequest error:', error);
        res.status(500).json({ success: false, message: 'L?i h? th?ng khi x�a phi?u' });
    }
};

export const deleteWarrantyClaim = async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('UPDATE warranty_claims SET is_active = 0 WHERE id = ?', [id]);
        await logAction(req.user.id, 'warranty_claim_deleted', 'X�a phi?u b?o h�nh', { warranty_claim_id: id });
        res.json({ success: true, message: '�� x�a phi?u b?o h�nh' });
    } catch (error) {
        console.error('deleteWarrantyClaim error:', error);
        res.status(500).json({ success: false, message: 'L?i h? th?ng khi x�a phi?u' });
    }
};

