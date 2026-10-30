import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as db from './db.js';
import { searchKnowledge } from './botKnowledgeService.js';
import {
    buildCart, createPendingAction, formatMoney, invoiceCodeOf, normalizePaymentMethod, unitPriceOf
} from './botActionService.js';

const STAFF_ROLES = ['staff', 'owner', 'admin'];
const PAID_ORDER_SQL = `EXISTS (
    SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
      AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
)`;

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const defineTool = (name, description, schema, handler) => new DynamicStructuredTool({
    name,
    description,
    schema,
    func: async (args) => {
        try {
            const result = await handler(args);
            return typeof result === 'string' ? result : JSON.stringify(result);
        } catch (error) {
            const message = error.statusCode ? error.message : 'Lỗi truy vấn dữ liệu, vui lòng thử lại.';
            if (!error.statusCode) console.error(`Bot tool ${name}:`, error);
            return JSON.stringify({ loi: message });
        }
    }
});

const scrubDemandText = (value) => String(value || '')
    .replace(/(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)/g, '[đã ẩn dữ liệu định danh]')
    .replace(/(?<!\d)(?:\+?84|0)\d{9}(?!\d)/g, '[đã ẩn số liên hệ]');

const pendingResult = (user, type, payload, summary) => JSON.stringify({
    trang_thai: 'CHO_XAC_NHAN',
    huong_dan: user.role === 'customer'
        ? 'Thao tác CHƯA được thực hiện. Hãy tóm tắt và hướng dẫn khách bấm nút Xác nhận hoặc Hủy trên thẻ thao tác.'
        : 'Thao tác CHƯA được thực hiện. Hãy trình bày tóm tắt và nhắc người dùng gõ /xacnhan để xác nhận hoặc /huy để hủy.',
    tom_tat: createPendingAction(user, type, payload, summary).summary
});

const orderItemsFor = (orderId) => db.query(
    `SELECT oi.id AS order_item_id, oi.product_id, COALESCE(oi.product_name, p.name) AS ten,
            oi.quantity AS so_luong, oi.unit_price AS don_gia
     FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
    [orderId]
);

const describeOrder = async (order) => ({
    ma_don: order.id,
    hoa_don: invoiceCodeOf(order.id, order.created_at),
    trang_thai: order.status,
    tong_tien: order.total_amount,
    thanh_toan: order.payment_type === 'installment' ? 'trả góp' : order.payment_method,
    khach: order.customer_name || null,
    sdt: order.customer_phone || null,
    hinh_thuc_giao: order.shipping_method || null,
    phi_giao_hang: Number(order.shipping_fee || 0),
    don_vi_van_chuyen: order.shipping_carrier || null,
    ma_van_don: order.tracking_code || null,
    du_kien_giao: order.estimated_delivery_at || null,
    ngay_tao: order.created_at,
    san_pham: await orderItemsFor(order.id)
});

const PRODUCT_SEARCH_STOP_WORDS = new Set([
    'tim', 'kiem', 'san', 'pham', 'hang', 'hoa', 'cho', 'toi', 'minh', 'ban', 'co', 'nao',
    'giup', 'xem', 'gia', 'bao', 'nhieu', 'con', 'khong', 'mot', 'vai', 'mau', 'dien', 'thoai',
    'dang', 'kinh', 'doanh', 'cua', 'la', 'voi', 'va', 'hay', 'tu', 'van', 'so', 'sanh'
]);

const productSearchTerms = (keyword) => {
    const normalized = String(keyword || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const words = normalized.split(/\s+/).filter((word) => word.length > 1 && !PRODUCT_SEARCH_STOP_WORDS.has(word));
    return [...new Set(words)].slice(0, 8);
};

const buildCommonTools = (user) => [
    defineTool(
        'ghi_nhan_nhu_cau_mua_sam',
        'Lưu nhu cầu mua sắm khách tự nguyện chia sẻ để cửa hàng tổng hợp xu hướng. Chỉ ghi nhận sau khi đã hỏi rõ và tóm tắt để khách đồng ý; không lưu tên, số điện thoại, địa chỉ, CCCD hay thông tin thanh toán.',
        z.object({
            danh_muc: z.string().trim().min(2).max(100),
            muc_dich: z.string().trim().max(300).optional(),
            ngan_sach_tu: z.number().int().min(0).optional(),
            ngan_sach_den: z.number().int().min(0).optional(),
            thuong_hieu: z.string().trim().max(100).optional(),
            ghi_chu: z.string().trim().max(500).optional()
        }),
        async ({ danh_muc, muc_dich, ngan_sach_tu, ngan_sach_den, thuong_hieu, ghi_chu }) => {
            if (ngan_sach_tu != null && ngan_sach_den != null && ngan_sach_tu > ngan_sach_den) {
                return { loi: 'Khoảng ngân sách chưa hợp lệ.' };
            }
            await db.run(
                `INSERT INTO bot_customer_needs
                 (customer_account_id, category, use_case, budget_min, budget_max, preferred_brand, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.role === 'customer' ? user.id : null, scrubDemandText(danh_muc), scrubDemandText(muc_dich),
                    ngan_sach_tu ?? null, ngan_sach_den ?? null, scrubDemandText(thuong_hieu), scrubDemandText(ghi_chu)]
            );
            return { da_ghi_nhan: true, thong_bao: 'Đã ghi nhận nhu cầu mua sắm đã thống nhất.' };
        }
    ),
    defineTool(
        'tim_san_pham',
        'Tìm sản phẩm đang kinh doanh theo từ khóa (tên, danh mục, mô tả, thẻ). Trả về mã sản phẩm, giá bán sau giảm, tồn kho, bảo hành.',
        z.object({ tu_khoa: z.string().min(1).describe('Từ khóa, ví dụ: tai nghe, iPhone, sạc') }),
        async ({ tu_khoa }) => {
            const terms = productSearchTerms(tu_khoa);
            if (!terms.length) return { ket_qua: [], ghi_chu: 'Vui lòng cung cấp tên hoặc hãng sản phẩm cần tìm.' };
            const termConditions = terms.map(() => '(p.name LIKE ? OR c.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR p.sku LIKE ?)');
            const termParams = terms.flatMap((term) => {
                const like = `%${term}%`;
                return [like, like, like, like, like];
            });
            const relevance = terms.map(() => '(CASE WHEN p.name LIKE ? THEN 5 WHEN p.tags LIKE ? THEN 3 WHEN c.name LIKE ? THEN 2 WHEN p.description LIKE ? OR p.sku LIKE ? THEN 1 ELSE 0 END)').join(' + ');
            const relevanceParams = terms.flatMap((term) => {
                const like = `%${term}%`;
                return [like, like, like, like, like];
            });
            const exactPhrase = `%${String(tu_khoa).trim()}%`;
            const rows = await db.query(
                `SELECT p.id, p.name, p.sku, p.price, p.discount_percent, p.stock_quantity, p.warranty_months,
                        p.description, c.name AS category
                 FROM products p LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.is_active = 1
                   AND (${termConditions.join(' OR ')})
                   ${['guest', 'customer'].includes(user.role) ? 'AND p.stock_quantity > 0' : ''}
                 ORDER BY CASE WHEN p.name LIKE ? THEN 100 ELSE 0 END + (${relevance}) DESC,
                          (p.stock_quantity > 0) DESC, p.name
                 LIMIT ${['guest', 'customer'].includes(user.role) ? 5 : 8}`,
                [...termParams, exactPhrase, ...relevanceParams]
            );
            if (!rows.length) return { ket_qua: [], ghi_chu: `Không có sản phẩm phù hợp đang còn hàng khớp "${tu_khoa}".` };
            return {
                ket_qua: rows.map((p) => ({
                    ma_san_pham: p.id,
                    ten: p.name,
                    sku: p.sku,
                    danh_muc: p.category,
                    gia_niem_yet: p.price,
                    giam_gia_phan_tram: p.discount_percent || 0,
                    gia_ban: unitPriceOf(p),
                    ton_kho: p.stock_quantity,
                    bao_hanh_thang: p.warranty_months || 0,
                    mo_ta: p.description
                }))
            };
        }
    ),
    defineTool(
        'tra_cuu_tri_thuc',
        'Tra cứu tài liệu của hệ thống (RAG): chính sách đổi trả, bảo hành, trả góp, thanh toán, mô tả chức năng hệ thống và cách dùng bot.',
        z.object({ cau_hoi: z.string().min(2).describe('Câu hỏi hoặc chủ đề cần tra cứu') }),
        async ({ cau_hoi }) => {
            const found = await searchKnowledge(cau_hoi, 4);
            return found.length ? { tai_lieu: found } : { tai_lieu: [], ghi_chu: 'Không tìm thấy tài liệu phù hợp.' };
        }
    ),
    defineTool(
        'tinh_phi_va_thoi_gian_ship',
        'Ước tính phí và thời gian giao hàng. Miễn phí từ 5 triệu đồng; nhận tại cửa hàng miễn phí.',
        z.object({
            tinh_thanh: z.string().optional(), quan_huyen: z.string().optional(),
            hinh_thuc_giao: z.enum(['pickup', 'standard', 'express']), tong_tien_hang: z.number().min(0)
        }),
        async ({ hinh_thuc_giao, tong_tien_hang }) => quoteShipping(hinh_thuc_giao, tong_tien_hang)
    ),
    defineTool(
        'goi_y_ban_kem',
        'Gợi ý tối đa ba sản phẩm còn hàng thường được mua cùng sản phẩm này theo lịch sử đơn hàng.',
        z.object({ product_id: z.number().int().min(1) }),
        async ({ product_id }) => {
            const rows = await db.query(
                `SELECT p.id, p.name, p.price, p.discount_percent, p.stock_quantity, COUNT(*) AS co_mua_cung
                 FROM order_items base JOIN order_items paired ON paired.order_id = base.order_id AND paired.product_id <> base.product_id
                 JOIN orders o ON o.id = base.order_id JOIN products p ON p.id = paired.product_id
                 WHERE base.product_id = ? AND p.is_active = 1 AND p.stock_quantity > 0 AND o.status <> 'cancelled'
                 GROUP BY p.id ORDER BY co_mua_cung DESC, p.name LIMIT 3`, [product_id]);
            return { goi_y: rows.map((row) => ({ ...row, gia_ban: unitPriceOf(row) })) };
        }
    ),
    defineTool(
        'tinh_tra_gop_du_kien',
        'Tính khoản trả trước và góp đều tham khảo. Không phải kết quả phê duyệt tín dụng.',
        z.object({ so_tien: z.number().min(1), ty_le_tra_truoc: z.number().min(20).max(70), ky_han_thang: z.number().int().min(3).max(12), doi_tac: z.string().max(80).optional() }),
        async ({ so_tien, ty_le_tra_truoc, ky_han_thang, doi_tac }) => {
            if (![3, 6, 9, 12].includes(ky_han_thang)) return { loi: 'Kỳ hạn trả góp chỉ gồm 3, 6, 9 hoặc 12 tháng.' };
            const downPayment = Math.round(so_tien * ty_le_tra_truoc / 100);
            const financed = so_tien - downPayment;
            return { doi_tac: doi_tac || 'Đối tác tài chính liên kết', tra_truoc: downPayment, so_tien_gop: financed,
                ky_han_thang, gop_moi_thang_tham_khao: Math.ceil(financed / ky_han_thang), ghi_chu: 'Chưa bao gồm lãi/phí của đối tác; cần thẩm định qua kênh chính thức.' };
        }
    )
];

const orderItemsSchema = z.array(z.object({
    product_id: z.number().int().describe('Mã sản phẩm lấy từ tim_san_pham'),
    so_luong: z.number().int().min(1).max(100).default(1)
})).min(1);

const quoteShipping = (method, subtotal) => {
    const key = ['pickup', 'express', 'standard'].includes(method) ? method : 'standard';
    if (key === 'pickup') return { method: key, fee: 0, estimated_delivery: 'Nhận tại cửa hàng' };
    if (subtotal >= 5000000) return { method: key, fee: 0, estimated_delivery: key === 'express' ? '2–4 giờ' : '2–4 ngày' };
    return { method: key, fee: key === 'express' ? 50000 : 30000, estimated_delivery: key === 'express' ? '2–4 giờ' : '2–4 ngày' };
};

const buildOrderTool = (user) => defineTool(
    'dat_hang',
    user.role === 'customer'
        ? 'Chuẩn bị đơn đặt hàng cho khách đang đăng nhập (chưa tạo ngay, cần khách bấm nút Xác nhận trên widget). Phải dùng mã sản phẩm từ tim_san_pham.'
        : 'Chuẩn bị hóa đơn bán hàng trả một lần tại quầy (chưa tạo ngay, cần gõ /xacnhan). Phải dùng mã sản phẩm từ tim_san_pham.',
    z.object({
        san_pham: orderItemsSchema,
        phuong_thuc_thanh_toan: z.enum(['cash', 'transfer', 'card']).optional().describe('cash=tiền mặt, transfer=chuyển khoản, card=thẻ'),
        hinh_thuc_giao: z.enum(['pickup', 'standard', 'express']).optional().describe('Nhận tại cửa hàng, giao tiêu chuẩn hoặc giao hỏa tốc'),
        dia_chi_giao_hang: z.string().min(10).max(250).optional().describe('Bắt buộc với khách hàng khi đặt giao hàng; yêu cầu địa chỉ cụ thể. Không dùng cho nhân viên/chủ cửa hàng.'),
        ten_khach: z.string().max(120).optional().describe('Chỉ dùng cho nhân viên/chủ cửa hàng'),
        sdt_khach: z.string().regex(/^\d{10}$/).optional().describe('SĐT 10 số, chỉ dùng cho nhân viên/chủ cửa hàng')
    }),
    async ({ san_pham, phuong_thuc_thanh_toan, hinh_thuc_giao, dia_chi_giao_hang, ten_khach, sdt_khach }) => {
        const cart = await buildCart(san_pham.map((item) => ({ product_id: item.product_id, quantity: item.so_luong })));
        const method = normalizePaymentMethod(phuong_thuc_thanh_toan);
        const shipping = quoteShipping(hinh_thuc_giao, cart.total);
        const lines = cart.lines.map((line) => `- ${line.quantity} × ${line.name} = ${formatMoney(line.unit_price * line.quantity)}`);
        let summary = `Đặt hàng:\n${lines.join('\n')}\nTiền hàng: ${formatMoney(cart.total)}\nPhí giao hàng (${shipping.method}): ${formatMoney(shipping.fee)}\nTổng thanh toán: ${formatMoney(cart.total + shipping.fee)} (thanh toán: ${method})`;
        const items = cart.lines.map((line) => ({ product_id: line.product_id, quantity: line.quantity }));
        if (user.role === 'customer') {
            if (!dia_chi_giao_hang?.trim()) return JSON.stringify({ loi: 'Cần địa chỉ giao hàng cụ thể trước khi chuẩn bị đơn.' });
            summary += `\nĐịa chỉ giao hàng: ${dia_chi_giao_hang.trim()}`;
            return pendingResult(user, 'create_order_customer', {
                items, payment_method: method, address: dia_chi_giao_hang,
                shipping_method: shipping.method, shipping_fee: shipping.fee,
                price_snapshot: Object.fromEntries(cart.lines.map((line) => [line.product_id, line.unit_price]))
            }, summary);
        }
        if (user.role !== 'staff') {
            return JSON.stringify({ loi: 'Chỉ nhân viên mới được lập hóa đơn. Quản trị viên và chủ cửa hàng không có quyền tạo đơn.' });
        }
        return pendingResult(user, 'create_order_staff', {
            items, payment_method: method, customer_name: ten_khach, customer_phone: sdt_khach
        }, summary);
    }
);

const buildCustomerTools = (user) => [
    defineTool(
        'don_cua_toi',
        'Liệt kê các đơn hàng gần đây của chính khách hàng đang đăng nhập.',
        z.object({ trang_thai: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional() }),
        async ({ trang_thai }) => {
            const params = [user.customer_id];
            let sql = `SELECT o.*, EXISTS(SELECT 1 FROM bot_customer_reviews r WHERE r.order_id = o.id) AS review_sent
                       FROM orders o WHERE o.customer_id = ?`;
            if (trang_thai) { sql += ' AND o.status = ?'; params.push(trang_thai); }
            sql += ' ORDER BY o.id DESC LIMIT 10';
            const orders = await db.query(sql, params);
            const summaries = await Promise.all(orders.map(async (order) => ({
                ...await describeOrder(order),
                da_danh_gia: Boolean(order.review_sent)
            })));
            return { don_hang: summaries };
        }
    ),
    buildOrderTool(user),
    defineTool(
        'huy_don_cua_toi',
        'Chuẩn bị hủy một đơn của khách đang chờ xác nhận (cần khách bấm nút Xác nhận trên widget).',
        z.object({ ma_don: z.number().int() }),
        async ({ ma_don }) => {
            const order = await db.get('SELECT id, status, total_amount FROM orders WHERE id = ? AND customer_id = ?', [ma_don, user.customer_id]);
            if (!order) return { loi: 'Không tìm thấy đơn hàng của bạn.' };
            if (order.status !== 'pending') return { loi: 'Chỉ hủy được đơn đang chờ xác nhận.' };
            return pendingResult(user, 'cancel_order_customer', { order_id: ma_don }, `Hủy đơn #${ma_don} (tổng ${formatMoney(order.total_amount)}).`);
        }
    ),
    defineTool(
        'doi_tra_bao_hanh_cua_toi',
        'Xem tình trạng các phiếu đổi trả và yêu cầu bảo hành của khách đang đăng nhập.',
        z.object({}),
        async () => ({
            doi_tra: await db.query(
                `SELECT id AS ma_phieu, order_id AS ma_don, return_type AS loai, status AS trang_thai, reason AS ly_do, requested_at AS ngay_gui
                 FROM returns WHERE store_customer_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 10`, [user.customer_id]),
            bao_hanh: await db.query(
                `SELECT id AS ma_yeu_cau, order_id AS ma_don, claim_type AS loai, status AS trang_thai,
                        claimed_at AS ngay_gui, warranty_end_date AS het_han
                 FROM warranty_claims WHERE store_customer_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 10`, [user.customer_id])
        })
    ),
    defineTool(
        'gui_danh_gia_don_hang',
        'Ghi nhận đánh giá tự nguyện của khách đã nhận hàng. Chỉ ghi nhận đánh giá cho đơn delivered thuộc chính khách đang đăng nhập; hỏi điểm 1–5 và xin phép trước khi lưu nhận xét.',
        z.object({ ma_don: z.number().int().min(1), diem: z.number().int().min(1).max(5), nhan_xet: z.string().trim().max(500).optional() }),
        async ({ ma_don, diem, nhan_xet }) => {
            const order = await db.get('SELECT id, status FROM orders WHERE id = ? AND customer_id = ?', [ma_don, user.customer_id]);
            if (!order || order.status !== 'delivered') return { loi: 'Chỉ gửi đánh giá cho đơn đã giao thành công của bạn.' };
            const existing = await db.get('SELECT id FROM bot_customer_reviews WHERE order_id = ?', [ma_don]);
            if (existing) return { loi: 'Bạn đã gửi đánh giá cho đơn này rồi, cảm ơn bạn.' };
            await db.run(
                'INSERT INTO bot_customer_reviews (order_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
                [ma_don, user.customer_id, diem, scrubDemandText(nhan_xet) || null]
            );
            return { da_ghi_nhan: true, thong_bao: 'Cảm ơn bạn đã đánh giá đơn hàng.' };
        }
    )
];

const buildStaffTools = (user) => {
    const tools = [
        defineTool(
            'xac_nhan_don_khach',
            'Xác nhận đơn hàng do khách đặt qua Bot sau khi đã kiểm tra đơn. Thao tác chỉ chuyển đơn sang đang xử lý, tạo hóa đơn và gửi hóa đơn cho khách; không ghi nhận đã thu tiền. Phải chuẩn bị thao tác chờ /xacnhan.',
            z.object({ ma_don: z.number().int().min(1) }),
            async ({ ma_don }) => {
                const order = await db.get(
                    `SELECT id, customer_name, total_amount, status, bot_reservation_expires_at
                     FROM orders WHERE id = ?`, [ma_don]);
                if (!order) return { loi: 'Không tìm thấy đơn hàng.' };
                if (order.status !== 'pending' || !order.bot_reservation_expires_at) {
                    return { loi: 'Đơn này không ở trạng thái chờ xác nhận qua Bot.' };
                }
                return pendingResult(user, 'accept_customer_order', { order_id: ma_don },
                    `Xác nhận đơn #${ma_don} của ${order.customer_name || 'khách hàng'} (${formatMoney(order.total_amount)}), tạo hóa đơn và gửi ảnh cho khách. Chưa xác nhận đã nhận thanh toán.`);
            }
        ),
        defineTool(
            'cap_nhat_van_don',
            'Chuẩn bị bàn giao đơn đang processing cho đơn vị vận chuyển. Thao tác cần /xacnhan.',
            z.object({ ma_don: z.number().int().min(1), shipping_carrier: z.string().trim().min(2).max(80), tracking_code: z.string().trim().min(3).max(100), estimated_delivery_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }),
            async ({ ma_don, shipping_carrier, tracking_code, estimated_delivery_at }) => {
                const order = await db.get('SELECT id, status FROM orders WHERE id = ?', [ma_don]);
                if (!order) return { loi: 'Không tìm thấy đơn hàng.' };
                if (order.status !== 'processing') return { loi: 'Chỉ bàn giao được đơn đang ở trạng thái processing.' };
                return pendingResult(user, 'ship_order', { order_id: ma_don, shipping_carrier, tracking_code, estimated_delivery_at },
                    `Bàn giao đơn #${ma_don} cho ${shipping_carrier}, mã vận đơn ${tracking_code}${estimated_delivery_at ? `, dự kiến giao ${estimated_delivery_at}` : ''}.`);
            }
        ),
        defineTool(
            'hoan_hang_that_bai',
            'Chuẩn bị hủy đơn giao thất bại sau khi hàng đã hoàn về cửa hàng và nhập lại tồn kho. Thao tác cần /xacnhan.',
            z.object({ ma_don: z.number().int().min(1), ly_do: z.string().min(3).max(200) }),
            async ({ ma_don, ly_do }) => {
                const order = await db.get('SELECT id, status FROM orders WHERE id = ?', [ma_don]);
                if (!order || !['shipped', 'processing'].includes(order.status)) return { loi: 'Không tìm thấy đơn đang giao/chuẩn bị để hoàn hàng.' };
                return pendingResult(user, 'cancel_returned_shipment', { order_id: ma_don, reason: ly_do }, `Hủy đơn #${ma_don} và hoàn tồn kho sau giao thất bại. Lý do: ${ly_do}`);
            }
        ),
        defineTool(
            'tra_cuu_don_hang',
            'Tra cứu hóa đơn/đơn hàng theo mã đơn, tên hoặc SĐT khách, hoặc trạng thái. Trả kèm order_item_id để tạo phiếu đổi trả.',
            z.object({
                ma_don: z.number().int().optional(),
                tu_khoa: z.string().optional().describe('Tên hoặc SĐT khách'),
                trang_thai: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional()
            }),
            async ({ ma_don, tu_khoa, trang_thai }) => {
                const conditions = []; const params = [];
                if (ma_don) { conditions.push('id = ?'); params.push(ma_don); }
                if (tu_khoa) { conditions.push('(customer_name LIKE ? OR customer_phone LIKE ?)'); params.push(`%${tu_khoa}%`, `%${tu_khoa}%`); }
                if (trang_thai) { conditions.push('status = ?'); params.push(trang_thai); }
                const orders = await db.query(
                    `SELECT * FROM orders ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY id DESC LIMIT 8`, params);
                return { don_hang: await Promise.all(orders.map(describeOrder)) };
            }
        ),
        defineTool(
            'san_pham_sap_het',
            'Liệt kê sản phẩm có tồn kho bằng hoặc thấp hơn ngưỡng cảnh báo.',
            z.object({}),
            async () => ({
                san_pham: await db.query(
                    `SELECT id AS ma_san_pham, name AS ten, stock_quantity AS ton_kho, low_stock_threshold AS nguong
                     FROM products WHERE is_active = 1 AND stock_quantity <= COALESCE(low_stock_threshold, 5)
                     ORDER BY stock_quantity ASC LIMIT 20`)
            })
        ),
        defineTool(
            'xac_nhan_thanh_toan_don',
            'Chuẩn bị xác nhận đã nhận thanh toán cho đơn trả một lần đang chờ (thường là đơn khách đặt qua Bot). Cần gõ /xacnhan.',
            z.object({ ma_don: z.number().int() }),
            async ({ ma_don }) => {
                const order = await db.get('SELECT id, status, payment_type, total_amount FROM orders WHERE id = ?', [ma_don]);
                if (!order) return { loi: 'Không tìm thấy đơn hàng.' };
                if (!['pending', 'processing', 'shipped'].includes(order.status) || order.payment_type !== 'full') {
                    return { loi: 'Đơn này không ở trạng thái chờ xác nhận thanh toán.' };
                }
                return pendingResult(user, 'confirm_payment', { order_id: ma_don }, `Xác nhận đã nhận ${formatMoney(order.total_amount)} cho đơn #${ma_don}.`);
            }
        ),
        defineTool(
            'danh_sach_doi_tra',
            'Liệt kê phiếu đổi trả (mặc định các phiếu đang chờ duyệt) kèm sản phẩm.',
            z.object({ trang_thai: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional() }),
            async ({ trang_thai }) => {
                const rows = await db.query(
                    `SELECT id, order_id, customer_name, customer_phone, return_type, reason, status, requested_at
                     FROM returns WHERE is_active = 1 AND status = ? ORDER BY id DESC LIMIT 10`, [trang_thai || 'pending']);
                for (const row of rows) {
                    row.san_pham = await db.query(
                        'SELECT product_name AS ten, quantity AS so_luong, unit_price AS don_gia, condition_status AS tinh_trang FROM return_items WHERE return_id = ?', [row.id]);
                }
                return { phieu_doi_tra: rows };
            }
        ),
        defineTool(
            'tao_yeu_cau_doi_tra',
            'Chuẩn bị phiếu đổi trả cho một đơn đã thanh toán (cần gõ /xacnhan). Lấy order_item_id từ tra_cuu_don_hang.',
            z.object({
                ma_don: z.number().int(),
                loai: z.enum(['exchange', 'refund', 'store_credit']).describe('exchange=đổi hàng, refund=hoàn tiền, store_credit=tích điểm cửa hàng'),
                ly_do: z.string().max(300).optional(),
                san_pham: z.array(z.object({
                    order_item_id: z.number().int(),
                    so_luong: z.number().int().min(1).default(1),
                    tinh_trang: z.enum(['new', 'used', 'damaged', 'defective', 'wrong_item']).default('new')
                })).min(1)
            }),
            async ({ ma_don, loai, ly_do, san_pham }) => {
                const order = await db.get('SELECT id FROM orders WHERE id = ? AND status <> ?', [ma_don, 'cancelled']);
                if (!order) return { loi: 'Không tìm thấy đơn hàng.' };
                const items = san_pham.map((item) => ({
                    order_item_id: item.order_item_id, quantity: item.so_luong, condition_status: item.tinh_trang
                }));
                return pendingResult(user, 'create_return', { order_id: ma_don, return_type: loai, reason: ly_do, items },
                    `Tạo phiếu đổi trả (${loai}) cho đơn #${ma_don}, ${items.length} dòng sản phẩm. Lý do: ${ly_do || 'không ghi'}.`);
            }
        )
    ];
    if (user.role === 'staff') {
        tools.push(
            buildOrderTool(user),
            defineTool(
                'cham_cong_cua_toi',
                'Xem lịch sử chấm công gần đây của người dùng đang đăng nhập.',
                z.object({}),
                async () => ({
                    cham_cong: await db.query(
                        `SELECT date AS ngay, check_in_time AS vao_ca, check_out_time AS ra_ca, total_hours AS tong_gio
                         FROM attendance WHERE user_id = ? ORDER BY id DESC LIMIT 7`, [user.id])
                })
            )
        );
    }
    return tools;
};

const buildManagerTools = (user) => [
    defineTool(
        'san_pham_sap_het',
        'Liệt kê sản phẩm có tồn kho bằng hoặc thấp hơn ngưỡng cảnh báo.',
        z.object({}),
        async () => ({
            san_pham: await db.query(
                `SELECT id AS ma_san_pham, name AS ten, stock_quantity AS ton_kho, low_stock_threshold AS nguong
                 FROM products WHERE is_active = 1 AND stock_quantity <= COALESCE(low_stock_threshold, 5)
                 ORDER BY stock_quantity ASC LIMIT 20`)
        })
    ),
    defineTool(
        'danh_sach_doi_tra',
        'Liệt kê phiếu đổi trả (mặc định các phiếu đang chờ duyệt) kèm sản phẩm.',
        z.object({ trang_thai: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional() }),
        async ({ trang_thai }) => {
            const rows = await db.query(
                `SELECT id, order_id, customer_name, customer_phone, return_type, reason, status, requested_at
                 FROM returns WHERE is_active = 1 AND status = ? ORDER BY id DESC LIMIT 10`, [trang_thai || 'pending']);
            for (const row of rows) {
                row.san_pham = await db.query(
                    'SELECT product_name AS ten, quantity AS so_luong, unit_price AS don_gia, condition_status AS tinh_trang FROM return_items WHERE return_id = ?', [row.id]);
            }
            return { phieu_doi_tra: rows };
        }
    ),
    defineTool(
        'bao_cao_kinh_doanh',
        'Báo cáo doanh thu, số đơn, top sản phẩm bán chạy, cảnh báo tồn kho và phiếu đổi trả chờ duyệt. Mặc định là tháng hiện tại.',
        z.object({
            tu_ngay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('YYYY-MM-DD'),
            den_ngay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('YYYY-MM-DD')
        }),
        async ({ tu_ngay, den_ngay }) => {
            const now = new Date();
            const from = tu_ngay || toIsoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
            const to = den_ngay || toIsoDate(now);
            const summary = await db.get(
                `SELECT COUNT(o.id) AS so_don, COALESCE(SUM(o.total_amount), 0) AS doanh_thu
                 FROM orders o WHERE o.status <> 'cancelled' AND date(o.created_at) BETWEEN ? AND ? AND ${PAID_ORDER_SQL}`, [from, to]);
            const top = await db.query(
                `SELECT COALESCE(oi.product_name, p.name) AS ten, SUM(oi.quantity) AS da_ban, SUM(oi.quantity * oi.unit_price) AS doanh_thu
                 FROM order_items oi JOIN orders o ON o.id = oi.order_id LEFT JOIN products p ON p.id = oi.product_id
                 WHERE o.status <> 'cancelled' AND date(o.created_at) BETWEEN ? AND ? AND ${PAID_ORDER_SQL}
                 GROUP BY oi.product_id ORDER BY da_ban DESC LIMIT 5`, [from, to]);
            const lowStock = await db.get('SELECT COUNT(*) AS so_luong FROM products WHERE is_active = 1 AND stock_quantity <= COALESCE(low_stock_threshold, 5)');
            const pendingReturns = await db.get("SELECT COUNT(*) AS so_luong FROM returns WHERE is_active = 1 AND status = 'pending'");
            const pendingOrders = await db.get("SELECT COUNT(*) AS so_luong FROM orders WHERE status = 'pending'");
            return {
                khoang_thoi_gian: { tu_ngay: from, den_ngay: to },
                tong_quan: summary,
                top_ban_chay: top,
                san_pham_sap_het: lowStock.so_luong,
                phieu_doi_tra_cho_duyet: pendingReturns.so_luong,
                don_cho_xac_nhan: pendingOrders.so_luong
            };
        }
    ),
    defineTool(
        'duyet_doi_tra',
        'Chuẩn bị duyệt (approved) hoặc từ chối (rejected) một phiếu đổi trả đang chờ (cần gõ /xacnhan).',
        z.object({
            ma_phieu: z.number().int(),
            quyet_dinh: z.enum(['approved', 'rejected']),
            ghi_chu: z.string().max(300).optional()
        }),
        async ({ ma_phieu, quyet_dinh, ghi_chu }) => {
            const ticket = await db.get('SELECT id, status, order_id FROM returns WHERE id = ? AND is_active = 1', [ma_phieu]);
            if (!ticket) return { loi: 'Không tìm thấy phiếu đổi trả.' };
            if (ticket.status !== 'pending') return { loi: `Phiếu đang ở trạng thái ${ticket.status}, chỉ duyệt được phiếu chờ duyệt.` };
            return pendingResult(user, 'decide_return', { return_id: ma_phieu, status: quyet_dinh, notes: ghi_chu },
                `${quyet_dinh === 'approved' ? 'Duyệt' : 'Từ chối'} phiếu đổi trả #${ma_phieu} (đơn #${ticket.order_id}).`);
        }
    )
];

const buildAdminTools = (user) => [
    defineTool(
        'thong_ke_tai_khoan',
        'Thống kê số tài khoản theo vai trò, trạng thái hoạt động và số tài khoản khách hàng.',
        z.object({}),
        async () => ({
            nhan_su: await db.query('SELECT role AS vai_tro, is_active AS dang_hoat_dong, COUNT(*) AS so_luong FROM users GROUP BY role, is_active'),
            tai_khoan_khach: await db.get('SELECT COUNT(*) AS so_luong FROM customer_accounts')
        })
    ),
    defineTool(
        'nhat_ky_hoat_dong',
        'Xem các dòng nhật ký hoạt động hệ thống gần nhất.',
        z.object({ so_dong: z.number().int().min(1).max(30).default(10) }),
        async ({ so_dong }) => ({
            nhat_ky: await db.query(
                `SELECT l.action_type AS loai, l.action_desc AS mo_ta, COALESCE(u.username, 'khách/ẩn danh') AS nguoi_dung, l.created_at AS thoi_gian
                 FROM audit_logs l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.id DESC LIMIT ?`, [so_dong])
        })
    ),
    defineTool(
        'cap_nhat_cau_hinh_ai',
        'Chuẩn bị thay đổi cấu hình AI (provider, model, host, max_tokens, temperature) cho toàn hệ thống (cần gõ /xacnhan).',
        z.object({
            ai_provider: z.enum(['gemini', 'ollama']).optional().describe('Động cơ AI (gemini hoặc ollama)'),
            ai_model: z.string().optional().describe('Tên mô hình (Gemini: gemini-3.8-flash hoặc gemini-3.1-flash-lite; Ollama: tên model cục bộ)'),
            ai_host: z.string().optional().describe('Host cho Ollama (thường là http://localhost:11434)'),
            ai_temperature: z.number().min(0).max(1).optional().describe('Độ sáng tạo 0-1'),
            ai_max_tokens: z.number().int().min(256).max(8192).optional().describe('Giới hạn độ dài')
        }),
        async (args) => {
            if (Object.keys(args).length === 0) return { loi: 'Cần chỉ định ít nhất một tham số để cập nhật.' };
            const parts = Object.entries(args).map(([k, v]) => `${k} = ${v}`);
            return pendingResult(user, 'update_ai_config', args, `Cập nhật cấu hình AI:\n- ${parts.join('\n- ')}`);
        }
    )
];

/** Bộ tool được cấp theo vai trò. Danh tính luôn lấy từ JWT (closure), không bao giờ từ LLM. */
export const buildToolsForUser = (user) => {
    if (!['guest', 'customer'].includes(user?.role)) return [];
    const tools = buildCommonTools(user);
    if (user.role === 'customer') tools.push(...buildCustomerTools(user));
    const seen = new Set();
    return tools.filter((tool) => {
        if (seen.has(tool.name)) return false;
        seen.add(tool.name);
        return true;
    });
};
