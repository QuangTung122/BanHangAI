import * as db from '../services/db.js';
import { logAction } from './auditController.js';

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

        if (!order_id || !items || items.length === 0) {
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

        const result = await db.run(
            `INSERT INTO returns (
                order_id, customer_id, customer_name, customer_phone,
                return_type, reason, exchange_product_id, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order_id,
                customer_id || null,
                customer_name || null,
                customer_phone || null,
                return_type,
                reason || null,
                exchange_product_id || null,
                notes || null,
                req.user.id
            ]
        );

        const returnId = result.lastID;

        for (const item of items) {
            await db.run(
                `INSERT INTO return_items (
                    return_id, order_item_id, product_id, product_name,
                    quantity, unit_price, condition_status, defect_type,
                    warranty_remaining_days, refund_amount, exchange_to_product_id,
                    exchange_delta_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    returnId,
                    item.order_item_id,
                    item.product_id,
                    item.product_name || null,
                    item.quantity || 1,
                    item.unit_price || 0,
                    item.condition_status || 'new',
                    item.defect_type || null,
                    item.warranty_remaining_days || 0,
                    item.refund_amount || 0,
                    item.exchange_to_product_id || null,
                    item.exchange_delta_amount || 0
                ]
            );
        }

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
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo yêu cầu đổi trả'
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
            sql += ` AND r.customer_id = ?`;
            params.push(customer_id);
        }

        if (order_id) {
            sql += ` AND r.order_id = ?`;
            params.push(order_id);
        }

        sql += ` ORDER BY r.requested_at DESC`;

        const returns = await db.query(sql, params);


        const generateInvoiceCode = (orderId, createdAtStr) => {
            if (!createdAtStr) return 'INV-' + orderId;
            const dateStr = createdAtStr.includes('Z') ? createdAtStr : createdAtStr.replace(' ', 'T') + 'Z';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'INV-' + orderId;
            const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
            return `INV-${yymmdd}-${String(orderId).padStart(4, '0')}`;
        };
        for (const item of returns) {
            item.invoice_code = generateInvoiceCode(item.order_id, item.order_created_at);
            item.items = await db.query(`SELECT * FROM return_items WHERE return_id = ?`, [item.id]);
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
        const { status, approved_by, refund_amount, notes, action } = req.body;

        const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái phê duyệt không hợp lệ'
            });
        }

        await db.run(
            `UPDATE returns SET status = ?, approved_by = ?, refund_amount = ?, notes = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [status, approved_by || req.user.id, refund_amount || 0, notes || null, id]
        );

        if (action === 'refund' && refund_amount > 0) {
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['expense', refund_amount, 'Đổi trả', 'Hoàn tiền cho đơn hàng đổi trả #' + id, req.user.id, 'cash', 'manual', id]
            );
        } else if (action === 'collect' && refund_amount > 0) {
            await db.run(
                'INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                ['income', refund_amount, 'Đổi trả', 'Thu thêm tiền khách khi đổi trả #' + id, req.user.id, 'cash', 'manual', id]
            );
        }

        await logAction(req.user.id, 'return_request_approved', 'Cập nhật trạng thái đổi trả', {
            return_id: id,
            status,
            action: action || 'none'
        });

        res.json({
            success: true,
            data: { return_id: Number(id), status },
            message: 'Cập nhật trạng thái đổi trả thành công'
        });
    } catch (error) {
        console.error('approveReturnRequest error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi phê duyệt đổi trả'
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
            created_by
        } = req.body;

        if (!product_id || !claim_type || !issue_description) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm hoặc mô tả lỗi'
            });
        }

        const result = await db.run(
            `INSERT INTO warranty_claims (
                order_id, order_item_id, product_id, customer_id, customer_name, customer_phone,
                serial_number, warranty_months, warranty_start_date, warranty_end_date,
                claim_type, issue_description, issue_code, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order_id || null,
                order_item_id || null,
                product_id,
                customer_id || null,
                customer_name || null,
                customer_phone || null,
                serial_number || null,
                warranty_months || 0,
                warranty_start_date || null,
                warranty_end_date || null,
                claim_type,
                issue_description,
                issue_code || null,
                created_by || req.user.id
            ]
        );

        await logAction(req.user.id, 'warranty_claim_created', 'Tạo yêu cầu bảo hành', {
            warranty_claim_id: result.lastID,
            product_id,
            claim_type
        });

        res.status(201).json({
            success: true,
            data: {
                warranty_claim_id: result.lastID,
                status: 'pending'
            },
            message: 'Yêu cầu bảo hành đã được tạo thành công'
        });
    } catch (error) {
        console.error('createWarrantyClaim error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo yêu cầu bảo hành'
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
            sql += ` AND w.customer_id = ?`;
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
        const { status, approved_by, resolution_notes, notes, fee_amount } = req.body;

        const validStatuses = ['pending', 'in_review', 'approved', 'repairing', 'repaired', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái bảo hành không hợp lệ'
            });
        }

        await db.run(
            `UPDATE warranty_claims SET status = ?, approved_by = ?, resolution_notes = ?, notes = ? WHERE id = ?`,
            [status, approved_by || req.user.id, resolution_notes || null, notes || null, id]
        );

        if (status === 'completed' && fee_amount > 0) {
            await db.run(
                `INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['income', fee_amount, 'Dịch vụ', 'Thu phí sửa chữa/dịch vụ bảo hành phiếu #' + id, req.user.id, 'cash', 'manual', id]
            );
        }

        await logAction(req.user.id, 'warranty_claim_updated', 'Cập nhật trạng thái bảo hành', {
            warranty_claim_id: id,
            status,
            fee_amount: fee_amount || 0
        });

        res.json({
            success: true,
            data: { warranty_claim_id: Number(id), status },
            message: 'Cập nhật trạng thái bảo hành thành công'
        });
    } catch (error) {
        console.error('updateWarrantyClaimStatus error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái bảo hành'
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

