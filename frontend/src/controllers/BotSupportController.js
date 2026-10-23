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
            <div class="h-full min-h-[520px] grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-4">
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div><h2 class="font-black text-slate-900">Hỗ trợ khách từ Bot</h2><p class="text-xs text-slate-500 mt-1">Yêu cầu mới sẽ hiện tự động</p></div>
                        <button data-refresh class="text-sm text-indigo-600 font-bold hover:underline">Tải lại</button>
                    </div>
                    <div data-request-list class="flex-1 overflow-y-auto divide-y divide-slate-100"></div>
                </section>
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <header data-chat-header class="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div><h2 data-chat-title class="font-black text-slate-900">Chọn yêu cầu hỗ trợ</h2><p data-chat-subtitle class="text-xs text-slate-500 mt-1">Bạn có thể trao đổi trực tiếp với khách tại đây.</p></div>
                        <div class="flex items-center gap-2">
                            <button data-decline class="hidden rounded-lg bg-rose-50 hover:bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700">Từ chối</button>
                            <button data-accept class="hidden rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Nhận phiên</button>
                            <button data-close class="hidden rounded-lg bg-slate-100 hover:bg-rose-50 px-3 py-2 text-xs font-bold text-slate-700 hover:text-rose-700">Kết thúc phiên</button>
                        </div>
                    </header>
                    <div data-chat-messages class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"></div>
                    <form data-chat-form class="hidden p-3 border-t border-slate-100 flex gap-2">
                        <button type="button" data-attach class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50" title="Gửi ảnh JPG, PNG hoặc WEBP, tối đa 5 MB">Ảnh</button>
                        <input data-chat-image type="file" accept="image/jpeg,image/png,image/webp" class="hidden">
                        <input data-chat-input maxlength="1000" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Nhập tin nhắn cho khách..." autocomplete="off">
                        <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Gửi</button>
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
            list.innerHTML = '<div class="p-8 text-center text-sm text-slate-400">Chưa có yêu cầu hỗ trợ nào.</div>';
            return;
        }
        list.innerHTML = this.requests.map((request) => {
            const active = Number(request.id) === this.selectedRequestId;
            const status = request.status === 'open' ? 'Chờ nhân viên nhận' : request.status === 'in_progress' ? `Đang trao đổi${request.assigned_staff_name ? ` · ${this.escape(request.assigned_staff_name)}` : ''}` : request.decision === 'declined' ? 'Đã từ chối' : 'Đã đóng';
            return `<button data-request-id="${Number(request.id)}" class="w-full text-left p-4 hover:bg-indigo-50 ${active ? 'bg-indigo-50' : ''}">
                <div class="flex items-center justify-between gap-2"><span class="font-bold text-sm text-slate-800 truncate">${this.escape(request.customer_name || 'Khách vãng lai')}</span><span class="text-[10px] font-bold text-indigo-600">#${Number(request.id)}</span></div>
                <p class="text-xs text-slate-500 truncate mt-1">${this.escape(request.last_message || '')}</p>
                <div class="flex justify-between mt-2 text-[10px] text-slate-400"><span>${status}${request.last_sender_type === 'customer' ? ' · Khách vừa nhắn' : ''}</span><span>${this.escape(request.updated_at || '')}</span></div>
            </button>`;
        }).join('');
    }

    async openRequest(id) {
        this.selectedRequestId = id;
        const request = this.requests.find((entry) => Number(entry.id) === id);
        this.root.querySelector('[data-chat-title]').textContent = `${request?.customer_name || 'Khách'} · Yêu cầu #${id}`;
        this.updateSelectedControls(request);
        this.root.querySelector('[data-chat-messages]').innerHTML = '<div class="text-sm text-slate-400">Đang tải hội thoại...</div>';
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
                const image = message.image_url ? `<img src="${this.escape(message.image_url)}" alt="Ảnh đính kèm" loading="lazy" class="mt-2 max-h-64 max-w-full rounded-lg object-contain" onerror="this.remove()">` : '';
                return `<div class="flex ${isStaff ? 'justify-end' : 'justify-start'}"><div class="max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isStaff ? 'bg-indigo-600 text-white' : isSystem ? 'bg-amber-50 text-amber-800' : 'bg-white border border-slate-200 text-slate-800'}"><div class="text-[10px] font-bold opacity-70 mb-1">${isStaff ? 'Nhân viên' : isSystem ? 'Hệ thống' : 'Khách'}</div>${message.content ? `<div class="whitespace-pre-wrap break-words">${this.escape(message.content)}</div>` : ''}${image}</div></div>`;
            }).join('') || '<div class="text-sm text-slate-400">Chưa có tin nhắn.</div>';
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
