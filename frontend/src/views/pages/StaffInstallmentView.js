export default class StaffInstallmentView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    formatMoney(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
    }

    render(orders) {
        this.container.innerHTML = `
            <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                <header class="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div>
                        <h2 class="text-lg font-black text-slate-900">Hồ sơ trả góp qua đối tác</h2>
                        <p class="text-sm text-slate-600 mt-1">Cửa hàng hỗ trợ đăng ký và xuất hóa đơn; đối tác tài chính xét duyệt, giải ngân và thu các kỳ thanh toán.</p>
                    </div>
                    <div class="flex gap-2">
                        <select id="filter-status" class="px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold">
                            <option value="all">Tất cả hồ sơ</option>
                            <option value="approved">Đã duyệt · demo</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="rejected">Bị từ chối</option>
                        </select>
                        <input id="search-installment" type="search" placeholder="Tìm khách, hóa đơn, mã hồ sơ" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    </div>
                </header>
                <div class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-900">
                    Dữ liệu đối tác và giải ngân trên màn hình này là mô phỏng. Không có kết nối ngân hàng/công ty tài chính và không theo dõi hoặc thu nợ hàng tháng.
                </div>
                <div class="overflow-auto flex-1">
                    <table class="w-full min-w-[950px] text-left">
                        <thead class="sticky top-0 bg-slate-100 text-xs uppercase text-slate-700">
                            <tr><th class="p-3">Khách hàng</th><th class="p-3">Hóa đơn</th><th class="p-3">Đối tác / Hồ sơ</th><th class="p-3">Kỳ hạn</th><th class="p-3">Trả trước</th><th class="p-3">Đối tác giải ngân</th><th class="p-3">Trạng thái</th></tr>
                        </thead>
                        <tbody id="installment-table-body" class="divide-y divide-slate-100 text-sm">${this.renderRows(orders)}</tbody>
                    </table>
                </div>
            </section>`;
    }

    renderRows(orders) {
        if (!orders?.length) return '<tr><td colspan="7" class="p-10 text-center text-slate-500">Chưa có hồ sơ trả góp.</td></tr>';
        const badges = {
            approved: '<span class="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">Đã duyệt · demo</span>',
            pending: '<span class="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold">Chờ xử lý</span>',
            rejected: '<span class="px-2 py-1 rounded bg-rose-100 text-rose-800 font-bold">Bị từ chối</span>',
            cancelled: '<span class="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold">Đã hủy</span>'
        };
        return orders.map(order => `
            <tr class="hover:bg-slate-50">
                <td class="p-3"><strong>${order.customer_name || 'Khách lẻ'}</strong><div class="text-xs text-slate-500">${order.customer_phone || ''}</div></td>
                <td class="p-3 font-bold text-indigo-700">${order.invoice_code || `#${order.id}`}</td>
                <td class="p-3">${order.finance_partner || 'Đối tác demo'}<div class="text-xs text-slate-500">${order.finance_application_code || '—'}</div></td>
                <td class="p-3">${order.installment_term || '—'} tháng</td>
                <td class="p-3">${this.formatMoney(order.down_payment)}</td>
                <td class="p-3">${this.formatMoney(order.financed_amount ?? (Number(order.total_amount) - Number(order.down_payment || 0)))}</td>
                <td class="p-3">${badges[order.financing_status] || badges.pending}</td>
            </tr>`).join('');
    }

    updateTable(orders) {
        const table = this.container.querySelector('#installment-table-body');
        if (table) table.innerHTML = this.renderRows(orders);
    }
}
