import ApiClient from '../core/ApiClient.js';

export default class BotSupportController {
    constructor() {
        this.root = document.getElementById('content-area');
        this.selectedRequestId = null;
        this.requests = [];
        this.renderShell();
        this.bindEvents();
        this.refresh();
        this.pollingInterval = setInterval(() => this.refresh(), 4000);
    }

    renderShell() {
        this.root.innerHTML = `
            <div class="h-full min-h-[520px] grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 p-1 max-w-[1600px] mx-auto w-full">
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
                <section class="bg-white rounded-2xl border border-[#e7eaf2] shadow-sm overflow-hidden flex flex-col">
                    <header data-chat-header class="p-4 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between">
                        <div>
                            <h2 data-chat-title class="font-black text-sm text-[#182033]">Chọn yêu cầu hỗ trợ</h2>
                            <p data-chat-subtitle class="text-[11px] text-[#7b8499] mt-0.5">Bạn có thể trao đổi trực tiếp và gửi ảnh cho khách tại đây.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button data-decline class="hidden rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer">Từ chối</button>
                            <button data-accept class="hidden rounded-xl bg-[#149c79] hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm">Nhận phiên</button>
                            <button data-close class="hidden rounded-xl bg-[#f5f6fa] hover:bg-rose-50 border border-[#e7eaf2] px-3 py-1.5 text-xs font-bold text-[#182033] hover:text-rose-700 transition-colors cursor-pointer">Kết thúc phiên</button>
                        </div>
                    </header>
                    <div data-chat-messages class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfd]"></div>
                    <form data-chat-form class="hidden p-3 border-t border-[#e7eaf2] flex gap-2 bg-white">
                        <button type="button" data-attach class="rounded-xl bg-[#f5f6fa] border border-[#e7eaf2] px-3 py-2 text-xs font-bold text-[#182033] hover:bg-[#f0edff] hover:text-[#5745f5] transition-colors cursor-pointer" title="Gửi ảnh JPG, PNG hoặc WEBP, tối đa 5 MB">Ảnh</button>
                        <input data-chat-image type="file" accept="image/jpeg,image/png,image/webp" class="hidden">
                        <input data-chat-input maxlength="1000" class="flex-1 rounded-xl border border-[#e7eaf2] px-4 py-2 text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="Nhập tin nhắn cho khách..." autocomplete="off">
                        <button class="rounded-xl bg-[#5745f5] hover:bg-[#4736e8] px-5 py-2 text-xs font-bold text-white transition-colors shadow-sm shadow-[#5745f5]/20 cursor-pointer">Gửi</button>
                    </form>
                </section>
            </div>`;
    }

    bindEvents() {
        this.root.querySelector('[data-refresh]').addEventListener('click', () => this.refresh());
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

    async refresh() {
        const response = await ApiClient.get('/bot/support/requests');
        if (!response.data?.success) return;
        this.requests = response.data.data || [];
        this.renderRequests();
        if (this.selectedRequestId) {
            const selected = this.requests.find((request) => Number(request.id) === this.selectedRequestId);
            this.updateSelectedControls(selected);
            await this.loadMessages(this.selectedRequestId);
        }
    }

    renderRequests() {
        const list = this.root.querySelector('[data-request-list]');
        if (!this.requests.length) {
            list.innerHTML = '<div class="p-8 text-center text-xs text-[#7b8499]">Chưa có yêu cầu hỗ trợ nào từ khách.</div>';
            return;
        }
        list.innerHTML = this.requests.map((request) => {
            const active = Number(request.id) === this.selectedRequestId;
            const status = request.status === 'open' ? 'Chờ nhân viên nhận' : request.status === 'in_progress' ? `Đang trao đổi${request.assigned_staff_name ? ` · ${this.escape(request.assigned_staff_name)}` : ''}` : request.decision === 'declined' ? 'Đã từ chối' : 'Đã đóng';
            return `<button data-request-id="${Number(request.id)}" class="w-full text-left p-3.5 hover:bg-[#f8f9fc] transition-colors cursor-pointer ${active ? 'bg-[#f0edff] border-l-4 border-l-[#5745f5]' : ''}">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-xs text-[#182033] truncate">${this.escape(request.customer_name || 'Khách vãng lai')}</span>
                    <span class="text-[10px] font-mono font-bold text-[#5745f5]">#${Number(request.id)}</span>
                </div>
                <p class="text-[11px] text-[#7b8499] truncate mt-1">${this.escape(request.last_message || 'Không có tin nhắn gần đây')}</p>
                <div class="flex justify-between mt-2 text-[10px] text-[#7b8499]">
                    <span class="font-medium">${status}${request.last_sender_type === 'customer' ? ' · <b class="text-[#5745f5]">Khách vừa nhắn</b>' : ''}</span>
                    <span class="font-mono">${this.escape(request.updated_at || '')}</span>
                </div>
            </button>`;
        }).join('');
    }

    async openRequest(id) {
        this.selectedRequestId = id;
        const request = this.requests.find((entry) => Number(entry.id) === id);
        this.root.querySelector('[data-chat-title]').textContent = `${request?.customer_name || 'Khách'} · Yêu cầu #${id}`;
        this.updateSelectedControls(request);
        this.root.querySelector('[data-chat-messages]').innerHTML = '<div class="text-xs text-[#7b8499] p-2">Đang tải hội thoại...</div>';
        await this.loadMessages(id, true);
        this.renderRequests();
    }

    updateSelectedControls(request) {
        const isOpen = request?.status === 'open';
        const isAssignedToMe = request?.status === 'in_progress' && Number(request.assigned_to_me) === 1;
        const subtitle = isOpen
            ? 'Khách đang chờ. Xem nội dung rồi nhận hoặc từ chối phiên.'
            : isAssignedToMe
                ? 'Bạn đang phụ trách phiên này và có thể trả lời khách.'
                : request?.status === 'in_progress'
                    ? `Đang được ${request.assigned_staff_name || 'nhân viên khác'} xử lý.`
                    : 'Phiên hỗ trợ đã kết thúc.';
        this.root.querySelector('[data-chat-subtitle]').textContent = subtitle;
        this.root.querySelector('[data-accept]').classList.toggle('hidden', !isOpen);
        this.root.querySelector('[data-decline]').classList.toggle('hidden', !isOpen);
        this.root.querySelector('[data-chat-form]').classList.toggle('hidden', !isAssignedToMe);
        this.root.querySelector('[data-close]').classList.toggle('hidden', !isAssignedToMe);
    }

    async decideRequest(action) {
        if (!this.selectedRequestId) return;
        const button = this.root.querySelector(`[data-${action}]`);
        button.disabled = true;
        try {
            const response = await ApiClient.post(`/bot/support/requests/${this.selectedRequestId}/${action}`, {});
            if (response.data?.success) {
                await this.refresh();
                await this.openRequest(this.selectedRequestId);
            } else if (window.showToast) {
                window.showToast(response.data?.message || 'Không cập nhật được yêu cầu.', 'error');
                await this.refresh();
            }
        } finally {
            button.disabled = false;
        }
    }

    async loadMessages(id, replace = false) {
        const response = await ApiClient.get(`/bot/support/requests/${id}/messages`);
        if (!response.data?.success || id !== this.selectedRequestId) return;
        const messages = response.data.data || [];
        const history = this.root.querySelector('[data-chat-messages]');
        if (replace) history.innerHTML = '';
        if (replace || messages.length) {
            history.innerHTML = messages.map((message) => {
                const isStaff = message.sender_type === 'staff';
                const isSystem = message.sender_type === 'system';
                const image = message.image_url ? `<img src="${this.escape(message.image_url)}" alt="Ảnh đính kèm" loading="lazy" class="mt-2 max-h-64 max-w-full rounded-xl object-contain border border-black/10" onerror="this.remove()">` : '';
                return `
                    <div class="flex ${isStaff ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${isStaff ? 'bg-[#5745f5] text-white' : isSystem ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-white border border-[#e7eaf2] text-[#182033]'}">
                            <div class="text-[10px] font-bold opacity-75 mb-1">${isStaff ? 'Nhân viên bán hàng' : isSystem ? 'Hệ thống AI' : 'Khách hàng'}</div>
                            ${message.content ? `<div class="whitespace-pre-wrap break-words leading-relaxed">${this.escape(message.content)}</div>` : ''}
                            ${image}
                        </div>
                    </div>
                `;
            }).join('') || '<div class="text-xs text-[#7b8499] text-center py-4">Chưa có tin nhắn trong phiên này.</div>';
            history.scrollTop = history.scrollHeight;
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
                await this.loadMessages(this.selectedRequestId, true);
                await this.refresh();
            } else if (window.showToast) window.showToast(response.data?.message || 'Không gửi được tin nhắn', 'error');
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    async closeRequest() {
        if (!this.selectedRequestId) return;
        const response = await ApiClient.post(`/bot/support/requests/${this.selectedRequestId}/close`, {});
        if (response.data?.success) {
            await this.refresh();
            await this.openRequest(this.selectedRequestId);
        }
    }

    destroy() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
    }
}
