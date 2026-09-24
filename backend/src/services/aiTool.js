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
                SELECT p.id, p.name, p.price, p.description, p.stock_quantity, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE (p.name LIKE ? OR c.name LIKE ? OR p.description LIKE ?)
                  AND p.price >= ? 
                  AND p.price <= ?
                  AND p.is_active = 1
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
            const sql = `SELECT name, stock_quantity, price FROM products WHERE name LIKE ? LIMIT 3`;
            const results = await db.query(sql, [`%${args.ten_san_pham}%`]);
            
            if (results.length === 0) return { message: "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh." };
            return results;
        } catch (error) {
            return { error: "Lỗi hệ thống: Không thể kiểm tra tồn kho." };
        }
    },

    bao_cao_kinh_doanh: async (args, userRole) => {
        try {
            // Kiểm tra phân quyền cứng bên trong hàm (đề phòng AI tự gọi)
            if (userRole === 'staff') {
                return { error: "CẢNH BÁO BẢO MẬT: Bạn là Staff nên hệ thống đã chặn yêu cầu xem báo cáo doanh thu." };
            }
            
            const trang_thai = args?.trang_thai || 'completed';
            const thang = args?.thang ? Number(args.thang) : null;
            const nam = args?.nam ? Number(args.nam) : null;
            
            let sql = `
                SELECT COUNT(id) as tong_don_hang, SUM(total_amount) as tong_doanh_thu 
                FROM orders 
                WHERE status = ?
            `;
            const params = [trang_thai];
            
            if (thang && nam) {
                const thangStr = thang.toString().padStart(2, '0');
                sql += ` AND created_at LIKE ?`;
                params.push(`${nam}-${thangStr}-%`);
            } else if (nam) {
                sql += ` AND created_at LIKE ?`;
                params.push(`${nam}-%`);
            }
            
            const results = await db.query(sql, params);
            return results[0];
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
                description: "Tìm kiếm thông tin sản phẩm (giá, mô tả, tồn kho) dựa trên từ khóa tên và khoảng giá để tư vấn cho khách.",
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
                description: "Tìm danh sách các sản phẩm được nhập thêm/tạo mới vào trong một tháng cụ thể.",
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
                description: "Lấy danh sách các loại mặt hàng shop đang bán để gợi ý nếu khách chưa biết mua gì.",
            },
            {
                name: "kiem_tra_ton_kho",
                description: "Kiểm tra số lượng tồn kho chính xác của một mặt hàng cụ thể.",
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
                description: "Lấy dữ liệu tổng quan về doanh thu, tổng đơn hàng, có thể lọc theo tháng và năm. Chỉ dùng cho admin/owner.",
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
