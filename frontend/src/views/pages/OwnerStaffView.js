export default class OwnerStaffView {
    constructor() {
        this.container = document.getElementById('content-area');
        this.activeTab = 'tab-staff-list';
    }

    render(records, users, currentMonth) {
        let html = `
            <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col h-full">
                <!-- Toolbar & Tabs Tinh gọn -->
                <div class="p-2 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between flex-wrap gap-2">
                    <!-- Tab Headers -->
                    <div class="flex gap-1.5">
                        <button data-tab="tab-staff-list" class="tab-btn px-3 py-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${this.activeTab === 'tab-staff-list' ? 'text-[#5745f5] bg-[#f0edff]' : 'text-[#7b8499] hover:text-[#182033] bg-white border border-[#e7eaf2]'}">
                            Hồ sơ & Mức lương
                        </button>
                        <button data-tab="tab-attendance" class="tab-btn px-3 py-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${this.activeTab === 'tab-attendance' ? 'text-[#5745f5] bg-[#f0edff]' : 'text-[#7b8499] hover:text-[#182033] bg-white border border-[#e7eaf2]'}">
                            Bảng công & Lương tháng
                        </button>
                    </div>

                    <!-- Header Buttons (hiện theo tab) -->
                    <div id="toolbar-actions" class="flex items-center gap-2">
                        <!-- JS sẽ inject nút tùy tab -->
                    </div>
                </div>

                <!-- TAB 1: DANH SÁCH NHÂN VIÊN -->
                <div id="tab-staff-list" class="tab-content flex-1 overflow-auto p-2.5 custom-scrollbar ${this.activeTab === 'tab-staff-list' ? '' : 'hidden'}">
                    <table class="w-full text-left border-collapse min-w-[700px]">
                        <thead class="bg-[#fafbfd] text-[#7b8499] text-xs uppercase font-black tracking-wider border-b border-[#e7eaf2]">
                            <tr>
                                <th class="p-4">Tên nhân viên / Username</th>
                                <th class="p-4 text-center">Vai trò</th>
                                <th class="p-4 text-center">Trạng thái</th>
                                <th class="p-4 text-center">Lương / Giờ (VNĐ)</th>
                                <th class="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#e7eaf2] text-sm text-[#182033]">
                            ${this.renderUsers(users)}
                        </tbody>
                    </table>
                </div>

                <!-- TAB 2: BẢNG CHẤM CÔNG -->
                <div id="tab-attendance" class="tab-content flex-1 overflow-auto p-5 custom-scrollbar ${this.activeTab === 'tab-attendance' ? '' : 'hidden'}">
                    <table class="w-full text-left border-collapse min-w-[750px]">
                        <thead class="bg-[#fafbfd] text-[#7b8499] text-xs uppercase font-black tracking-wider border-b border-[#e7eaf2]">
                            <tr>
                                <th class="p-4">Nhân viên</th>
                                <th class="p-4">Ngày</th>
                                <th class="p-4">Các Ca Làm</th>
                                <th class="p-4 text-center">Giờ Chuẩn</th>
                                <th class="p-4 text-center">Tăng Ca (OT)</th>
                                <th class="p-4 text-right">Lương Tạm Tính</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#e7eaf2] text-sm text-[#182033]">
                            ${this.renderAttendance(records)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.updateToolbar(currentMonth);
    }

    renderUsers(users) {
        if (!users || users.length === 0) return `<tr><td colspan="5" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-14 h-14 rounded-2xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-xl mb-3">👥</div>
                <span class="text-[#7b8499] font-medium text-sm">Chưa có nhân viên nào trong danh sách.</span>
            </div>
        </td></tr>`;
        
        return users.map(u => {
            const roleBadge = u.role === 'owner' ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : (u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#f0edff] text-[#5745f5] border border-[#e1dcff]');
            
            return `
                <tr class="hover:bg-[#fafbfd] transition-colors" data-id="${u.id}">
                    <td class="p-4">
                        <div class="font-bold text-[#182033]">${u.full_name || u.username}</div>
                        <div class="text-xs font-semibold text-[#7b8499]">@${u.username}</div>
                    </td>
                    <td class="p-4 text-center">
                        <span class="px-2.5 py-1 ${roleBadge} text-[11px] font-black rounded-[6px] uppercase tracking-wider">${u.role}</span>
                    </td>
                    <td class="p-4 text-center">
                        <span class="px-2.5 py-1 ${u.is_active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'} text-[11px] font-black rounded-[6px]">${u.is_active ? 'Hoạt động' : 'Khóa'}</span>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <input type="number" value="${u.hourly_wage || 0}" class="input-wage w-28 px-3 py-1.5 bg-white border border-[#e7eaf2] rounded-[8px] text-right font-black text-[#182033] focus:outline-none focus:border-[#5745f5] shadow-sm transition-all text-xs">
                            <span class="text-xs text-[#7b8499] font-bold">đ/h</span>
                        </div>
                    </td>
                    <td class="p-4 text-center">
                        <button class="btn-save-wage px-3.5 py-1.5 bg-[#5745f5] hover:bg-[#4735e5] text-white font-bold text-xs rounded-[8px] transition-colors shadow-sm">
                            Lưu Mức Lương
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderAttendance(records) {
        if (!records || records.length === 0) {
            return `<tr><td colspan="6" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-14 h-14 rounded-2xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-xl mb-3">🕒</div>
                <span class="text-[#7b8499] font-bold text-sm">Chưa có dữ liệu chấm công tháng này.</span>
            </div>
        </td></tr>`;
        }
        
        return records.map(r => {
            const wage = r.hourly_wage || 0;
            const standardSalary = (r.standard_hours || 0) * wage;
            const otSalary = (r.ot_hours || 0) * wage * 1.5;
            const totalSalary = standardSalary + otSalary;
            const salaryFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSalary);
            
            return `
                <tr class="hover:bg-[#fafbfd] transition-colors">
                    <td class="p-4">
                        <div class="font-bold text-[#182033]">${r.full_name || r.username}</div>
                        <div class="text-[11px] font-bold text-[#5745f5] uppercase">Mức lương: ${new Intl.NumberFormat('vi-VN').format(wage)}đ/h</div>
                    </td>
                    <td class="p-4 font-bold text-[#182033]">
                        ${r.date}
                        ${r.is_working ? `<span class="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-[4px] animate-pulse">Đang trong ca</span>` : ''}
                    </td>
                    <td class="p-4 text-xs font-semibold text-[#7b8499]">
                        ${(r.shifts || '').split(', ').map(s => s ? `<span class="inline-block px-2 py-1 bg-[#f5f6fa] text-[#182033] font-semibold rounded-[6px] border border-[#e7eaf2] mr-1 mb-1">${s}</span>` : '').join('')}
                    </td>
                    <td class="p-4 text-center font-black text-[#5745f5]">${r.standard_hours > 0 ? r.standard_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-center font-black text-rose-600">${r.ot_hours > 0 ? r.ot_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-right font-black text-emerald-700">${totalSalary > 0 ? salaryFmt : '--'}</td>
                </tr>
            `;
        }).join('');
    }

    updateToolbar(currentMonth) {
        const toolbar = document.getElementById('toolbar-actions');
        if (!toolbar) return;
        
        if (this.activeTab === 'tab-attendance') {
            toolbar.innerHTML = `
                <select id="filter-month" class="px-3 py-1.5 bg-white border border-[#e7eaf2] rounded-[8px] text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] shadow-sm transition-all">
                    <!-- Sẽ đc populate -->
                </select>
                <button id="btn-export-excel" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-[8px] shadow-sm transition-colors flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Xuất Excel Lương
                </button>
            `;
            this.populateMonthSelect(currentMonth);
        } else {
            toolbar.innerHTML = ``;
        }
    }

    populateMonthSelect(currentMonth) {
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
            if (mStr === currentMonth) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }
    }
}
