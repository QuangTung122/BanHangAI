import * as db from './db.js';

/* ==============================================================
   1. CÁC HÀM XỬ LÝ LOGIC (Đã thêm cơ chế bắt lỗi nghiêm ngặt)
============================================================== */
const aiFunctions = {
    tim_kiem_san_pham: async (args) => {
        try {
            const tu_khoa = args?.tu_khoa ? String(args.tu_khoa).trim() : "";
            const gia_toi_thieu = Number(args?.gia_toi_thieu) || 0;
            const gia_toi_da = Number(args?.gia_toi_da) || 999999999;

            const sql = `
                SELECT p.id, p.name, p.price, p.discount_percent, p.description, p.stock_quantity, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE (p.name LIKE ? OR c.name LIKE ? OR p.description LIKE ?)
                  AND p.price >= ? 
                  AND p.price <= ?
                  AND p.is_active = 1
                  AND p.stock_quantity > 0
                LIMIT 5
            `;
            const params = [`%${tu_khoa}%`, `%${tu_khoa}%`, `%${tu_khoa}%`, gia_toi_thieu, gia_toi_da];
            const results = await db.query(sql, params);
            
            if (results.length === 0) return { message: `Không tìm thấy sản phẩm nào khớp với từ khóa '${tu_khoa}'.` };
            return results;
        } catch (error) {
            console.error("Lỗi tim_kiem_san_pham:", error);
            return { error: "Lỗi hệ thống: Không thể truy vấn sản phẩm lúc này." };
        }
    },

    tim_kiem_san_pham_theo_thang: async (args) => {
        try {
            const thang = Number(args?.thang);
            const nam = Number(args?.nam) || new Date().getFullYear();
            if (!thang || thang < 1 || thang > 12) return { error: "Lỗi: Cần cung cấp tháng hợp lệ (1-12)." };

            const thangStr = thang.toString().padStart(2, '0');
            const searchStr = `${nam}-${thangStr}-%`;

            const sql = `
                SELECT p.name, p.price, p.stock_quantity, p.created_at
                FROM products p
                WHERE p.created_at LIKE ? AND p.is_active = 1
                ORDER BY p.created_at DESC
                LIMIT 10
            `;
            const results = await db.query(sql, [searchStr]);
            
            if (results.length === 0) return { message: `Không có sản phẩm nào được thêm vào tháng ${thang}/${nam}.` };
            return results;
        } catch (error) {
            console.error("Lỗi tim_kiem_san_pham_theo_thang:", error);
            return { error: "Lỗi hệ thống: Không thể truy vấn sản phẩm theo tháng." };
        }
    },

    xem_danh_muc: async () => {
        try {
            const sql = `SELECT name, description FROM categories WHERE is_active = 1`;
            const results = await db.query(sql);
            if (results.length === 0) return { message: "Shop hiện chưa có danh mục nào." };
            return results;
        } catch (error) {
            return { error: "Lỗi hệ thống: Không thể tải danh mục." };
        }
    },

    kiem_tra_ton_kho: async (args) => {
        try {
            if (!args?.ten_san_pham) return { error: "Lỗi: Cần cung cấp tên sản phẩm." };
            const sql = `SELECT name, stock_quantity, price FROM products WHERE is_active = 1 AND name LIKE ? ORDER BY name LIMIT 3`;
            const results = await db.query(sql, [`%${String(args.ten_san_pham).trim()}%`]);
            
            if (results.length === 0) return { message: "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh." };
            return results;
        } catch (error) {
            return { error: "Lỗi hệ thống: Không thể kiểm tra tồn kho." };
        }
    },

    bao_cao_kinh_doanh: async (args, userRole) => {
        try {
            if (!['admin', 'owner'].includes(userRole)) {
                return { error: 'Bạn không có quyền xem báo cáo doanh thu.' };
            }
            let sql = `SELECT COUNT(o.id) AS tong_don_hang, COALESCE(SUM(o.total_amount), 0) AS tong_doanh_thu
                       FROM orders o WHERE o.status <> 'cancelled' AND EXISTS (
                         SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
                           AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                       )`;
            const params = [];
            const month = args?.thang === undefined ? null : Number(args.thang);
            const year = args?.nam === undefined ? null : Number(args.nam);
            if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) {
                return { error: 'Tháng cần xem phải nằm trong khoảng 1 đến 12.' };
            }
            if (year !== null && (!Number.isInteger(year) || year < 2000 || year > 2200)) {
                return { error: 'Năm cần xem không hợp lệ.' };
            }
            if (month !== null || year !== null) {
                const selectedYear = year ?? new Date().getFullYear();
                if (month !== null) {
                    sql += ` AND strftime('%Y-%m', o.created_at) = ?`;
                    params.push(`${selectedYear}-${String(month).padStart(2, '0')}`);
                } else {
                    sql += ` AND strftime('%Y', o.created_at) = ?`;
                    params.push(String(selectedYear));
                }
            }
            return await db.get(sql, params);
        } catch (error) {
            return { error: "Lỗi hệ thống: Không thể sinh báo cáo doanh thu." };
        }
    }
};

/* ==============================================================
   2. KHAI BÁO CẤU TRÚC TOOLS CHO GEMINI VÀ OLLAMA
============================================================== */
export const geminiToolDeclarations = [
    {
        functionDeclarations: [
            {
                name: "tim_kiem_san_pham",
                description: "HÀM TRUY VẤN: Tìm kiếm thông tin sản phẩm (giá, mô tả, tồn kho) dựa trên từ khóa và khoảng giá. Sau khi có dữ liệu thô, Bot phải dùng dữ liệu này để tự sinh lời tư vấn tự nhiên cho khách.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        tu_khoa: { type: "STRING", description: "Từ khóa tên sản phẩm (VD: Tai nghe, iPhone)" },
                        gia_toi_thieu: { type: "NUMBER", description: "Giá thấp nhất (VNĐ)" },
                        gia_toi_da: { type: "NUMBER", description: "Giá cao nhất (VNĐ)" }
                    }
                }
            },
            {
                name: "tim_kiem_san_pham_theo_thang",
                description: "HÀM TRUY VẤN: Tìm danh sách các sản phẩm được nhập/tạo mới trong một tháng cụ thể. Dùng để xem hàng mới về.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        thang: { type: "NUMBER", description: "Tháng cần tìm kiếm (1-12)" },
                        nam: { type: "NUMBER", description: "Năm cần tìm kiếm (VD: 2024). Bỏ trống sẽ lấy năm hiện tại." }
                    },
                    required: ["thang"]
                }
            },
            {
                name: "xem_danh_muc",
                description: "HÀM TRUY VẤN: Lấy danh sách các loại mặt hàng shop đang bán. Bot sẽ dùng danh sách này để gợi ý khách hàng.",
            },
            {
                name: "kiem_tra_ton_kho",
                description: "HÀM TRUY VẤN: Kiểm tra số lượng tồn kho chính xác của một mặt hàng cụ thể. Dùng khi khách hỏi 'còn hàng không?'.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        ten_san_pham: { type: "STRING", description: "Tên chính xác hoặc 1 phần tên sản phẩm" }
                    },
                    required: ["ten_san_pham"]
                }
            },
            {
                name: "bao_cao_kinh_doanh",
                description: "HÀM TRUY VẤN: Lấy dữ liệu thô về doanh thu, tổng đơn hàng. Bot dùng số liệu này để báo cáo.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        trang_thai: { type: "STRING", description: "Trạng thái đơn (VD: completed, pending)" },
                        thang: { type: "NUMBER", description: "Tháng (1-12) muốn xem doanh thu" },
                        nam: { type: "NUMBER", description: "Năm muốn xem doanh thu (VD: 2024)" }
                    }
                }
            }
        ]
    }
];

// Sinh cấu trúc tools chuẩn OpenAI/Ollama từ Gemini tools
export const ollamaToolDeclarations = geminiToolDeclarations[0].functionDeclarations.map(fn => {
    const params = fn.parameters ? {
        type: "object",
        properties: {},
        required: fn.parameters.required || []
    } : undefined;

    if (fn.parameters && fn.parameters.properties) {
        for (const [key, val] of Object.entries(fn.parameters.properties)) {
            params.properties[key] = {
                type: val.type.toLowerCase(), // OLLAMA expects lowercase like 'string', 'number'
                description: val.description
            };
        }
    }

    return {
        type: "function",
        function: {
            name: fn.name,
            description: fn.description,
            parameters: params
        }
    };
});

/* ==============================================================
   3. BỘ ĐỊNH TUYẾN THỰC THI TOOL (Router)
============================================================== */
export const executeAiTool = async (functionName, functionArgs, userRole) => {
    console.log(`[AI Tool Called]: ${functionName}`, functionArgs, `(Role: ${userRole})`);
    
    switch (functionName) {
        case "tim_kiem_san_pham":
            return await aiFunctions.tim_kiem_san_pham(functionArgs);
        case "tim_kiem_san_pham_theo_thang":
            return await aiFunctions.tim_kiem_san_pham_theo_thang(functionArgs);
        case "xem_danh_muc":
            return await aiFunctions.xem_danh_muc();
        case "kiem_tra_ton_kho":
            return await aiFunctions.kiem_tra_ton_kho(functionArgs);
        case "bao_cao_kinh_doanh":
            return await aiFunctions.bao_cao_kinh_doanh(functionArgs, userRole);
        default:
            console.warn(`[AI Tool Error]: Bot gọi một tool không tồn tại -> ${functionName}`);
            return { error: `Function ${functionName} chưa được hỗ trợ trên hệ thống.` };
    }
};


/* ==============================================================
   4. BỘ ĐỊNH TUYẾN TỔ HỢP LỆNH NHANH (Slash Commands Router)
============================================================== */

const parsePriceCondition = (text) => {
    let sqlCondition = "1=1";
    let params = [];

    // Tìm "từ X đến Y triệu"
    const matchRange = text.match(/từ\s*(\d+)\s*đến\s*(\d+)\s*(triệu|tr)/i);
    if (matchRange) {
        sqlCondition = "price >= ? AND price <= ?";
        params.push(parseInt(matchRange[1]) * 1000000);
        params.push(parseInt(matchRange[2]) * 1000000);
        return { sqlCondition, params };
    }

    // Tìm "dưới X triệu" hoặc "rẻ hơn X triệu"
    const matchUnder = text.match(/(dưới|rẻ hơn|<)\s*(\d+)\s*(triệu|tr)/i);
    if (matchUnder) {
        sqlCondition = "price <= ?";
        params.push(parseInt(matchUnder[2]) * 1000000);
        return { sqlCondition, params };
    }

    // Tìm "trên X triệu" hoặc "hơn X triệu"
    const matchOver = text.match(/(trên|hơn|>)\s*(\d+)\s*(triệu|tr)/i);
    if (matchOver) {
        sqlCondition = "price >= ?";
        params.push(parseInt(matchOver[2]) * 1000000);
        return { sqlCondition, params };
    }

    // Tìm "X triệu" (Khoảng giá lân cận +- 2 triệu)
    const matchExact = text.match(/(\d+)\s*(triệu|tr)/i);
    if (matchExact) {
        const basePrice = parseInt(matchExact[1]) * 1000000;
        sqlCondition = "price >= ? AND price <= ?";
        params.push(basePrice - 2000000 > 0 ? basePrice - 2000000 : 0);
        params.push(basePrice + 2000000);
        return { sqlCondition, params };
    }

    return { sqlCondition, params };
};

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
const formatInvoiceCode = (order) => {
    const createdAt = new Date(`${String(order.created_at).replace(' ', 'T')}Z`);
    return Number.isNaN(createdAt.getTime()) ? `Đơn #${order.id}` : `INV-${createdAt.toISOString().slice(2, 10).replace(/-/g, '')}-${String(order.id).padStart(4, '0')}`;
};
const NO_LLM_RESULT = 'Hiện tại hệ thống không có dữ liệu phù hợp.';
const normalizeIntentTerm = (value) => String(value).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export const processSlashCommand = async (message, userRole, userId) => {
    const lowerMsg = String(message || '').toLowerCase().trim();
    let preFetchContext = null;
    let directAnswer = null;

    if (lowerMsg.startsWith('/giá') || lowerMsg.startsWith('/gia')) {
        const keyword = message.replace(/^\/gi[aá]\s*/i, '').trim();
        if (!keyword) return { directAnswer: 'Cú pháp: /giá <tên sản phẩm hoặc khoảng giá>', preFetchContext: null };
        const priceLogic = parsePriceCondition(keyword);
        const sql = `SELECT name, price, discount_percent, stock_quantity FROM products
                     WHERE is_active = 1 AND ${priceLogic.sqlCondition}
                       AND (? = '' OR name LIKE ? OR sku LIKE ?)
                     ORDER BY price ASC LIMIT 5`;
        const searchTerm = priceLogic.params.length ? '' : keyword;
        const products = await db.query(sql, [...priceLogic.params, searchTerm, `%${searchTerm}%`, `%${searchTerm}%`]);
        directAnswer = products.length
            ? products.map((product) => {
                const salePrice = Math.round(product.price * (100 - (product.discount_percent || 0)) / 100);
                return `• ${product.name}: ${formatPrice(salePrice)}${product.discount_percent ? ` (giảm ${product.discount_percent}%)` : ''}; tồn ${product.stock_quantity}.`;
            }).join('\n')
            : NO_LLM_RESULT;
    } else if (lowerMsg.startsWith('/tồn kho') || lowerMsg.startsWith('/tonkho') || lowerMsg.startsWith('/ton kho')) {
        const keyword = message.replace(/^\/t[ồo]n\s*kho\s*/i, '').trim();
        if (!keyword) return { directAnswer: 'Cú pháp: /tồn kho <tên hoặc mã sản phẩm>', preFetchContext: null };
        const products = await db.query(
            `SELECT name, sku, stock_quantity, low_stock_threshold FROM products
             WHERE is_active = 1 AND (name LIKE ? OR sku LIKE ?) ORDER BY name LIMIT 5`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        directAnswer = products.length
            ? products.map((product) => `• ${product.name}${product.sku ? ` (${product.sku})` : ''}: ${product.stock_quantity} sản phẩm${product.stock_quantity <= product.low_stock_threshold ? ' — cần chú ý nhập hàng' : ''}.`).join('\n')
            : NO_LLM_RESULT;
    } else if (lowerMsg.startsWith('/khách hàng') || lowerMsg.startsWith('/khachhang')) {
        if (!['admin', 'owner'].includes(userRole)) {
            return { directAnswer: 'Bạn không có quyền tra cứu hồ sơ khách hàng qua chatbot.', preFetchContext: null };
        }
        const keyword = message.replace(/^\/kh[aá]ch\s*h[aà]ng\s*/i, '').trim();
        if (keyword.length < 2) return { directAnswer: 'Cú pháp: /khách hàng <tên hoặc số điện thoại>', preFetchContext: null };
        const customers = await db.query(
            `SELECT id, full_name, phone FROM customers
             WHERE full_name LIKE ? OR phone LIKE ? ORDER BY updated_at DESC LIMIT 5`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        if (!customers.length) return { directAnswer: NO_LLM_RESULT, preFetchContext: null };
        const summaries = [];
        for (const customer of customers) {
            const orders = await db.query(
                `SELECT id, total_amount, status, created_at FROM orders
                 WHERE customer_id = ? ORDER BY created_at DESC LIMIT 3`,
                [customer.id]
            );
            const serviceCases = await db.query(
                `SELECT case_type, status, created_at FROM (
                    SELECT 'Đổi trả' AS case_type, status, requested_at AS created_at
                    FROM returns WHERE store_customer_id = ?
                    UNION ALL
                    SELECT 'Bảo hành' AS case_type, status, claimed_at AS created_at
                    FROM warranty_claims WHERE store_customer_id = ?
                 ) ORDER BY created_at DESC LIMIT 3`,
                [customer.id, customer.id]
            );
            const maskedPhone = customer.phone ? `${customer.phone.slice(0, 2)}••••••${customer.phone.slice(-2)}` : 'chưa có số điện thoại';
            const orderSummary = orders.length
                ? orders.map((order) => `${formatInvoiceCode(order)} (${order.status}, ${formatPrice(order.total_amount)})`).join('; ')
                : 'chưa có đơn hàng';
            const serviceSummary = serviceCases.length
                ? serviceCases.map((item) => `${item.case_type} (${item.status})`).join('; ')
                : 'không có hồ sơ đổi trả/bảo hành';
            summaries.push(`${customer.full_name} — ${maskedPhone}. Gần đây: ${orderSummary}. Hồ sơ dịch vụ: ${serviceSummary}.`);
        }
        directAnswer = summaries.join('\n');
    } else if (lowerMsg.startsWith('/báo cáo') || lowerMsg.startsWith('/baocao')) {
        if (!['admin', 'owner'].includes(userRole)) {
            return { directAnswer: 'Bạn không có quyền xem báo cáo doanh thu.', preFetchContext: null };
        }
        const period = message.replace(/^\/b[aá]o\s*c[aá]o\s*/i, '').trim().toLowerCase();
        let sql = `SELECT COUNT(o.id) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_revenue
                   FROM orders o WHERE o.status <> 'cancelled' AND EXISTS (
                     SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
                       AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                   )`;
        const params = [];
        const monthMatch = period.match(/th[aá]ng\s+(\d{1,2})/);
        const yearMatch = period.match(/n[aă]m\s+(\d{4})/);
        if (monthMatch) {
            const month = Number(monthMatch[1]);
            const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
            if (month < 1 || month > 12 || year < 2000 || year > 2200) {
                return { directAnswer: 'Tháng hoặc năm cần xem không hợp lệ.', preFetchContext: null };
            }
            sql += ` AND strftime('%Y-%m', o.created_at) = ?`;
            params.push(`${year}-${String(month).padStart(2, '0')}`);
        } else if (yearMatch) {
            const year = Number(yearMatch[1]);
            if (year < 2000 || year > 2200) return { directAnswer: 'Năm cần xem không hợp lệ.', preFetchContext: null };
            sql += ` AND strftime('%Y', o.created_at) = ?`;
            params.push(String(year));
        } else if (period.includes('hôm nay') || period.includes('hom nay')) {
            sql += ` AND date(o.created_at) = date('now', 'localtime')`;
        } else if (period.includes('tháng') || period.includes('thang')) {
            sql += ` AND strftime('%Y-%m', o.created_at) = strftime('%Y-%m', 'now', 'localtime')`;
        } else if (period.includes('năm') || period.includes('nam')) {
            sql += ` AND strftime('%Y', o.created_at) = strftime('%Y', 'now', 'localtime')`;
        }
        const stats = await db.get(sql, params);
        const label = period || 'toàn thời gian';
        directAnswer = `Báo cáo ${label}: ${stats.total_orders || 0} đơn đã hoàn thành, doanh thu ${formatPrice(stats.total_revenue)}.`;
    } else if (lowerMsg.startsWith('/liệt kê') || lowerMsg.startsWith('/lietke')) {
        const keyword = message.replace(/^\/li[eệ]t\s*k[eê]\s*/i, '').trim().toLowerCase();
        if (keyword.includes('danh mục') || keyword.includes('danhmuc')) {
            const categories = await db.query('SELECT name FROM categories WHERE is_active = 1 ORDER BY name');
            directAnswer = categories.length ? categories.map((category) => `• ${category.name}`).join('\n') : NO_LLM_RESULT;
        } else if (keyword.includes('đơn hàng') || keyword.includes('donhang')) {
            const params = userRole === 'staff' ? [userId] : [];
            const scope = userRole === 'staff' ? 'WHERE o.user_id = ?' : '';
            const orders = await db.query(
                `SELECT o.id, o.total_amount, o.status, o.created_at
                 FROM orders o ${scope} ORDER BY o.created_at DESC LIMIT 10`,
                params
            );
            directAnswer = orders.length
                ? orders.map((order) => `${formatInvoiceCode(order)} — ${order.status}, ${formatPrice(order.total_amount)}`).join('\n')
                : NO_LLM_RESULT;
        } else {
            const products = await db.query(
                `SELECT name, price, discount_percent, stock_quantity FROM products
                 WHERE is_active = 1 AND (? = '' OR name LIKE ? OR description LIKE ? OR tags LIKE ?)
                 ORDER BY name LIMIT 10`,
                [keyword, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
            );
            directAnswer = products.length
                ? products.map((product) => `• ${product.name}: ${formatPrice(Math.round(product.price * (100 - (product.discount_percent || 0)) / 100))}; tồn ${product.stock_quantity}.`).join('\n')
                : NO_LLM_RESULT;
        }
    } else if (lowerMsg.startsWith('/tư vấn') || lowerMsg.startsWith('/tuvan')) {
        const keyword = message.replace(/^\/t[ưu]\s*v[aấ]n\s*/i, '').trim();
        const priceLogic = parsePriceCondition(keyword);
        const stopWords = new Set(['toi', 'muon', 'can', 'tim', 'mua', 'tu', 'van', 'san', 'pham', 'loai', 'gia', 'duoi', 'tren', 'hon', 'tu', 'den', 'trieu', 'co', 'hang', 'khong', 'cho', 'mot', 'vai']);
        const terms = [...new Set((keyword.match(/[\p{L}\p{N}]{2,}/gu) || []).map((term) => term.toLowerCase()))]
            .filter((term) => !stopWords.has(normalizeIntentTerm(term)) && !/^\d+$/.test(term));
        const keywordClause = terms.length
            ? ` AND (${terms.map(() => '(p.name LIKE ? OR p.tags LIKE ? OR p.description LIKE ? OR c.name LIKE ?)').join(' OR ')})`
            : '';
        const termParams = terms.flatMap((term) => [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        const products = await db.query(
            `SELECT p.name, p.price, p.discount_percent, p.stock_quantity, p.tags,
                    SUBSTR(COALESCE(p.description, ''), 1, 180) AS description, c.name AS category_name
             FROM products p LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = 1 AND p.stock_quantity > 0 AND ${priceLogic.sqlCondition}${keywordClause}
             ORDER BY p.stock_quantity DESC, p.price ASC LIMIT 3`,
            [...priceLogic.params, ...termParams]
        );
        directAnswer = products.length
            ? `Một số lựa chọn đang còn hàng:\n${products.map((product) => `• ${product.name} (${product.category_name || 'Khác'}): ${formatPrice(Math.round(product.price * (100 - (product.discount_percent || 0)) / 100))}; còn ${product.stock_quantity}. ${product.description || ''}`.trim()).join('\n')}`
            : 'Mình chưa tìm thấy sản phẩm còn hàng phù hợp với tiêu chí đó. Bạn có thể nới rộng ngân sách hoặc đổi nhu cầu.';
    } else if (/(bán chậm|bán ít|ít bán|bán kém|hàng tồn lâu)/i.test(message)) {
        if (!['admin', 'owner'].includes(userRole)) {
            return { directAnswer: 'Bạn không có quyền xem báo cáo hàng bán chậm.', preFetchContext: null };
        }
        const monthMatch = lowerMsg.match(/th[aá]ng\s+(\d{1,2})/);
        const yearMatch = lowerMsg.match(/n[aă]m\s+(\d{4})/);
        let monthFilter = `strftime('%Y-%m', o.created_at) = strftime('%Y-%m', 'now', 'localtime')`;
        let periodLabel = 'tháng này';
        if (monthMatch) {
            const month = Number(monthMatch[1]);
            const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
            if (month < 1 || month > 12 || year < 2000 || year > 2200) {
                return { directAnswer: 'Tháng hoặc năm cần xem không hợp lệ.', preFetchContext: null };
            }
            monthFilter = `strftime('%Y-%m', o.created_at) = ?`;
            periodLabel = `${month}/${year}`;
        }
        const salesParams = monthMatch ? [`${yearMatch ? Number(yearMatch[1]) : new Date().getFullYear()}-${String(Number(monthMatch[1])).padStart(2, '0')}`] : [];
        const slowProducts = await db.query(
            `SELECT p.name, p.stock_quantity, COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) AS sold_quantity
             FROM products p
             LEFT JOIN order_items oi ON oi.product_id = p.id
             LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
               AND ${monthFilter}
               AND EXISTS (
                 SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
                   AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
               )
             WHERE p.is_active = 1
             GROUP BY p.id
             ORDER BY sold_quantity ASC, p.stock_quantity DESC, p.name ASC
             LIMIT 5`,
            salesParams
        );
        directAnswer = slowProducts.length
            ? `5 mặt hàng bán ít nhất trong ${periodLabel} (xếp theo số lượng, chỉ tính đơn đã ghi nhận thanh toán):\n${slowProducts.map((product) => `• ${product.name}: bán ${product.sold_quantity}, còn ${product.stock_quantity} trong kho`).join('\n')}`
            : NO_LLM_RESULT;
    } else if (/(doanh thu|báo cáo|bao cao|bán được bao nhiêu|tổng số đơn)/i.test(message)) {
        if (!['admin', 'owner'].includes(userRole)) {
            return { directAnswer: 'Bạn không có quyền xem báo cáo doanh thu.', preFetchContext: null };
        }
        let sql = `SELECT COUNT(o.id) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_revenue
                   FROM orders o WHERE o.status <> 'cancelled' AND EXISTS (
                     SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.source = 'auto' AND t.type = 'income'
                       AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
                   )`;
        const params = [];
        const monthMatch = lowerMsg.match(/th[aá]ng\s+(\d{1,2})/);
        const yearMatch = lowerMsg.match(/n[aă]m\s+(\d{4})/);
        if (monthMatch) {
            const month = Number(monthMatch[1]);
            const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
            if (month < 1 || month > 12 || year < 2000 || year > 2200) {
                return { directAnswer: 'Tháng hoặc năm cần xem không hợp lệ.', preFetchContext: null };
            }
            sql += ` AND strftime('%Y-%m', o.created_at) = ?`;
            params.push(`${year}-${String(month).padStart(2, '0')}`);
        } else if (yearMatch) {
            const year = Number(yearMatch[1]);
            if (year < 2000 || year > 2200) return { directAnswer: 'Năm cần xem không hợp lệ.', preFetchContext: null };
            sql += ` AND strftime('%Y', o.created_at) = ?`;
            params.push(String(year));
        } else if (lowerMsg.includes('hôm nay') || lowerMsg.includes('hom nay')) {
            sql += ` AND date(o.created_at) = date('now', 'localtime')`;
        } else if (lowerMsg.includes('tháng') || lowerMsg.includes('thang')) {
            sql += ` AND strftime('%Y-%m', o.created_at) = strftime('%Y-%m', 'now', 'localtime')`;
        } else if (lowerMsg.includes('năm') || lowerMsg.includes('nam')) {
            sql += ` AND strftime('%Y', o.created_at) = strftime('%Y', 'now', 'localtime')`;
        }
        const stats = await db.get(sql, params);
        directAnswer = `Có ${stats.total_orders || 0} đơn đã ghi nhận thanh toán, tổng giá trị ${formatPrice(stats.total_revenue)}${monthMatch || yearMatch || lowerMsg.includes('hôm nay') || lowerMsg.includes('hom nay') ? ' trong kỳ được hỏi' : ' từ trước đến nay'}.`;
    } else if (/(tồn kho|còn hàng|còn bao nhiêu|còn không)/i.test(message)) {
        const stopWords = new Set(['ton', 'kho', 'con', 'hang', 'bao', 'nhieu', 'khong', 'san', 'pham', 'mat', 'toi', 'muon', 'can', 'cho', 'cua', 'la', 'nao', 'co', 'khong', 'hien', 'tai']);
        const terms = [...new Set((message.match(/[\p{L}\p{N}]{2,}/gu) || []).map((term) => term.toLowerCase()))]
            .filter((term) => !stopWords.has(normalizeIntentTerm(term)) && !/^[\d]+$/.test(term));
        if (!terms.length) return { directAnswer: 'Bạn cho mình tên hoặc mã sản phẩm để kiểm tra tồn kho nhé.', preFetchContext: null };
        const where = terms.map(() => '(name LIKE ? OR sku LIKE ?)').join(' OR ');
        const params = terms.flatMap((term) => [`%${term}%`, `%${term}%`]);
        const products = await db.query(
            `SELECT name, sku, stock_quantity, low_stock_threshold FROM products
             WHERE is_active = 1 AND (${where}) ORDER BY name LIMIT 5`,
            params
        );
        directAnswer = products.length
            ? products.map((product) => `• ${product.name}${product.sku ? ` (${product.sku})` : ''}: ${product.stock_quantity} sản phẩm${product.stock_quantity <= product.low_stock_threshold ? ' — mức tồn thấp' : ''}.`).join('\n')
            : NO_LLM_RESULT;
    } else if (lowerMsg.startsWith('/')) {
        directAnswer = 'Lệnh hỗ trợ: /giá <tên hoặc khoảng giá>, /tồn kho <tên sản phẩm>, /tư vấn <nhu cầu>, /liệt kê <sản phẩm|đơn hàng|danh mục>, /báo cáo <kỳ>, /khách hàng <tên hoặc số điện thoại>.';
    } else {
        const isProductQuestion = /(sản phẩm|mặt hàng|tư vấn|mua|giá|còn hàng|iphone|tai nghe|điện thoại)/i.test(message);
        if (isProductQuestion) {
            const stopWords = new Set(['toi', 'muon', 'can', 'tim', 'mua', 'tu', 'van', 'san', 'pham', 'mat', 'hang', 'loai', 'gia', 'duoi', 'tren', 'hon', 'tu', 'den', 'trieu', 'co', 'khong', 'cho', 'mot', 'vai', 'cua', 'la', 'nao', 'gi', 'dung', 'pin', 'thoi', 'luong']);
            const terms = [...new Set((message.match(/[\p{L}\p{N}]{2,}/gu) || []).map((term) => term.toLowerCase()))]
                .filter((term) => !stopWords.has(normalizeIntentTerm(term)) && !/^\d+$/.test(term)).slice(0, 6);
            const priceLogic = parsePriceCondition(message);
            const keywordClause = terms.length
                ? ` AND (${terms.map(() => '(p.name LIKE ? OR p.tags LIKE ? OR p.description LIKE ? OR c.name LIKE ?)').join(' OR ')})`
                : '';
            const termParams = terms.flatMap((term) => [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
            const products = await db.query(
                `SELECT p.name, p.price, p.discount_percent, p.stock_quantity, p.tags,
                        SUBSTR(COALESCE(p.description, ''), 1, 180) AS description, c.name AS category_name
                 FROM products p LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.is_active = 1 AND p.stock_quantity > 0 AND ${priceLogic.sqlCondition}${keywordClause}
                 ORDER BY p.stock_quantity DESC, p.price ASC LIMIT 5`,
                [...priceLogic.params, ...termParams]
            );
            preFetchContext = products.length
                ? products.map((product) => `- ${product.name}; giá niêm yết ${formatPrice(product.price)}; giảm ${product.discount_percent || 0}%; giá hiện tại ${formatPrice(Math.round(product.price * (100 - (product.discount_percent || 0)) / 100))}; tồn ${product.stock_quantity}; nhóm ${product.category_name || 'Khác'}; mô tả ${product.description || 'chưa có mô tả'}`).join('\n')
                : 'Không tìm thấy sản phẩm còn hàng khớp truy vấn trong CSDL. Không đề xuất sản phẩm khác.';
        }
    }

    return { directAnswer, preFetchContext };
};
