export default class StaffInstallmentView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders) {
        let html = `
            <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-5 border-b border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 class="text-lg font-bold text-slate-800">Quản lý hồ sơ trả góp</h2>
                        <p class="text-sm text-slate-500 mt-1">Theo dõi và thu cước khách hàng trả góp</p>
                    </div>
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <select id="filter-status" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all transition-colors">
                            <option value="all">Tất cả hồ sơ</option>
                            <option value="active">Đang trả góp</option>
                            <option value="overdue">Trễ hạn</option>
                            <option value="completed">Đã tất toán</option>
                        </select>
                        <div class="relative max-w-xs w-full">
                            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" id="search-installment" placeholder="Tìm tên, SĐT, CCCD..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:bg-white transition-colors">
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 shadow-sm text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th class="p-4">Khách Hàng</th>
                                <th class="p-4">Mã Hóa Đơn</th>
                                <th class="p-4">Kỳ Hạn / Dư Nợ</th>
                                <th class="p-4">Đến Hạn</th>
                                <th class="p-4">Thu Ngân (Phụ Trách)</th>
                                <th class="p-4">Tiến Độ</th>
                                <th class="p-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody id="installment-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                            ${this.renderRows(orders)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Thu Cước -->
            <div id="payment-modal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-md overflow-hidden transform scale-95 transition-transform duration-300" id="payment-modal-content">
                    <!-- Nạp nội dung bằng JS -->
                </div>
            </div>

            <!-- Modal Lịch sử -->
            <div id="history-modal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-lg overflow-hidden transform scale-95 transition-transform duration-300" id="history-modal-content">
                    <!-- Nạp nội dung bằng JS -->
                </div>
            </div>

            <iframe id="print-frame" style="display: none;"></iframe>
        `;
        
        this.container.innerHTML = html;
    }

    renderRows(orders) {
        if (!orders || orders.length === 0) {
            return `<tr><td colspan="6" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Không có hồ sơ trả góp nào.</span>
            </div>
        </td></tr>`;
        }
        
        const now = new Date();
        
        return orders.map(o => {
            const isCompleted = o.paid_months >= o.installment_term;
            const remainingDebt = o.total_amount - (o.monthly_fee * o.paid_months);
            
            let dueDateStr = '--';
            let isOverdue = false;
            if (!isCompleted && o.next_due_date) {
                const dueDate = new Date(o.next_due_date);
                dueDateStr = dueDate.toLocaleDateString('vi-VN');
                isOverdue = dueDate < now;
            }
            
            let statusBadge = '';
            if (isCompleted) {
                statusBadge = `<span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-bold border border-green-200">Tất toán</span>`;
            } else if (isOverdue) {
                statusBadge = `<span class="px-2 py-1 bg-rose-50 text-rose-700 rounded text-xs font-bold border border-rose-200">Trễ hạn</span>`;
            } else {
                statusBadge = `<span class="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold border border-amber-200">Đang trả</span>`;
            }
            
            const progressWidth = (o.paid_months / o.installment_term) * 100;
            const trClass = isOverdue && !isCompleted ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/80';
            
            return `
                <tr class="${trClass} transition-colors">
                    <td class="p-4 font-bold text-slate-800">
                        <div class="flex flex-col">
                            <span>${o.customer_name || 'Khách lẻ'}</span>
                            <span class="text-xs text-slate-500 font-medium">${o.customer_phone || '--'}</span>
                        </div>
                    </td>
                    <td class="p-4 font-bold text-indigo-600 text-xs">${o.invoice_code}</td>
                    <td class="p-4">
                        <div class="text-xs text-slate-500 mb-0.5">Mỗi tháng: <strong class="text-slate-800">${this.formatMoney(o.monthly_fee)}</strong></div>
                        <div class="text-xs text-slate-500">Dư nợ: <strong class="${isCompleted ? 'text-green-600' : 'text-rose-600'}">${this.formatMoney(remainingDebt > 0 ? remainingDebt : 0)}</strong></div>
                    </td>
                    <td class="p-4">
                        <div class="font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}">${dueDateStr}</div>
                        ${isOverdue && !isCompleted ? '<div class="text-xs text-rose-500 font-medium">Cần thu ngay!</div>' : ''}
                    </td>
                    <td class="p-4 text-slate-700 font-semibold">
                        ${o.cashier_name || '--'}
                    </td>
                    <td class="p-4">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="font-bold text-slate-700">${o.paid_months}/${o.installment_term} tháng</span>
                            ${statusBadge}
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full ${isCompleted ? 'bg-green-500' : (isOverdue ? 'bg-rose-500' : 'bg-amber-500')}" style="width: ${progressWidth}%"></div>
                        </div>
                    </td>
                    <td class="p-4 text-center space-x-1">
                        <button class="btn-view-history px-2 py-1.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded shadow-sm transition-colors text-xs font-semibold" data-id="${o.id}">
                            Lịch sử
                        </button>
                        <button class="btn-collect-payment px-2 py-1.5 ${isCompleted ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded shadow-sm transition-colors text-xs font-semibold" data-id="${o.id}" ${isCompleted ? 'disabled' : ''}>
                            Thu cước
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPaymentModal(order) {
        const remainingMonths = order.installment_term - order.paid_months;
        const remainingDebt = remainingMonths * order.monthly_fee;
        
        return `
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 class="text-lg font-bold text-slate-800">Thu cước trả góp</h3>
                <button id="btn-close-payment-modal" class="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Hình thức thanh toán</label>
                    <div class="grid grid-cols-2 gap-3" id="payment-method-group">
                        <label class="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-emerald-500 [&:has(:checked)]:bg-emerald-50 transition-colors">
                            <input type="radio" name="payment_method" value="cash" class="hidden" checked>
                            <span class="font-bold text-emerald-600">Tiền mặt</span>
                        </label>
                        <label class="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-indigo-500 [&:has(:checked)]:bg-indigo-50 transition-colors">
                            <input type="radio" name="payment_method" value="transfer" class="hidden">
                            <span class="font-bold text-indigo-600">Chuyển khoản</span>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-amber-50 p-4 rounded-lg border border-amber-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-100 transition-colors" id="btn-pay-one" data-id="${order.id}">
                        <p class="text-amber-800 text-xs font-medium mb-1">Thu 1 kỳ (${order.paid_months + 1}/${order.installment_term})</p>
                        <p class="text-xl font-black text-rose-600">${this.formatMoney(order.monthly_fee)}</p>
                    </div>
                    
                    <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-100 transition-colors" id="btn-pay-all" data-id="${order.id}">
                        <p class="text-emerald-800 text-xs font-medium mb-1">Tất toán (${remainingMonths} kỳ)</p>
                        <p class="text-xl font-black text-emerald-600">${this.formatMoney(remainingDebt)}</p>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div class="flex justify-between py-1 border-b border-slate-200 shadow-sm/60">
                        <span>Khách hàng:</span>
                        <strong class="text-slate-800">${order.customer_name}</strong>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-200 shadow-sm/60">
                        <span>Số điện thoại:</span>
                        <strong class="text-slate-800">${order.customer_phone}</strong>
                    </div>
                    <div class="flex justify-between py-1">
                        <span>Mã hóa đơn:</span>
                        <strong class="text-indigo-600">${order.invoice_code}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistoryModal(order) {
        let historyHtml = '';
        if (!order.payments || order.payments.length === 0) {
            historyHtml = `<div class="p-4 text-center text-slate-500">Chưa có lịch sử thu cước.</div>`;
        } else {
            historyHtml = order.payments.map((p, index) => `
                <div class="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <div>
                        <div class="font-bold text-slate-800">Kỳ ${index + 1}</div>
                        <div class="text-xs text-slate-500">${new Date(p.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-indigo-600">${this.formatMoney(p.amount)}</div>
                        <div class="text-xs text-slate-500">Thu ngân: ${p.cashier_name || '--'}</div>
                    </div>
                </div>
            `).join('');
        }

        return `
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 class="text-lg font-bold text-slate-800">Lịch sử thu cước - ${order.invoice_code}</h3>
                <button id="btn-close-history-modal" class="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="p-0 max-h-[400px] overflow-y-auto">
                ${historyHtml}
            </div>
            <div class="p-4 bg-slate-50 border-t border-slate-100 text-right">
                <button id="btn-close-history-modal-bottom" class="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors">Đóng</button>
            </div>
        `;
    }

    updateTable(orders) {
        document.getElementById('installment-table-body').innerHTML = this.renderRows(orders);
    }

    showPaymentModal(order) {
        const modal = document.getElementById('payment-modal');
        const content = document.getElementById('payment-modal-content');
        
        content.innerHTML = this.renderPaymentModal(order);
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    }

    hidePaymentModal() {
        const modal = document.getElementById('payment-modal');
        const content = document.getElementById('payment-modal-content');
        if(!modal) return;
        
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    showHistoryModal(order) {
        const modal = document.getElementById('history-modal');
        const content = document.getElementById('history-modal-content');
        
        content.innerHTML = this.renderHistoryModal(order);
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    }

    hideHistoryModal() {
        const modal = document.getElementById('history-modal');
        const content = document.getElementById('history-modal-content');
        if(!modal) return;
        
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    printReceipt(order, amount, isPayAll = false, paymentMethod = 'cash') {
        const iframe = document.getElementById('print-frame');
        if (!iframe) return;
        
        const doc = iframe.contentWindow.document;
        doc.open();
        
        const dateStr = new Date().toLocaleString('vi-VN');
        const typeStr = isPayAll ? 'TẤT TOÁN TRẢ GÓP' : 'THU CƯỚC TRẢ GÓP';
        const remainingDebt = isPayAll ? 0 : order.total_amount - (order.paid_months * order.monthly_fee) - amount;
        const pmStr = paymentMethod === 'cash' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN';

        doc.write(`
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; color: #000; width: 300px; margin: 0 auto; padding: 10px; }
                    .center { text-align: center; }
                    h2 { margin: 5px 0; font-size: 16px; }
                    p { margin: 3px 0; font-size: 12px; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    .row { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="center">
                    <h2>CỬA HÀNG E-COM AI</h2>
                    <p>Địa chỉ: 123 AI Street, Tech City</p>
                    <p>Hotline: 1900 1000</p>
                    <h2 style="margin-top: 15px;">BIÊN LAI ${typeStr}</h2>
                    <p>HĐ Gốc: ${order.invoice_code}</p>
                    <p>Ngày: ${dateStr}</p>
                    <p><b>HT THANH TOÁN: ${pmStr}</b></p>
                </div>
                
                <div class="line"></div>
                
                <p>Khách hàng: ${order.customer_name || 'Khách lẻ'}</p>
                <p>SĐT: ${order.customer_phone || ''}</p>
                
                <div class="line"></div>
                
                <div class="row">
                    <span>Số tiền thu:</span>
                    <strong>${this.formatMoney(amount)}</strong>
                </div>
                <div class="row">
                    <span>Dư nợ còn lại:</span>
                    <strong>${this.formatMoney(remainingDebt > 0 ? remainingDebt : 0)}</strong>
                </div>
                
                <div class="line"></div>

                <div class="center" style="margin-top: 20px;">
                    <p>Xin cảm ơn quý khách!</p>
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}

