export default class StaffOrderHistoryView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders, pendingBotOrders = []) {
        let html = `
            <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col h-full">
                <!-- Toolbar tìm kiếm tinh gọn -->
                <div class="p-2.5 border-b border-[#e7eaf2] flex items-center justify-between gap-3 shrink-0 bg-[#fafbfd]">
                    <div class="relative max-w-sm w-full">
                        <svg class="w-4 h-4 absolute left-3 top-2.5 text-[#7b8499]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-order" placeholder="Tìm theo Mã hóa đơn hoặc SĐT..." class="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs text-[#182033] font-bold placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] transition-all">
                    </div>
                    <span id="bot-pending-count" class="inline-flex items-center rounded-lg bg-[#f0edff] border border-[#e1dcff] px-2.5 py-1 text-xs font-black text-[#5745f5] shrink-0">${pendingBotOrders.length} đơn Bot cần xử lý</span>
                </div>

                <!-- Đơn Bot chờ nhân viên xác nhận -->
                <section class="p-3 border-b border-[#e1dcff] bg-[#f0edff]/40 shrink-0" aria-labelledby="bot-pending-heading">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <h3 id="bot-pending-heading" class="text-xs font-black text-[#182033] flex items-center gap-1.5">
                            <span class="text-[#5745f5]">✦</span>
                            <span>Đơn Bot chờ xác nhận</span>
                        </h3>
                    </div>
                    <div id="bot-pending-list" class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                        ${this.renderPendingBotOrders(pendingBotOrders)}
                    </div>
                </section>

                <!-- Table -->
                <div class="flex-1 overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[920px]">
                        <thead class="sticky top-0 bg-[#fafbfd] z-10 border-b border-[#e7eaf2]">
                            <tr class="text-[11px] uppercase tracking-wider text-[#7b8499] font-black">
                                <th class="p-3">Mã Hóa Đơn</th>
                                <th class="p-3">Thời Gian</th>
                                <th class="p-3">Khách Hàng</th>
                                <th class="p-3">SĐT</th>
                                <th class="p-3">Thu Ngân</th>
                                <th class="p-3 text-right">Tổng Tiền</th>
                                <th class="p-3 text-center">Trạng Thái</th>
                                <th class="p-3 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody id="order-table-body" class="divide-y divide-[#e7eaf2] text-xs">
                            ${this.renderRows(orders)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn -->
            <div id="invoice-modal" class="fixed inset-0 bg-[#182033]/60 backdrop-blur-xs z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-200 p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#e7eaf2] overflow-hidden transform scale-95 transition-transform duration-200" id="invoice-modal-content">
                    <!-- Dynamic content -->
                </div>
            </div>

            <!-- Frame ẩn để in -->
            <iframe id="print-frame" class="hidden"></iframe>
        `;

        this.container.innerHTML = html;
    }

    renderPendingBotOrders(orders = []) {
        if (!orders.length) {
            return '<div class="col-span-full py-2 text-center text-xs font-semibold text-[#7b8499]">Không có đơn hàng nào từ bot đang chờ xác nhận.</div>';
        }

        return orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleString('vi-VN');
            const total = this.formatMoney(order.total_amount);
            const items = (order.items || []).map((item) => `${item.quantity}x ${item.product_name}`).join(', ');
            return `
                <div class="rounded-lg border border-[#e1dcff] bg-white p-3 shadow-xs flex flex-col justify-between gap-2">
                    <div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-mono text-xs font-black text-[#5745f5]">${order.invoice_code || `#${order.id}`}</span>
                            <span class="text-[10px] font-bold text-[#7b8499]">${dateStr}</span>
                        </div>
                        <div class="mt-1 font-bold text-xs text-[#182033]">${order.customer_name || 'Khách đặt qua Bot'} ${order.customer_phone ? `· ${order.customer_phone}` : ''}</div>
                        <div class="mt-1 text-xs text-[#7b8499] line-clamp-2">${items || 'Chi tiết đơn hàng'}</div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-[#e7eaf2]">
                        <span class="font-black text-[#182033] text-xs">${total}</span>
                        <div class="flex items-center gap-1.5">
                            <button class="btn-view-invoice px-2.5 py-1 bg-[#f0edff] text-[#5745f5] rounded-md hover:bg-[#5745f5] hover:text-white transition-colors text-xs font-bold cursor-pointer" data-id="${order.id}">Chi tiết</button>
                            <button class="btn-confirm-bot-order px-2.5 py-1 bg-[#5745f5] text-white rounded-md hover:bg-[#4735e5] transition-colors text-xs font-bold shadow-xs cursor-pointer" data-id="${order.id}">Xác nhận</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRows(orders) {
        if (!orders || orders.length === 0) {
            return `<tr><td colspan="8" class="p-8 text-center text-xs text-[#7b8499] font-medium">Chưa có dữ liệu đơn hàng nào</td></tr>`;
        }

        return orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleString('vi-VN');
            const total = this.formatMoney(o.total_amount);
            
            let status = 'Đã hoàn tất';
            let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            
            if (o.status === 'cancelled') {
                status = 'Đã hủy';
                statusClass = 'bg-rose-50 text-rose-700 border-rose-200';
            } else if (o.status === 'pending') {
                status = 'Chờ xác nhận';
                statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
            } else if (o.status === 'processing') {
                status = o.has_payment ? 'Đã thanh toán · Chờ xuất' : 'Chờ thu tiền';
                statusClass = 'bg-[#f0edff] text-[#5745f5] border-[#e1dcff]';
            } else if (o.status === 'shipped') {
                status = o.has_payment ? 'Đang giao hàng' : 'Đang giao · Chưa thanh toán';
                statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
            } else if (o.status === 'delivered') {
                status = 'Giao thành công';
                statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            }

            const awaitingBotConfirmation = o.status === 'pending';
            const canConfirmPayment = o.status === 'processing' || (['processing', 'shipped'].includes(o.status) && !o.has_payment);

            return `
                <tr class="hover:bg-[#fafbfd] transition-colors">
                    <td class="p-3 font-mono font-bold text-[#5745f5]">${o.invoice_code || '--'}</td>
                    <td class="p-3 text-[#7b8499] font-medium text-[11px]">${dateStr}</td>
                    <td class="p-3 font-bold text-[#182033]">${o.customer_name || 'Khách vãng lai'}</td>
                    <td class="p-3 text-[#7b8499] font-medium text-xs">${o.customer_phone || '--'}</td>
                    <td class="p-3 text-[#7b8499] font-medium text-xs">${o.cashier_name || '--'}</td>
                    <td class="p-3 text-right font-black text-[#182033] text-xs">${total}</td>
                    <td class="p-3 text-center"><span class="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass}">${status}</span></td>
                    <td class="p-3 text-center whitespace-nowrap">
                        ${awaitingBotConfirmation ? `<button class="btn-confirm-bot-order mb-1 px-2.5 py-1 bg-[#5745f5] text-white rounded-md hover:bg-[#4735e5] transition-colors text-xs font-bold cursor-pointer" data-id="${o.id}">Xác nhận</button> ` : ''}
                        ${canConfirmPayment ? `<button class="btn-confirm-payment mb-1 px-2.5 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-xs font-bold shadow-xs cursor-pointer" data-id="${o.id}">Thu tiền</button> ` : ''}
                        <button class="btn-view-invoice px-2.5 py-1 bg-[#f0edff] border border-[#e1dcff] text-[#5745f5] rounded-md hover:bg-[#5745f5] hover:text-white transition-colors text-xs font-bold cursor-pointer" data-id="${o.id}">
                            ${awaitingBotConfirmation ? 'Xem đơn' : 'Chi tiết'}
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
        const heading = order.status === 'pending' ? 'Chi tiết đơn hàng đang chờ xác nhận' : `Hóa đơn: ${order.invoice_code}`;
        let itemsHtml = (order.items || []).map(item => `
            <tr class="border-b border-[#e7eaf2] last:border-0">
                <td class="py-2 font-bold text-[#182033]">${item.product_name}</td>
                <td class="py-2 text-center font-bold text-[#7b8499]">${item.quantity}</td>
                <td class="py-2 text-right font-bold text-[#7b8499]">${this.formatMoney(item.unit_price)}</td>
                <td class="py-2 text-right font-black text-[#5745f5]">${this.formatMoney(item.unit_price * item.quantity)}</td>
            </tr>
        `).join('');

        return `
            <div class="p-4 border-b border-[#e7eaf2] flex justify-between items-start bg-[#fafbfd]">
                <div>
                    <h3 class="text-sm font-black text-[#182033]">${heading}</h3>
                    <p class="text-[11px] text-[#7b8499] font-medium mt-0.5">Thời gian: ${dateStr}</p>
                </div>
                <button id="btn-close-modal" class="p-1 text-[#7b8499] hover:bg-slate-100 hover:text-[#182033] rounded-md transition-colors cursor-pointer">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-4 space-y-3">
                <div class="grid grid-cols-2 gap-3 text-xs">
                    <div class="bg-[#f5f6fa] p-2.5 rounded-lg border border-[#e7eaf2]">
                        <p class="text-[10px] font-bold text-[#7b8499] uppercase">Khách hàng</p>
                        <p class="font-bold text-[#182033]">${order.customer_name || 'Khách vãng lai'}</p>
                        <p class="text-[11px] text-[#7b8499]">SĐT: ${order.customer_phone || 'Không lưu'}</p>
                    </div>
                    <div class="bg-[#f5f6fa] p-2.5 rounded-lg border border-[#e7eaf2] text-right">
                        <p class="text-[10px] font-bold text-[#7b8499] uppercase">Thu ngân</p>
                        <p class="font-bold text-[#182033]">${order.cashier_name || '--'}</p>
                        <span class="inline-block mt-0.5 px-2 py-0.5 bg-[#f0edff] text-[#5745f5] text-[10px] font-bold rounded border border-[#e1dcff]">${order.status === 'pending' ? 'Chờ xác nhận' : order.has_payment ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                    </div>
                </div>

                <div class="border border-[#e7eaf2] rounded-lg overflow-hidden">
                    <table class="w-full text-xs text-left">
                        <thead class="bg-[#fafbfd] text-[#7b8499] font-black border-b border-[#e7eaf2] uppercase text-[10px]">
                            <tr>
                                <th class="px-3 py-2">Sản phẩm</th>
                                <th class="px-3 py-2 text-center">SL</th>
                                <th class="px-3 py-2 text-right">Đơn giá</th>
                                <th class="px-3 py-2 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#e7eaf2] px-3">
                            ${itemsHtml}
                        </tbody>
                        <tfoot class="bg-[#fafbfd] border-t border-[#e7eaf2] font-bold text-[#182033]">
                            ${order.shipping_fee ? `
                            <tr>
                                <td colspan="3" class="px-3 py-1.5 text-right font-bold text-xs text-[#7b8499]">Phí giao hàng:</td>
                                <td class="px-3 py-1.5 text-right text-[#182033] font-bold text-xs">${this.formatMoney(order.shipping_fee)}</td>
                            </tr>` : ''}
                            <tr>
                                <td colspan="3" class="px-3 py-2 text-right font-black uppercase text-xs text-[#7b8499]">Tổng thanh toán:</td>
                                <td class="px-3 py-2 text-right text-[#5745f5] font-black text-base">${this.formatMoney(order.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="p-3 border-t border-[#e7eaf2] bg-[#fafbfd] flex justify-end gap-2">
                ${canConfirmPayment ? `
                    <button id="btn-modal-confirm-payment" class="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-1 cursor-pointer" data-id="${order.id}">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Thu tiền & Hoàn tất
                    </button>
                ` : ''}
                ${invoiceAvailable ? `<button id="btn-reprint" class="px-3.5 py-1.5 bg-[#5745f5] text-white font-bold text-xs rounded-lg hover:bg-[#4735e5] shadow-xs transition-all flex items-center gap-1 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    In hóa đơn
                </button>` : ''}
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
