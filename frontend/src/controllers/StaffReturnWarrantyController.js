import StaffReturnWarrantyView from '../views/pages/StaffReturnWarrantyView.js';
import ReturnWarrantyService from '../services/ReturnWarrantyService.js';
import OrderModel from '../models/OrderModel.js';

export default class StaffReturnWarrantyController {
    constructor() {
        this.view = new StaffReturnWarrantyView();
        this.orderModel = new OrderModel();
        this.service = new ReturnWarrantyService();
        this.orders = [];
        this.selectedOrder = null;
        this.currentTab = 'return';

        this.init();
    }

    async init() {
        try {
            const res = await this.orderModel.fetchOrders();
            if (res && res.success) {
                this.orders = res.data || [];
            }
        } catch (error) {
            console.error('Lỗi tải hóa đơn cho đổi trả:', error);
            this.orders = [];
        }

        this.view.render(this.orders);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        const searchBtn = container.querySelector('#btn-search-return');
        const searchInput = container.querySelector('#return-search');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.filterOrders(searchInput.value));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.filterOrders(searchInput.value);
            });
        }

        container.addEventListener('click', async (e) => {
            const orderCard = e.target.closest('.order-card');
            if (orderCard) {
                const orderId = Number(orderCard.dataset.orderId);
                const order = this.orders.find(o => Number(o.id) === orderId);
                if (order) {
                    this.selectedOrder = order;
                    this.view.renderDetail(order);
                }
                return;
            }

            const action = e.target.closest('.action-btn');
            if (action) {
                const itemId = Number(action.dataset.itemId);
                const actionType = action.dataset.action;
                const item = (this.selectedOrder?.items || []).find(i => Number(i.id) === itemId);
                if (item) {
                    this.view.showForm(actionType, item);
                }
                return;
            }

            const closeBtn = e.target.closest('.close-form-btn');
            if (closeBtn) {
                if (this.selectedOrder) {
                    this.view.renderDetail(this.selectedOrder);
                }
                return;
            }

            const cancelBtn = e.target.closest('.cancel-return-btn');
            if (cancelBtn) {
                if (this.selectedOrder) {
                    this.view.renderDetail(this.selectedOrder);
                }
                return;
            }

            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                this.currentTab = tabBtn.dataset.tab;
                container.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.toggle('bg-indigo-600', btn.dataset.tab === this.currentTab);
                    btn.classList.toggle('text-white', btn.dataset.tab === this.currentTab);
                    btn.classList.toggle('bg-slate-100', btn.dataset.tab !== this.currentTab);
                    btn.classList.toggle('text-slate-700', btn.dataset.tab !== this.currentTab);
                });
                return;
            }

            const submitBtn = e.target.closest('.submit-return-btn');
            if (submitBtn) {
                const selectedItem = (this.selectedOrder?.items || []).find(i => Number(i.id) === Number(submitBtn.dataset.itemId || document.querySelector('.action-btn')?.dataset.itemId));
                const reason = container.querySelector('#return-reason')?.value || 'Khách yêu cầu xử lý';
                    let remainingDays = 0;
                    if (selectedItem?.warranty_months) {
                        const orderDate = new Date(this.selectedOrder.created_at);
                        const expireDate = new Date(orderDate);
                        expireDate.setMonth(expireDate.getMonth() + selectedItem.warranty_months);
                        const diff = expireDate.getTime() - new Date().getTime();
                        remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                    }

                const payload = {
                    order_id: this.selectedOrder?.id,
                    customer_id: null,
                    customer_name: this.selectedOrder?.customer_name,
                    customer_phone: this.selectedOrder?.customer_phone,
                    return_type: this.currentTab === 'warranty' ? 'refund' : (this.currentTab === 'return' ? 'exchange' : 'refund'),
                    reason,
                    exchange_product_id: container.querySelector('#return-exchange-product')?.value || null,
                    notes: reason,
                    items: [{
                        order_item_id: selectedItem?.id,
                        product_id: selectedItem?.product_id,
                        product_name: selectedItem?.product_name,
                        quantity: selectedItem?.quantity || 1,
                        unit_price: selectedItem?.unit_price || 0,
                        condition_status: container.querySelector('#return-condition')?.value || 'new',
                        defect_type: this.currentTab === 'warranty' ? (container.querySelector('#warranty-type')?.value || 'repair') : null,
                        warranty_remaining_days: remainingDays,
                        refund_amount: 0,
                        exchange_to_product_id: container.querySelector('#return-exchange-product')?.value || null,
                        exchange_delta_amount: 0
                    }]
                };

                if (this.currentTab === 'warranty') {
                    const warrantyMonths = selectedItem?.warranty_months || 0;
                    const startDate = new Date(this.selectedOrder.created_at || Date.now());
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + warrantyMonths);

                    const warranty = {
                        order_id: this.selectedOrder?.id,
                        order_item_id: selectedItem?.id,
                        product_id: selectedItem?.product_id,
                        customer_id: null,
                        customer_name: this.selectedOrder?.customer_name,
                        customer_phone: this.selectedOrder?.customer_phone,
                        serial_number: 'SN-' + Date.now(),
                        warranty_months: warrantyMonths,
                        warranty_start_date: startDate.toISOString(),
                        warranty_end_date: endDate.toISOString(),
                        claim_type: container.querySelector('#warranty-type')?.value || 'repair',
                        issue_description: reason,
                        issue_code: 'GENERAL',
                        created_by: 1
                    };
                    const res = await this.service.createWarrantyClaim(warranty);
                    if (res.data && res.data.success) {
                        window.showToast?.('Yêu cầu bảo hành đã được tạo', 'success');
                    } else {
                        window.showToast?.(res.data?.message || 'Tạo bảo hành thất bại', 'error');
                    }
                } else {
                    const res = await this.service.createReturnRequest(payload);
                    if (res.data && res.data.success) {
                        window.showToast?.('Yêu cầu đổi trả đã được lưu', 'success');
                    } else {
                        window.showToast?.(res.data?.message || 'Tạo yêu cầu thất bại', 'error');
                    }
                }

                if (this.selectedOrder) {
                    this.view.renderDetail(this.selectedOrder);
                }
            }
        });
    }

    filterOrders(keyword = '') {
        const q = keyword.trim().toLowerCase();
        if (!q) {
            this.view.render(this.orders);
            this.bindEvents();
            return;
        }

        const filtered = this.orders.filter(order => {
            const code = (order.invoice_code || '').toLowerCase();
            const name = (order.customer_name || '').toLowerCase();
            const phone = (order.customer_phone || '').toLowerCase();
            return code.includes(q) || name.includes(q) || phone.includes(q);
        });

        this.view.render(filtered);
        this.bindEvents();
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
