import OrderService from '../services/OrderService.js';

export default class OrderModel {
    constructor() {
        this.orders = [];
        this.pendingBotOrders = [];
    }

    async fetchOrders(type = '') {
        const service = new OrderService();
        const { data } = await service.getOrders(type);
        if (data && data.success) {
            this.orders = data.data;
        }
        return data;
    }

    async fetchPendingBotOrders() {
        const service = new OrderService();
        const { data } = await service.getPendingBotOrders();
        if (data && data.success) this.pendingBotOrders = data.data || [];
        return data;
    }

    async getMyStats() {
        const service = new OrderService();
        const res = await service.getMyStats();
        return res.data;
    }

    async confirmBotOrder(orderId) {
        const service = new OrderService();
        return service.confirmBotOrder(orderId);
    }

    async confirmOrderPayment(orderId) {
        const service = new OrderService();
        return service.confirmOrderPayment(orderId);
    }
}
