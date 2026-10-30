import ChatModule from '../views/layouts/ChatModule.js';
import ChatService from '../services/ChatService.js';

const mojibakeMarkers = /(?:Ã.|Â.|Ä.|Æ.|á[º»]|â€)/;
const windows1252Bytes = new Map(Array.from(
    '\u20ac\u0081\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u008d\u017d\u008f\u0090\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u009d\u017e\u0178',
    (character, index) => [character, index + 0x80]
));
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

export const repairMojibake = (value) => {
    let text = String(value || '');
    for (let pass = 0; pass < 2 && mojibakeMarkers.test(text); pass += 1) {
        let repaired = '';
        let changed = false;
        const characters = Array.from(text);
        for (let index = 0; index < characters.length;) {
            const codePoint = characters[index].codePointAt(0);
            const byte = codePoint <= 0xff
                ? codePoint
                : windows1252Bytes.get(characters[index]);
            if (byte === undefined) {
                repaired += characters[index];
                index += 1;
                continue;
            }

            const start = index;
            const bytes = [];
            while (index < characters.length) {
                const character = characters[index];
                const point = character.codePointAt(0);
                const nextByte = point <= 0xff ? point : windows1252Bytes.get(character);
                if (nextByte === undefined) break;
                bytes.push(nextByte);
                index += 1;
            }

            const segment = characters.slice(start, index).join('');
            if (mojibakeMarkers.test(segment)) {
                try {
                    const decoded = utf8Decoder.decode(new Uint8Array(bytes));
                    if (decoded !== segment) {
                        repaired += decoded;
                        changed = true;
                        continue;
                    }
                } catch {
                    // Keep text unchanged when it is not a valid mis-decoded UTF-8 sequence.
                }
            }
            repaired += segment;
        }
        if (!changed) break;
        text = repaired;
    }
    return text;
};

export default class ChatController {
    constructor(parentElement = null) {
        this.view = new ChatModule(parentElement);
        this.history = [];
        this.supportTicket = null;
        this.supportLastMessageId = 0;
        this.supportPollingInterval = null;
        this.customerUpdatesInterval = null;
        this.loadingCustomerUpdates = false;
        this.registrationRequiresOtp = true;
        this.init();
    }

    init() {
        if (this.view.bindToggleChat) {
            this.view.bindToggleChat();
        }
        this.view.bindSendMessage(this.handleSendMessage.bind(this));
        
        this.handleWindowBotMessage = (e) => this.handleSendMessage(e.detail);
        window.addEventListener('send-bot-msg', this.handleWindowBotMessage);
        this.handleRegisterOtpRequest = (e) => this.requestRegistrationOtp(e.detail);
        this.handleRegisterVerify = (e) => this.verifyRegistration(e.detail);
        window.addEventListener('bot-register-request-otp', this.handleRegisterOtpRequest);
        window.addEventListener('bot-register-verify', this.handleRegisterVerify);
        this.restoreSupportSession();
        
        // Command Suggestions
        this.availableCommands = [];
        this.view.bindInputEvents(this.handleInput.bind(this));
        this.view.bindCommandChips((name, meta) => {
            const commandName = meta?.name || name;
            if (meta?.args) this.view.setInput(`/${commandName} `);
            else this.handleSendMessage(`/${commandName}`);
        });
        
        // Load profile
        this.loadProfile();
    }

    async loadProfile() {
        let user = null;
        try {
            const token = localStorage.getItem('bot_token');
            let res;
            if (token) {
                try {
                    res = await ChatService.botProfile();
                } catch (e) {
                    // Token hết hạn / tài khoản bị khóa => coi như đã đăng xuất
                    localStorage.removeItem('bot_token');
                    res = await fetch('/api/bot/profile').then(r => r.json());
                }
            } else {
                // Fetch guest commands
                res = await fetch('/api/bot/profile').then(r => r.json());
            }
            user = res.data?.user || null;
            this.registrationRequiresOtp = res.data?.registrationRequiresOtp !== false;
            this.availableCommands = res.data?.commands || [];
            this.view.setCommandMeta(this.availableCommands);
        } catch (e) {
            console.error('Lỗi tải danh sách lệnh:', e);
        }
        this.currentUser = user;
        this.startCustomerUpdates(user);
        this.view.setSession(user, {
            onLogin: (command) => this.view.setInput(command),
            onLogout: (command) => this.handleSendMessage(command),
            onHandoff: () => this.requestHumanHelp(),
            onQuickAction: (command, needsInput) => this.handleQuickAction(command, needsInput)
        });
    }

    startCustomerUpdates(user) {
        if (this.customerUpdatesInterval) clearInterval(this.customerUpdatesInterval);
        this.customerUpdatesInterval = null;
        if (user?.role !== 'customer') return;
        const refresh = async () => {
            if (this.loadingCustomerUpdates) return;
            this.loadingCustomerUpdates = true;
            try {
                const response = await ChatService.getCustomerUpdates();
                for (const update of response.data || []) {
                    const content = update.message || update.title;
                    const bubble = this.view.appendAIBubble();
                    this.view.updateBubbleText(bubble, content);
                    if (update.invoice_image_url) {
                        this.view.appendImageToBubble(bubble, update.invoice_image_url, `Hóa đơn cho đơn hàng #${update.order_id}`);
                    }
                    this.history.push({ role: 'assistant', content });
                }
            } catch (error) {
                if (error.message && !/đăng nhập|phiên/i.test(error.message)) console.warn('Bot customer update:', error.message);
            } finally {
                this.loadingCustomerUpdates = false;
            }
        };
        void refresh();
        this.customerUpdatesInterval = setInterval(refresh, 10000);
    }

    handleQuickAction(message, needsInput = false) {
        if (needsInput) {
            this.view.setInput(message);
            this.handleInput(message);
        } else if (message) {
            this.handleSendMessage(message);
        }
    }

    contextualSuggestions(latestMessage, reply) {
        const role = this.currentUser?.role || 'guest';
        const recentMessages = this.history.slice(-8, -2).map((entry) => entry.content).join(' ');
        const turnContext = `${latestMessage} ${reply}`.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
        const recentContext = recentMessages.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
        if (/[?？]\s*$/.test(reply.trim())) return [];

        const hasCurrentIntent = /doanh thu|doanh so|loi nhuan|bao cao|ban chay|ket qua kinh doanh|tang truong|ton kho|sap het|nhap hang|con hang|het hang|san pham|mat hang|hang hoa|don hang|don cua toi|don cua minh|dat hang|hoa don|thanh toan|giao hang|doi tra|bao hanh|phieu doi|phieu bao hanh|cham cong|ca lam|gio lam|tai khoan|nguoi dung|nhat ky|hoat dong|cau hinh|model|gemini|ollama|chinh sach|tra gop|doi hang|tim|tu van|so sanh|mau nao|tai nghe|dien thoai|iphone|samsung|laptop/.test(turnContext);
        const context = hasCurrentIntent ? turnContext : `${recentContext} ${turnContext}`;
        const has = (pattern) => pattern.test(context);
        const command = (canonicalName, label, args = '') => {
            const metadata = this.availableCommands.find((item) => item.canonicalName === canonicalName);
            return metadata ? { label, command: `/${metadata.name}${args}` } : null;
        };
        const suggestions = [];
        const add = (suggestion) => { if (suggestion && suggestions.length < 3) suggestions.push(suggestion); };
        const periodPattern = /hôm nay|hôm qua|tuần này|tuần trước|tháng này|tháng trước|tháng\s+\d{1,2}(?:\/\d{4})?|quý này|quý trước|quý\s+[1-4]|năm nay|năm\s+\d{4}/i;
        const period = latestMessage.match(periodPattern)?.[0] || recentMessages.match(periodPattern)?.[0] || 'tháng này';
        const salesIntent = has(/doanh thu|loi nhuan|bao cao|ban chay|ket qua kinh doanh|tang truong/);
        const stockIntent = has(/ton kho|sap het|nhap hang|con hang|het hang|ton hang/);
        const orderIntent = has(/don hang|dat hang|hoa don|thanh toan|giao hang/);
        const returnIntent = has(/doi tra|bao hanh|phieu doi|phieu bao hanh/);
        const attendanceIntent = has(/cham cong|ca lam|gio lam/);
        const adminIntent = has(/tai khoan|nguoi dung|nhat ky|hoat dong|cau hinh|model|gemini|ollama/);
        const productIntent = has(/tim|tu van|so sanh|mau nao|san pham|tai nghe|dien thoai|iphone|samsung|laptop/);
        const policyIntent = has(/chinh sach|bao hanh|doi tra|tra gop|thanh toan|doi hang/);

        if (role === 'owner' && salesIntent) {
            add({ label: 'So sánh với kỳ trước', message: `So sánh doanh thu ${period} với kỳ liền trước và nêu mức chênh lệch.` });
            add({ label: 'Xem mặt hàng bán chạy', message: `Trong ${period}, mặt hàng nào bán chạy nhất?` });
            add(command('lowstock', 'Kiểm tra hàng sắp hết'));
        } else if (role === 'owner' && stockIntent) {
            add(command('lowstock', 'Xem hàng sắp hết'));
            add({ label: 'Đề xuất nhập hàng', message: 'Dựa trên tồn kho và tốc độ bán, đề xuất mặt hàng cần nhập trước.' });
            add(command('report', 'Xem báo cáo kinh doanh', ` ${period}`));
        } else if (role === 'owner' && returnIntent) {
            add(command('returns', 'Xem phiếu đang chờ'));
            add({ label: 'Hướng dẫn xử lý phiếu', message: 'Hãy hướng dẫn tôi các bước xử lý phiếu đổi trả đang chờ.' });
        } else if (role === 'owner' && orderIntent) {
            add(command('orders', 'Tra cứu đơn hàng', ' '));
            add(command('pay', 'Ghi nhận thanh toán', ' '));
            add(command('report', 'Xem báo cáo liên quan', ` ${period}`));
        } else if (role === 'owner' && productIntent) {
            add(command('products', 'Tra cứu sản phẩm', ' '));
            add(command('lowstock', 'Kiểm tra hàng sắp hết'));
            add({ label: 'Xem hiệu quả bán', message: `Đánh giá tình hình bán mặt hàng này trong ${period}.` });
        } else if (role === 'staff' && stockIntent) {
            add(command('products', 'Tra cứu sản phẩm', ' '));
            add(command('lowstock', 'Xem hàng sắp hết'));
            add(command('orders', 'Tra cứu đơn hàng', ' '));
        } else if (role === 'staff' && orderIntent) {
            add(command('orders', 'Tra cứu đơn hàng', ' '));
            add(command('pay', 'Ghi nhận thanh toán', ' '));
            add(command('returns', 'Xem phiếu đổi trả'));
        } else if (role === 'customer' && orderIntent) {
            add(command('orders', 'Xem đơn của tôi'));
            add(command('cancelorder', 'Hủy đơn', ' '));
            add(command('myreturns', 'Xem đổi trả và bảo hành'));
        } else if (role === 'admin' && adminIntent) {
            if (has(/tai khoan|nguoi dung/)) add(command('accounts', 'Xem thống kê tài khoản'));
            if (has(/nhat ky|hoat dong/)) add(command('audit', 'Xem nhật ký hoạt động'));
            if (has(/cau hinh|model|gemini|ollama/)) add(command('config', 'Cấu hình AI', ' '));
        } else if ((role === 'staff' || role === 'owner') && attendanceIntent) {
            add(command('attendance', 'Xem chấm công'));
            add(command('orders', 'Tra cứu đơn hàng', ' '));
        } else if ((role === 'customer' || role === 'guest') && productIntent) {
            add({ label: 'So sánh các lựa chọn', message: 'So sánh các sản phẩm vừa tìm theo giá, bảo hành và mức độ phù hợp với nhu cầu của tôi.' });
            add(command('products', 'Tìm mẫu khác', ' '));
            add(command('policy', 'Xem chính sách bảo hành', ' bảo hành'));
        } else if ((role === 'customer' || role === 'guest') && policyIntent) {
            add({ label: 'Áp dụng vào trường hợp của tôi', message: 'Tôi muốn hỏi chính sách này cho trường hợp sau: ', needsInput: true });
            add(command('policy', 'Xem chủ đề chính sách khác', ' '));
        }

        if (suggestions.length) return suggestions;
        if (role === 'owner') return [
            command('report', 'Báo cáo kinh doanh', ' tháng này'),
            command('lowstock', 'Kiểm tra hàng sắp hết'),
            command('returns', 'Phiếu đổi trả chờ xử lý')
        ].filter(Boolean);
        if (role === 'staff') return [
            command('products', 'Tra cứu sản phẩm', ' '),
            command('orders', 'Tra cứu đơn hàng', ' '),
            command('attendance', 'Xem chấm công')
        ].filter(Boolean);
        if (role === 'customer') return [
            command('products', 'Tìm sản phẩm', ' '),
            command('orders', 'Xem đơn của tôi'),
            command('policy', 'Tra cứu chính sách', ' ')
        ].filter(Boolean);
        if (role === 'admin') return [
            command('accounts', 'Thống kê tài khoản'),
            command('audit', 'Nhật ký hoạt động'),
            command('config', 'Cấu hình AI', ' ')
        ].filter(Boolean);
        return [
            command('products', 'Tìm sản phẩm', ' '),
            command('policy', 'Tra cứu chính sách', ' '),
            { label: 'Tư vấn theo nhu cầu', message: 'Tôi đang tìm sản phẩm, hãy hỏi tôi nhu cầu sử dụng và tầm giá.' }
        ].filter(Boolean);
    }

    refreshContextualSuggestions(latestMessage, reply) {
        this.view.renderQuickActions(
            this.contextualSuggestions(latestMessage, reply),
            (message, needsInput) => this.handleQuickAction(message, needsInput)
        );
    }

    async requestHumanHelp(userIntent = '') {
        if (this.supportTicket) {
            this.view.updateBubbleText(this.view.appendAIBubble(), 'Bạn đang trong phiên hỗ trợ. Hãy nhắn nội dung cần trao đổi ngay tại đây; gõ `/thoat` khi muốn kết thúc phiên với nhân viên.');
            return;
        }
        const bubble = this.view.appendAIBubble();
        this.view.updateBubbleText(bubble, 'Đang gửi yêu cầu hỗ trợ...');
        try {
            const contextEntries = [...this.history.slice(-8)];
            if (userIntent && (!contextEntries.length || contextEntries[contextEntries.length - 1].content !== userIntent)) {
                contextEntries.push({ role: 'user', content: userIntent });
            }
            const context = contextEntries
                .filter((entry) => ['user', 'assistant'].includes(entry.role) && entry.content)
                .map((entry) => `${entry.role === 'user' ? 'Khách' : 'Bot'}: ${entry.content}`)
                .join('\n').slice(0, 1800);
            const result = await ChatService.requestHumanHelp(context);
            this.supportTicket = result.data;
            this.supportLastMessageId = Number(result.data.last_message_id) || 0;
            localStorage.setItem('bot_support_ticket', JSON.stringify(this.supportTicket));
            this.view.updateBubbleText(bubble, `${result.message || 'Đã gửi yêu cầu. Nhân viên cửa hàng sẽ tiếp nhận sớm nhất có thể.'}\n\nKhi muốn kết thúc phiên, gõ **/thoat**.`);
            this.startSupportPolling();
        } catch (error) {
            this.view.updateBubbleText(bubble, error.message || 'Chưa gửi được yêu cầu, vui lòng thử lại.');
        }
    }

    restoreSupportSession() {
        try {
            const saved = JSON.parse(localStorage.getItem('bot_support_ticket') || 'null');
            if (!saved?.request_id || !saved?.access_key) return;
            this.supportTicket = saved;
            this.supportLastMessageId = 0;
            this.startSupportPolling();
        } catch {
            localStorage.removeItem('bot_support_ticket');
        }
    }

    startSupportPolling() {
        if (this.supportPollingInterval) clearInterval(this.supportPollingInterval);
        if (this.customerUpdatesInterval) clearInterval(this.customerUpdatesInterval);
        this.pollSupportMessages();
        this.supportPollingInterval = setInterval(() => this.pollSupportMessages(), 3000);
    }

    async pollSupportMessages() {
        if (!this.supportTicket) return;
        try {
            const result = await ChatService.getSupportMessages(
                this.supportTicket.request_id, this.supportTicket.access_key, this.supportLastMessageId);
            for (const message of result.data.messages || []) {
                this.supportLastMessageId = Math.max(this.supportLastMessageId, Number(message.id) || 0);
                if (message.sender_type === 'customer') continue;
                const bubble = this.view.appendAIBubble();
                const prefix = message.sender_type === 'staff' ? '**Nhân viên:** ' : '';
                this.view.updateBubbleText(bubble, `${prefix}${message.content || ''}`);
                if (message.image_url) this.view.appendImageToBubble(bubble, message.image_url, 'Ảnh đính kèm từ nhân viên');
            }
            if (result.data.status === 'closed') {
                clearInterval(this.supportPollingInterval);
                this.supportPollingInterval = null;
                this.supportTicket = null;
                localStorage.removeItem('bot_support_ticket');
                this.view.updateBubbleText(this.view.appendAIBubble(), 'Phiên hỗ trợ đã kết thúc. Bạn có thể tiếp tục hỏi bot hoặc bấm “Gặp nhân viên” để mở yêu cầu mới.');
            }
        } catch (error) {
            clearInterval(this.supportPollingInterval);
            this.supportPollingInterval = null;
            this.supportTicket = null;
            localStorage.removeItem('bot_support_ticket');
            this.view.updateBubbleText(this.view.appendAIBubble(), error.message || 'Phiên hỗ trợ không còn khả dụng. Hãy bấm “Gặp nhân viên” để gửi yêu cầu mới.');
        }
    }

    async sendSupportMessage(text, image = null) {
        try {
            const result = await ChatService.sendSupportMessage(
                this.supportTicket.request_id, this.supportTicket.access_key, text, image);
            this.supportLastMessageId = Math.max(this.supportLastMessageId, Number(result.data?.id) || 0);
        } catch (error) {
            this.view.updateBubbleText(this.view.appendAIBubble(), error.message || 'Chưa gửi được tin nhắn cho nhân viên.');
        }
    }

    async closeSupportSession() {
        if (!this.supportTicket) {
            this.view.updateBubbleText(this.view.appendAIBubble(), 'Bạn hiện không ở trong phiên hỗ trợ với nhân viên.');
            return;
        }

        const ticket = this.supportTicket;
        const bubble = this.view.appendAIBubble();
        this.view.updateBubbleText(bubble, 'Đang kết thúc phiên hỗ trợ...');
        if (this.supportPollingInterval) clearInterval(this.supportPollingInterval);
        this.supportPollingInterval = null;
        this.view.setLoadingState(true);
        try {
            const result = await ChatService.closeSupportSession(ticket.request_id, ticket.access_key);
            this.supportTicket = null;
            this.supportLastMessageId = 0;
            localStorage.removeItem('bot_support_ticket');
            this.view.updateBubbleText(bubble, `${result.message || 'Đã kết thúc phiên hỗ trợ.'}\n\nBạn có thể tiếp tục trò chuyện với bot hoặc mở phiên mới bằng nút **Gặp nhân viên**.`);
        } catch (error) {
            this.view.updateBubbleText(bubble, error.message || 'Chưa kết thúc được phiên hỗ trợ. Vui lòng thử lại.');
            this.startSupportPolling();
        } finally {
            this.view.setLoadingState(false);
        }
    }

    async requestRegistrationOtp(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        const status = form.querySelector('[data-register-status]');
        const button = form.querySelector('[data-register-send]');
        button.disabled = true;
        status.textContent = 'Đang yêu cầu mã xác minh...';
        try {
            const result = await ChatService.requestBotRegistrationOtp(form.querySelector('[name="phone"]').value.trim());
            status.textContent = result.message || 'Nếu gửi được SMS, mã xác minh sẽ đến số điện thoại của bạn.';
            if (result.data?.demoCode) {
                status.textContent = `${status.textContent} Mã OTP demo: ${result.data.demoCode}`;
            }
            form.querySelector('[data-register-code]').classList.remove('hidden');
            form.querySelector('[data-register-verify]').classList.remove('hidden');
        } catch (error) {
            status.textContent = repairMojibake(error.message);
        } finally {
            button.disabled = false;
        }
    }

    async verifyRegistration(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        const status = form.querySelector('[data-register-status]');
        const button = form.querySelector('[data-register-verify]');
        const value = (name) => form.querySelector(`[name="${name}"]`)?.value.trim() || '';
        button.disabled = true;
        status.textContent = this.registrationRequiresOtp ? 'Đang xác minh và tạo tài khoản...' : 'Đang tạo tài khoản demo...';
        try {
            const result = await ChatService.botRegister({
                username: value('username'), email: value('email'), address: value('address'), password: form.querySelector('[name="password"]').value,
                full_name: value('full_name'), phone: value('phone'), code: value('code')
            });
            if (result.data.token) localStorage.setItem('bot_token', result.data.token);
            else localStorage.removeItem('bot_token');
            status.textContent = 'Đăng ký thành công. Tài khoản đã được đăng nhập.';
            await this.loadProfile();
            setTimeout(() => this.handleSendMessage('/batdau'), 500);
        } catch (error) {
            status.textContent = repairMojibake(error.message);
        } finally {
            button.disabled = false;
        }
    }

    showRegistrationForm() {
        const aiBubble = this.view.appendAIBubble();
        const formId = `bot-register-${Date.now()}`;
        const requiresOtp = this.registrationRequiresOtp;
        const formHtml = `
            <div id="${formId}" class="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2 w-full max-w-sm">
                <h4 class="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">👤 Tạo tài khoản khách hàng</h4>
                <div class="flex flex-col gap-2 mb-3">
                    <input name="full_name" type="text" maxlength="120" placeholder="Họ và tên" autocomplete="name" class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    <input name="phone" type="tel" inputmode="numeric" maxlength="10" placeholder="Số điện thoại${requiresOtp ? ' 10 chữ số' : ' (không bắt buộc)'}" autocomplete="tel" ${requiresOtp ? 'required' : ''} class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    <input name="email" type="email" maxlength="254" placeholder="Email" autocomplete="email" required class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    <input name="address" type="text" maxlength="250" placeholder="Địa chỉ nhận hàng" autocomplete="street-address" required class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    <input name="username" type="text" maxlength="30" placeholder="Tên đăng nhập (3-30 ký tự)" autocomplete="username" class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    <input name="password" type="password" minlength="${requiresOtp ? 10 : 6}" maxlength="72" placeholder="Mật khẩu (ít nhất ${requiresOtp ? 10 : 6} ký tự)" autocomplete="new-password" class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    ${requiresOtp ? '<input name="code" data-register-code type="text" inputmode="numeric" maxlength="6" placeholder="Mã OTP SMS" class="hidden w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">' : ''}
                </div>
                <p data-register-status class="text-xs text-slate-600 mb-2">${requiresOtp ? 'Xác minh số điện thoại để bảo vệ hồ sơ khách hàng.' : 'Bản demo: nhập họ tên, tên đăng nhập và mật khẩu để tạo tài khoản.'}</p>
                ${requiresOtp ? `<button data-register-send onclick="window.dispatchEvent(new CustomEvent('bot-register-request-otp', {detail: '${formId}'}))" class="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-sm w-full shadow-sm">Gửi mã xác minh</button>` : ''}
                <button data-register-verify onclick="window.dispatchEvent(new CustomEvent('bot-register-verify', {detail: '${formId}'}))" class="${requiresOtp ? 'hidden mt-2' : ''} px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm w-full shadow-sm">${requiresOtp ? 'Xác minh và tạo tài khoản' : 'Tạo tài khoản'}</button>
            </div>
        `;
        this.view.updateBubbleText(aiBubble, formHtml, true);
    }

    handleInput(text) {
        const value = text.trimStart();
        if (value.startsWith('/') && !/\s/.test(value)) {
            const search = value.substring(1).toLowerCase();
            const matched = this.availableCommands
                .filter((command) => [command.name, command.canonicalName, ...(command.aliases || [])]
                    .some((name) => name?.toLowerCase().startsWith(search)
                        || name?.toLowerCase().includes(search)))
                .sort((a, b) => {
                    const aStarts = [a.name, a.canonicalName, ...(a.aliases || [])]
                        .some((name) => name?.toLowerCase().startsWith(search));
                    const bStarts = [b.name, b.canonicalName, ...(b.aliases || [])]
                        .some((name) => name?.toLowerCase().startsWith(search));
                    return Number(bStarts) - Number(aStarts) || a.name.localeCompare(b.name, 'vi');
                });
            this.view.renderSuggestions(matched, (cmd) => {
                this.view.setInput(cmd + ' ');
            });
        } else {
            this.view.hideSuggestions();
        }
    }

    async handleSendMessage(text, image = null) {
        text = text || (image ? 'Hãy xem ảnh hóa đơn này giúp tôi.' : '');
        if (!text) return;
        const trimmedText = text.trim();
        const isRegisterCommand = /^\/(?:dangky|register)(?:\s|$)/i.test(trimmedText);
        const containsSensitiveId = !image && /(?<!\d)(?:\d[\s.-]?){11}\d(?!\d)/.test(text);
        const containsPhone = !image && /(?<!\d)(?:\+?84|0)\d{9}(?!\d)/.test(text);
        if (containsSensitiveId || containsPhone) {
            this.view.appendUserMessage(containsSensitiveId ? '[CCCD đã được ẩn]' : '[Số điện thoại đã được ẩn]');
            this.view.updateBubbleText(this.view.appendAIBubble(), containsSensitiveId
                ? 'Không gửi CCCD hoặc ảnh giấy tờ trong chat. Với hồ sơ trả góp, hãy nhập thông tin trực tiếp trên kênh chính thức của đối tác tài chính hoặc liên hệ nhân viên.'
                : isRegisterCommand
                    ? 'Lệnh đăng ký không nhận thông tin qua chat. Hãy nhập số điện thoại trực tiếp trong biểu mẫu đăng ký bên dưới để xác minh.'
                    : 'Không gửi số điện thoại trong chat. Hãy dùng biểu mẫu đăng ký để xác minh số hoặc liên hệ nhân viên nếu cần cập nhật thông tin.');
            if (isRegisterCommand && !containsSensitiveId) this.showRegistrationForm();
            return;
        }
        const isCredentialCommandWithArgs = /^\/(?:dangky|register|dangnhap|login)\s+\S/i.test(trimmedText);
        this.view.appendUserMessage(isCredentialCommandWithArgs ? `${trimmedText.split(/\s+/)[0]} [thông tin đã ẩn]` : text, image);
        
        // Handle client-side commands
        const rawCommand = text.trim().toLowerCase();
        const typedCommand = /^\/([a-z]+)/.exec(rawCommand)?.[1];
        const commandMeta = typedCommand && this.availableCommands.find((command) =>
            [command.name, command.canonicalName, ...(command.aliases || [])].some((name) => name?.toLowerCase() === typedCommand));
        const cmd = commandMeta
            ? rawCommand.replace(/^\/[a-z]+/, `/${commandMeta.canonicalName}`)
            : rawCommand;
        
        if (cmd === '/clear') {
            this.history = [];
            this.view.clearHistory();
            this.view.updateBubbleText(this.view.appendAIBubble(), '🗑️ Đã xóa lịch sử chat. Gõ /trogiup để xem lệnh.');
            return;
        }
        
        if (cmd === '/logout') {
            localStorage.removeItem('bot_token');
            try { await ChatService.botLogout(); } catch (error) { console.warn('Bot logout:', error.message); }
            this.history = [];
            this.view.clearHistory();
            this.view.updateBubbleText(this.view.appendAIBubble(), '👋 Đã đăng xuất. Gõ /dangnhap để đăng nhập lại.');
            this.loadProfile();
            return;
        }

        if (cmd === '/thoat') {
            await this.closeSupportSession();
            return;
        }

        if (this.supportTicket) {
            await this.sendSupportMessage(text, image);
            return;
        }

        const normalizedMessage = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (/(gap nhan vien|noi chuyen voi nhan vien|ket noi voi nhan vien|lien he nhan vien|ho tro truc tiep)/.test(normalizedMessage)) {
            await this.requestHumanHelp(text);
            return;
        }

        if (cmd === '/login') {
            const aiBubble = this.view.appendAIBubble();
            const formHtml = `
                <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2 w-full max-w-sm">
                    <h4 class="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">🔐 Đăng nhập Bot</h4>
                    <div class="flex flex-col gap-2 mb-3">
                        <input type="text" id="login-user" placeholder="Tên đăng nhập" class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                        <input type="password" id="login-pass" placeholder="Mật khẩu" class="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500">
                    </div>
                    <button onclick="
                        const u = document.getElementById('login-user').value;
                        const p = document.getElementById('login-pass').value;
                        if(u && p) window.dispatchEvent(new CustomEvent('send-bot-msg', {detail: '/dangnhap ' + u + ' ' + p}));
                    " class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm w-full shadow-sm">Đăng Nhập</button>
                </div>
            `;
            this.view.updateBubbleText(aiBubble, formHtml, true);
            return;
        }

        if (cmd.startsWith('/login ')) {
            const parts = text.trim().split(/\s+/);
            if (parts.length === 3) {
                const username = parts[1];
                const password = parts[2];
                try {
                    this.view.setLoadingState(true);
                    const aiBubble = this.view.appendAIBubble();
                    this.view.updateBubbleText(aiBubble, "Đang đăng nhập...");
                    
                    const res = await ChatService.botLogin(username, password);
                    if (res.data.token) localStorage.setItem('bot_token', res.data.token);
                    else localStorage.removeItem('bot_token');
                    this.view.updateBubbleText(aiBubble, `Đăng nhập thành công với vai trò: **${res.data.user.role}**`);
                    await this.loadProfile();
                    
                    setTimeout(() => { this.handleSendMessage('/batdau'); }, 500);
                } catch(e) {
                    const aiBubble = this.view.appendAIBubble();
                    this.view.updateBubbleText(aiBubble, `<span class="text-red-500">Lỗi: ${e.message}</span>`);
                } finally {
                    this.view.setLoadingState(false);
                }
                return;
            }
        }

        if (cmd === '/register') {
            this.showRegistrationForm();
            return;
        }

        if (cmd.startsWith('/register ')) {
            this.view.updateBubbleText(this.view.appendAIBubble(), 'Đăng ký cần xác minh số điện thoại bằng mã SMS. Mình đã mở biểu mẫu; hãy nhập thông tin ở đó. Mật khẩu cần ít nhất 10 ký tự.');
            this.showRegistrationForm();
            return;
        }

        this.view.setLoadingState(true);
        const aiBubble = this.view.appendAIBubble();
        
        let fullResponse = '';

        ChatService.streamChat(
            text, 
            this.history, 
            (chunk) => {
                fullResponse += chunk;
                this.view.updateBubbleText(aiBubble, fullResponse);
            },
            () => {
                this.view.setLoadingState(false);
                this.history.push({ role: 'user', content: text });
                this.history.push({ role: 'assistant', content: fullResponse });
                if (this.history.length > 20) { // Keep more history for LangChain tool calling context
                    this.history = this.history.slice(-20);
                }
                this.refreshContextualSuggestions(text, fullResponse);
            },
            (errorMsg) => {
                this.view.setLoadingState(false);
                this.loadProfile();
                this.view.updateBubbleText(aiBubble, `<span class="text-red-500">Lỗi: ${errorMsg}</span><br><br>Gợi ý: Nếu bạn chưa đăng nhập, hãy dùng lệnh <code>/dangnhap</code> hoặc tạo tài khoản bằng <code>/dangky</code>.`);
            },
            (action) => this.view.appendPendingAction(action, this.confirmPendingAction.bind(this), this.cancelPendingAction.bind(this)),
            image
        );
    }

    async confirmPendingAction(actionId, card, confirmButton, cancelButton) {
        confirmButton.disabled = true;
        cancelButton.disabled = true;
        try {
            const result = await ChatService.confirmCustomerAction(actionId);
            card.replaceChildren();
            const message = document.createElement('p');
            message.className = 'text-sm font-medium text-emerald-800';
            message.textContent = result.message;
            card.append(message);
        } catch (error) {
            const message = document.createElement('p');
            message.className = 'mb-2 text-sm text-rose-700';
            message.textContent = error.message;
            card.prepend(message);
            confirmButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    async cancelPendingAction(actionId, card, confirmButton, cancelButton) {
        confirmButton.disabled = true;
        cancelButton.disabled = true;
        try {
            const result = await ChatService.cancelCustomerAction(actionId);
            card.replaceChildren();
            const message = document.createElement('p');
            message.className = 'text-sm text-slate-600';
            message.textContent = result.message;
            card.append(message);
        } catch (error) {
            const message = document.createElement('p');
            message.className = 'mb-2 text-sm text-rose-700';
            message.textContent = error.message;
            card.prepend(message);
            confirmButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    destroy() {
        if (this.handleWindowBotMessage) window.removeEventListener('send-bot-msg', this.handleWindowBotMessage);
        if (this.handleRegisterOtpRequest) window.removeEventListener('bot-register-request-otp', this.handleRegisterOtpRequest);
        if (this.handleRegisterVerify) window.removeEventListener('bot-register-verify', this.handleRegisterVerify);
        if (this.supportPollingInterval) clearInterval(this.supportPollingInterval);
        this.view?.releaseImagePreviews?.();
        if (this.view && this.view.container && this.view.container.parentNode) {
            this.view.container.parentNode.removeChild(this.view.container);
        }
    }
}
