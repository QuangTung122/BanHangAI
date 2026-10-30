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
            <div class="h-full flex flex-col gap-2.5 relative">
                <!-- Vùng Thống kê Nhanh Tinh gọn -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
                    <!-- TỔNG THU -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3 flex items-center gap-3 relative overflow-hidden group hover:border-[#5745f5] transition-all">
                        <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-[#7b8499] uppercase tracking-wider">Tổng Thu (Tháng này)</p>
                            <h3 class="text-xl font-black text-emerald-700 mt-0.5 tracking-tight">${fmt.format(summary.total_income || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỔNG CHI -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3 flex items-center gap-3 relative overflow-hidden group hover:border-[#5745f5] transition-all">
                        <div class="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/></svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-[#7b8499] uppercase tracking-wider">Tổng Chi (Tháng này)</p>
                            <h3 class="text-xl font-black text-rose-700 mt-0.5 tracking-tight">${fmt.format(summary.total_expense || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỒN QUỸ -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3 flex flex-col justify-center relative group hover:border-[#5745f5] transition-all">
                        <div class="flex items-center gap-3 mb-1.5">
                            <div class="w-10 h-10 rounded-lg bg-[#f0edff] border border-[#e1dcff] flex items-center justify-center text-[#5745f5] shrink-0">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-[#7b8499] uppercase tracking-wider">Tổng Tồn Quỹ</p>
                                <h3 class="text-xl font-black text-[#5745f5] mt-0.5 tracking-tight">${fmt.format(summary.balance || 0)}</h3>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-[#f5f6fa]">
                            <div class="cursor-pointer" id="cash-breakdown-trigger">
                                <p class="text-[9px] font-bold text-[#7b8499] uppercase hover:text-[#5745f5] transition-colors">Tiền mặt ▾</p>
                                <p class="text-[11px] font-black text-amber-700">${fmt.format(summary.total_cash || 0)}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-bold text-[#7b8499] uppercase">Tài khoản Bank</p>
                                <p class="text-[11px] font-black text-[#5745f5]">${fmt.format(summary.total_transfer || 0)}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-bold text-[#7b8499] uppercase">Thẻ POS</p>
                                <p class="text-[11px] font-black text-violet-700">${fmt.format(summary.total_card || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bảng Lịch sử Giao dịch (Sổ Quỹ Thu Chi - Rộng rãi) -->
                <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex-1 flex flex-col">
                    <div class="p-2.5 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#7b8499]">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </span>
                                <input type="text" id="search-tx" placeholder="Tìm theo mã HĐ, diễn giải..." class="pl-8 pr-3 py-1.5 w-56 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold text-[#182033] focus:outline-none focus:border-[#5745f5]">
                            </div>
                            
                            <select id="filter-month" class="px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] cursor-pointer">
                                <!-- Rendered by JS -->
                            </select>
                        </div>

                        <button id="btn-create-transaction" class="px-3.5 py-1.5 bg-[#5745f5] hover:bg-[#4735e5] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>
                            Lập Phiếu Thu/Chi
                        </button>
                    </div>

                    <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse min-w-[900px]">
                            <thead class="bg-[#fafbfd] text-[#7b8499] text-[11px] uppercase font-black tracking-wider sticky top-0 z-10 border-b border-[#e7eaf2]">
                                <tr>
                                    <th class="p-3">Thời Gian</th>
                                    <th class="p-3 text-center">Loại</th>
                                    <th class="p-3">Mã Chứng Từ</th>
                                    <th class="p-3">Danh Mục</th>
                                    <th class="p-3">Diễn Giải</th>
                                    <th class="p-3 text-right">Số Tiền (VNĐ)</th>
                                    <th class="p-3 text-center">Người Lập</th>
                                    <th class="p-3 text-center">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#e7eaf2] text-xs">
                                ${this.renderRows(transactions)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Chi tiết tiền mặt -->
            <div id="modal-cash-breakdown" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[14px] shadow-2xl border border-[#e7eaf2] w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-5 py-4 border-b border-[#e7eaf2] flex items-center justify-between bg-[#fafbfd]">
                        <h3 class="text-base font-black text-[#182033]">Chi tiết phân bổ tiền mặt</h3>
                        <button id="btn-close-cash-breakdown" class="text-[#7b8499] hover:text-[#182033]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-[#e7eaf2]">
                            <span class="text-sm font-bold text-[#7b8499]">Két an toàn (Owner)</span>
                            <span class="text-base font-black text-[#182033]">${fmt.format(cashBreakdown.safe || 0)}</span>
                        </div>
                        <div class="text-xs font-black text-[#7b8499] uppercase tracking-wider mb-2.5">Tiền nhân viên đang giữ:</div>
                        <div class="space-y-2.5">
                        ${(cashBreakdown.counters || []).length > 0 ? cashBreakdown.counters.map(c => `
                            <div class="flex justify-between items-center p-2.5 bg-[#f5f6fa] rounded-[9px] border border-[#e7eaf2]">
                                <span class="text-xs font-bold text-[#182033] truncate mr-2">• ${c.name}</span>
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="text-xs font-black ${c.amount < 0 ? 'text-rose-600' : 'text-amber-700'}">${fmt.format(c.amount)}</span>
                                    ${c.amount > 0 ? `<button class="btn-collect-cash px-2.5 py-1 bg-[#5745f5] text-white hover:bg-[#4735e5] rounded-[6px] text-[11px] font-bold transition-colors" data-id="${c.user_id}" data-name="${c.name}" data-max="${c.amount}">Thu</button>` : ''}
                                </div>
                            </div>
                        `).join('') : '<div class="text-xs text-[#7b8499] italic py-2">Chưa có dữ liệu ca bán hàng</div>'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Tạo Phiếu Mới -->
            <div id="modal-transaction" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[14px] shadow-2xl border border-[#e7eaf2] w-full max-w-lg transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#e7eaf2] flex items-center justify-between bg-[#fafbfd]">
                        <h3 class="text-base font-black text-[#182033]">Lập Phiếu Thu / Chi</h3>
                        <button id="btn-close-modal" class="text-[#7b8499] hover:text-[#182033]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="form-transaction" class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1.5">Loại Phiếu *</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex items-center justify-center gap-2 p-3 border border-[#e7eaf2] rounded-[10px] cursor-pointer hover:bg-[#f5f6fa] [&:has(:checked)]:border-emerald-600 [&:has(:checked)]:bg-emerald-50 transition-colors">
                                        <input type="radio" name="type" value="income" class="hidden" id="radio-income" required checked>
                                        <span class="font-black text-emerald-800 text-sm">PHIẾU THU (+)</span>
                                    </label>
                                    <label class="flex items-center justify-center gap-2 p-3 border border-[#e7eaf2] rounded-[10px] cursor-pointer hover:bg-[#f5f6fa] [&:has(:checked)]:border-rose-600 [&:has(:checked)]:bg-rose-50 transition-colors">
                                        <input type="radio" name="type" value="expense" class="hidden" id="radio-expense" required>
                                        <span class="font-black text-rose-800 text-sm">PHIẾU CHI (-)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Danh Mục *</label>
                                    <select id="tx-category" class="w-full px-3 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-xs text-[#182033] font-bold focus:border-[#5745f5]" required>
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
                                    <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Hình thức</label>
                                    <select id="tx-payment-method" class="w-full px-3 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-xs text-[#182033] font-bold focus:border-[#5745f5]" required>
                                        <option value="cash">Tiền mặt</option>
                                        <option value="transfer">Chuyển khoản</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Số Tiền (VNĐ) *</label>
                                <input type="number" id="tx-amount" min="1000" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-[9px] text-base text-[#182033] font-black focus:border-[#5745f5]" required placeholder="Nhập số tiền...">
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Diễn Giải / Lý do chi tiết</label>
                                <input type="text" id="tx-description" placeholder="Ví dụ: Tiền điện tháng này..." class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-xs font-semibold text-[#182033] focus:border-[#5745f5]">
                            </div>
                            
                            <div class="pt-3 border-t border-[#e7eaf2] flex justify-end gap-3">
                                <button type="button" id="btn-cancel-tx" class="px-5 py-2 bg-white border border-[#e7eaf2] text-[#7b8499] font-bold text-xs rounded-[9px] hover:bg-[#f5f6fa] transition-colors">Hủy</button>
                                <button type="submit" class="px-5 py-2 bg-[#5745f5] text-white font-bold text-xs rounded-[9px] hover:bg-[#4735e5] shadow-sm transition-colors">Lưu Phiếu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Thu Tiền NV -->
            <div id="modal-collect-cash" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[14px] shadow-2xl border border-[#e7eaf2] w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-5 py-4 border-b border-[#e7eaf2] flex items-center justify-between bg-[#fafbfd]">
                        <h3 class="text-base font-black text-[#182033]">Thu Tiền Kế Toán</h3>
                        <button id="btn-close-collect-modal" class="text-[#7b8499] hover:text-[#182033]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <form id="form-collect-cash" class="space-y-4">
                            <input type="hidden" id="collect-staff-id" name="staff_id">
                            
                            <div class="bg-[#f0edff] p-3 rounded-[9px] border border-[#e1dcff] mb-2">
                                <p class="text-xs text-[#5745f5] font-bold">Thu từ nhân viên:</p>
                                <p class="text-sm font-black text-[#182033]" id="collect-staff-name">...</p>
                                <p class="text-[11px] text-[#5745f5] mt-1 font-semibold">Tối đa có thể thu: <span id="collect-max-label"></span></p>
                            </div>

                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Số Tiền Thu (VNĐ) *</label>
                                <input type="number" id="collect-amount" name="amount" min="1000" class="w-full px-3 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-sm text-[#182033] font-black focus:border-[#5745f5]" required>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Hình thức nhận *</label>
                                <select name="receive_method" class="w-full px-3 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-xs text-[#182033] font-bold focus:border-[#5745f5]" required>
                                    <option value="cash">Tiền mặt bỏ két</option>
                                    <option value="transfer">Nhân viên chuyển khoản thẳng Bank</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-black text-[#182033] uppercase tracking-wider mb-1">Ghi chú</label>
                                <input type="text" name="description" placeholder="VD: Bàn giao ca..." class="w-full px-3 py-2 bg-white border border-[#e7eaf2] rounded-[9px] text-xs text-[#182033] font-semibold focus:border-[#5745f5]">
                            </div>
                            
                            <div class="pt-2 flex justify-end gap-3">
                                <button type="submit" class="px-5 py-2.5 w-full bg-[#5745f5] text-white font-bold text-xs rounded-[9px] hover:bg-[#4735e5] shadow-sm transition-colors">Xác nhận thu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn / Giao dịch -->
            <div id="modal-invoice-detail" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[14px] shadow-2xl border border-[#e7eaf2] w-full max-w-2xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300 overflow-hidden mx-4">
                    <div class="px-5 py-4 border-b border-[#e7eaf2] flex items-center justify-between bg-[#fafbfd] shrink-0">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg bg-[#f0edff] border border-[#e1dcff] flex items-center justify-center text-[#5745f5]">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <div>
                                <h3 class="text-sm font-black text-[#182033]" id="detail-modal-heading">Chi tiết chứng từ</h3>
                                <p class="text-[11px] font-bold text-[#5745f5] font-mono mt-0.5" id="detail-invoice-id"></p>
                            </div>
                        </div>
                        <button id="btn-close-invoice" class="text-[#7b8499] hover:text-[#182033] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div id="invoice-detail-content" class="p-5 bg-[#fafbfd] overflow-y-auto custom-scrollbar flex-1 min-h-[180px]">
                        <!-- Content rendered by JS -->
                    </div>
                </div>
            </div>

            <!-- Frame ẩn để in -->
            <iframe id="print-frame" style="position: absolute; width: 0; height: 0; border: none; left: -9999px;"></iframe>
        `;
        
        this.container.innerHTML = html;
        this.populateMonthSelect();
        this.attachEvents();
    }

    renderRows(transactions) {
        if (!transactions || transactions.length === 0) {
            return `<tr><td colspan="8" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-14 h-14 rounded-2xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-xl mb-3">💰</div>
                <span class="text-[#182033] font-bold text-sm">Chưa có phát sinh giao dịch thu chi nào.</span>
            </div>
        </td></tr>`;
        }
        
        const fmt = new Intl.NumberFormat('vi-VN');
        
        return transactions.map(t => {
            const isIncome = t.type === 'income';
            
            const typeBadge = isIncome 
                ? `<span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-md border border-emerald-300">THU</span>`
                : `<span class="px-2.5 py-0.5 bg-rose-50 text-rose-800 font-bold text-xs rounded-md border border-rose-300">CHI</span>`;
            
            const txCode = isIncome ? `PT-${String(t.id).padStart(4, '0')}` : `PC-${String(t.id).padStart(4, '0')}`;
            
            const methodBadge = t.payment_method === 'transfer'
                ? `<span class="inline-block mt-0.5 px-2 py-0.5 bg-[#f0edff] text-[#5745f5] text-[10px] font-bold rounded border border-[#e1dcff]">Chuyển khoản</span>`
                : t.payment_method === 'card'
                    ? `<span class="inline-block mt-0.5 px-2 py-0.5 bg-violet-50 text-violet-800 text-[10px] font-bold rounded border border-violet-200">Thẻ</span>`
                    : `<span class="inline-block mt-0.5 px-2 py-0.5 bg-amber-50 text-amber-900 text-[10px] font-bold rounded border border-amber-200">Tiền mặt</span>`;
                
            const amountColor = isIncome ? 'text-emerald-700' : 'text-rose-700';
            const amountPrefix = isIncome ? '+' : '-';
            const dateFmt = new Date(t.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
            const isInvoice = !!t.invoice_id || !!(t.reference_id && (t.category === 'Bán hàng' || t.category === 'Trả góp' || t.source === 'auto'));
            const invoiceCodeDisplay = t.invoice_id || (t.reference_id ? `INV-${t.reference_id}` : txCode);
            const invoiceHtml = isInvoice
                ? `<span class="cursor-pointer hover:underline btn-view-invoice text-[#5745f5] font-black" data-id="${t.invoice_id || invoiceCodeDisplay}" data-tx-id="${t.id}" title="Xem chi tiết hóa đơn gốc">${invoiceCodeDisplay}</span>`
                : `<span class="cursor-pointer hover:underline btn-view-invoice text-[#5745f5] font-black" data-id="${txCode}" data-tx-id="${t.id}" title="Xem chi tiết chứng từ">${txCode}</span>`;

            return `
                <tr class="hover:bg-[#fafbfd] transition-colors">
                    <td class="p-4 font-bold text-[#7b8499] text-xs whitespace-nowrap">${dateFmt}</td>
                    <td class="p-4 text-center">${typeBadge}</td>
                    <td class="p-4 font-black text-[#5745f5] text-xs">${invoiceHtml}</td>
                    <td class="p-4">
                        <div class="font-bold text-[#182033] text-sm">${t.category}</div>
                        ${methodBadge}
                    </td>
                    <td class="p-4 text-[#7b8499] text-sm font-semibold max-w-[200px] truncate" title="${t.description || ''}">${t.description || '--'}</td>
                    <td class="p-4 text-right font-black ${amountColor} text-base">${amountPrefix} ${fmt.format(t.amount)}đ</td>
                    <td class="p-4 text-center text-xs font-bold text-[#7b8499]">${t.username ? '@' + t.username : '--'}</td>
                    <td class="p-4 text-center">
                        <button class="px-2.5 py-1 bg-[#f0edff] text-[#5745f5] text-[11px] font-bold rounded-[6px] border border-[#e1dcff] hover:bg-[#5745f5] hover:text-white transition-colors btn-view-invoice cursor-pointer" data-id="${isInvoice ? (t.invoice_id || invoiceCodeDisplay) : txCode}" data-tx-id="${t.id}" title="${isInvoice ? 'Xem hóa đơn gốc' : 'Xem chi tiết chứng từ'}">Chi tiết</button>
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
