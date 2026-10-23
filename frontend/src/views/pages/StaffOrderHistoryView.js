export default class StaffOrderHistoryView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders, pendingBotOrders = []) {
        let html = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 class="text-lg font-black text-slate-900">Đơn hàng & hóa đơn bán lẻ</h2>
                        <p class="text-xs text-slate-600 font-semibold mt-0.5">Xác nhận đơn khách đặt qua Bot, tra cứu và in hóa đơn bán hàng</p>
                    </div>
                    <div class="relative max-w-sm w-full">
                        <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-order" placeholder="Tìm theo Mã hóa đơn hoặc SĐT..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all shadow-inner">
                    </div>
                </div>

                <section class="p-5 border-b border-amber-200 bg-amber-50/70 shrink-0" aria-labelledby="bot-pending-heading">
                    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                            <h3 id="bot-pending-heading" class="text-sm font-black text-amber-950">Đơn Bot chờ nhân viên xác nhận</h3>
                            <p class="mt-1 text-xs font-medium text-amber-900">Xác nhận đơn tại đây để chuyển sang chuẩn bị hàng và gửi thông báo cho khách.</p>
                        </div>
                        <span id="bot-pending-count" class="inline-flex items-center rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-950">${pendingBotOrders.length} đơn cần xử lý</span>
                    </div>
                    <div id="bot-pending-list" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        ${this.renderPendingBotOrders(pendingBotOrders)}
                    </div>
                </section>

                <!-- Table -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[920px]">
                        <thead>
                            <tr class="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-700 font-black">
                                <th class="p-4">Mã Hóa Đơn</th>
                                <th class="p-4">Thời Gian</th>
                                <th class="p-4">Khách Hàng</th>
                                <th class="p-4">Số Điện Thoại</th>
                                <th class="p-4">Thu Ngân</th>
                                <th class="p-4 text-right">Tổng Thanh Toán</th>
                                <th class="p-4 text-center">Trạng Thái</th>
                                <th class="p-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody id="order-table-body" class="divide-y divide-slate-100 text-sm">
                            ${this.renderRows(orders)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn -->
            <div id="invoice-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform scale-95 transition-transform duration-300" id="invoice-modal-content">
                    <!-- Nạp nội dung bằng JS -->
                </div>
            </div>

            <!-- Hidden iframe for printing -->
            <iframe id="print-frame" style="display:none;"></iframe>
        `;
        
        this.container.innerHTML = html;
    }

    renderPendingBotOrders(orders = []) {
        if (!orders.length) {
            return '<div class="rounded-xl border border-dashed border-amber-300 bg-white/70 p-4 text-sm font-semibold text-slate-600 md:col-span-2 xl:col-span-3">Hiện không có đơn Bot nào chờ xác nhận.</div>';
        }
        return orders.map((order) => {
            const customer = this.escapeHtml(order.customer_name || 'Khách hàng');
            const phone = this.escapeHtml(order.customer_phone || 'Chưa có số điện thoại');
            const expires = order.bot_reservation_expires_at
                ? new Date(`${String(order.bot_reservation_expires_at).replace(' ', 'T')}Z`).toLocaleString('vi-VN')
                : '—';
            return `<article class="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                <div class="flex items-start justify-between gap-2">
                    <div><p class="text-sm font-black text-slate-900">Đơn #${Number(order.id)}</p><p class="mt-1 text-xs font-bold text-slate-700">${customer}</p><p class="text-xs text-slate-600">${phone}</p></div>
                    <span class="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900">Chờ xác nhận</span>
                </div>
                <div class="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                    <div><p class="text-[10px] font-bold uppercase text-slate-500">Tổng đơn</p><p class="text-sm font-black text-indigo-700">${this.formatMoney(order.total_amount)}</p><p class="mt-1 text-[10px] text-slate-500">Giữ hàng đến ${this.escapeHtml(expires)}</p></div>
                    <div class="flex gap-2">
                        <button class="btn-view-invoice rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" data-id="${Number(order.id)}">Chi tiết</button>
                        <button class="btn-confirm-bot-order rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700" data-id="${Number(order.id)}">Xác nhận</button>
                    </div>
                </div>
            </article>`;
        }).join('');
    }

    escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    updatePendingBotOrders(orders = []) {
        const list = document.getElementById('bot-pending-list');
        const count = document.getElementById('bot-pending-count');
        if (list) list.innerHTML = this.renderPendingBotOrders(orders);
        if (count) count.textContent = `${orders.length} đơn cần xử lý`;
    }

    renderRows(orders) {
        if (!orders || orders.length === 0) {
            return `<tr><td colspan="8" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Chưa có đơn hàng hoặc hóa đơn nào.</span>
                <span class="text-slate-500 text-xs mt-1">Đơn Bot đang chờ xử lý được hiển thị ở khung riêng phía trên.</span>
            </div>
        </td></tr>`;
        }
        
        return orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleString('vi-VN');
            const total = this.formatMoney(o.total_amount);
            const awaitingBotConfirmation = o.status === 'pending' && Boolean(o.bot_reservation_expires_at);
            const canConfirmPayment = o.status === 'processing' || (['processing', 'shipped'].includes(o.status) && !o.has_payment);
            const status = o.status === 'pending' ? 'Chờ xác nhận'
                : o.status === 'processing' ? 'Đã xác nhận · Đang xử lý'
                    : o.status === 'shipped' ? 'Đang giao'
                        : o.status === 'delivered' ? 'Hoàn tất' : o.status || '—';
            const statusClass = o.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200'
                : o.status === 'processing' ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200';
            
            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-black text-indigo-700">${o.invoice_code}</td>
                    <td class="p-4 text-slate-700 font-medium">${dateStr}</td>
                    <td class="p-4 font-bold text-slate-900">${o.customer_name || 'Khách vãng lai'}</td>
                    <td class="p-4 text-slate-700 font-bold">${o.customer_phone || '--'}</td>
                    <td class="p-4 text-slate-700 font-semibold">${o.cashier_name || '--'}</td>
                    <td class="p-4 text-right font-black text-slate-900 text-base">${total}</td>
                    <td class="p-4 text-center"><span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass}">${status}</span></td>
                    <td class="p-4 text-center">
                        ${awaitingBotConfirmation ? `<button class="btn-confirm-bot-order mb-1 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-black" data-id="${o.id}">Xác nhận đơn</button><br>` : ''}
                        ${canConfirmPayment ? `<button class="btn-confirm-payment mb-1 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-black shadow-sm" data-id="${o.id}">Thu tiền & Hoàn tất</button><br>` : ''}
                        <button class="btn-view-invoice px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors text-xs font-black" data-id="${o.id}">
                            ${awaitingBotConfirmation ? 'Xem đơn' : 'Chi tiết hóa đơn'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderModalContent(order) {
        const dateStr = new Date(order.created_at).toLocaleString('vi-VN');
        const invoiceAvailable = ['processing', 'shipped', 'delivered'].includes(order.status);
        const canConfirmPayment = order.status === 'processing' || (['processing', 'shipped'].includes(order.status) && !order.has_payment);
        const heading = order.status === 'pending' ? 'Chi tiết đơn hàng đang chờ xác nhận' : `Hóa đơn bán hàng: ${order.invoice_code}`;
        let itemsHtml = (order.items || []).map(item => `
            <tr class="border-b border-slate-100 last:border-0">
                <td class="py-2.5 font-bold text-slate-900">${item.product_name}</td>
                <td class="py-2.5 text-center font-bold text-slate-700">${item.quantity}</td>
                <td class="py-2.5 text-right font-bold text-slate-700">${this.formatMoney(item.unit_price)}</td>
                <td class="py-2.5 text-right font-black text-indigo-700">${this.formatMoney(item.unit_price * item.quantity)}</td>
            </tr>
        `).join('');

        return `
            <div class="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
                <div>
                    <h3 class="text-lg font-black text-slate-900">${heading}</h3>
                    <p class="text-xs text-slate-600 font-semibold mt-0.5">Thời gian lập đơn: ${dateStr}</p>
                </div>
                <button id="btn-close-modal" class="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4 mb-5 text-sm">
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <p class="text-xs font-bold text-slate-600 mb-0.5 uppercase tracking-wide">Khách hàng</p>
                        <p class="font-black text-slate-900 text-sm">${order.customer_name || 'Khách vãng lai'}</p>
                        <p class="text-xs font-bold text-slate-700 mt-0.5">SĐT: ${order.customer_phone || 'Không lưu'}</p>
                    </div>
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-right">
                        <p class="text-xs font-bold text-slate-600 mb-0.5 uppercase tracking-wide">Thu ngân phụ trách</p>
                        <p class="font-black text-slate-900 text-sm">${order.cashier_name || '--'}</p>
                        <span class="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 text-[11px] font-black rounded border border-indigo-200">${order.status === 'pending' ? 'Chờ nhân viên xác nhận' : order.status === 'processing' ? 'Đã xác nhận · Đang xử lý' : order.has_payment ? 'Đã thanh toán' : 'Chưa xác nhận thanh toán'}</span>
                    </div>
                </div>

                <div class="border border-slate-200 rounded-xl overflow-hidden mb-4">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-xs uppercase">
                            <tr>
                                <th class="px-4 py-3">Sản phẩm</th>
                                <th class="px-4 py-3 text-center">SL</th>
                                <th class="px-4 py-3 text-right">Đơn giá</th>
                                <th class="px-4 py-3 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 px-4">
                            ${itemsHtml}
                        </tbody>
                        <tfoot class="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                            ${order.shipping_fee ? `
                            <tr>
                                <td colspan="3" class="px-4 py-2 text-right font-bold text-xs text-slate-600">Phí giao hàng:</td>
                                <td class="px-4 py-2 text-right text-slate-800 font-bold text-sm">${this.formatMoney(order.shipping_fee)}</td>
                            </tr>` : ''}
                            <tr>
                                <td colspan="3" class="px-4 py-3 text-right font-black uppercase text-xs text-slate-700">Tổng thanh toán:</td>
                                <td class="px-4 py-3 text-right text-indigo-700 font-black text-lg">${this.formatMoney(order.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                ${canConfirmPayment ? `
                    <button id="btn-modal-confirm-payment" class="px-5 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2" data-id="${order.id}">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Thu tiền & Hoàn tất đơn
                    </button>
                ` : ''}
                ${invoiceAvailable ? `<button id="btn-reprint" class="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    In lại hóa đơn
                </button>` : '<span class="text-xs font-semibold text-amber-800">Hóa đơn sẽ được tạo sau khi xác nhận đơn.</span>'}
            </div>
        `;
    }

    updateTable(orders) {
        document.getElementById('order-table-body').innerHTML = this.renderRows(orders);
    }

    showModal(order) {
        const modal = document.getElementById('invoice-modal');
        const content = document.getElementById('invoice-modal-content');
        
        content.innerHTML = this.renderModalContent(order);
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    }

    hideModal() {
        const modal = document.getElementById('invoice-modal');
        const content = document.getElementById('invoice-modal-content');
        
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
