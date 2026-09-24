export default class OwnerDashboardView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(data) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <!-- 3 Thẻ Chỉ Số Quan Trọng -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
                    <!-- Doanh thu -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="flex items-center gap-3 mb-2.5">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <p class="text-sm font-bold text-slate-700">Tổng doanh thu tích lũy</p>
                        </div>
                        <h3 class="text-3xl font-black text-slate-900 mb-3 tracking-tight">${fmt.format(data.total_revenue || 0)}</h3>
                        <div class="flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                                <svg class="w-3 h-3 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                +18.4%
                            </span>
                            <span class="text-slate-600 font-semibold">so với tuần trước</span>
                        </div>
                    </div>
                    
                    <!-- Đơn hàng -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="flex items-center gap-3 mb-2.5">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            </div>
                            <p class="text-sm font-bold text-slate-700">Đơn hàng hoàn thành</p>
                        </div>
                        <h3 class="text-3xl font-black text-slate-900 mb-3 tracking-tight">${data.completed_orders || 0} <span class="text-sm font-bold text-slate-600">đơn</span></h3>
                        <div class="flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                                <svg class="w-3 h-3 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                +25.0%
                            </span>
                            <span class="text-slate-600 font-semibold">so với tuần trước</span>
                        </div>
                    </div>
                    
                    <!-- Sắp hết hàng -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="flex items-center gap-3 mb-2.5">
                            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <p class="text-sm font-bold text-slate-700">Cảnh báo tồn kho thấp</p>
                        </div>
                        <h3 class="text-3xl font-black ${Number(data.low_stock_products) > 0 ? 'text-rose-600' : 'text-slate-900'} mb-3 tracking-tight">
                            ${data.low_stock_products || 0} <span class="text-sm font-bold text-slate-600">mặt hàng</span>
                        </h3>
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md ${Number(data.low_stock_products) > 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-700'} border">
                                Ngưỡng tối thiểu: 5
                            </span>
                            <span class="text-slate-500 font-medium">Cần lên kế hoạch nhập hàng</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <!-- Biểu đồ Doanh thu -->
                    <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                                Biểu đồ tăng trưởng doanh thu
                            </h3>
                            <div class="flex items-center gap-2 flex-wrap">
                                <input type="date" id="chart-start-date" class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600">
                                <span class="text-xs text-slate-500 font-bold">-</span>
                                <input type="date" id="chart-end-date" class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600">
                                <button id="btn-filter-chart" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors shadow-sm">Lọc</button>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col relative w-full h-full min-h-[260px]">
                            <canvas id="revenueChart" class="w-full h-full"></canvas>
                        </div>
                    </div>
                    
                    <!-- Top Bán Chạy -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                                <svg class="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.633 1.135-.867 1.833-.466 1.393-.656 2.924-.656 4.119 0 .8.09 1.547.258 2.213-.306-.237-.582-.544-.805-.91-.295-.483-.497-1.077-.594-1.745a1 1 0 00-1.928.328c.18 1.25.6 2.404 1.22 3.328.62.923 1.488 1.63 2.563 1.936a5.502 5.502 0 004.832-1.408c1.328-1.258 2.05-3.056 2.05-4.887 0-1.785-.694-3.54-1.801-4.896a12.825 12.825 0 00-2-1.977zM10 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
                                Top Sản Phẩm Bán Chạy
                            </h3>
                            <a href="#menu-owner-products" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">Xem tất cả &rarr;</a>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar">
                            <div class="space-y-4">
                                ${(data.top_products || []).map((p, index) => {
                                    const maxSold = Math.max(...(data.top_products || []).map(x => x.sold));
                                    const progress = maxSold > 0 ? Math.round((p.sold / maxSold) * 100) : 0;
                                    const rankBadge = index === 0 ? 'bg-amber-500 text-white' : (index === 1 ? 'bg-slate-400 text-white' : (index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'));
                                    const img = p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random" class="w-full h-full object-cover">`;
                                    
                                    return `
                                    <div class="flex items-center gap-3">
                                        <div class="w-6 h-6 rounded-md ${rankBadge} flex items-center justify-center font-black text-xs shrink-0">${index + 1}</div>
                                        <div class="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            ${img}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="text-xs font-bold text-slate-900 truncate">${p.name}</h4>
                                            <div class="flex items-center gap-2 mt-1">
                                                <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div class="h-full bg-indigo-600 rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                                <span class="text-[10px] font-bold text-slate-500 w-7">${progress}%</span>
                                            </div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <div class="text-xs font-black text-slate-900">${p.sold} đã bán</div>
                                            <div class="text-[10px] text-indigo-700 font-bold mt-0.5">${fmt.format(p.revenue || 0)}</div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                                ${(!data.top_products || data.top_products.length === 0) ? '<p class="text-xs text-slate-500 text-center py-6 font-semibold">Chưa có giao dịch bán hàng nào</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insight Banner -->
                <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-md p-6 shrink-0 flex flex-col md:flex-row items-center justify-between border border-slate-800 relative overflow-hidden">
                    <div class="flex items-center gap-5 relative z-10 w-full md:w-auto">
                        <div class="w-14 h-14 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500 text-white uppercase tracking-wider">AI Phân tích Doanh thu</span>
                            </div>
                            <h3 class="text-lg md:text-xl font-black text-white leading-tight">Tổng kết tình hình kinh doanh thời gian thực</h3>
                            <p class="text-slate-300 text-xs mt-1 font-medium max-w-lg">Bấm phân tích để AI rà soát dữ liệu hóa đơn, tồn kho và đưa ra gợi ý chiến lược nhập hàng.</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 md:mt-0 relative z-10 w-full md:w-auto flex justify-end">
                        <button id="btn-ai-insight" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
                            Phân Tích Ngay
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                </div>
                <div id="ai-insight-result" class="hidden p-5 bg-white rounded-2xl border border-indigo-200 text-sm font-semibold text-slate-800 leading-relaxed shadow-sm">
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderChart(chartData) {
        if (!chartData || chartData.length === 0) return '';
        const max = Math.max(...chartData.map(c => c.revenue), 1000000);
        return chartData.map(c => {
            const h = (c.revenue / max) * 100;
            return `
                <div class="flex-1 flex flex-col items-center justify-end group h-full relative cursor-pointer">
                    <div class="w-full max-w-[40px] bg-indigo-600 rounded-t-sm transition-all duration-200 group-hover:bg-indigo-500" style="height: ${h}%"></div>
                    <div class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.revenue)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError(msg) {
        this.container.innerHTML = `<div class="p-8 text-center text-rose-600 font-black text-sm bg-white rounded-2xl border border-rose-200">${msg}</div>`;
    }
}
