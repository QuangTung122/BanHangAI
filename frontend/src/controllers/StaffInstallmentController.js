import StaffInstallmentView from '../views/pages/StaffInstallmentView.js';
import OrderModel from '../models/OrderModel.js';

export default class StaffInstallmentController {
    constructor() {
        this.view = new StaffInstallmentView();
        this.orderModel = new OrderModel();
        
        this.currentSearch = '';
        this.currentFilter = 'all';

        this.init();
    }

    async init() {
        try {
            await this.orderModel.fetchOrders('installment'); // Lấy đơn trả góp kèm lịch sử thu cước
        } catch (error) {
            console.error('Không thể kết nối đến Backend Server:', error);
        }

        this.view.render(this.orderModel.orders);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;
        const now = new Date();

        const handleFilter = () => {
            let filtered = this.orderModel.orders;
            
            if (this.currentSearch) {
                const kw = this.currentSearch;
                filtered = filtered.filter(o => 
                    (o.customer_name && o.customer_name.toLowerCase().includes(kw)) ||
                    (o.customer_phone && o.customer_phone.includes(kw)) ||
                    (o.customer_cccd && o.customer_cccd.includes(kw)) ||
                    (o.invoice_code && o.invoice_code.toLowerCase().includes(kw))
                );
            }
            
            if (this.currentFilter === 'active') {
                filtered = filtered.filter(o => o.paid_months < o.installment_term && (!o.next_due_date || new Date(o.next_due_date) >= now));
            } else if (this.currentFilter === 'completed') {
                filtered = filtered.filter(o => o.paid_months >= o.installment_term);
            } else if (this.currentFilter === 'overdue') {
                filtered = filtered.filter(o => o.paid_months < o.installment_term && o.next_due_date && new Date(o.next_due_date) < now);
            }
            
            this.view.updateTable(filtered);
        };

        const searchInput = container.querySelector('#search-installment');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase().trim();
                handleFilter();
            });
        }

        const filterSelect = container.querySelector('#filter-status');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                handleFilter();
            });
        }

        container.addEventListener('click', async (e) => {
            // Mở modal thu cước
            const btnCollect = e.target.closest('.btn-collect-payment');
            if (btnCollect) {
                const id = parseInt(btnCollect.dataset.id);
                const order = this.orderModel.orders.find(o => o.id === id);
                if (order && order.paid_months < order.installment_term) {
                    this.view.showPaymentModal(order);
                }
            }

            // Mở modal lịch sử
            const btnHistory = e.target.closest('.btn-view-history');
            if (btnHistory) {
                const id = parseInt(btnHistory.dataset.id);
                const order = this.orderModel.orders.find(o => o.id === id);
                if (order) {
                    this.view.showHistoryModal(order);
                }
            }

            // Đóng modal lịch sử
            const btnCloseHistory = e.target.closest('#btn-close-history-modal') || e.target.closest('#btn-close-history-modal-bottom');
            if (btnCloseHistory || (e.target.id === 'history-modal')) {
                this.view.hideHistoryModal();
            }

            // Đóng modal thu cước
            const btnClosePayment = e.target.closest('#btn-close-payment-modal');
            if (btnClosePayment || (e.target.id === 'payment-modal')) {
                this.view.hidePaymentModal();
            }

            // Xử lý nộp 1 kỳ hoặc tất toán
            const btnPayOne = e.target.closest('#btn-pay-one');
            const btnPayAll = e.target.closest('#btn-pay-all');
            
            if (btnPayOne || btnPayAll) {
                const isPayAll = !!btnPayAll;
                const targetBtn = btnPayOne || btnPayAll;
                const id = parseInt(targetBtn.dataset.id);
                
                const order = this.orderModel.orders.find(o => o.id === id);
                if (!order) return;

                const amount = isPayAll ? (order.installment_term - order.paid_months) * order.monthly_fee : order.monthly_fee;

                // Lấy phương thức thanh toán
                const pmInput = document.querySelector('input[name="payment_method"]:checked');
                const paymentMethod = pmInput ? pmInput.value : 'cash';

                targetBtn.style.pointerEvents = 'none';
                targetBtn.style.opacity = '0.5';
                
                try {
                    const res = await this.orderModel.addInstallmentPayment(id, isPayAll, paymentMethod);
                    if (res && res.success) {
                        // Cập nhật lại data local bằng cách fetch lại cho chuẩn lịch sử
                        await this.orderModel.fetchOrders('installment');
                        
                        this.view.hidePaymentModal();
                        handleFilter();
                        
                        // In biên lai
                        const updatedOrder = this.orderModel.orders.find(o => o.id === id);
                        this.view.printReceipt(updatedOrder, amount, isPayAll, paymentMethod);

                    } else {
                        alert(res.message || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error(error);
                    alert('Lỗi kết nối máy chủ');
                } finally {
                    targetBtn.style.pointerEvents = 'auto';
                    targetBtn.style.opacity = '1';
                }
            }
        });
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
