import { buildToolsForUser } from './botToolService.js';
import { formatMoney } from './botActionService.js';

/**
 * "Đường tắt" cho các lệnh chỉ đọc dữ liệu: gọi thẳng tool (vẫn giữ nguyên phân quyền theo vai trò)
 * rồi định dạng kết quả, KHÔNG đi qua Gemini => phản hồi gần như tức thì.
 * Trả về null nếu lệnh cần AI suy luận (khi đó controller sẽ chuyển cho agent như cũ).
 */

const ORDER_STATUS = {
    pending: '🟡 Chờ xác nhận', processing: '🔵 Đang xử lý', shipped: '🚚 Đang giao',
    delivered: '🟢 Đã giao', cancelled: '🔴 Đã hủy'
};
const RETURN_STATUS = {
    pending: '🟡 Chờ tiếp nhận/duyệt', approved: '🟢 Đã duyệt', rejected: '🔴 Từ chối',
    completed: '✅ Hoàn tất', cancelled: '⚫ Đã hủy'
};
const WARRANTY_STATUS = {
    pending: '🟡 Chờ tiếp nhận', in_review: '🔎 Đang gửi hãng/TTBH', approved: '🟢 Đã duyệt',
    repairing: '🛠️ Đang sửa chữa', repaired: '📦 Đã có kết quả', completed: '✅ Đã hoàn tất',
    rejected: '🔴 Từ chối', cancelled: '⚫ Đã hủy'
};
const RETURN_TYPE = { exchange: 'Đổi hàng', refund: 'Hoàn tiền', store_credit: 'Tích điểm' };
const ROLE_NAME = { admin: 'Quản trị', owner: 'Chủ cửa hàng', staff: 'Nhân viên' };
const ORDER_STATUS_FILTERS = [
    [/^(pending|cho xac nhan|chờ xác nhận)$/i, 'pending'],
    [/^(processing|dang xu ly|đang xử lý)$/i, 'processing'],
    [/^(shipped|dang giao|đang giao)$/i, 'shipped'],
    [/^(delivered|hoan thanh|hoàn thành|da giao|đã giao)$/i, 'delivered'],
    [/^(cancelled|canceled|da huy|đã hủy)$/i, 'cancelled']
];

const dateOf = (value) => (value ? String(value).slice(0, 16).replace('T', ' ') : '—');
const parseJson = (text) => { try { return JSON.parse(text); } catch { return null; } };

const formatOrders = (orders, title) => {
    if (!orders?.length) return `📭 **${title}**\nKhông có đơn hàng nào.`;
    const lines = orders.map((o) => {
        const items = (o.san_pham || []).map((p) => `${p.so_luong}× ${p.ten}`).join(', ');
        const who = o.khach ? ` · 👤 ${o.khach}${o.sdt ? ` (${o.sdt})` : ''}` : '';
        const shipping = o.ma_van_don ? `\n  🚚 ${o.don_vi_van_chuyen || 'Đơn vị vận chuyển'} · mã ${o.ma_van_don}${o.du_kien_giao ? ` · dự kiến ${dateOf(o.du_kien_giao)}` : ''}` : '';
        return `- **#${o.ma_don}** · ${ORDER_STATUS[o.trang_thai] || o.trang_thai}${o.hoa_don ? ` · 🧾 ${o.hoa_don}` : ''} · **${formatMoney(o.tong_tien)}**${who}\n  ${items || '—'} · ${dateOf(o.ngay_tao)}${shipping}`;
    });
    return `🧾 **${title}** (${orders.length})\n${lines.join('\n')}`;
};

const FORMATTERS = {
    xac_nhan_don_khach: (data) => data.tom_tat
        ? `📝 **Xác nhận đơn khách đặt qua Bot**\n${data.tom_tat}\n\nKiểm tra đơn trước khi tiếp tục, sau đó gõ \`/xacnhan\` để xác nhận và gửi hóa đơn cho khách.`
        : 'Không tạo được thao tác xác nhận đơn hàng.',
    tim_san_pham: (data, args) => {
        const rows = data.ket_qua || [];
        if (!rows.length) return `🔍 Không tìm thấy sản phẩm khớp **"${args.tu_khoa}"**. Thử từ khóa khác nhé.`;
        const lines = rows.map((p) => {
            const stock = p.ton_kho > 0 ? `📦 còn ${p.ton_kho}` : '❌ hết hàng';
            const sale = p.giam_gia_phan_tram ? ` ~~${formatMoney(p.gia_niem_yet)}~~ 🔥-${p.giam_gia_phan_tram}%` : '';
            return `- **${p.ten}** — **${formatMoney(p.gia_ban)}**${sale} · ${stock}${p.bao_hanh_thang ? ` · 🛡️ BH ${p.bao_hanh_thang} tháng` : ''}`;
        });
        return `🔍 **Kết quả cho "${args.tu_khoa}"** (${rows.length})\n${lines.join('\n')}\n\n💡 Muốn mua? Gõ \`/dathang <tên sản phẩm> x<số lượng>\``;
    },
    don_cua_toi: (data) => formatOrders(data.don_hang, 'Đơn hàng của bạn'),
    tra_cuu_don_hang: (data) => formatOrders(data.don_hang, 'Đơn hàng'),
    san_pham_sap_het: (data) => {
        const rows = data.san_pham || [];
        if (!rows.length) return '✅ **Tồn kho ổn định** — không có sản phẩm nào dưới ngưỡng cảnh báo.';
        const lines = rows.map((p) => `- ${p.ton_kho <= 0 ? '🔴' : '🟠'} **${p.ten}** — còn **${p.ton_kho}** (ngưỡng ${p.nguong ?? 5})`);
        return `⚠️ **Sản phẩm sắp hết hàng** (${rows.length})\n${lines.join('\n')}`;
    },
    danh_sach_doi_tra: (data) => {
        const rows = data.phieu_doi_tra || [];
        if (!rows.length) return '✅ Không có phiếu đổi trả nào đang chờ duyệt.';
        const lines = rows.map((r) => {
            const items = (r.san_pham || []).map((p) => `${p.so_luong}× ${p.ten}`).join(', ');
            return `- **Phiếu #${r.id}** · đơn #${r.order_id} · ${RETURN_TYPE[r.return_type] || r.return_type} · ${RETURN_STATUS[r.status] || r.status}\n  👤 ${r.customer_name || '—'} · ${items || '—'}${r.reason ? ` · _${r.reason}_` : ''}`;
        });
        return `↩️ **Phiếu đổi trả chờ duyệt** (${rows.length})\n${lines.join('\n')}`;
    },
    doi_tra_bao_hanh_cua_toi: (data) => {
        const returns = (data.doi_tra || []).map((r) => `- **Phiếu RET-${r.ma_phieu}** · đơn #${r.ma_don} · ${RETURN_TYPE[r.loai] || r.loai}\n  Trạng thái: ${RETURN_STATUS[r.trang_thai] || r.trang_thai} · gửi ${dateOf(r.ngay_gui)}`);
        const claims = (data.bao_hanh || []).map((c) => `- **Phiếu WAR-${c.ma_yeu_cau}** · đơn #${c.ma_don || '—'}\n  Trạng thái: ${WARRANTY_STATUS[c.trang_thai] || c.trang_thai} · tiếp nhận ${dateOf(c.ngay_gui)} · hết hạn ${dateOf(c.het_han)}`);
        if (!returns.length && !claims.length) return '📭 Bạn chưa có phiếu đổi trả hay yêu cầu bảo hành nào.';
        return [
            returns.length ? `↩️ **Đổi trả**\n${returns.join('\n')}` : '',
            claims.length ? `🛡️ **Bảo hành**\n${claims.join('\n')}` : ''
        ].filter(Boolean).join('\n\n');
    },
    cham_cong_cua_toi: (data) => {
        const rows = data.cham_cong || [];
        if (!rows.length) return '📭 Chưa có dữ liệu chấm công.';
        const total = rows.reduce((sum, r) => sum + (Number(r.tong_gio) || 0), 0);
        const lines = rows.map((r) => `- 📅 **${r.ngay}** · vào ${r.vao_ca ? String(r.vao_ca).slice(11, 16) || r.vao_ca : '—'} · ra ${r.ra_ca ? String(r.ra_ca).slice(11, 16) || r.ra_ca : '⏳'} · **${Number(r.tong_gio || 0).toFixed(1)}h**`);
        return `⏰ **Chấm công gần đây**\n${lines.join('\n')}\n\nTổng: **${total.toFixed(1)} giờ**`;
    },
    thong_ke_tai_khoan: (data) => {
        const byRole = {};
        (data.nhan_su || []).forEach((r) => {
            byRole[r.vai_tro] = byRole[r.vai_tro] || { on: 0, off: 0 };
            byRole[r.vai_tro][r.dang_hoat_dong ? 'on' : 'off'] += r.so_luong;
        });
        const lines = Object.entries(byRole).map(([role, c]) => `- **${ROLE_NAME[role] || role}**: 🟢 ${c.on} hoạt động · 🔒 ${c.off} bị khóa`);
        return `👥 **Thống kê tài khoản**\n${lines.join('\n')}\n- **Khách hàng (Bot)**: ${data.tai_khoan_khach?.so_luong || 0}`;
    },
    nhat_ky_hoat_dong: (data) => {
        const rows = data.nhat_ky || [];
        if (!rows.length) return '📭 Chưa có nhật ký hoạt động.';
        const lines = rows.map((l) => `- \`${dateOf(l.thoi_gian)}\` **${l.nguoi_dung}** · ${l.loai} — ${l.mo_ta}`);
        return `📜 **Nhật ký hoạt động gần nhất**\n${lines.join('\n')}`;
    }
};

/** Ánh xạ lệnh -> { tool, args }. Trả về null nếu không xử lý nhanh được. */
const planFor = (name, args, user) => {
    switch (name) {
        case 'products': return args ? { tool: 'tim_san_pham', input: { tu_khoa: args } } : null;
        case 'confirmorder': {
            const match = /^#?(\d+)$/.exec(args.trim());
            return match ? { tool: 'xac_nhan_don_khach', input: { ma_don: Number(match[1]) } } : null;
        }
        case 'orders':
            if (user.role === 'customer') return { tool: 'don_cua_toi', input: {} };
            if (!args) return { tool: 'tra_cuu_don_hang', input: {} };
            for (const [pattern, status] of ORDER_STATUS_FILTERS) {
                if (pattern.test(args.trim())) return { tool: 'tra_cuu_don_hang', input: { trang_thai: status } };
            }
            if (/^#?\d+$/.test(args)) return { tool: 'tra_cuu_don_hang', input: { ma_don: Number(args.replace('#', '')) } };
            return { tool: 'tra_cuu_don_hang', input: { tu_khoa: args } };
        case 'lowstock': return { tool: 'san_pham_sap_het', input: {} };
        case 'returns': return { tool: 'danh_sach_doi_tra', input: {} };
        case 'myreturns': return { tool: 'doi_tra_bao_hanh_cua_toi', input: {} };
        case 'attendance': return { tool: 'cham_cong_cua_toi', input: {} };
        case 'accounts': return { tool: 'thong_ke_tai_khoan', input: {} };
        case 'audit': return { tool: 'nhat_ky_hoat_dong', input: { so_dong: 10 } };
        default: return null;
    }
};

export const runQuickCommand = async ({ name, args, user }) => {
    if (!user) return null;
    const plan = planFor(name, args, user);
    if (!plan) return null;
    const tool = buildToolsForUser(user).find((item) => item.name === plan.tool);
    if (!tool) return null;
    const data = parseJson(await tool.invoke(plan.input));
    if (!data) return null;
    if (data.loi) return `⚠️ ${data.loi}`;
    return FORMATTERS[plan.tool](data, plan.input);
};

const normalizeText = (value) => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

/** Dự phòng cho các tra cứu khách hàng khi nhà cung cấp LLM trả lỗi/503. */
export const runCustomerFallback = async ({ message, user }) => {
    if (!['guest', 'customer'].includes(user?.role)) return null;
    const text = normalizeText(message);
    let toolName;
    let input;
    if (/huong dan|cach dung|su dung chatbot|su dung bot|bot lam duoc gi|chuc nang/.test(text)) {
        return [
            '👋 Mình là trợ lý dành cho khách hàng. Bạn có thể nhắn tự nhiên hoặc dùng lệnh:',
            '- Tư vấn sản phẩm: cho mình biết món cần tìm, nhu cầu sử dụng và ngân sách.',
            '- Tra cứu chính sách: `/chinhsach đổi trả` hoặc hỏi về bảo hành, giao hàng.',
            user.role === 'customer'
                ? '- Đơn hàng và lịch sử mua: `/donhang`; đổi trả/bảo hành: `/doitra`.'
                : '- Đăng nhập bằng `/dangnhap` để xem lịch sử mua hàng và theo dõi đơn của bạn.',
            '- Khi muốn đặt hàng, mình sẽ chuẩn bị thông tin; nhân viên cửa hàng xác nhận đơn trên hệ thống.'
        ].join('\n');
    }
    if (/doi tra|bao hanh|chinh sach|thanh toan|tra gop|giao hang/.test(text)) {
        toolName = 'tra_cuu_tri_thuc';
        input = { cau_hoi: message };
    } else if (/don hang|don cua toi|lich su mua|lich su don|theo doi don/.test(text) && user.role === 'customer') {
        toolName = 'don_cua_toi';
        input = {};
    } else if (/bao hanh cua toi|phieu doi tra|tinh trang doi tra/.test(text) && user.role === 'customer') {
        toolName = 'doi_tra_bao_hanh_cua_toi';
        input = {};
    } else if (/san pham|tu van|tim|gia|con hang|dien thoai|tai nghe|laptop|iphone|samsung/.test(text)) {
        toolName = 'tim_san_pham';
        input = { tu_khoa: message };
    } else if (/mua|can tim|tu van|goi y|chon gi|nen mua|phu hop|ngan sach|tai nghe|dien thoai|laptop|iphone|samsung|san pham/.test(text)) {
        return 'Mình sẽ giúp bạn chọn sản phẩm phù hợp. Bạn cho mình biết danh mục muốn tìm, nhu cầu sử dụng và khoảng ngân sách nhé. Khi Gemini hoạt động lại, mình có thể tư vấn tự nhiên đầy đủ hơn.';
    } else {
        return 'Mình đang tạm mất kết nối với AI tư vấn. Bạn vẫn có thể hỏi về sản phẩm, chính sách đổi trả/bảo hành, hoặc dùng `/trogiup` để xem các chức năng khách hàng.';
    }
    const tool = buildToolsForUser(user).find((item) => item.name === toolName);
    if (!tool) return null;
    const data = parseJson(await tool.invoke(input));
    if (!data || data.loi) return data?.loi ? `⚠️ ${data.loi}` : null;
    if (toolName === 'tim_san_pham') return FORMATTERS.tim_san_pham(data, input);
    if (toolName === 'don_cua_toi') return FORMATTERS.don_cua_toi(data);
    if (toolName === 'doi_tra_bao_hanh_cua_toi') return FORMATTERS.doi_tra_bao_hanh_cua_toi(data);
    const docs = data.tai_lieu || [];
    return docs.length
        ? `📚 **Thông tin chính sách**\n${docs.map((doc) => `- **${doc.title || 'Tài liệu'}**\n${doc.content}`).join('\n\n')}`
        : 'Chưa tìm thấy thông tin phù hợp trong tài liệu cửa hàng. Hãy thử hỏi nhân viên hỗ trợ.';
};
