import OrderService from '../services/OrderService.js';

export default class OrderModel {
    constructor() {
        this.orders = [];
    }

    async fetchOrders(type = '') {
        const service = new OrderService();
        const { data } = await service.getOrders(type);
        if (data && data.success) {
            this.orders = data.data;
        }
        return data;
    }

    async addInstallmentPayment(orderId, payAll = false, paymentMethod = 'cash') {
        const service = new OrderService();
        const res = await service.addInstallmentPayment(orderId, payAll, paymentMethod);
        return res.data;
    }

    async getMyStats() {
        const service = new OrderService();
        const res = await service.getMyStats();
        return res.data;
    }
}
