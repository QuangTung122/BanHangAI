import ApiClient from '../core/ApiClient.js';

export default class OrderService {
    async getOrders(type = '') {
        let url = '/orders';
        if (type) {
            url += `?type=${encodeURIComponent(type)}`;
        }
        return await ApiClient.get(url);
    }

    async getMyStats() {
        return await ApiClient.get('/orders/my-stats');
    }
}
