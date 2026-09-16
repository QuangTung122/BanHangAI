export default class StaffReturnWarrantyView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders = []) {
        this.container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800">Đổi trả hàng & Bảo hành</h2>
                            <p class="text-sm text-slate-500 mt-1">Xử lý yêu cầu của khách hàng sau khi mua hàng</p>
                        </div>
                        <div class="flex gap-2">
                            <button data-tab="return" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-sm">Đổi / Trả</button>
                            <button data-tab="warranty" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">Bảo hành</button>
                        </div>
                    </div>

                    <div class="p-5 md:p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6">
                            <div class="space-y-4">
                                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tìm hóa đơn</label>
                                    <div class="flex gap-2">
                                        <input id="return-search" type="text" placeholder="Mã hóa đơn / SĐT / tên khách" class="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10" />
                                        <button id="btn-search-return" class="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Tìm</button>
                                    </div>
                                </div>

                                <div id="return-order-list" class="space-y-3 min-h-[300px]">
                                    ${this.renderOrderList(orders)}
                                </div>
                            </div>

                            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[420px]">
                                <div id="return-detail-panel">
                                    <div class="flex items-center justify-center h-full text-slate-400 text-sm py-12">
                                        Chọn hóa đơn để xem chi tiết sản phẩm và xử lý yêu cầu.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrderList(orders) {
        if (!orders || orders.length === 0) {
            return `
                <div class="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                    Chưa có hóa đơn nào phù hợp.
                </div>
            `;
        }

        return orders.slice(0, 8).map(order => `
            <button class="order-card w-full text-left border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all bg-white" data-order-id="${order.id}">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <div class="font-bold text-slate-800">${order.invoice_code || `INV-${order.id}`}</div>
                        <div class="text-xs text-slate-500 mt-1">${new Date(order.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                    <span class="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Hoàn thành</span>
                </div>
                <div class="mt-3 text-sm text-slate-600">
                    <div>Khách: ${order.customer_name || 'Khách lẻ'}</div>
                    <div>SĐT: ${order.customer_phone || '--'}</div>
                </div>
            </button>
        `).join('');
    }

    renderDetail(order) {
        const items = order.items || [];

        const itemHtml = items.map(item => `
            <div class="border border-slate-200 rounded-xl p-3 bg-white">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <div class="font-bold text-slate-800">${item.product_name || 'Sản phẩm'}</div>
                        <div class="text-xs text-slate-500 mt-1">Số lượng: ${item.quantity} • Đơn giá: ${this.formatMoney(item.unit_price)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-500">Bảo hành</div>
                        <div class="text-sm font-bold text-indigo-600">12 tháng</div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-3">
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700" data-action="exchange" data-item-id="${item.id}">Đổi hàng</button>
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700" data-action="refund" data-item-id="${item.id}">Trả hàng</button>
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700" data-action="warranty" data-item-id="${item.id}">Bảo hành</button>
                </div>
            </div>
        `).join('');

        this.container.querySelector('#return-detail-panel').innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                        <div class="text-xs uppercase tracking-wider text-slate-500">Hóa đơn</div>
                        <div class="text-lg font-bold text-slate-800">${order.invoice_code || `INV-${order.id}`}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs uppercase tracking-wider text-slate-500">Tổng tiền</div>
                        <div class="text-lg font-bold text-rose-600">${this.formatMoney(order.total_amount || 0)}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-white border border-slate-200 rounded-xl p-3">
                        <div class="text-slate-500">Khách hàng</div>
                        <div class="font-bold text-slate-800">${order.customer_name || 'Khách lẻ'}</div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-xl p-3">
                        <div class="text-slate-500">SĐT</div>
                        <div class="font-bold text-slate-800">${order.customer_phone || '--'}</div>
                    </div>
                </div>

                <div class="space-y-3">
                    ${itemHtml || '<div class="text-sm text-slate-400">Không có sản phẩm trong đơn hàng.</div>'}
                </div>
            </div>
        `;
    }

    showForm(type, item) {
        const panel = this.container.querySelector('#return-detail-panel');
        panel.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs uppercase tracking-wider text-slate-500">Xử lý</div>
                        <div class="text-xl font-bold text-slate-800">${type === 'exchange' ? 'Đổi hàng' : type === 'refund' ? 'Trả hàng' : 'Bảo hành'}</div>
                    </div>
                    <button class="close-form-btn px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">Quay lại</button>
                </div>

                <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sản phẩm</label>
                        <div class="font-bold text-slate-800">${item.product_name || 'Sản phẩm'}</div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lý do</label>
                        <textarea id="return-reason" rows="3" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10" placeholder="Nhập lý do chi tiết..."></textarea>
                    </div>

                    ${type === 'exchange' ? `
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sản phẩm thay thế</label>
                            <select id="return-exchange-product" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10">
                                <option value="">-- Chọn sản phẩm thay thế --</option>
                                <option value="1">iPhone 15 Pro</option>
                                <option value="2">AirPods Pro 2</option>
                                <option value="3">Tai nghe Sony WH-1000XM4</option>
                            </select>
                        </div>
                    ` : ''}

                    ${type === 'warranty' ? `
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Loại lỗi</label>
                            <select id="warranty-type" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10">
                                <option value="repair">Sửa chữa</option>
                                <option value="replace">Đổi mới</option>
                                <option value="inspection">Kiểm tra kỹ thuật</option>
                            </select>
                        </div>
                    ` : ''}

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trạng thái hàng</label>
                        <select id="return-condition" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10">
                            <option value="new">Mới</option>
                            <option value="used">Đã dùng</option>
                            <option value="defective">Lỗi kỹ thuật</option>
                            <option value="damaged">Hư hỏng</option>
                        </select>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button class="submit-return-btn flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700">Xác nhận</button>
                        <button class="cancel-return-btn flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200">Hủy</button>
                    </div>
                </div>
            </div>
        `;
    }

    formatMoney(amount = 0) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
