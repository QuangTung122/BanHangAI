import ApiClient from '../core/ApiClient.js';

export default class BotSupportController {
    constructor() {
        this.root = document.getElementById('content-area');
        this.selectedRequestId = null;
        this.requests = [];
        this.lastMessagesHash = '';
        this.renderShell();
        this.bindEvents();
        this.refresh(true);
        this.pollingInterval = setInterval(() => this.refresh(false), 4000);
    }

    renderShell() {
        this.root.innerHTML = `
            <div class="h-full min-h-[560px] grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 p-1 max-w-[1600px] mx-auto w-full">
                <!-- Cột trái: Danh sách yêu cầu -->
                <section class="bg-white rounded-2xl border border-[#e7eaf2] shadow-sm overflow-hidden flex flex-col">
                    <div class="p-4 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-[#5745f5] animate-ping"></span>
                                <h2 class="font-black text-sm text-[#182033]">Khách Hàng Cần Hỗ Trợ</h2>
                            </div>
                            <p class="text-[11px] text-[#7b8499] mt-0.5">Yêu cầu từ bot tư vấn tự động</p>
                        </div>
                        <button data-refresh class="text-xs text-[#5745f5] font-bold hover:underline cursor-pointer">Tải lại</button>
                    </div>
                    <div data-request-list class="flex-1 overflow-y-auto divide-y divide-[#e7eaf2]"></div>
                </section>

                <!-- Cột phải: Khung hội thoại trực tiếp -->
                <section class="bg-white rounded-2xl border border-[#e7eaf2] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <header data-chat-header class="p-4 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                            <h2 data-chat-title class="font-black text-sm text-[#182033]">Chọn yêu cầu hỗ trợ</h2>
                            <p data-chat-subtitle class="text-[11px] text-[#7b8499] mt-0.5 truncate">Bạn có thể trao đổi trực tiếp và gửi ảnh cho khách tại đây.</p>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button data-decline class="hidden rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer">Từ chối</button>
                            <button data-accept class="hidden rounded-xl bg-[#149c79] hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm">Nhận phiên</button>
                            <button data-close class="hidden rounded-xl bg-[#f5f6fa] hover:bg-rose-50 border border-[#e7eaf2] px-3 py-1.5 text-xs font-bold text-[#182033] hover:text-rose-700 transition-colors cursor-pointer">Kết thúc phiên</button>
                        </div>
                    </header>
                    <div data-chat-messages class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfd]"></div>
                    <div data-chat-footer class="hidden"></div>
                    <form data-chat-form class="hidden p-3 border-t border-[#e7eaf2] flex gap-2 bg-white">
                        <button type="button" data-attach class="rounded-xl bg-[#f5f6fa] border border-[#e7eaf2] px-3.5 py-2 text-xs font-bold text-[#182033] hover:bg-[#f0edff] hover:text-[#5745f5] transition-colors cursor-pointer" title="Gửi ảnh JPG, PNG hoặc WEBP, tối đa 5 MB">Ảnh</button>
                        <input data-chat-image type="file" accept="image/jpeg,image/png,image/webp" class="hidden">
                        <input data-chat-input maxlength="1000" class="flex-1 rounded-xl border border-[#e7eaf2] px-4 py-2 text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="Nhập tin nhắn cho khách..." autocomplete="off">
                        <button class="rounded-xl bg-[#5745f5] hover:bg-[#4736e8] px-5 py-2 text-xs font-bold text-white transition-colors shadow-sm shadow-[#5745f5]/20 cursor-pointer">Gửi</button>
                    </form>
                </section>
            </div>`;
    }

    bindEvents() {
        this.root.querySelector('[data-refresh]').addEventListener('click', () => this.refresh(false));
        this.root.querySelector('[data-request-list]').addEventListener('click', (event) => {
            const item = event.target.closest('[data-request-id]');
            if (item) this.openRequest(Number(item.dataset.requestId));
        });
        this.root.querySelector('[data-chat-form]').addEventListener('submit', (event) => {
            event.preventDefault();
            this.sendReply();
        });
        const imagePicker = this.root.querySelector('[data-chat-image]');
        this.root.querySelector('[data-attach]').addEventListener('click', () => imagePicker.click());
        imagePicker.addEventListener('change', () => {
            const file = imagePicker.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                window.showToast?.('Chỉ nhận ảnh JPG, PNG hoặc WEBP, tối đa 5 MB.', 'error');
                imagePicker.value = '';
                return;
            }
            this.root.querySelector('[data-attach]').textContent = file.name.length > 12 ? 'Ảnh ✓' : `${file.name} ✓`;
        });
        this.root.querySelector('[data-close]').addEventListener('click', () => this.closeRequest());
        this.root.querySelector('[data-accept]').addEventListener('click', () => this.decideRequest('accept'));
        this.root.querySelector('[data-decline]').addEventListener('click', () => this.decideRequest('decline'));
    }

    escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    formatTime(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(String(dateString).replace(' ', 'T'));
            if (isNaN(date.getTime())) return String(dateString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${hours}:${minutes} ${day}/${month}`;
        } catch {
            return String(dateString);
        }
    }

    async refresh(isInitial = false) {
        try {
            const response = await ApiClient.get('/bot/support/requests');
            if (!response.data?.success) {
                if (!this.requests.length) this.renderEmptyState();
                return;
            }
            this.requests = response.data.data || [];
            this.renderRequests();

            if (!this.requests.length) {
                this.renderEmptyState();
                return;
            }

            // Tự động chọn yêu cầu nếu chưa chọn hoặc yêu cầu đang chọn không còn tồn tại
            if (!this.selectedRequestId || !this.requests.some((r) => Number(r.id) === this.selectedRequestId)) {
                const target = this.requests.find((r) => r.status === 'in_progress' && Number(r.assigned_to_me) === 1)
                    || this.requests.find((r) => r.status === 'open')
                    || this.requests[0];
                if (target) {
                    await this.openRequest(Number(target.id));
                    return;
                }
            }

            if (this.selectedRequestId) {
                const selected = this.requests.find((request) => Number(request.id) === this.selectedRequestId);
                if (selected) {
                    this.renderChatHeader(selected);
                    this.updateSelectedControls(selected);
                    await this.loadMessages(this.selectedRequestId, false);
                }
            }
        } catch (error) {
            console.error('BotSupportController refresh error:', error);
        }
    }

    renderEmptyState() {
        this.selectedRequestId = null;
        this.lastMessagesHash = '';
        this.root.querySelector('[data-chat-title]').textContent = 'Hỗ trợ khách hàng từ Bot';
        this.root.querySelector('[data-chat-subtitle]').textContent = 'Hiện không có yêu cầu nào.';
        this.root.querySelector('[data-accept]').classList.add('hidden');
        this.root.querySelector('[data-decline]').classList.add('hidden');
        this.root.querySelector('[data-close]').classList.add('hidden');
        this.root.querySelector('[data-chat-form]').classList.add('hidden');
        const footer = this.root.querySelector('[data-chat-footer]');
        if (footer) {
            footer.innerHTML = '';
            footer.classList.add('hidden');
        }
        const messages = this.root.querySelector('[data-chat-messages]');
        messages.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center p-8 text-[#7b8499]">
                <div class="w-16 h-16 rounded-2xl bg-[#f0edff] flex items-center justify-center text-[#5745f5] mb-4 text-2xl shadow-sm">
                    💬
                </div>
                <h3 class="font-bold text-sm text-[#182033] mb-1.5">Chưa có yêu cầu hỗ trợ</h3>
                <p class="text-xs max-w-sm leading-relaxed text-[#7b8499]">
                    Khi khách hàng yêu cầu gặp nhân viên từ chatbot AI, phiên hỗ trợ sẽ hiển thị tại đây để bạn tiếp nhận.
                </p>
            </div>
        `;
    }

    renderRequests() {
        const list = this.root.querySelector('[data-request-list]');
        if (!this.requests.length) {
            list.innerHTML = `
                <div class="p-8 text-center text-xs text-[#7b8499]">
                    <div class="text-2xl mb-2">📭</div>
                    Chưa có yêu cầu hỗ trợ nào từ khách.
                </div>`;
            return;
        }
        list.innerHTML = this.requests.map((request) => {
            const active = Number(request.id) === this.selectedRequestId;
            const isOpen = request.status === 'open';
            const isInProgress = request.status === 'in_progress';
            const isAssignedToMe = isInProgress && Number(request.assigned_to_me) === 1;

            const statusLabel = isOpen
                ? '<span class="text-amber-600 font-bold">Chờ nhận phiên</span>'
                : isInProgress
                    ? (isAssignedToMe
                        ? '<span class="text-emerald-600 font-bold">Bạn đang xử lý</span>'
                        : `<span class="text-sky-600 font-medium">${this.escape(request.assigned_staff_name || 'NV khác')}</span>`)
                    : (request.decision === 'declined' ? '<span class="text-rose-600 font-medium">Đã từ chối</span>' : '<span class="text-slate-500 font-medium">Đã đóng</span>');

            const customerLabel = this.escape(request.customer_name || 'Khách vãng lai');
            const previewMessage = this.escape(request.last_message || 'Không có tin nhắn gần đây');

            return `
                <button data-request-id="${Number(request.id)}" class="w-full text-left p-3.5 hover:bg-[#f8f9fc] transition-colors cursor-pointer border-l-4 ${active ? 'bg-[#f0edff] border-l-[#5745f5]' : 'border-l-transparent'}">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-amber-500 animate-pulse' : isAssignedToMe ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            <span class="font-bold text-xs text-[#182033] truncate">${customerLabel}</span>
                        </div>
                        <span class="text-[10px] font-mono font-bold text-[#5745f5] shrink-0">#${Number(request.id)}</span>
                    </div>
                    <p class="text-[11px] text-[#7b8499] truncate mt-1">${previewMessage}</p>
                    <div class="flex justify-between items-center mt-2 text-[10px] text-[#7b8499]">
                        <div>${statusLabel}${request.last_sender_type === 'customer' ? ' · <b class="text-[#5745f5]">Khách vừa nhắn</b>' : ''}</div>
                        <span class="font-mono text-[9px] opacity-75">${this.escape(this.formatTime(request.updated_at))}</span>
                    </div>
                </button>
            `;
        }).join('');
    }

    renderChatHeader(request) {
        const titleEl = this.root.querySelector('[data-chat-title]');
        const subtitleEl = this.root.querySelector('[data-chat-subtitle]');
        if (!request) {
            titleEl.textContent = 'Hỗ trợ khách hàng';
            subtitleEl.textContent = 'Chọn yêu cầu hỗ trợ từ danh sách bên trái.';
            return;
        }

        const statusBadge = request.status === 'open'
            ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Chờ nhận phiên</span>'
            : request.status === 'in_progress'
                ? (Number(request.assigned_to_me) === 1
                    ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đang xử lý</span>'
                    : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">${this.escape(request.assigned_staff_name || 'NV khác')}</span>`)
                : request.decision === 'declined'
                    ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Đã từ chối</span>'
                    : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Đã kết thúc</span>';

        titleEl.innerHTML = `
            <div class="flex items-center gap-2 flex-wrap">
                <span class="font-black text-sm text-[#182033]">${this.escape(request.customer_name || 'Khách vãng lai')}</span>
                <span class="text-xs font-mono font-bold text-[#5745f5]">#${Number(request.id)}</span>
                ${statusBadge}
            </div>
        `;

        const subtitle = request.status === 'open'
            ? 'Khách hàng đang đợi hỗ trợ. Bấm "Nhận phiên" để bắt đầu trao đổi trực tiếp với khách.'
            : (request.status === 'in_progress' && Number(request.assigned_to_me) === 1)
                ? 'Bạn đang phụ trách phiên này. Bạn có thể gửi tin nhắn và ảnh tư vấn sản phẩm cho khách.'
                : request.status === 'in_progress'
                    ? `Phiên này đang do ${this.escape(request.assigned_staff_name || 'nhân viên khác')} phụ trách.`
                    : 'Phiên hỗ trợ đã kết thúc.';
        subtitleEl.textContent = subtitle;
    }

    async openRequest(id) {
        this.selectedRequestId = id;
        this.lastMessagesHash = '';
        const request = this.requests.find((entry) => Number(entry.id) === id);
        this.renderChatHeader(request);
        this.updateSelectedControls(request);
        const messagesContainer = this.root.querySelector('[data-chat-messages]');
        messagesContainer.innerHTML = `
            <div class="h-full flex items-center justify-center text-xs text-[#7b8499]">
                <div class="flex items-center gap-2">
                    <span class="w-3.5 h-3.5 rounded-full border-2 border-[#5745f5] border-t-transparent animate-spin"></span>
                    <span>Đang tải hội thoại...</span>
                </div>
            </div>`;
        await this.loadMessages(id, true);
        this.renderRequests();
    }

    updateSelectedControls(request) {
        const isOpen = request?.status === 'open';
        const isAssignedToMe = request?.status === 'in_progress' && Number(request.assigned_to_me) === 1;
        const isClosed = request?.status === 'closed';
        const isOtherStaff = request?.status === 'in_progress' && !isAssignedToMe;

        // Header controls
        this.root.querySelector('[data-accept]').classList.toggle('hidden', !isOpen);
        this.root.querySelector('[data-decline]').classList.toggle('hidden', !isOpen);
        this.root.querySelector('[data-close]').classList.toggle('hidden', !isAssignedToMe);

        // Chat form (input)
        this.root.querySelector('[data-chat-form]').classList.toggle('hidden', !isAssignedToMe);

        // Footer banner
        const footerContainer = this.root.querySelector('[data-chat-footer]');
        if (footerContainer) {
            if (isOpen) {
                footerContainer.innerHTML = `
                    <div class="p-3.5 border-t border-amber-200 bg-amber-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">⏳</span>
                            <div>
                                <div class="text-xs font-bold text-amber-900">Khách hàng đang chờ nhân viên tiếp nhận</div>
                                <div class="text-[11px] text-amber-700">Xem nội dung yêu cầu bên trên rồi bấm nhận phiên để bắt đầu trao đổi trực tiếp.</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button data-footer-decline class="rounded-xl bg-white hover:bg-rose-50 border border-rose-200 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer">Từ chối</button>
                            <button data-footer-accept class="rounded-xl bg-[#149c79] hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer">Nhận phiên ngay</button>
                        </div>
                    </div>
                `;
                footerContainer.classList.remove('hidden');
                footerContainer.querySelector('[data-footer-accept]')?.addEventListener('click', () => this.decideRequest('accept'));
                footerContainer.querySelector('[data-footer-decline]')?.addEventListener('click', () => this.decideRequest('decline'));
            } else if (isOtherStaff) {
                footerContainer.innerHTML = `
                    <div class="p-3 border-t border-[#e7eaf2] bg-sky-50 text-center text-xs text-sky-800">
                        Phiên hỗ trợ này đang do nhân viên <b>${this.escape(request.assigned_staff_name || 'khác')}</b> xử lý.
                    </div>
                `;
                footerContainer.classList.remove('hidden');
            } else if (isClosed) {
                footerContainer.innerHTML = `
                    <div class="p-3 border-t border-[#e7eaf2] bg-slate-50 text-center text-xs text-[#7b8499]">
                        Phiên hỗ trợ đã đóng (${request.decision === 'declined' ? 'Đã từ chối' : 'Đã kết thúc'}). Không thể gửi thêm tin nhắn.
                    </div>
                `;
                footerContainer.classList.remove('hidden');
            } else {
                footerContainer.innerHTML = '';
                footerContainer.classList.add('hidden');
            }
        }
    }

    async decideRequest(action) {
        if (!this.selectedRequestId) return;
        const button = this.root.querySelector(`[data-${action}]`);
        if (button) button.disabled = true;
        try {
            const response = await ApiClient.post(`/bot/support/requests/${this.selectedRequestId}/${action}`, {});
            if (response.data?.success) {
                window.showToast?.(action === 'accept' ? 'Đã nhận phiên hỗ trợ thành công!' : 'Đã từ chối phiên hỗ trợ.', 'success');
                await this.refresh(false);
                await this.openRequest(this.selectedRequestId);
            } else if (window.showToast) {
                window.showToast(response.data?.message || 'Không cập nhật được yêu cầu.', 'error');
                await this.refresh(false);
            }
        } finally {
            if (button) button.disabled = false;
        }
    }

    renderSystemMessage(message) {
        const isWaiting = message.content?.includes('yêu cầu gặp');
        return `
            <div class="flex justify-center my-2">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${isWaiting ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-[#eef0f6] text-[#55607a] border border-[#e2e6f0]'}">
                    <span>${isWaiting ? '⏳' : 'ℹ️'}</span>
                    <span>${this.escape(message.content)}</span>
                    ${message.created_at ? `<span class="text-[10px] opacity-60 ml-1 font-mono">${this.escape(this.formatTime(message.created_at))}</span>` : ''}
                </div>
            </div>
        `;
    }

    renderBotContext(content, createdAt) {
        const lines = String(content || '').split('\n');
        const turns = [];
        let currentRole = null;
        let currentText = [];

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line.startsWith('Khách:')) {
                if (currentRole) turns.push({ role: currentRole, text: currentText.join('\n') });
                currentRole = 'user';
                currentText = [line.slice(6).trim()];
            } else if (line.startsWith('Bot:')) {
                if (currentRole) turns.push({ role: currentRole, text: currentText.join('\n') });
                currentRole = 'bot';
                currentText = [line.slice(4).trim()];
            } else if (currentRole) {
                currentText.push(line);
            } else {
                currentRole = 'user';
                currentText = [line];
            }
        }
        if (currentRole) turns.push({ role: currentRole, text: currentText.join('\n') });

        const dialogueHtml = turns.map((turn) => {
            const isUser = turn.role === 'user';
            return `
                <div class="flex items-start gap-2 text-xs">
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 ${isUser ? 'bg-indigo-100 text-[#5745f5]' : 'bg-emerald-100 text-[#149c79]'}">
                        ${isUser ? '👤' : '🤖'}
                    </span>
                    <div class="flex-1">
                        <span class="font-bold text-[11px] ${isUser ? 'text-[#5745f5]' : 'text-[#149c79]'}">${isUser ? 'Khách' : 'Bot AI'}:</span>
                        <span class="text-[#182033] whitespace-pre-wrap leading-relaxed">${this.escape(turn.text)}</span>
                    </div>
                </div>
            `;
        }).join('<div class="h-2"></div>');

        return `
            <div class="my-2 border border-indigo-100 bg-[#f8f9fe] rounded-2xl p-3.5 shadow-sm max-w-[95%] mx-auto">
                <div class="flex items-center justify-between gap-2 border-b border-indigo-100/70 pb-2 mb-2.5">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-[#5745f5]">
                        <span>💬</span>
                        <span>Lịch sử trao đổi với Bot trước khi kết nối nhân viên</span>
                    </div>
                    ${createdAt ? `<span class="text-[10px] text-[#7b8499] font-mono">${this.escape(this.formatTime(createdAt))}</span>` : ''}
                </div>
                <div class="space-y-1.5">
                    ${dialogueHtml}
                </div>
            </div>
        `;
    }

    resolveImageUrl(url) {
        if (!url || typeof url !== 'string') return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }
        const backendOrigin = (window.location.port && window.location.port !== '5000') ? 'http://localhost:5000' : '';
        return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    renderCustomerMessage(message) {
        const fullUrl = this.resolveImageUrl(message.image_url);
        const image = fullUrl ? `<img src="${this.escape(fullUrl)}" alt="Ảnh đính kèm" loading="lazy" class="mt-2 max-h-64 max-w-full rounded-xl object-contain border border-black/10 cursor-pointer" onclick="window.open('${this.escape(fullUrl)}', '_blank')" onerror="this.onerror=null; this.alt='Không thể tải ảnh';">` : '';
        return `
            <div class="flex justify-start my-1.5">
                <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm bg-white border border-[#e7eaf2] text-[#182033]">
                    <div class="flex items-center justify-between gap-3 text-[10px] font-bold text-[#7b8499] mb-1">
                        <span>Khách hàng</span>
                        ${message.created_at ? `<span class="font-mono font-normal opacity-75">${this.escape(this.formatTime(message.created_at))}</span>` : ''}
                    </div>
                    ${message.content ? `<div class="whitespace-pre-wrap break-words leading-relaxed">${this.escape(message.content)}</div>` : ''}
                    ${image}
                </div>
            </div>
        `;
    }

    renderStaffMessage(message) {
        const fullUrl = this.resolveImageUrl(message.image_url);
        const image = fullUrl ? `<img src="${this.escape(fullUrl)}" alt="Ảnh đính kèm" loading="lazy" class="mt-2 max-h-64 max-w-full rounded-xl object-contain border border-white/20 cursor-pointer" onclick="window.open('${this.escape(fullUrl)}', '_blank')" onerror="this.onerror=null; this.alt='Không thể tải ảnh';">` : '';
        return `
            <div class="flex justify-end my-1.5">
                <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm bg-[#5745f5] text-white">
                    <div class="flex items-center justify-between gap-3 text-[10px] font-bold text-white/80 mb-1">
                        <span>Nhân viên hỗ trợ</span>
                        ${message.created_at ? `<span class="font-mono font-normal opacity-75">${this.escape(this.formatTime(message.created_at))}</span>` : ''}
                    </div>
                    ${message.content ? `<div class="whitespace-pre-wrap break-words leading-relaxed">${this.escape(message.content)}</div>` : ''}
                    ${image}
                </div>
            </div>
        `;
    }

    renderMessageItem(message) {
        if (message.sender_type === 'system') {
            return this.renderSystemMessage(message);
        }
        if (message.content && (message.content.includes('Khách:') || message.content.includes('Bot:'))) {
            return this.renderBotContext(message.content, message.created_at);
        }
        if (message.sender_type === 'staff') {
            return this.renderStaffMessage(message);
        }
        return this.renderCustomerMessage(message);
    }

    async loadMessages(id, replace = false) {
        try {
            const response = await ApiClient.get(`/bot/support/requests/${id}/messages`);
            if (!response.data?.success || id !== this.selectedRequestId) return;
            const messages = response.data.data || [];
            const historyContainer = this.root.querySelector('[data-chat-messages]');
            if (!historyContainer) return;

            const currentHash = JSON.stringify(messages);
            if (!replace && this.lastMessagesHash === currentHash) return;
            this.lastMessagesHash = currentHash;

            if (!messages.length) {
                historyContainer.innerHTML = '<div class="text-xs text-[#7b8499] text-center py-6">Chưa có tin nhắn trong phiên này.</div>';
                return;
            }

            const isScrolledNearBottom = historyContainer.scrollHeight - historyContainer.scrollTop - historyContainer.clientHeight < 120;

            historyContainer.innerHTML = messages.map((message) => this.renderMessageItem(message)).join('');

            if (replace || isScrolledNearBottom) {
                historyContainer.scrollTop = historyContainer.scrollHeight;
            }
        } catch (error) {
            console.error('BotSupportController loadMessages error:', error);
        }
    }

    async sendReply() {
        const input = this.root.querySelector('[data-chat-input]');
        const imageInput = this.root.querySelector('[data-chat-image]');
        const content = input.value.trim();
        const image = imageInput.files?.[0] || null;
        if ((!content && !image) || !this.selectedRequestId) return;
        input.disabled = true;
        try {
            const body = new FormData();
            body.append('content', content);
            if (image) body.append('image', image, image.name);
            const response = await ApiClient.postFormData(`/bot/support/requests/${this.selectedRequestId}/messages`, body);
            if (response.data?.success) {
                input.value = '';
                imageInput.value = '';
                this.root.querySelector('[data-attach]').textContent = 'Ảnh';
                this.lastMessagesHash = '';
                await this.loadMessages(this.selectedRequestId, true);
                await this.refresh(false);
            } else if (window.showToast) {
                window.showToast(response.data?.message || 'Không gửi được tin nhắn', 'error');
            }
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    async closeRequest() {
        if (!this.selectedRequestId) return;
        if (!confirm('Bạn có chắc chắn muốn kết thúc phiên hỗ trợ này?')) return;
        const response = await ApiClient.post(`/bot/support/requests/${this.selectedRequestId}/close`, {});
        if (response.data?.success) {
            window.showToast?.('Đã kết thúc phiên hỗ trợ.', 'success');
            await this.refresh(false);
            await this.openRequest(this.selectedRequestId);
        } else if (window.showToast) {
            window.showToast(response.data?.message || 'Không thể kết thúc phiên hỗ trợ.', 'error');
        }
    }

    destroy() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
    }
}
