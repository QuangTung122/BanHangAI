export default class StaffInstallmentView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    formatMoney(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
    }

    render(orders) {
        this.container.innerHTML = `
            <section class="bg-white rounded-xl border border-[#e7eaf2] shadow-xs overflow-hidden h-full flex flex-col">
                <!-- Toolbar lọc và tìm kiếm tinh gọn -->
                <header class="p-2.5 border-b border-[#e7eaf2] flex items-center justify-between gap-2.5 bg-[#fafbfd]">
                    <div class="flex items-center gap-2">
                        <select id="filter-status" class="px-2.5 py-1.5 border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:border-[#5745f5] bg-white cursor-pointer">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="approved">Đã duyệt (Demo)</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="rejected">Bị từ chối</option>
                        </select>
                        <input id="search-installment" type="search" placeholder="Tìm tên khách, hóa đơn..." class="w-64 px-3 py-1.5 border border-[#e7eaf2] rounded-lg text-xs text-[#182033] focus:border-[#5745f5] bg-white">
                    </div>
                    <span class="text-[11px] font-bold text-[#5745f5] bg-[#f0edff] border border-[#e1dcff] px-2.5 py-1 rounded-lg">Mô phỏng tài chính đối tác POS</span>
                </header>

                <div class="overflow-auto flex-1 custom-scrollbar">
                    <table class="w-full min-w-[950px] text-left">
                        <thead class="sticky top-0 bg-[#fafbfd] text-[11px] uppercase text-[#7b8499] font-black border-b border-[#e7eaf2]">
                            <tr>
                                <th class="p-3">Khách hàng</th>
                                <th class="p-3">Hóa đơn</th>
                                <th class="p-3">Đối tác / Hồ sơ</th>
                                <th class="p-3">Kỳ hạn</th>
                                <th class="p-3">Trả trước</th>
                                <th class="p-3">Đối tác giải ngân</th>
                                <th class="p-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody id="installment-table-body" class="divide-y divide-[#e7eaf2] text-xs">${this.renderRows(orders)}</tbody>
                    </table>
                </div>
            </section>`;
    }

    renderRows(orders) {
        if (!orders?.length) return '<tr><td colspan="7" class="p-8 text-center text-[#7b8499] font-medium text-xs">Chưa có hồ sơ trả góp nào.</td></tr>';
        const badges = {
            approved: '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Đã duyệt (Demo)</span>',
            pending: '<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">Chờ xử lý</span>',
            rejected: '<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Bị từ chối</span>',
            cancelled: '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">Đã hủy</span>'
        };

        return orders.map((order) => {
            const statusBadge = badges[order.status] || `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">${order.status || 'Chờ xử lý'}</span>`;
            return `
                <tr class="hover:bg-[#fafbfd] transition-colors">
                    <td class="p-3 font-bold text-[#182033]">
                        <div>${order.customer_name || 'Khách tại quầy'}</div>
                        <div class="text-[11px] text-[#7b8499]">${order.customer_phone || ''}</div>
                    </td>
                    <td class="p-3 font-mono font-bold text-[#5745f5]">${order.invoice_code || `#${order.id}`}</td>
                    <td class="p-3 text-[#182033]">
                        <div class="font-bold">${order.finance_partner || 'Home Credit (mô phỏng)'}</div>
                        <div class="text-[10px] text-[#7b8499] font-mono">${order.finance_application_code || '--'}</div>
                    </td>
                    <td class="p-3 text-[#182033] font-bold">${order.installment_term || 6} tháng</td>
                    <td class="p-3 text-[#182033] font-bold">${this.formatMoney(order.down_payment || 0)}</td>
                    <td class="p-3 text-[#5745f5] font-black">${this.formatMoney(order.financed_amount || order.total_amount)}</td>
                    <td class="p-3 text-center">${statusBadge}</td>
                </tr>`;
        }).join('');
    }

    updateTable(orders) {
        const body = document.getElementById('installment-table-body');
        if (body) body.innerHTML = this.renderRows(orders);
    }
}
