export default class OwnerStaffView {
    constructor() {
        this.container = document.getElementById('content-area');
        this.activeTab = 'tab-staff-list';
    }

    render(records, users, currentMonth) {
        let html = `
            <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
                <!-- Toolbar & Tabs -->
                <div class="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800">Quản lý Nhân sự & Chấm công</h2>
                            <p class="text-sm text-slate-500 mt-1">Cấu hình mức lương và xem bảng công tự động</p>
                        </div>
                        
                        <!-- Header Buttons (hiện theo tab) -->
                        <div id="toolbar-actions" class="flex items-center gap-3">
                            <!-- JS sẽ inject nút tùy tab -->
                        </div>
                    </div>
                    
                    <!-- Tab Headers -->
                    <div class="flex gap-4 border-b border-slate-200 shadow-sm">
                        <button data-tab="tab-staff-list" class="tab-btn px-4 py-2 font-bold text-sm border-b-2 transition-colors ${this.activeTab === 'tab-staff-list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                            Hồ sơ & Mức lương
                        </button>
                        <button data-tab="tab-attendance" class="tab-btn px-4 py-2 font-bold text-sm border-b-2 transition-colors ${this.activeTab === 'tab-attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                            Bảng công & Trả lương
                        </button>
                    </div>
                </div>

                <!-- TAB 1: DANH SÁCH NHÂN VIÊN -->
                <div id="tab-staff-list" class="tab-content flex-1 overflow-auto p-5 ${this.activeTab === 'tab-staff-list' ? '' : 'hidden'}">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th class="p-4 rounded-tl-lg">Tên nhân viên / Username</th>
                                <th class="p-4 text-center">Vai trò</th>
                                <th class="p-4 text-center">Trạng thái</th>
                                <th class="p-4 text-center">Lương / Giờ (VNĐ)</th>
                                <th class="p-4 text-center rounded-tr-lg">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                            ${this.renderUsers(users)}
                        </tbody>
                    </table>
                </div>

                <!-- TAB 2: BẢNG CHẤM CÔNG -->
                <div id="tab-attendance" class="tab-content flex-1 overflow-auto p-5 ${this.activeTab === 'tab-attendance' ? '' : 'hidden'}">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th class="p-4 rounded-tl-lg">Nhân viên</th>
                                <th class="p-4">Ngày</th>
                                <th class="p-4">Các Ca Làm</th>
                                <th class="p-4 text-center">Giờ Chuẩn</th>
                                <th class="p-4 text-center">Tăng Ca (OT)</th>
                                <th class="p-4 text-right rounded-tr-lg">Lương Tạm Tính</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
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
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Chưa có nhân viên.</span>
            </div>
        </td></tr>`;
        
        return users.map(u => {
            const roleBadge = u.role === 'owner' ? 'bg-purple-100 text-purple-700' 
                            : (u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700');
            
            return `
                <tr class="hover:bg-slate-50/80 transition-colors/80 transition-colors" data-id="${u.id}">
                    <td class="p-4">
                        <div class="font-bold text-slate-800">${u.full_name || u.username}</div>
                        <div class="text-[10px] text-slate-500">@${u.username}</div>
                    </td>
                    <td class="p-4 text-center">
                        <span class="px-2 py-1 ${roleBadge} text-xs font-bold rounded">${u.role.toUpperCase()}</span>
                    </td>
                    <td class="p-4 text-center">
                        <span class="px-2 py-1 ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'} text-xs font-bold rounded">${u.is_active ? 'Hoạt động' : 'Khóa'}</span>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <input type="number" value="${u.hourly_wage || 0}" class="input-wage w-28 px-3 py-1.5 border border-slate-300 rounded text-right font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all">
                            <span class="text-xs text-slate-500 font-medium">đ/h</span>
                        </div>
                    </td>
                    <td class="p-4 text-center">
                        <button class="btn-save-wage px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold text-xs rounded border border-indigo-200 transition-colors shadow-sm">
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
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Chưa có dữ liệu chấm công tháng này.</span>
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
                <tr class="hover:bg-slate-50/80 transition-colors/80 transition-colors">
                    <td class="p-4">
                        <div class="font-bold text-slate-800">${r.full_name || r.username}</div>
                        <div class="text-[10px] text-slate-500 uppercase">Mức lương: ${new Intl.NumberFormat('vi-VN').format(wage)}đ/h</div>
                    </td>
                    <td class="p-4 font-semibold text-slate-700">
                        ${r.date}
                        ${r.is_working ? `<span class="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded animate-pulse">Đang trong ca</span>` : ''}
                    </td>
                    <td class="p-4 text-xs font-medium text-slate-600">
                        ${(r.shifts || '').split(', ').map(s => s ? `<span class="inline-block px-2 py-1 bg-slate-100 rounded mr-1 mb-1">${s}</span>` : '').join('')}
                    </td>
                    <td class="p-4 text-center font-black text-indigo-600">${r.standard_hours > 0 ? r.standard_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-center font-black text-rose-500">${r.ot_hours > 0 ? r.ot_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-right font-black text-emerald-600">${totalSalary > 0 ? salaryFmt : '--'}</td>
                </tr>
            `;
        }).join('');
    }

    updateToolbar(currentMonth) {
        const toolbar = document.getElementById('toolbar-actions');
        if (!toolbar) return;
        
        if (this.activeTab === 'tab-attendance') {
            toolbar.innerHTML = `
                <select id="filter-month" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all">
                    <!-- Sẽ đc populate -->
                </select>
                <button id="btn-export-excel" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
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

