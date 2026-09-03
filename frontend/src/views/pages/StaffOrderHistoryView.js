export default class StaffOrderHistoryView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders) {
        let html = `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 class="text-lg font-bold text-slate-800">Lịch sử hóa đơn bán lẻ</h2>
                        <p class="text-sm text-slate-500 mt-1">Quản lý và tra cứu các đơn hàng trả thẳng</p>
                    </div>
                    <div class="relative max-w-sm w-full">
                        <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-order" placeholder="Tìm theo Mã hóa đơn hoặc SĐT..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors">
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th class="p-4">Mã Hóa Đơn</th>
                                <th class="p-4">Ngày Mua</th>
                                <th class="p-4">Khách Hàng</th>
                                <th class="p-4">SĐT</th>
                                <th class="p-4">Thu Ngân</th>
                                <th class="p-4 text-right">Tổng Tiền</th>
                                <th class="p-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody id="order-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                            ${this.renderRows(orders)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn -->
            <div id="invoice-modal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform scale-95 transition-transform duration-300" id="invoice-modal-content">
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
            return `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-medium">Không có dữ liệu hóa đơn nào.</td></tr>`;
        }
        
        return orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleString('vi-VN');
            const total = this.formatMoney(o.total_amount);
            
            return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-indigo-600">${o.invoice_code}</td>
                    <td class="p-4 text-slate-500">${dateStr}</td>
                    <td class="p-4 font-medium">${o.customer_name || 'Khách lẻ'}</td>
                    <td class="p-4">${o.customer_phone || '--'}</td>
                    <td class="p-4">${o.cashier_name || '--'}</td>
                    <td class="p-4 text-right font-bold text-slate-800">${total}</td>
                    <td class="p-4 text-center">
                        <button class="btn-view-invoice px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-600 hover:text-white transition-colors text-xs font-semibold" data-id="${o.id}">
                            Xem chi tiết
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderModalContent(order) {
        const dateStr = new Date(order.created_at).toLocaleString('vi-VN');
        let itemsHtml = order.items.map(item => `
            <tr>
                <td class="py-2">${item.product_name}</td>
                <td class="py-2 text-center">${item.quantity}</td>
                <td class="py-2 text-right font-medium">${this.formatMoney(item.unit_price)}</td>
                <td class="py-2 text-right font-bold">${this.formatMoney(item.unit_price * item.quantity)}</td>
            </tr>
        `).join('');

        return `
            <div class="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">Chi tiết Hóa đơn ${order.invoice_code}</h3>
                    <p class="text-sm text-slate-500 mt-1">Ngày mua: ${dateStr}</p>
                </div>
                <button id="btn-close-modal" class="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p class="text-slate-500 mb-1">Khách hàng</p>
                        <p class="font-bold text-slate-800">${order.customer_name || 'Khách lẻ'}</p>
                        <p class="text-slate-600">${order.customer_phone || ''}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-right">
                        <p class="text-slate-500 mb-1">Thu ngân</p>
                        <p class="font-bold text-slate-800">${order.cashier_name || '--'}</p>
                        <p class="text-slate-600">Trạng thái: Hoàn thành</p>
                    </div>
                </div>

                <div class="border border-slate-200 rounded-lg overflow-hidden">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
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
                        <tfoot class="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                            <tr>
                                <td colspan="3" class="px-4 py-3 text-right">Tổng cộng:</td>
                                <td class="px-4 py-3 text-right text-rose-600 text-base">${this.formatMoney(order.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button id="btn-reprint" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
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
        
        // Timeout for animation
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
