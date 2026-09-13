export default class OwnerCashflowView {
    constructor() {
        this.container = document.getElementById('content-area');
        this.state = {
            filterPanelOpen: false
        };
    }

    render(summary, transactions) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        // Use real data from API
        const cashBreakdown = summary.cash_breakdown || {
            safe: summary.total_cash || 0,
            counters: []
        };

        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <!-- Vùng Thống kê Nhanh -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <!-- TỔNG THU -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-emerald-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-6 flex items-center gap-4 relative overflow-hidden">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
                        <div class="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 relative z-10">
                            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div class="relative z-10">
                            <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Tổng Thu (Tháng này)</p>
                            <h3 class="text-2xl font-black text-emerald-600 mt-1">${fmt.format(summary.total_income || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỔNG CHI -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-rose-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-6 flex items-center gap-4 relative overflow-hidden">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full opacity-50"></div>
                        <div class="w-14 h-14 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 relative z-10">
                            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/></svg>
                        </div>
                        <div class="relative z-10">
                            <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Tổng Chi (Tháng này)</p>
                            <h3 class="text-2xl font-black text-rose-600 mt-1">${fmt.format(summary.total_expense || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- TỒN QUỸ -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-indigo-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-center relative overflow-visible">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 z-0"></div>
                        <div class="relative z-10 flex items-center gap-4 mb-3">
                            <div class="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Tổng Tồn Quỹ</p>
                                <h3 class="text-2xl font-black text-indigo-600 mt-1">${fmt.format(summary.balance || 0)}</h3>
                            </div>
                        </div>
                        <div class="relative z-10 grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-indigo-50">
                            <div class="cursor-pointer" id="cash-breakdown-trigger">
                                <div class="flex items-center gap-1">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase hover:text-amber-600 transition-colors">Tiền mặt tại quầy (Click xem chi tiết) ▾</p>
                                </div>
                                <p class="text-sm font-bold text-amber-600">${fmt.format(summary.total_cash || 0)}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase">Chuyển khoản (NH)</p>
                                <p class="text-sm font-bold text-indigo-600">${fmt.format(summary.total_transfer || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bảng Lịch sử Giao dịch -->
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex-1 flex flex-col z-0">
                    <div class="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 class="text-lg font-bold text-slate-800">Sổ Quỹ Thu Chi</h2>
                            <p class="text-xs text-slate-500 mt-1">Quản lý dòng tiền tự động từ Hóa đơn & Thủ công</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </span>
                                <input type="text" id="search-tx" placeholder="Tìm theo mã HĐ, diễn giải..." class="pl-9 pr-4 py-2 w-56 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500">
                            </div>
                            
                            <button id="btn-filter" class="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:-translate-y-0.5 active:scale-[0.98] shadow-sm transition-all duration-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                                Bộ lọc
                            </button>

                            <select id="filter-month" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all">
                                <!-- Rendered by JS -->
                            </select>
                            <button id="btn-create-transaction" class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all duration-200 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                Lập Phiếu Thu/Chi
                            </button>
                        </div>
                    </div>
                    
                    <!-- Sub-header Filter (Hidden by default, shown when clicking Bộ lọc) -->
                    <div id="advanced-filter-panel" class="${this.state.filterPanelOpen ? '' : 'hidden'} p-4 bg-slate-50 border-b border-slate-200 shadow-sm grid grid-cols-4 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Loại Phiếu</label>
                            <select class="w-full p-2 border border-slate-200 rounded text-sm">
                                <option value="">Tất cả</option>
                                <option value="income">Chỉ Phiếu THU</option>
                                <option value="expense">Chỉ Phiếu CHI</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Nguồn tạo</label>
                            <select class="w-full p-2 border border-slate-200 rounded text-sm">
                                <option value="">Tất cả</option>
                                <option value="auto">Tự động (Từ Hóa đơn)</option>
                                <option value="manual">Thủ công</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Phương thức</label>
                            <select class="w-full p-2 border border-slate-200 rounded text-sm">
                                <option value="">Tất cả</option>
                                <option value="cash">Tiền mặt</option>
                                <option value="transfer">Chuyển khoản</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Nhân viên</label>
                            <select class="w-full p-2 border border-slate-200 rounded text-sm">
                                <option value="">Tất cả nhân viên</option>
                                <!-- This could be dynamic, but left static for UI template -->
                                <option value="1">Owner</option>
                                <option value="2">Staff</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex-1 overflow-auto p-5">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th class="p-4 rounded-tl-lg">Thời Gian</th>
                                    <th class="p-4 text-center">Loại</th>
                                    <th class="p-4">Chứng từ / Hóa Đơn</th>
                                    <th class="p-4">Danh Mục</th>
                                    <th class="p-4">Diễn Giải</th>
                                    <th class="p-4 text-right">Số Tiền (VNĐ)</th>
                                    <th class="p-4 text-center">Người Lập</th>
                                    <th class="p-4 text-center rounded-tr-lg">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                                ${this.renderRows(transactions)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Chi tiết tiền mặt -->
            <div id="modal-cash-breakdown" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-800">Chi tiết tiền mặt</h3>
                        <button id="btn-close-cash-breakdown" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <span class="text-slate-600">Két an toàn (Owner)</span>
                            <span class="text-lg font-bold text-slate-800">${fmt.format(cashBreakdown.safe || 0)}</span>
                        </div>
                        <div class="text-sm font-bold text-slate-400 mb-3">Nhân viên đang cầm:</div>
                        <div class="space-y-3">
                        ${(cashBreakdown.counters || []).length > 0 ? cashBreakdown.counters.map(c => `
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-slate-700 truncate mr-2" title="${c.name}">• ${c.name}</span>
                                <div class="flex items-center gap-3 shrink-0">
                                    <span class="text-sm font-bold ${c.amount < 0 ? 'text-rose-500' : 'text-amber-600'}">${fmt.format(c.amount)}</span>
                                    ${c.amount > 0 ? `<button class="btn-collect-cash px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-bold transition-colors" data-id="${c.user_id}" data-name="${c.name}" data-max="${c.amount}">Thu</button>` : `<span class="text-xs font-bold text-rose-500 px-3">Âm quỹ</span>`}
                                </div>
                            </div>
                        `).join('') : '<div class="text-sm text-slate-500 italic">Chưa có dữ liệu</div>'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Tạo Phiếu Mới -->
            <div id="modal-transaction" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-lg transform scale-95 transition-transform duration-300">
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-800">Lập Phiếu Thu / Chi</h3>
                        <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="form-transaction" class="space-y-4">
                            <!-- Nút AI (Giả lập) -->
                            <div class="flex gap-2 mb-4">
                                <button type="button" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-3 rounded-lg border border-indigo-200 flex items-center justify-center gap-2 transition-colors">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    Quét Hóa Đơn AI
                                </button>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Loại Phiếu</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <label class="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-emerald-500 [&:has(:checked)]:bg-emerald-50 transition-colors">
                                        <input type="radio" name="type" value="income" class="hidden" id="radio-income" required>
                                        <span class="font-bold text-emerald-600">PHIẾU THU (+)</span>
                                    </label>
                                    <label class="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 [&:has(:checked)]:border-rose-500 [&:has(:checked)]:bg-rose-50 transition-colors">
                                        <input type="radio" name="type" value="expense" class="hidden" id="radio-expense" required>
                                        <span class="font-bold text-rose-600">PHIẾU CHI (-)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-1">Danh Mục</label>
                                    <select id="tx-category" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-medium" required>
                                        <option value="">-- Chọn danh mục --</option>
                                        <optgroup label="Thu" id="opt-income" class="hidden">
                                            <option value="Thu góp vốn">Thu góp vốn</option>
                                            <option value="Thu thanh lý">Thu thanh lý</option>
                                            <option value="Hoàn ứng">Hoàn ứng</option>
                                            <option value="Khác">Khác</option>
                                        </optgroup>
                                        <optgroup label="Chi" id="opt-expense" class="hidden">
                                            <option value="Nhập hàng">Nhập hàng / Trả NCC</option>
                                            <option value="Thanh toán lương">Thanh toán lương</option>
                                            <option value="Mặt bằng">Mặt bằng / Thuê nhà</option>
                                            <option value="Điện nước">Điện nước / Internet</option>
                                            <option value="Marketing">Marketing / Quảng cáo</option>
                                            <option value="Khác">Khác</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-1">Hình thức</label>
                                    <select id="tx-payment-method" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-medium" required>
                                        <option value="cash">Tiền mặt</option>
                                        <option value="transfer">Chuyển khoản</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Số Tiền (VNĐ)</label>
                                <input type="number" id="tx-amount" min="1000" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-bold text-slate-800 text-lg" required>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Diễn Giải / Ghi chú</label>
                                <input type="text" id="tx-description" placeholder="Mô tả chi tiết khoản thu/chi" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-medium">
                            </div>

                            <!-- Upload Chứng từ gốc -->
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Đính kèm chứng từ (Tùy chọn)</label>
                                <label class="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors block">
                                    <input type="file" id="tx-attachment" accept="image/*,.pdf,.doc,.docx" class="hidden" onchange="document.getElementById('file-name').textContent = this.files[0] ? this.files[0].name : 'Click để tải lên ảnh bill, hóa đơn đỏ...'">
                                    <svg class="w-6 h-6 text-slate-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                    <span id="file-name" class="text-sm text-slate-500 font-medium">Click để tải lên ảnh bill, hóa đơn đỏ...</span>
                                </label>
                            </div>
                            
                            <div class="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" id="btn-cancel-tx" class="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50/80 transition-colors">Hủy</button>
                                <button type="submit" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                                    Lưu Phiếu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Thu Tiền Nội Bộ -->
            <div id="modal-collect-cash" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="bg-emerald-600 p-4 flex justify-between items-center text-white">
                        <div>
                            <h3 class="font-bold text-lg">Thu Tiền Nhân Viên</h3>
                            <p class="text-xs opacity-80" id="collect-staff-name">---</p>
                        </div>
                        <button id="btn-close-collect-modal" class="hover:bg-white/20 p-1 rounded transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <form id="form-collect-cash" class="space-y-4">
                            <input type="hidden" id="collect-staff-id" name="staff_id">
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Số tiền thu (VNĐ)</label>
                                <div class="relative">
                                    <input type="number" id="collect-amount" name="amount" min="1000" class="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all font-bold text-slate-800 text-lg" required>
                                    <button type="button" id="btn-collect-all" class="absolute right-2 top-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1.5 rounded transition-colors">TẤT CẢ</button>
                                </div>
                                <p class="text-xs text-slate-500 mt-1">Đang giữ: <span id="collect-max-label" class="font-bold text-amber-600">0</span></p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Hình thức nhận</label>
                                <select id="collect-method" name="receive_method" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all font-medium">
                                    <option value="cash">Tiền mặt (Vào Két an toàn)</option>
                                    <option value="transfer">Chuyển khoản (Vào thẻ NH)</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Ghi chú (Tùy chọn)</label>
                                <input type="text" id="collect-note" name="description" placeholder="VD: Thu tiền ca sáng" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all text-sm">
                            </div>
                            
                            <div class="pt-4 mt-2 flex justify-end gap-3">
                                <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                                    Xác Nhận Thu Tiền
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Chi tiết Hóa đơn (Popup xem hóa đơn tự động) -->
            <div id="modal-invoice-detail" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div>
                            <p class="text-xs opacity-80">Chi tiết Hóa Đơn</p>
                            <h4 class="font-bold text-lg" id="detail-invoice-id">INV-20260901-001</h4>
                        </div>
                        <button id="btn-close-invoice" class="hover:bg-white/20 p-1 rounded transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5 bg-slate-50">
                        <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Khách hàng:</span><span class="font-bold text-slate-800">Khách Lẻ</span></div>
                        <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Người bán:</span><span class="font-medium text-slate-800">@phuong</span></div>
                        <div class="flex justify-between text-sm mb-4"><span class="text-slate-500">Thời gian:</span><span class="font-medium text-slate-800">01/09/2026 14:30</span></div>
                        <div class="border-t border-slate-200 pt-3 border-dashed">
                            <!-- Mock Items -->
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-slate-700">Áo thun x 2</span>
                                <span class="text-slate-800">300.000đ</span>
                            </div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-slate-700">Quần Jean x 1</span>
                                <span class="text-slate-800">550.000đ</span>
                            </div>
                        </div>
                        <div class="border-t border-slate-200 pt-3 mt-3 border-dashed flex justify-between items-center">
                            <span class="font-bold text-slate-700">TỔNG CỘNG:</span>
                            <span class="font-black text-indigo-600 text-lg">850.000đ</span>
                        </div>
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
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Chưa có giao dịch nào.</span>
            </div>
        </td></tr>`;
        }
        
        const fmt = new Intl.NumberFormat('vi-VN');
        
        return transactions.map(t => {
            const isIncome = t.type === 'income';
            
            // TYPE
            const typeBadge = isIncome 
                ? `<span class="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200">THU</span>`
                : `<span class="px-2 py-1 bg-rose-50 text-rose-700 font-bold text-[10px] rounded border border-rose-200">CHI</span>`;
            
            // SOURCE (Auto from Invoice vs Manual)
            const isAuto = t.source === 'auto' || t.invoice_id;
            const txCode = isIncome ? `PT-${String(t.id).padStart(4, '0')}` : `PC-${String(t.id).padStart(4, '0')}`;
            const attachmentIcon = t.attachment_url ? ` <svg class="w-4 h-4 inline text-indigo-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Có chứng từ đính kèm"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>` : '';
            const sourceBadge = isAuto 
                ? `<span class="inline-flex items-center gap-1 text-indigo-600 font-bold text-xs cursor-pointer hover:underline btn-view-invoice" data-id="${t.invoice_id}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    ${t.invoice_id || txCode}
                   </span>${attachmentIcon}`
                : `<span class="text-slate-600 font-bold text-xs inline-flex items-center gap-1 cursor-pointer hover:underline btn-view-invoice" data-id="${txCode}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    ${txCode}
                   </span>${attachmentIcon}`;

            // PAYMENT METHOD
            const methodBadge = t.payment_method === 'transfer'
                ? `<span class="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">Chuyển khoản</span>`
                : `<span class="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">Tiền mặt</span>`;
                
            const amountColor = isIncome ? 'text-emerald-600' : 'text-rose-600';
            const amountPrefix = isIncome ? '+' : '-';
            const dateFmt = new Date(t.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' });
            
            return `
                <tr class="hover:bg-slate-50/80 transition-colors/80 transition-colors">
                    <td class="p-4 font-semibold text-slate-500 text-xs whitespace-nowrap">${dateFmt}</td>
                    <td class="p-4 text-center">${typeBadge}</td>
                    <td class="p-4">${sourceBadge}</td>
                    <td class="p-4">
                        <div class="font-bold text-slate-800">${t.category}</div>
                        ${methodBadge}
                    </td>
                    <td class="p-4 text-slate-600 text-sm max-w-[200px] truncate" title="${t.description || ''}">${t.description || ''}</td>
                    <td class="p-4 text-right font-black ${amountColor}">${amountPrefix} ${fmt.format(t.amount)}</td>
                    <td class="p-4 text-center text-xs font-bold text-slate-500">@${t.username}</td>
                    <td class="p-4 text-center">
                        <button class="btn-view-invoice text-indigo-600 hover:text-indigo-800 text-xs font-bold" data-id="${t.invoice_id || txCode}" title="Xem chi tiết">
                            Chi tiết
                        </button>
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
        // Toggle Advanced Filter
        const btnFilter = document.getElementById('btn-filter');
        const filterPanel = document.getElementById('advanced-filter-panel');
        if (btnFilter && filterPanel) {
            if (this.state.filterPanelOpen) {
                btnFilter.classList.add('bg-slate-100');
            }
            btnFilter.addEventListener('click', () => {
                this.state.filterPanelOpen = !this.state.filterPanelOpen;
                filterPanel.classList.toggle('hidden', !this.state.filterPanelOpen);
                btnFilter.classList.toggle('bg-slate-100', this.state.filterPanelOpen);
            });
        }

        // Logic for Radio buttons changing Categories in Modal
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


