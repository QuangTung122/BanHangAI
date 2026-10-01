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

    async getMyStats() {
        const service = new OrderService();
        const res = await service.getMyStats();
        return res.data;
    }
}
