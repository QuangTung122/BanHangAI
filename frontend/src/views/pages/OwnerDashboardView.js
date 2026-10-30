export default class OwnerDashboardView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(data) {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        
        let html = `
            <div class="flex flex-col gap-3 relative pb-6">
                <!-- 3 Thẻ Chỉ Số Quan Trọng (KPI Cards - Tinh gọn) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                    <!-- Doanh thu -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3.5 flex flex-col relative overflow-hidden group hover:border-[#5745f5] transition-all">
                        <div class="flex items-center gap-2.5 mb-1.5">
                            <div class="w-8 h-8 rounded-lg bg-[#f0edff] flex items-center justify-center text-[#5745f5] border border-[#e1dcff]">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <p class="text-xs font-bold text-[#7b8499]">Doanh thu đã thu</p>
                        </div>
                        <h3 class="text-xl md:text-2xl font-black text-[#5745f5] mb-1 tracking-tight">${fmt.format(data.total_revenue || 0)}</h3>
                        <p class="text-[10px] font-semibold text-[#7b8499]">Tổng đơn hàng hoàn tất</p>
                    </div>
                    
                    <!-- Đơn hàng hoàn thành -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3.5 flex flex-col relative overflow-hidden group hover:border-[#5745f5] transition-all">
                        <div class="flex items-center gap-2.5 mb-1.5">
                            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            </div>
                            <p class="text-xs font-bold text-[#7b8499]">Đơn hàng hoàn thành</p>
                        </div>
                        <h3 class="text-xl md:text-2xl font-black text-[#182033] mb-1 tracking-tight">${data.completed_orders || 0} <span class="text-xs font-bold text-[#7b8499]">đơn</span></h3>
                        <p class="text-[10px] font-semibold text-[#7b8499]">Đơn POS & Đơn qua Bot</p>
                    </div>
                    
                    <!-- Sắp hết hàng -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-3.5 flex flex-col relative overflow-hidden group hover:border-[#5745f5] transition-all">
                        <div class="flex items-center gap-2.5 mb-1.5">
                            <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <p class="text-xs font-bold text-[#7b8499]">Cảnh báo tồn kho thấp</p>
                        </div>
                        <h3 class="text-xl md:text-2xl font-black ${Number(data.low_stock_products) > 0 ? 'text-rose-600' : 'text-[#182033]'} mb-1 tracking-tight">
                            ${data.low_stock_products || 0} <span class="text-xs font-bold text-[#7b8499]">mặt hàng</span>
                        </h3>
                        <div class="flex items-center gap-1.5 text-[11px] font-bold text-[#7b8499]">
                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${Number(data.low_stock_products) > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700'} border">
                                Ngưỡng: ≤ 5
                            </span>
                            <span class="font-medium">Cần lên kế hoạch nhập hàng</span>
                        </div>
                    </div>
                </div>

                <!-- Bố cục biểu đồ và Top bán chạy -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1">
                    <!-- Biểu đồ Doanh thu -->
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-4 flex flex-col">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                            <h3 class="text-xs font-black text-[#182033] flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-[#5745f5]"></span>
                                Biểu đồ tăng trưởng doanh thu
                            </h3>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <input type="date" id="chart-start-date" class="px-2.5 py-1 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5]">
                                <span class="text-xs text-[#7b8499] font-bold">-</span>
                                <input type="date" id="chart-end-date" class="px-2.5 py-1 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5]">
                                <button id="btn-filter-chart" class="px-3 py-1 bg-[#5745f5] hover:bg-[#4735e5] text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer">Lọc</button>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col relative w-full h-full min-h-[220px]">
                            <canvas id="revenueChart" class="w-full h-full"></canvas>
                        </div>
                    </div>
                    
                    <!-- Top Bán Chạy -->
                    <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-4 flex flex-col">
                        <div class="flex justify-between items-center mb-3 pb-2 border-b border-[#e7eaf2]">
                            <h3 class="text-xs font-black text-[#182033] flex items-center gap-1.5">
                                <span class="text-amber-500">🏆</span>
                                Top Sản Phẩm Bán Chạy
                            </h3>
                            <a href="#menu-owner-products" class="text-[11px] font-bold text-[#5745f5] hover:underline">Xem kho &rarr;</a>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar">
                            <div class="space-y-2.5">
                                ${(data.top_products || []).map((p, index) => {
                                    const maxSold = Math.max(...(data.top_products || []).map(x => x.sold));
                                    const progress = maxSold > 0 ? Math.round((p.sold / maxSold) * 100) : 0;
                                    const rankBadge = index === 0 ? 'bg-[#5745f5] text-white' : (index === 1 ? 'bg-indigo-400 text-white' : (index === 2 ? 'bg-indigo-300 text-white' : 'bg-[#f0edff] text-[#5745f5]'));
                                    const img = p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-[#f5f6fa] flex items-center justify-center text-xs font-bold text-[#7b8499]">📦</div>`;
                                    
                                    return `
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-5 h-5 rounded-md ${rankBadge} flex items-center justify-center font-black text-[10px] shrink-0">${index + 1}</div>
                                        <div class="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-[#e7eaf2]">
                                            ${img}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="text-xs font-bold text-[#182033] truncate">${p.name}</h4>
                                            <div class="flex items-center gap-1.5 mt-0.5">
                                                <div class="flex-1 h-1 bg-[#f5f6fa] rounded-full overflow-hidden">
                                                    <div class="h-full bg-[#5745f5] rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                                <span class="text-[9px] font-bold text-[#7b8499] w-6">${progress}%</span>
                                            </div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <div class="text-xs font-black text-[#182033]">${p.sold} đã bán</div>
                                            <div class="text-[10px] text-[#5745f5] font-bold">${fmt.format(p.revenue || 0)}</div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                                ${(!data.top_products || data.top_products.length === 0) ? '<p class="text-xs text-[#7b8499] text-center py-4 font-semibold">Chưa có giao dịch nào</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nhu cầu khách hàng từ Bot -->
                <section class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] p-4">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <h3 class="text-xs font-black text-[#182033]">Nhu cầu khách hàng từ Bot</h3>
                            <p class="text-[10px] text-[#7b8499]">Tổng hợp 90 ngày gần nhất qua chat</p>
                        </div>
                        <span class="text-[10px] font-bold text-[#5745f5] bg-[#f0edff] border border-[#e1dcff] rounded-md px-2 py-0.5">Dữ liệu AI</span>
                    </div>
                    <p id="bot-review-insights" class="mb-3 text-xs font-semibold text-[#182033]"></p>
                    <div id="bot-demand-insights" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                        <p class="text-xs text-[#7b8499]">Đang tải dữ liệu nhu cầu...</p>
                    </div>
                </section>

                <!-- AI Insight Banner chuẩn HTH Smart Sales -->
                <div class="bg-[#f0edff] border border-[#e1dcff] rounded-xl shadow-xs p-3.5 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden">
                    <div class="flex items-center gap-3 relative z-10 w-full md:w-auto">
                        <div class="w-9 h-9 rounded-xl bg-[#5745f5] text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                            ✦
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-[#182033] leading-tight">Tổng kết tình hình kinh doanh thời gian thực</h3>
                            <p class="text-[#7b8499] text-[11px] mt-0.5 font-medium max-w-lg">Báo cáo dùng dữ liệu hóa đơn, tồn kho và bán hàng để đưa ra chiến lược tối ưu.</p>
                        </div>
                    </div>
                    
                    <div class="relative z-10 w-full md:w-auto flex justify-end shrink-0">
                        <button id="btn-ai-insight" class="px-4 py-2 bg-[#5745f5] hover:bg-[#4735e5] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
                            <span>Phân Tích AI</span>
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                </div>

                <div id="ai-insight-result" class="hidden p-4 bg-white rounded-xl border border-[#e1dcff] text-xs font-medium text-[#182033] leading-relaxed shadow-xs">
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderDemandInsights(data) {
        const target = this.container?.querySelector('#bot-demand-insights');
        if (!target) return;
        const reviewTarget = this.container?.querySelector('#bot-review-insights');
        const reviews = data?.reviews;
        if (reviewTarget) reviewTarget.textContent = reviews?.review_count
            ? `Đánh giá 90 ngày: ${Number(reviews.review_count)} lượt · trung bình ${Number(reviews.average_rating || 0).toFixed(1)}/5.`
            : 'Chưa có đánh giá khách hàng trong 90 ngày gần nhất.';
        const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        const groups = data?.by_category || [];
        target.innerHTML = groups.length ? groups.map((group) => `
            <article class="rounded-lg border border-[#e7eaf2] bg-[#f5f6fa] p-3 text-xs">
                <div class="flex items-start justify-between gap-2"><h4 class="font-bold text-[#182033]">${escape(group.category)}</h4><span class="rounded-md bg-[#f0edff] px-2 py-0.5 text-[10px] font-bold text-[#5745f5]">${Number(group.request_count) || 0} lượt</span></div>
                <p class="mt-1 text-[11px] text-[#7b8499]">Ngân sách: ${Number(group.average_budget_min) ? Math.round(Number(group.average_budget_min)).toLocaleString('vi-VN') + '–' : ''}${Number(group.average_budget_max) ? Math.round(Number(group.average_budget_max)).toLocaleString('vi-VN') + ' ₫' : 'tùy chọn'}</p>
            </article>`).join('') : '<p class="text-xs text-[#7b8499]">Chưa có nhu cầu mua sắm được khách xác nhận.</p>';
    }

    renderChart(chartData) {
        if (!chartData || chartData.length === 0) return '';
        const max = Math.max(...chartData.map(c => c.revenue), 1000000);
        return chartData.map(c => {
            const h = (c.revenue / max) * 100;
            return `
                <div class="flex-1 flex flex-col items-center justify-end group h-full relative cursor-pointer">
                    <div class="w-full max-w-[36px] bg-[#5745f5] rounded-t-sm transition-all duration-150 group-hover:bg-[#4735e5]" style="height: ${h}%"></div>
                    <div class="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#182033] text-white text-[10px] font-bold py-1 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none">
                        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.revenue)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError(msg) {
        this.container.innerHTML = `<div class="p-6 text-center text-rose-600 font-bold text-xs bg-white rounded-xl border border-rose-200">${msg}</div>`;
    }
}
