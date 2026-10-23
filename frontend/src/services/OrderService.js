import ApiClient from '../core/ApiClient.js';

export default class OrderService {
    async getOrders(type = '') {
        let url = '/orders';
        if (type) {
            url += `?type=${encodeURIComponent(type)}`;
        }
        return await ApiClient.get(url);
    }

    async getPendingBotOrders() {
        return await ApiClient.get('/orders/bot-pending');
    }

    async getMyStats() {
        return await ApiClient.get('/orders/my-stats');
    }

    async confirmBotOrder(orderId) {
        return await ApiClient.post(`/orders/${encodeURIComponent(orderId)}/confirm-bot`, {});
    }

    async confirmOrderPayment(orderId) {
        return await ApiClient.post(`/orders/${encodeURIComponent(orderId)}/confirm-payment`, {});
    }
}
