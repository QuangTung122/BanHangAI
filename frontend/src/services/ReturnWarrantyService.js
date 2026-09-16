import ApiClient from '../core/ApiClient.js';

export default class ReturnWarrantyService {
    async getOrders() {
        return await ApiClient.get('/orders');
    }

    async createReturnRequest(payload) {
        return await ApiClient.post('/returns', payload);
    }

    async createWarrantyClaim(payload) {
        return await ApiClient.post('/warranty-claims', payload);
    }
}
