export default class StaffOrderHistoryView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders) {
        let html = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 class="text-lg font-black text-slate-900">Lịch sử hóa đơn bán lẻ</h2>
                        <p class="text-xs text-slate-600 font-semibold mt-0.5">Tra cứu, xem lại chi tiết và in lại hóa đơn của khách hàng</p>
                    </div>
                    <div class="relative max-w-sm w-full">
                        <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-order" placeholder="Tìm theo Mã hóa đơn hoặc SĐT..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all shadow-inner">
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-700 font-black">
                                <th class="p-4">Mã Hóa Đơn</th>
                                <th class="p-4">Thời Gian</th>
                                <th class="p-4">Khách Hàng</th>
                                <th class="p-4">Số Điện Thoại</th>
                                <th class="p-4">Thu Ngân</th>
                                <th class="p-4 text-right">Tổng Thanh Toán</th>
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

    renderRows(orders) {
        if (!orders || orders.length === 0) {
            return `<tr><td colspan="7" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Chưa có giao dịch hóa đơn nào.</span>
                <span class="text-slate-500 text-xs mt-1">Các hóa đơn thanh toán từ màn hình POS sẽ hiển thị tại đây</span>
            </div>
        </td></tr>`;
        }
        
        return orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleString('vi-VN');
            const total = this.formatMoney(o.total_amount);
            
            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-black text-indigo-700">${o.invoice_code}</td>
                    <td class="p-4 text-slate-700 font-medium">${dateStr}</td>
                    <td class="p-4 font-bold text-slate-900">${o.customer_name || 'Khách vãng lai'}</td>
                    <td class="p-4 text-slate-700 font-bold">${o.customer_phone || '--'}</td>
                    <td class="p-4 text-slate-700 font-semibold">${o.cashier_name || '--'}</td>
                    <td class="p-4 text-right font-black text-slate-900 text-base">${total}</td>
                    <td class="p-4 text-center">
                        <button class="btn-view-invoice px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors text-xs font-black" data-id="${o.id}">
                            Chi tiết
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderModalContent(order) {
        const dateStr = new Date(order.created_at).toLocaleString('vi-VN');
        let itemsHtml = order.items.map(item => `
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
                    <h3 class="text-lg font-black text-slate-900">Hóa đơn bán hàng: ${order.invoice_code}</h3>
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
                        <span class="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-black rounded border border-emerald-200">Đã thanh toán</span>
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
                            <tr>
                                <td colspan="3" class="px-4 py-3 text-right font-black uppercase text-xs text-slate-700">Tổng thanh toán:</td>
                                <td class="px-4 py-3 text-right text-indigo-700 font-black text-lg">${this.formatMoney(order.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button id="btn-reprint" class="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    In lại hóa đơn
                </button>
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
