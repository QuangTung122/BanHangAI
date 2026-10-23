const ALL = ['guest', 'customer'];
const AUTHED = ['customer'];
const STAFF_UP = ['staff', 'owner', 'admin'];
const MANAGER = ['owner', 'admin'];

const needArgs = (args, usage) => (args ? null : `Thiếu nội dung. Cách dùng: ${usage}`);

const VI_COMMAND_NAMES = {
    start: 'batdau', help: 'trogiup', features: 'tinhnang', login: 'dangnhap', register: 'dangky',
    logout: 'dangxuat', me: 'hoso', clear: 'xoachat', thoat: 'thoat', products: 'sanpham',
    policy: 'chinhsach', buy: 'dathang', orders: 'donhang', cancelorder: 'huydon', myreturns: 'doitra',
    pay: 'ghinhanthanhtoan', lowstock: 'saphet', returns: 'phieudoitra', return: 'taodoitra',
    approve: 'duyetdoitra', reject: 'tuchoidotra', report: 'baocao', attendance: 'chamcong',
    accounts: 'thongketaikhoan', account: 'quanlytaikhoan', password: 'caplaimatkhau', close: 'khoa',
    open: 'mokhoa', audit: 'nhatky', audio: 'phatnhac', confirm: 'xacnhan', cancel: 'huy',
    ship: 'giaovan', failedelivery: 'hoanhang', broadcast: 'thongbao'
};

const localName = (name) => VI_COMMAND_NAMES[name] || name;

/**
 * Danh sách lệnh dùng chung cho server & giao diện (nguồn sự thật duy nhất).
 * - client: true  => giao diện tự xử lý (form đăng nhập, xóa màn hình...)
 * - prompt(args)  => chuyển lệnh thành yêu cầu cho agent LangChain
 */
export const COMMANDS = [
    { name: 'start', desc: 'Khởi động bot và xem chức năng dành cho bạn', roles: ALL },
    { name: 'help', desc: 'Danh sách lệnh bạn có thể dùng', roles: ALL },
    { name: 'features', desc: 'Mô tả các chức năng của hệ thống bán hàng', roles: ALL },
    { name: 'login', args: '<tên_đăng_nhập> <mật_khẩu>', desc: 'Đăng nhập', roles: ['guest'], client: true },
    { name: 'register', args: '<tên_đăng_nhập> <email> <mật_khẩu>', desc: 'Tạo tài khoản khách hàng', roles: ['guest'], client: true },
    { name: 'logout', desc: 'Đăng xuất', roles: AUTHED, client: true },
    { name: 'me', desc: 'Xem thông tin tài khoản đang đăng nhập', roles: AUTHED },
    { name: 'clear', desc: 'Xóa cuộc trò chuyện trên màn hình', roles: ALL, client: true },
    { name: 'thoat', desc: 'Kết thúc phiên trò chuyện với nhân viên', roles: ALL, client: true },
    {
        name: 'products', args: '<từ khóa>', desc: 'Tìm sản phẩm, giá và tồn kho', roles: ['guest', 'customer', 'staff', 'owner', 'admin'],
        prompt: (args) => (args ? `Tìm sản phẩm: ${args}` : null), usage: '/sanpham tai nghe', listed: false
    },
    {
        name: 'policy', args: '<chủ đề>', desc: 'Tra cứu chính sách (đổi trả, bảo hành, trả góp...)', roles: ['guest', 'customer', 'staff', 'owner', 'admin'],
        prompt: (args) => (args ? `Tra cứu chính sách/hướng dẫn: ${args}` : 'Tóm tắt các chính sách đổi trả, bảo hành, thanh toán'), usage: '/chinhsach đổi trả', listed: false
    },
    {
        name: 'buy', args: '<sản phẩm> [số lượng]', desc: 'Đặt hàng / lập hóa đơn (cần /xacnhan)', roles: ['customer', 'staff', 'owner'],
        prompt: (args) => (args ? `Tôi muốn đặt: ${args}. Hãy tìm sản phẩm phù hợp và chuẩn bị đơn.` : null), usage: '/dathang iPhone 15 x1', listed: false
    },
    {
        name: 'orders', args: '[mã đơn | tên/SĐT khách]', desc: 'Xem đơn hàng (của bạn hoặc của cửa hàng)', roles: ['customer', 'staff', 'owner'],
        prompt: (args, user) => {
            if (user.role === 'customer') return 'Liệt kê các đơn hàng gần đây của tôi kèm trạng thái.';
            return args ? `Tra cứu đơn hàng: ${args}` : 'Liệt kê các đơn hàng gần đây của cửa hàng.';
        }, listed: false
    },
    {
        name: 'cancelorder', args: '<mã đơn>', desc: 'Hủy đơn đang chờ xác nhận của bạn (cần /xacnhan)', roles: ['customer'],
        prompt: (args) => (args ? `Hủy đơn #${args} của tôi` : null), usage: '/huydon 12', listed: false
    },
    {
        name: 'myreturns', desc: 'Xem tình trạng đổi trả & bảo hành của bạn', roles: ['customer'],
        prompt: () => 'Cho tôi xem tình trạng các phiếu đổi trả và bảo hành của tôi.', listed: false
    },
    {
        name: 'pay', args: '<mã đơn>', desc: 'Xác nhận đã thanh toán cho đơn chờ (cần /xacnhan)', roles: ['staff', 'owner'],
        prompt: (args) => (args ? `Xác nhận thanh toán cho đơn #${args}` : null), usage: '/ghinhanthanhtoan 12', listed: false
    },
    {
        name: 'ship', args: '<mã đơn> <đơn vị vận chuyển> <mã vận đơn>', desc: 'Bàn giao đơn hàng cho đơn vị vận chuyển (cần /xacnhan)', roles: ['staff', 'owner'],
        prompt: (args) => (args ? `Chuẩn bị bàn giao đơn hàng ${args} cho đơn vị vận chuyển. Hãy hỏi thêm thông tin còn thiếu.` : null), usage: '/giaovan 12 GHN GHN123456', listed: false
    },
    {
        name: 'failedelivery', args: '<mã đơn> <lý do>', desc: 'Hoàn kho sau khi đơn giao thất bại và hàng đã về cửa hàng (cần /xacnhan)', roles: ['staff', 'owner'],
        prompt: (args) => (args ? `Chuẩn bị hoàn hàng và nhập lại kho cho đơn ${args}.` : null), usage: '/hoanhang 12 khách không nhận', listed: false
    },
    {
        name: 'lowstock', desc: 'Sản phẩm sắp hết hàng', roles: ['staff', 'owner', 'admin'],
        prompt: () => 'Liệt kê sản phẩm sắp hết hàng và gợi ý nhập thêm.', listed: false
    },
    {
        name: 'returns', desc: 'Phiếu đổi trả đang chờ duyệt', roles: ['staff', 'owner', 'admin'],
        prompt: () => 'Liệt kê các phiếu đổi trả đang chờ duyệt.', listed: false
    },
    {
        name: 'return', args: '<mã đơn> <lý do>', desc: 'Tạo phiếu đổi trả (cần /xacnhan)', roles: ['staff', 'owner'],
        prompt: (args) => (args ? `Tạo phiếu đổi trả cho đơn: ${args}` : null), usage: '/taodoitra 12 máy bị lỗi', listed: false
    },
    {
        name: 'approve', args: '<mã phiếu>', desc: 'Duyệt phiếu đổi trả (cần /xacnhan)', roles: ['owner', 'admin'],
        prompt: (args) => (args ? `Duyệt phiếu đổi trả #${args}` : null), usage: '/duyetdoitra 5', listed: false
    },
    {
        name: 'reject', args: '<mã phiếu> [lý do]', desc: 'Từ chối phiếu đổi trả (cần /xacnhan)', roles: ['owner', 'admin'],
        prompt: (args) => (args ? `Từ chối phiếu đổi trả: ${args}` : null), usage: '/tuchoidotra 5 sai điều kiện', listed: false
    },
    {
        name: 'report', args: '[khoảng thời gian]', desc: 'Báo cáo & phân tích kinh doanh', roles: ['owner', 'admin'],
        prompt: (args) => `Báo cáo kinh doanh ${args || 'tháng này'}, nhận xét và đề xuất hành động.`
    },
    {
        name: 'attendance', desc: 'Xem chấm công gần đây của bạn', roles: ['staff', 'owner'],
        prompt: () => 'Cho tôi xem lịch sử chấm công gần đây.'
    },
    {
        name: 'accounts', desc: 'Thống kê tài khoản hệ thống', roles: ['admin'],
        prompt: () => 'Thống kê tài khoản theo vai trò và trạng thái.'
    },
    { name: 'broadcast', args: '<nội dung>', desc: 'Thông báo đến tất cả tài khoản hệ thống', roles: ['admin'] },
    {
        name: 'account', args: '<tên_tài_khoản>', desc: 'Mở form quản lý tài khoản', roles: ['admin'], client: true
    },
    {
        name: 'password', args: '<tên_tài_khoản>', desc: 'Cấp lại mật khẩu mặc định', roles: ['admin'],
        prompt: (args) => (args ? `Cấp lại mật khẩu mặc định cho tài khoản: ${args}` : null), listed: false
    },
    {
        name: 'close', args: '<tên_tài_khoản>', desc: 'Khóa tài khoản', roles: ['admin'],
        prompt: (args) => (args ? `Khóa tài khoản: ${args}` : null), listed: false
    },
    {
        name: 'open', args: '<tên_tài_khoản>', desc: 'Mở khóa tài khoản', roles: ['admin'],
        prompt: (args) => (args ? `Mở khóa tài khoản: ${args}` : null), listed: false
    },
    {
        name: 'audit', desc: 'Nhật ký hoạt động gần nhất', roles: ['admin'],
        prompt: () => 'Cho tôi xem nhật ký hoạt động gần nhất và gợi ý những nội dung quan trọng mà admin nên xem xét.'
    },
    {
        name: 'audio', args: '<link_mp3>', desc: 'Phát nhạc hệ thống bot', roles: ['admin'], client: true
    },
    { name: 'confirm', desc: 'Xác nhận thao tác đang chờ', roles: AUTHED },
    { name: 'cancel', desc: 'Hủy thao tác đang chờ', roles: AUTHED }
];

const ROLE_INTRO = {
    guest: 'Bạn có thể trò chuyện với bot mà không cần tạo tài khoản. Đăng nhập bằng /dangnhap nếu bạn có tài khoản.',
    customer: 'Mình có thể tư vấn sản phẩm, tra cứu chính sách, giúp bạn theo dõi đơn và xem lịch sử mua hàng.',
    staff: 'Mình có thể hỗ trợ các chức năng tài khoản và chấm công được cấp quyền.',
    owner: 'Mình có thể hỗ trợ xem báo cáo kinh doanh.',
    admin: 'Mình giúp bạn xem thống kê tài khoản, nhật ký hoạt động, báo cáo kinh doanh và gửi thông báo toàn hệ thống bằng /thongbao: <nội dung>.'
};

const ROLE_EXAMPLES = {
    guest: ['"Hướng dẫn mình sử dụng bot"'],
    customer: ['"Tư vấn tai nghe dưới 2 triệu"', '"Chính sách bảo hành thế nào?"', '"Cho tôi xem đơn hàng gần đây"'],
    staff: ['"Cho tôi xem lịch sử chấm công"'],
    owner: ['"Doanh thu tháng này thế nào?"'],
    admin: ['"Có bao nhiêu tài khoản đang hoạt động?"', '"Nhật ký hoạt động gần đây có gì lạ không?"', '"Báo cáo kinh doanh tuần này"']
};

/** Nhóm lệnh để hiển thị gọn (mỗi nhóm một dòng, có màu riêng trên giao diện). */
export const COMMAND_GROUPS = [
    { key: 'basic', icon: '🧭', label: 'Cơ bản', commands: ['start', 'help', 'features', 'me', 'clear'] },
    { key: 'account', icon: '🔐', label: 'Tài khoản', commands: ['login', 'register', 'logout'] },
    { key: 'manage', icon: '📊', label: 'Quản lý', commands: ['report', 'attendance', 'accounts', 'account', 'password', 'close', 'open', 'audit', 'audio', 'broadcast'] },
    { key: 'action', icon: '✅', label: 'Thao tác', commands: ['confirm', 'cancel', 'thoat'] }
];

const groupOf = (name) => COMMAND_GROUPS.find((group) => group.commands.includes(name))?.key || 'basic';

export const getCommandsForRole = (role) => ['guest', 'customer'].includes(role)
    ? COMMANDS.filter((command) => command.roles.includes(role))
    : [];

const commandByAlias = new Map(COMMANDS.flatMap((command) => [
    [command.name, command.name],
    [localName(command.name), command.name]
]));

const listedCommandsForRole = (role) => getCommandsForRole(role).filter((command) => command.listed !== false);

export const publicCommandList = (role) => listedCommandsForRole(role).map(({ name, args, desc, client }) => ({
    name: localName(name), canonicalName: name, aliases: [name, localName(name)], args: args || '',
    desc: desc.replaceAll('/confirm', '/xacnhan').replaceAll('/cancel', '/huy'),
    client: Boolean(client), group: groupOf(name)
}));

const helpText = (role) => {
    const allowed = new Set(listedCommandsForRole(role).map((command) => command.name));
    const lines = COMMAND_GROUPS
        .map((group) => ({ ...group, items: group.commands.filter((name) => allowed.has(name)) }))
        .filter((group) => group.items.length)
        .map((group) => `${group.icon} **${group.label}** ${group.items.map((name) => `\`/${localName(name)}\``).join(' ')}`);
    return `📋 **Lệnh dành cho bạn**\n${lines.join('\n')}\n\n💡 Bấm vào lệnh để dùng, gõ \`/\` để xem gợi ý. Lệnh dùng không dấu; lệnh tiếng Anh cũ vẫn được hỗ trợ.`;
};

const ROLE_FEATURES = {
    guest: `🤖 **Bot dành cho khách vãng lai**
- 🔎 Tìm hiểu sản phẩm và tra cứu chính sách đổi trả, bảo hành.
- 🔐 Đăng nhập \`/dangnhap\` hoặc đăng ký \`/dangky\` để theo dõi đơn và xem lịch sử mua hàng.`,
    customer: `🤖 **Trợ lý dành cho khách hàng**
- 🔎 Tìm và tư vấn sản phẩm theo nhu cầu, ngân sách.
- 📦 Theo dõi đơn hàng, xem lịch sử mua hàng sau khi đăng nhập.
- 🛡️ Tra cứu chính sách đổi trả, bảo hành và gửi yêu cầu hỗ trợ.
- 🧾 Chuẩn bị thông tin đặt hàng; nhân viên cửa hàng xác nhận đơn.
- ⭐ Gửi đánh giá cho đơn đã giao thành công.`,
staff: `🤖 **Bot dành cho nhân viên**
- 🕒 Xem chấm công và sử dụng các chức năng tài khoản được cấp quyền.`,
owner: `🤖 **Bot dành cho chủ cửa hàng**
- 📊 Xem báo cáo kinh doanh.`,
    admin: `🤖 **Bot dành cho quản trị viên**
- 👥 Thống kê tài khoản, xem nhật ký và quản lý tài khoản.
- 📊 Xem báo cáo kinh doanh, cập nhật cấu hình AI.
- 📢 Gửi thông báo đến toàn hệ thống bằng \`/thongbao: <nội dung>\`.`
};

const featuresText = (role) => `${ROLE_FEATURES[role] || ROLE_FEATURES.guest}

💡 Gõ \`/trogiup\` để xem lệnh phù hợp với vai trò. Bot chỉ hiển thị dữ liệu bạn được phép xem; thao tác thay đổi dữ liệu cần xác nhận.`;

export const startText = (user) => {
    const role = user?.role || 'guest';
    const name = user ? (user.full_name || user.username) : 'bạn';
    const examples = ROLE_EXAMPLES[role] || [];
    return `👋 **Xin chào ${name}!**\n${ROLE_INTRO[role]}${
        examples.length ? `\n\n💬 **Thử hỏi:** ${examples.join(' · ')}` : ''
    }\n\n${helpText(role)}`;
};

/** Phân tích "/lenh tham so" thành { name, args }. */
export const parseCommand = (message) => {
    const match = /^\/([a-zA-Z]+)(?:@\w+)?(?::)?(?:\s+([\s\S]*))?$/.exec(message.trim());
    return match ? { name: match[1].toLowerCase(), args: (match[2] || '').trim() } : null;
};

/**
 * Xử lý lệnh phía server.
 * @returns {{type: 'text', text: string} | {type: 'prompt', prompt: string} | {type: 'confirm'} | {type: 'cancel'}}
 */
export const resolveCommand = ({ name, args, user }) => {
    const role = user?.role || 'guest';
    if (!['guest', 'customer'].includes(role)) {
        return { type: 'text', text: 'Trợ lý Bot chỉ phục vụ khách hàng. Vui lòng dùng hệ thống nội bộ.' };
    }
    const canonicalName = commandByAlias.get(name) || name;
    const command = COMMANDS.find((item) => item.name === canonicalName);
    if (!command) return { type: 'text', text: `Lệnh /${name} không tồn tại. Gõ /trogiup để xem danh sách lệnh.` };
    if (!command.roles.includes(role)) {
        const hint = role === 'guest' ? ' Nếu đây là tài khoản của bạn, hãy đăng nhập bằng /dangnhap để dùng chức năng dành cho khách hàng.' : '';
        return { type: 'text', text: `Bạn không có quyền dùng lệnh /${localName(command.name)}.${hint}` };
    }
    if (command.client) return { type: 'text', text: `Lệnh /${localName(command.name)} được xử lý trên giao diện bot.` };

    switch (command.name) {
        case 'start': return { type: 'text', text: startText(user) };
        case 'help': return { type: 'text', text: helpText(role) };
        case 'features': return { type: 'text', text: featuresText(role) };
        case 'broadcast': {
            const content = args.trim();
            if (!content) return { type: 'text', text: 'Cách dùng: /thongbao: <nội dung>' };
            if (content.length > 2000) return { type: 'text', text: 'Nội dung thông báo tối đa 2.000 ký tự.' };
            return { type: 'broadcast', message: content };
        }
        case 'me':
            return {
                type: 'text',
                text: `🪪 **Tài khoản của bạn**\n- 👤 ${user.full_name || '(chưa cập nhật)'} · \`${user.username}\`\n- 🏷️ Vai trò: **${role}**`
            };
        case 'confirm': return { type: 'confirm' };
        case 'cancel': return { type: 'cancel' };
        default: {
            const prompt = command.prompt ? command.prompt(args, user) : null;
            const usage = (command.usage || `/${localName(command.name)}`).replace(/^\/[a-z]+/i, `/${localName(command.name)}`);
            if (!prompt) return { type: 'text', text: needArgs(args, usage) };
            return { type: 'prompt', prompt, commandName: command.name };
        }
    }
};
