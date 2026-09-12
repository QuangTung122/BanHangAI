export default class StaffAttendanceView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(records) {
        let html = `
            <div class="h-full flex flex-col gap-6">
                <!-- Vùng Chấm công nhanh -->
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-8 flex flex-col items-center justify-center shrink-0">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">Bảng chấm công điện tử</h2>
                    <p class="text-slate-500 mb-8" id="real-time-clock">Đang tải giờ hệ thống...</p>
                    
                    <div class="flex items-center gap-6">
                        <button id="btn-attendance-checkin" class="w-40 h-40 rounded-full bg-emerald-500 hover:bg-emerald-600 hover:scale-105 shadow-lg shadow-emerald-500/30 text-white flex flex-col items-center justify-center transition-all duration-300">
                            <svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                            <span class="text-xl font-black tracking-wide">VÀO CA</span>
                        </button>
                        
                        <div class="w-20 h-px bg-slate-200"></div>
                        
                        <button id="btn-attendance-checkout" class="w-40 h-40 rounded-full bg-rose-500 hover:bg-rose-600 hover:scale-105 shadow-lg shadow-rose-500/30 text-white flex flex-col items-center justify-center transition-all duration-300">
                            <svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            <span class="text-xl font-black tracking-wide">TAN CA</span>
                        </button>
                    </div>
                </div>

                <!-- Lịch sử chấm công -->
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex-1 flex flex-col">
                    <div class="p-5 border-b border-slate-100 bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-800">Lịch sử chấm công của tôi</h2>
                        <p class="text-xs text-slate-500 mt-1">Lưu ý: Mức lương tạm tính chỉ mang tính tham khảo (25k/h).</p>
                    </div>
                    
                    <div class="flex-1 overflow-auto p-5">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th class="p-4 rounded-tl-lg">Ngày</th>
                                    <th class="p-4">Các Ca Làm (Vào - Ra)</th>
                                    <th class="p-4 text-center">Giờ Chuẩn</th>
                                    <th class="p-4 text-center">Tăng Ca (OT)</th>
                                    <th class="p-4 text-right rounded-tr-lg">Thu Nhập Tạm Tính</th>
                                </tr>
                            </thead>
                            <tbody id="attendance-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
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
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Bạn chưa có lịch sử chấm công nào.</span>
            </div>
        </td></tr>`;
        }
        
        return records.map(r => {
            // Tạm hiển thị 25k/h để nv tham khảo
            const standardSalary = (r.standard_hours || 0) * 25000;
            const otSalary = (r.ot_hours || 0) * 25000 * 1.5;
            const totalSalary = standardSalary + otSalary;
            const salaryFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSalary);
            
            return `
                <tr class="hover:bg-slate-50/80 transition-colors/80 transition-colors">
                    <td class="p-4 font-bold text-slate-700">
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

    startClock() {
        const clockEl = document.getElementById('real-time-clock');
        if (!clockEl) return;

        this.clockInterval = setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (document.getElementById('real-time-clock')) {
                document.getElementById('real-time-clock').innerText = `${timeStr} - ${dateStr}`;
            }
        }, 1000);
    }
}

