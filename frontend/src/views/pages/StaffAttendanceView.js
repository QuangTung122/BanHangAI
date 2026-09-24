export default class StaffAttendanceView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(records) {
        let html = `
            <div class="h-full flex flex-col gap-6">
                <!-- Vùng Chấm công nhanh -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center shrink-0">
                    <h2 class="text-2xl font-black text-slate-900 mb-1">Bảng Chấm Công Trực Tuyến</h2>
                    <p class="text-sm font-bold text-slate-600 mb-8" id="real-time-clock">Đang đồng bộ giờ chuẩn hệ thống...</p>
                    
                    <div class="flex items-center gap-8">
                        <button id="btn-attendance-checkin" class="w-36 h-36 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/20 text-white flex flex-col items-center justify-center transition-all">
                            <svg class="w-10 h-10 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                            <span class="text-lg font-black tracking-wide">VÀO CA</span>
                        </button>
                        
                        <div class="w-12 h-px bg-slate-300"></div>
                        
                        <button id="btn-attendance-checkout" class="w-36 h-36 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-600/20 text-white flex flex-col items-center justify-center transition-all">
                            <svg class="w-10 h-10 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            <span class="text-lg font-black tracking-wide">TAN CA</span>
                        </button>
                    </div>
                </div>

                <!-- Lịch sử chấm công -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                    <div class="p-5 border-b border-slate-200 bg-slate-50">
                        <h2 class="text-lg font-black text-slate-900">Nhật ký chấm công cá nhân</h2>
                        <p class="text-xs text-slate-600 font-semibold mt-0.5">Hệ thống ghi nhận chính xác theo từng phút làm việc</p>
                    </div>
                    
                    <div class="flex-1 overflow-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-100 text-slate-700 text-xs uppercase font-black tracking-wider border-b border-slate-200">
                                <tr>
                                    <th class="p-4">Ngày Làm Việc</th>
                                    <th class="p-4">Thời Gian Các Ca (Vào - Ra)</th>
                                    <th class="p-4 text-center">Giờ Chuẩn</th>
                                    <th class="p-4 text-center">Tăng Ca (OT)</th>
                                    <th class="p-4 text-right">Lương Dự Kiến</th>
                                </tr>
                            </thead>
                            <tbody id="attendance-table-body" class="divide-y divide-slate-100 text-sm">
                                ${this.renderRows(records)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.startClock();
    }

    renderRows(records) {
        if (!records || records.length === 0) {
            return `<tr><td colspan="5" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Chưa có dữ liệu chấm công nào trong tháng.</span>
            </div>
        </td></tr>`;
        }
        
        return records.map(r => {
            const standardSalary = (r.standard_hours || 0) * 25000;
            const otSalary = (r.ot_hours || 0) * 25000 * 1.5;
            const totalSalary = standardSalary + otSalary;
            const salaryFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSalary);
            
            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-black text-slate-900">
                        ${r.date}
                        ${r.is_working ? `<span class="ml-2 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black rounded-md">Đang làm việc</span>` : ''}
                    </td>
                    <td class="p-4 text-xs font-bold text-slate-700">
                        ${(r.shifts || '').split(', ').map(s => s ? `<span class="inline-block px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded-lg mr-1.5 mb-1">${s}</span>` : '').join('')}
                    </td>
                    <td class="p-4 text-center font-black text-indigo-700">${r.standard_hours > 0 ? r.standard_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-center font-black text-rose-700">${r.ot_hours > 0 ? r.ot_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-4 text-right font-black text-emerald-700 text-base">${totalSalary > 0 ? salaryFmt : '--'}</td>
                </tr>
            `;
        }).join('');
    }

    startClock() {
        const clockEl = document.getElementById('real-time-clock');
        if (!clockEl) return;

        if (this.clockInterval) clearInterval(this.clockInterval);

        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            clockEl.innerText = `${timeStr} • ${dateStr}`;
        };

        updateTime();
        this.clockInterval = setInterval(updateTime, 1000);
    }
}
