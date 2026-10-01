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
            await this.orderModel.fetchOrders('installment');
        } catch (error) {
            console.error('Không thể tải hồ sơ trả góp:', error);
        }
        this.view.render(this.orderModel.orders);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;
        const filter = () => {
            let orders = this.orderModel.orders || [];
            if (this.currentFilter !== 'all') orders = orders.filter(order => (order.financing_status || 'pending') === this.currentFilter);
            if (this.currentSearch) {
                orders = orders.filter(order => [order.customer_name, order.customer_phone, order.invoice_code, order.finance_partner, order.finance_application_code]
                    .some(value => String(value || '').toLowerCase().includes(this.currentSearch)));
            }
            this.view.updateTable(orders);
        };
        container.querySelector('#filter-status')?.addEventListener('change', event => {
            this.currentFilter = event.target.value;
            filter();
        });
        container.querySelector('#search-installment')?.addEventListener('input', event => {
            this.currentSearch = event.target.value.trim().toLowerCase();
            filter();
        });
    }

    destroy() {
        if (this.view.container) this.view.container.innerHTML = '';
    }
}
