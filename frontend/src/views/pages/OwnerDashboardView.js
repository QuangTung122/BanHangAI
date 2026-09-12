export default class OwnerDashboardView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(data) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <!-- Doanh thu -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <p class="text-sm font-semibold text-slate-500">Tổng doanh thu</p>
                        </div>
                        <h3 class="text-2xl font-black text-slate-800 mb-4">${fmt.format(data.total_revenue || 0)}</h3>
                        <div class="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-4">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                            +18.4% <span class="text-slate-400 font-medium ml-1">so với tuần trước</span>
                        </div>
                        <!-- Sparkline Mock -->
                        <div class="absolute bottom-0 left-0 w-full h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 100 30" class="w-full h-full text-indigo-500" preserveAspectRatio="none"><path d="M0,25 C20,20 30,10 50,15 C70,20 80,5 100,2 L100,30 L0,30 Z" fill="url(#grad-indigo)" opacity="0.2"/><path d="M0,25 C20,20 30,10 50,15 C70,20 80,5 100,2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        </div>
                    </div>
                    
                    <!-- Đơn hàng -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            </div>
                            <p class="text-sm font-semibold text-slate-500">Đơn hàng hoàn thành</p>
                        </div>
                        <h3 class="text-2xl font-black text-slate-800 mb-4">${data.completed_orders || 0} <span class="text-base font-bold text-slate-500">đơn</span></h3>
                        <div class="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-4">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                            +25.0% <span class="text-slate-400 font-medium ml-1">so với tuần trước</span>
                        </div>
                        <div class="absolute bottom-0 left-0 w-full h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 100 30" class="w-full h-full text-blue-400" preserveAspectRatio="none"><path d="M0,20 C30,25 40,5 70,15 C85,20 95,5 100,10 L100,30 L0,30 Z" fill="url(#grad-blue)" opacity="0.2"/><path d="M0,20 C30,25 40,5 70,15 C85,20 95,5 100,10" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        </div>
                    </div>
                    
                    <!-- Sắp hết hàng -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <p class="text-sm font-semibold text-slate-500">Sản phẩm sắp hết hàng</p>
                        </div>
                        <h3 class="text-2xl font-black text-slate-800 mb-4">${data.low_stock_products || 0} <span class="text-base font-bold text-slate-500">sản phẩm</span></h3>
                        <div class="flex items-center gap-1.5 text-xs text-rose-500 font-bold mb-4">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                            -50.0% <span class="text-slate-400 font-medium ml-1">so với tuần trước</span>
                        </div>
                        <div class="absolute bottom-0 left-0 w-full h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 100 30" class="w-full h-full text-orange-400" preserveAspectRatio="none"><path d="M0,15 C20,10 30,25 50,15 C70,5 80,20 100,5 L100,30 L0,30 Z" fill="url(#grad-orange)" opacity="0.2"/><path d="M0,15 C20,10 30,25 50,15 C70,5 80,20 100,5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        </div>
                    </div>


                </div>

                <!-- Định nghĩa Gradient dùng chung cho SVG -->
                <svg width="0" height="0" class="hidden">
                    <defs>
                        <linearGradient id="grad-indigo" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="currentColor" stop-opacity="1" /><stop offset="100%" stop-color="currentColor" stop-opacity="0" /></linearGradient>
                        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="currentColor" stop-opacity="1" /><stop offset="100%" stop-color="currentColor" stop-opacity="0" /></linearGradient>
                        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="currentColor" stop-opacity="1" /><stop offset="100%" stop-color="currentColor" stop-opacity="0" /></linearGradient>
                        <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="currentColor" stop-opacity="1" /><stop offset="100%" stop-color="currentColor" stop-opacity="0" /></linearGradient>
                    </defs>
                </svg>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <!-- Biểu đồ -->
                    <div class="lg:col-span-2 bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div class="w-6 h-6 rounded flex items-center justify-center bg-indigo-50 text-indigo-500">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                                </div>
                                Biểu đồ doanh thu
                            </h3>
                        <div class="flex items-center gap-2">
                            <input type="date" id="chart-start-date" class="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500">
                            <span class="text-xs text-slate-400">-</span>
                            <input type="date" id="chart-end-date" class="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500">
                            <button id="btn-filter-chart" class="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors">Lọc</button>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col relative w-full h-full min-h-[250px]">
                        <canvas id="revenueChart" class="w-full h-full"></canvas>
                    </div>
                </div>
                    
                    <!-- Top Bán Chạy -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>
                                </div>
                                Top Bán Chạy Nhất
                            </h3>
                            <a href="#menu-owner-products" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center">Xem tất cả <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></a>
                        </div>
                        <div class="flex-1 overflow-auto">
                            <div class="space-y-5">
                                ${(data.top_products || []).map((p, index) => {
                                    const maxSold = Math.max(...(data.top_products || []).map(x => x.sold));
                                    const progress = maxSold > 0 ? Math.round((p.sold / maxSold) * 100) : 0;
                                    const colors = [
                                        {bg: 'bg-amber-100', text: 'text-amber-600'},
                                        {bg: 'bg-slate-100', text: 'text-slate-600'},
                                        {bg: 'bg-rose-100', text: 'text-rose-600'},
                                        {bg: 'bg-blue-50', text: 'text-blue-600'},
                                        {bg: 'bg-emerald-50', text: 'text-emerald-600'}
                                    ];
                                    const c = colors[index % colors.length];
                                    const img = p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random" class="w-full h-full object-cover">`;
                                    
                                    return `
                                    <div class="flex items-center gap-4 group">
                                        <div class="w-7 h-7 rounded-full ${c.bg} ${c.text} flex items-center justify-center font-black text-xs shrink-0">${index + 1}</div>
                                        <div class="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                            ${img}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="text-sm font-bold text-slate-800 truncate">${p.name}</h4>
                                            <div class="flex items-center gap-2 mt-1.5">
                                                <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div class="h-full bg-indigo-500 rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                                <span class="text-[10px] font-bold text-slate-400 w-8">${progress}%</span>
                                            </div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <div class="text-xs font-bold text-slate-700">${p.sold} sản phẩm</div>
                                            <div class="text-[10px] text-slate-500 mt-0.5">Doanh thu: ${fmt.format(p.revenue || 0)}</div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                                ${(!data.top_products || data.top_products.length === 0) ? '<p class="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu</p>' : ''}
                            </div>
                        </div>
                        
                        <!-- Line gradient def -->
                        <svg width="0" height="0" class="hidden">
                            <defs>
                                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#a855f7" />
                                    <stop offset="50%" stop-color="#3b82f6" />
                                    <stop offset="100%" stop-color="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <!-- AI Insight Banner -->
                <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 rounded-[24px] shadow-[0_10px_30px_rgba(79,70,229,0.3)] p-8 shrink-0 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div class="absolute -right-20 -top-20 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    
                    <div class="flex items-center gap-6 relative z-10 w-full md:w-auto">
                        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg shadow-purple-500/30 flex-shrink-0">
                            <div class="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                                <svg class="w-10 h-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest">AI Phân tích</span>
                                <span class="flex h-2 w-2 relative">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            <h3 class="text-xl md:text-2xl font-black text-white leading-tight">Doanh thu của bạn đang tăng <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">18.4%</span></h3>
                            <p class="text-slate-300 text-sm mt-1 max-w-md">Nhóm khách hàng trẻ mang lại mức tăng trưởng đột phá. Nên tập trung quảng cáo phụ kiện.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-6 mt-6 md:mt-0 relative z-10 w-full md:w-auto justify-end">
                        <div class="flex items-center gap-3">
                            <div class="text-right">
                                <div class="text-xs font-bold text-slate-300">Độ tin cậy</div>
                                <div class="text-lg font-black text-white">94%</div>
                            </div>
                            <!-- Circular progress -->
                            <div class="relative w-12 h-12">
                                <svg class="w-12 h-12 transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" class="text-slate-700"/>
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" stroke-dasharray="125.6" stroke-dashoffset="7.5" class="text-emerald-400"/>
                                </svg>
                            </div>
                        </div>
                        <button id="btn-ai-insight" class="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap">
                            Phân Tích Dữ Liệu Thực
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                </div>
                <div id="ai-insight-result" class="hidden p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm text-indigo-900 leading-relaxed shadow-inner">
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderChart(chartData) {
        if (!chartData || chartData.length === 0) return '';
        const max = Math.max(...chartData.map(c => c.revenue), 1000000); // at least 1M to show some scale
        return chartData.map(c => {
            const h = (c.revenue / max) * 100;
            return `
                <div class="flex-1 flex flex-col items-center justify-end group h-full relative cursor-pointer">
                    <div class="w-full max-w-[40px] bg-indigo-500 rounded-t-sm transition-all duration-300 group-hover:bg-indigo-400" style="height: ${h}%"></div>
                    <!-- Tooltip -->
                    <div class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.revenue)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError(msg) {
        this.container.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">${msg}</div>`;
    }
}
