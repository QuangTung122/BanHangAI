export default class OwnerDashboardView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(data) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <!-- Top Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <!-- Doanh thu -->
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Tổng doanh thu</p>
                            <h3 class="text-2xl font-black text-slate-800">${fmt.format(data.total_revenue || 0)}</h3>
                        </div>
                    </div>
                    
                    <!-- Đơn hàng -->
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Đơn hàng hoàn thành</p>
                            <h3 class="text-2xl font-black text-slate-800">${data.completed_orders || 0} <span class="text-sm font-normal text-slate-400">đơn</span></h3>
                        </div>
                    </div>
                    
                    <!-- Sắp hết hàng -->
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Sản phẩm sắp hết hàng</p>
                            <h3 class="text-2xl font-black text-slate-800">${data.low_stock_products || 0} <span class="text-sm font-normal text-slate-400">sản phẩm</span></h3>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <!-- Biểu đồ -->
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-slate-800 mb-4">Biểu đồ doanh thu (7 ngày qua)</h3>
                        <div class="flex-1 border-b-2 border-l-2 border-slate-100 flex items-end justify-between pt-6 pb-2 px-2 gap-2 relative">
                            ${this.renderChart(data.revenue_chart)}
                        </div>
                        <div class="flex justify-between px-2 mt-2 text-xs font-medium text-slate-400">
                            ${(data.revenue_chart || []).map(c => `<span>${c.date}</span>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Top Bán Chạy -->
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Top Bán Chạy Nhất</h3>
                        <div class="flex-1 overflow-auto">
                            <div class="space-y-4 mt-2">
                                ${(data.top_products || []).map((p, index) => `
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <span class="text-sm font-bold text-slate-400">#${index + 1}</span>
                                            <span class="text-sm font-bold text-indigo-600">${p.name}</span>
                                        </div>
                                        <span class="text-sm font-bold text-slate-600">${p.sold} sản phẩm</span>
                                    </div>
                                `).join('')}
                                ${(!data.top_products || data.top_products.length === 0) ? '<p class="text-sm text-slate-500 italic">Chưa có dữ liệu bán hàng.</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insight -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 shrink-0 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800">AI Insight</h3>
                    </div>
                    <button id="btn-ai-insight" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        Phân Tích Dữ Liệu Thực
                    </button>
                </div>
                <p class="text-center text-slate-400 text-xs italic mt-[-10px]">Nhấn nút "Phân Tích Dữ Liệu Thực" để AI đọc số liệu mới nhất và đưa ra lời khuyên.</p>
                <div id="ai-insight-result" class="hidden mt-4 p-5 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-900 leading-relaxed shadow-inner">
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
