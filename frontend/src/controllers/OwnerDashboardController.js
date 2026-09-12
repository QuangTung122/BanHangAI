import DashboardService from '../services/DashboardService.js';
import OwnerDashboardView from '../views/pages/OwnerDashboardView.js';

export default class OwnerDashboardController {
    constructor() {
        this.view = new OwnerDashboardView();
        this.loadData();
    }

    async loadData() {
        try {
            const res = await DashboardService.getDashboardData();
            if (res.status === 200 && res.data.success) {
                this.dashboardData = res.data.data;
                this.view.render(this.dashboardData);
                this.initChart();
                this.bindEvents();
            } else {
                this.view.renderError('Không thể tải dữ liệu thống kê.');
            }
        } catch (error) {
            console.error(error);
            this.view.renderError('Lỗi kết nối đến máy chủ.');
        }
    }

    initChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const chartData = this.dashboardData.revenue_chart || [];
        const labels = chartData.map(d => d.date);
        const data = chartData.map(d => d.revenue);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    bindEvents() {
        const btnFilter = document.getElementById('btn-filter-chart');
        if (btnFilter) {
            btnFilter.addEventListener('click', async () => {
                const start = document.getElementById('chart-start-date').value;
                const end = document.getElementById('chart-end-date').value;
                if (!start || !end) {
                    alert('Vui lòng chọn từ ngày và đến ngày');
                    return;
                }
                
                try {
                    btnFilter.disabled = true;
                    btnFilter.textContent = '...';
                    const { default: ApiClient } = await import('../core/ApiClient.js');
                    const res = await ApiClient.get(`/dashboard?start_date=${start}&end_date=${end}`);
                    
                    if (res.data && res.data.success) {
                        this.dashboardData = res.data.data;
                        this.initChart();
                        
                        // Cập nhật lại list sản phẩm nếu có thể (view render lại)
                        // This might be tricky if we don't re-render the whole view, 
                        // but updating just the chart is enough for the chart filter.
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    btnFilter.disabled = false;
                    btnFilter.textContent = 'Lọc';
                }
            });
        }

        const btnAi = document.getElementById('btn-ai-insight');
        if (btnAi) {
            btnAi.addEventListener('click', async () => {
                const resultDiv = document.getElementById('ai-insight-result');
                btnAi.disabled = true;
                btnAi.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang phân tích...';
                
                try {
                    // Gọi API chat với prompt ẩn chứa data dashboard
                    const prompt = `Dưới đây là số liệu thống kê cửa hàng hiện tại: Tổng doanh thu: ${this.dashboardData.total_revenue}, Đơn hàng hoàn thành: ${this.dashboardData.completed_orders}, Số sản phẩm sắp hết hàng: ${this.dashboardData.low_stock_products}. Top sản phẩm bán chạy: ${JSON.stringify(this.dashboardData.top_products)}. Hãy đóng vai là chuyên gia phân tích dữ liệu, phân tích ngắn gọn trong 3-4 câu và đưa ra 1-2 lời khuyên cho chủ cửa hàng để tăng doanh thu hoặc tối ưu hóa. Chỉ cần text đơn giản không cần định dạng phức tạp.`;
                    
                    const { default: ApiClient } = await import('../core/ApiClient.js');
                    const res = await ApiClient.post('/dashboard/insight', {
                        message: prompt
                    });
                    
                    if (res.data && res.data.success) {
                        resultDiv.innerHTML = res.data.data.reply;
                        resultDiv.classList.remove('hidden');
                    } else {
                        alert('Lỗi phân tích AI: ' + (res.data?.message || 'Không có phản hồi'));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Lỗi kết nối hệ thống AI.');
                } finally {
                    btnAi.disabled = false;
                    btnAi.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Phân Tích Dữ Liệu Thực';
                }
            });
        }
    }

    destroy() {
        // Cleanup if needed
    }
}
