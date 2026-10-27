export default class StaffAttendanceView {
    constructor() {
        this.container = document.getElementById('content-area');
        this.clockInterval = null;
    }

    render(records) {
        let html = `
            <div class="h-full flex flex-col gap-3 p-1 max-w-[1400px] mx-auto w-full">
                <!-- Vùng Chấm công nhanh Tinh gọn -->
                <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <div class="flex flex-col sm:flex-row items-center gap-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f6fa] border border-[#e7eaf2] rounded-lg">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <div class="text-xs font-bold text-[#182033]" id="real-time-clock">Đang đồng bộ giờ hệ thống...</div>
                        </div>
                        <span class="text-[11px] font-medium text-[#7b8499]">Ghi nhận giờ làm việc tự động</span>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <button id="btn-attendance-checkin" class="px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 shadow-sm shadow-emerald-500/20 text-white flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                            <span class="text-xs font-black tracking-wide">VÀO CA (Check-in)</span>
                        </button>
                        
                        <button id="btn-attendance-checkout" class="px-5 py-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 shadow-sm shadow-rose-500/20 text-white flex items-center gap-2 transition-all cursor-pointer border border-rose-400/30">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            <span class="text-xs font-black tracking-wide">TAN CA (Check-out)</span>
                        </button>
                    </div>
                </div>

                <!-- Lịch sử chấm công (Rộng rãi) -->
                <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex-1 flex flex-col">
                    <div class="p-3 border-b border-[#e7eaf2] bg-[#fafbfd] flex items-center justify-between flex-wrap gap-2">
                        <h2 class="text-xs font-black text-[#182033]">Nhật ký chấm công tháng này</h2>
                        <div class="text-[11px] font-semibold text-[#7b8499]">
                            Đơn giá chuẩn: <span class="font-bold text-[#182033]">25.000đ/h</span> • OT: <span class="font-bold text-[#5745f5]">x1.5</span>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-[#fafbfd] text-[#7b8499] text-[11px] uppercase font-black tracking-wider border-b border-[#e7eaf2] sticky top-0">
                                <tr>
                                    <th class="p-3">Ngày Làm Việc</th>
                                    <th class="p-3">Thời Gian Các Ca (Vào - Ra)</th>
                                    <th class="p-3 text-center">Giờ Chuẩn</th>
                                    <th class="p-3 text-center">Tăng Ca (OT)</th>
                                    <th class="p-3 text-right">Lương Dự Kiến</th>
                                </tr>
                            </thead>
                            <tbody id="attendance-table-body" class="divide-y divide-[#e7eaf2] text-xs font-medium">
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
            return `<tr><td colspan="5" class="p-8 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-10 h-10 rounded-xl bg-[#f0edff] flex items-center justify-center text-[#5745f5] mb-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span class="text-[#182033] font-bold text-xs">Chưa có dữ liệu chấm công nào trong tháng</span>
            </div>
        </td></tr>`;
        }
        
        return records.map(r => {
            const standardSalary = (r.standard_hours || 0) * 25000;
            const otSalary = (r.ot_hours || 0) * 25000 * 1.5;
            const totalSalary = standardSalary + otSalary;
            const salaryFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSalary);
            
            return `
                <tr class="hover:bg-[#fafbfd] transition-colors">
                    <td class="p-3 font-bold text-[#182033]">
                        <div class="flex items-center gap-2">
                            <span>${r.date}</span>
                            ${r.is_working ? `<span class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black rounded-md animate-pulse">Đang làm</span>` : ''}
                        </div>
                    </td>
                    <td class="p-3 text-[11px] font-semibold text-[#182033]">
                        ${(r.shifts || '').split(', ').map(s => s ? `<span class="inline-block px-2 py-0.5 bg-[#f5f6fa] border border-[#e7eaf2] text-[#182033] rounded-md mr-1 mb-0.5 font-mono text-[10px]">${s}</span>` : '').join('')}
                    </td>
                    <td class="p-3 text-center font-bold text-[#5745f5]">${r.standard_hours > 0 ? r.standard_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-3 text-center font-bold text-rose-600">${r.ot_hours > 0 ? r.ot_hours.toFixed(2) + 'h' : '--'}</td>
                    <td class="p-3 text-right font-black text-emerald-600 text-xs">${totalSalary > 0 ? salaryFmt : '--'}</td>
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
            const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
            clockEl.innerText = `${timeStr} • ${dateStr}`;
        };

        updateTime();
        this.clockInterval = setInterval(updateTime, 1000);
    }
}
