export default class OwnerCashflowView {
    constructor() {
        this.container = document.getElementById('content-area');
        this.state = {
            filterPanelOpen: false
        };
    }

    render(summary, transactions) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        const cashBreakdown = summary.cash_breakdown || {
            safe: summary.total_cash || 0,
            counters: []
        };

        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <!-- Vùng Thống kê Nhanh -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
                    <!-- TỔNG THU -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 relative overflow-hidden">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-black text-slate-700 uppercase tracking-wide">Tổng Thu (Tháng này)</p>
                            <h3 class="text-2xl font-black text-emerald-700 mt-0.5">${fmt.format(summary.total_income || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỔNG CHI -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 relative overflow-hidden">
                        <div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-black text-slate-700 uppercase tracking-wide">Tổng Chi (Tháng này)</p>
                            <h3 class="text-2xl font-black text-rose-700 mt-0.5">${fmt.format(summary.total_expense || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỒN QUỸ -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center relative">
                        <div class="flex items-center gap-4 mb-2.5">
                            <div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div>
                                <p class="text-xs font-black text-slate-700 uppercase tracking-wide">Tổng Tồn Quỹ Hiện Tại</p>
                                <h3 class="text-2xl font-black text-indigo-700 mt-0.5">${fmt.format(summary.balance || 0)}</h3>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
                            <div class="cursor-pointer" id="cash-breakdown-trigger">
                                <p class="text-[10px] font-black text-slate-600 uppercase hover:text-amber-700 transition-colors">Tiền mặt tại quầy ▾</p>
                                <p class="text-xs font-black text-amber-700 mt-0.5">${fmt.format(summary.total_cash || 0)}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-slate-600 uppercase">Tài khoản Ngân Hàng</p>
                                <p class="text-xs font-black text-indigo-700 mt-0.5">${fmt.format(summary.total_transfer || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bảng Lịch sử Giao dịch -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                    <div class="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 class="text-lg font-black text-slate-900">Sổ Quỹ Thu Chi</h2>
                            <p class="text-xs text-slate-600 font-semibold mt-0.5">Theo dõi chi tiết dòng tiền ra vào tự động và thủ công</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </span>
                                <input type="text" id="search-tx" placeholder="Tìm theo mã HĐ, diễn giải..." class="pl-9 pr-4 py-2 w-56 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-inner">
                            </div>
                            
                            <select id="filter-month" class="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600">
                                <!-- Rendered by JS -->
                            </select>
                            <button id="btn-create-transaction" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1.5">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>
                                Lập Phiếu Thu/Chi
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-100 text-slate-700 text-xs uppercase font-black tracking-wider sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th class="p-4">Thời Gian</th>
                                    <th class="p-4 text-center">Loại</th>
                                    <th class="p-4">Mã Chứng Từ</th>
                                    <th class="p-4">Danh Mục</th>
                                    <th class="p-4">Diễn Giải</th>
                                    <th class="p-4 text-right">Số Tiền (VNĐ)</th>
                                    <th class="p-4 text-center">Người Lập</th>
                                    <th class="p-4 text-center">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-sm">
                                ${this.renderRows(transactions)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Chi tiết tiền mặt -->
            <div id="modal-cash-breakdown" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h3 class="text-base font-black text-slate-900">Chi tiết phân bổ tiền mặt</h3>
                        <button id="btn-close-cash-breakdown" class="text-slate-500 hover:text-slate-800">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <span class="text-sm font-bold text-slate-700">Két an toàn (Owner)</span>
                            <span class="text-base font-black text-slate-900">${fmt.format(cashBreakdown.safe || 0)}</span>
                        </div>
                        <div class="text-xs font-black text-slate-700 uppercase tracking-wide mb-2.5">Tiền nhân viên đang giữ:</div>
                        <div class="space-y-2.5">
                        ${(cashBreakdown.counters || []).length > 0 ? cashBreakdown.counters.map(c => `
                            <div class="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                <span class="text-xs font-bold text-slate-900 truncate mr-2">• ${c.name}</span>
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="text-xs font-black ${c.amount < 0 ? 'text-rose-600' : 'text-amber-700'}">${fmt.format(c.amount)}</span>
                                    ${c.amount > 0 ? `<button class="btn-collect-cash px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md text-[11px] font-bold transition-colors" data-id="${c.user_id}" data-name="${c.name}" data-max="${c.amount}">Thu</button>` : ''}
                                </div>
                            </div>
                        `).join('') : '<div class="text-xs text-slate-500 italic py-2">Chưa có dữ liệu ca bán hàng</div>'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Tạo Phiếu Mới -->
            <div id="modal-transaction" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h3 class="text-base font-black text-slate-900">Lập Phiếu Thu / Chi</h3>
                        <button id="btn-close-modal" class="text-slate-500 hover:text-slate-800">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="form-transaction" class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">Loại Phiếu *</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex items-center justify-center gap-2 p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-emerald-600 [&:has(:checked)]:bg-emerald-50 transition-colors">
                                        <input type="radio" name="type" value="income" class="hidden" id="radio-income" required checked>
                                        <span class="font-black text-emerald-800 text-sm">PHIẾU THU (+)</span>
                                    </label>
                                    <label class="flex items-center justify-center gap-2 p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-rose-600 [&:has(:checked)]:bg-rose-50 transition-colors">
                                        <input type="radio" name="type" value="expense" class="hidden" id="radio-expense" required>
                                        <span class="font-black text-rose-800 text-sm">PHIẾU CHI (-)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Danh Mục *</label>
                                    <select id="tx-category" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600" required>
                                        <option value="">-- Chọn danh mục --</option>
                                        <optgroup label="Thu" id="opt-income">
                                            <option value="Thu góp vốn">Thu góp vốn</option>
                                            <option value="Thu thanh lý">Thu thanh lý</option>
                                            <option value="Hoàn ứng">Hoàn ứng</option>
                                            <option value="Khác">Thu khác</option>
                                        </optgroup>
                                        <optgroup label="Chi" id="opt-expense" class="hidden">
                                            <option value="Nhập hàng">Nhập hàng / Trả NCC</option>
                                            <option value="Thanh toán lương">Thanh toán lương</option>
                                            <option value="Mặt bằng">Mặt bằng / Thuê nhà</option>
                                            <option value="Điện nước">Điện nước / Internet</option>
                                            <option value="Marketing">Marketing / Quảng cáo</option>
                                            <option value="Khác">Chi khác</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Hình thức</label>
                                    <select id="tx-payment-method" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600" required>
                                        <option value="cash">Tiền mặt</option>
                                        <option value="transfer">Chuyển khoản</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Số Tiền (VNĐ) *</label>
                                <input type="number" id="tx-amount" min="1000" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-base text-slate-900 font-black focus:border-indigo-600" required placeholder="Nhập số tiền...">
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Diễn Giải / Lý do chi tiết</label>
                                <input type="text" id="tx-description" placeholder="Ví dụ: Tiền điện tháng 9/2026..." class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600">
                            </div>
                            
                            <div class="pt-3 border-t border-slate-200 flex justify-end gap-3">
                                <button type="button" id="btn-cancel-tx" class="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-black text-xs rounded-lg hover:bg-slate-100 transition-colors">Hủy</button>
                                <button type="submit" class="px-5 py-2 bg-indigo-600 text-white font-black text-xs rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">Lưu Phiếu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Thu Tiền NV -->
            <div id="modal-collect-cash" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h3 class="text-base font-black text-slate-900">Thu Tiền Kế Toán</h3>
                        <button id="btn-close-collect-modal" class="text-slate-500 hover:text-slate-800">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <form id="form-collect-cash" class="space-y-4">
                            <input type="hidden" id="collect-staff-id" name="staff_id">
                            
                            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-2">
                                <p class="text-xs text-indigo-700 font-bold">Thu từ nhân viên:</p>
                                <p class="text-sm font-black text-slate-900" id="collect-staff-name">...</p>
                                <p class="text-[11px] text-indigo-600 mt-1 font-semibold">Tối đa có thể thu: <span id="collect-max-label"></span></p>
                            </div>

                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Số Tiền Thu (VNĐ) *</label>
                                <input type="number" id="collect-amount" name="amount" min="1000" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-black focus:border-indigo-600" required>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Hình thức nhận *</label>
                                <select name="receive_method" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600" required>
                                    <option value="cash">Tiền mặt bỏ két</option>
                                    <option value="transfer">Nhân viên chuyển khoản thẳng Bank</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1">Ghi chú</label>
                                <input type="text" name="description" placeholder="VD: Bàn giao ca..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600">
                            </div>
                            
                            <div class="pt-2 flex justify-end gap-3">
                                <button type="submit" class="px-5 py-2 w-full bg-indigo-600 text-white font-black text-xs rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">Xác nhận thu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn / Giao dịch -->
            <div id="modal-invoice-detail" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h3 class="text-base font-black text-slate-900">Chi tiết chứng từ <span id="detail-invoice-id" class="text-indigo-600"></span></h3>
                        <button id="btn-close-invoice" class="text-slate-500 hover:text-slate-800">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5 bg-slate-50 min-h-[150px]">
                        <!-- Content rendered by JS -->
                    </div>
                </div>
            </div>

            <!-- Hidden iframe for printing -->
            <iframe id="print-frame" style="display:none;"></iframe>
        `;
        
        this.container.innerHTML = html;
        this.populateMonthSelect();
        this.attachEvents();
    }

    renderRows(transactions) {
        if (!transactions || transactions.length === 0) {
            return `<tr><td colspan="8" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Chưa có phát sinh giao dịch thu chi nào.</span>
            </div>
        </td></tr>`;
        }
        
        const fmt = new Intl.NumberFormat('vi-VN');
        
        return transactions.map(t => {
            const isIncome = t.type === 'income';
            
            const typeBadge = isIncome 
                ? `<span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-black text-xs rounded-md border border-emerald-300">THU</span>`
                : `<span class="px-2.5 py-0.5 bg-rose-50 text-rose-800 font-black text-xs rounded-md border border-rose-300">CHI</span>`;
            
            const txCode = isIncome ? `PT-${String(t.id).padStart(4, '0')}` : `PC-${String(t.id).padStart(4, '0')}`;
            const isAuto = t.source === 'auto' || t.invoice_id;
            
            const methodBadge = t.payment_method === 'transfer'
                ? `<span class="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200">Chuyển khoản</span>`
                : `<span class="inline-block mt-0.5 px-2 py-0.5 bg-amber-50 text-amber-900 text-[10px] font-bold rounded border border-amber-200">Tiền mặt</span>`;
                
            const amountColor = isIncome ? 'text-emerald-700' : 'text-rose-700';
            const amountPrefix = isIncome ? '+' : '-';
            const dateFmt = new Date(t.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
            const isInvoice = !!t.invoice_id;
            const invoiceHtml = isInvoice
                ? `<span class="cursor-pointer hover:underline btn-view-invoice text-indigo-600" data-id="${t.invoice_id}">${t.invoice_id}</span>`
                : `<span class="cursor-pointer hover:underline btn-view-invoice text-indigo-600" data-id="${txCode}">${txCode}</span>`;

            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-bold text-slate-700 text-xs whitespace-nowrap">${dateFmt}</td>
                    <td class="p-4 text-center">${typeBadge}</td>
                    <td class="p-4 font-black text-indigo-700 text-xs">${invoiceHtml}</td>
                    <td class="p-4">
                        <div class="font-bold text-slate-900 text-sm">${t.category}</div>
                        ${methodBadge}
                    </td>
                    <td class="p-4 text-slate-700 text-sm font-semibold max-w-[200px] truncate" title="${t.description || ''}">${t.description || '--'}</td>
                    <td class="p-4 text-right font-black ${amountColor} text-base">${amountPrefix} ${fmt.format(t.amount)}đ</td>
                    <td class="p-4 text-center text-xs font-bold text-slate-700">${t.username ? '@' + t.username : '--'}</td>
                    <td class="p-4 text-center">
                        <button class="px-2 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded border border-indigo-200 hover:bg-indigo-100 transition-colors btn-view-invoice" data-id="${isInvoice ? t.invoice_id : txCode}">Chi tiết</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    populateMonthSelect() {
        const select = document.getElementById('filter-month');
        if (!select) return;
        
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const mStr = `${yyyy}-${mm}`;
            const opt = document.createElement('option');
            opt.value = mStr;
            opt.textContent = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
            select.appendChild(opt);
        }
    }

    attachEvents() {
        const radioIncome = document.getElementById('radio-income');
        const radioExpense = document.getElementById('radio-expense');
        const optIncome = document.getElementById('opt-income');
        const optExpense = document.getElementById('opt-expense');
        const categorySelect = document.getElementById('tx-category');

        const updateCategoryOptions = () => {
            if (!categorySelect) return;
            categorySelect.value = "";
            if (radioIncome?.checked) {
                optIncome?.classList.remove('hidden');
                optExpense?.classList.add('hidden');
            } else if (radioExpense?.checked) {
                optIncome?.classList.add('hidden');
                optExpense?.classList.remove('hidden');
            }
        };

        radioIncome?.addEventListener('change', updateCategoryOptions);
        radioExpense?.addEventListener('change', updateCategoryOptions);
    }
}
