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

    async getReturnRequests() {
        return await ApiClient.get('/returns');
    }

    async getWarrantyClaims() {
        return await ApiClient.get('/warranty-claims');
    }

    async updateWarrantyClaimStatus(id, payload) {
        return await ApiClient.put(`/warranty-claims/${id}/status`, payload);
    }

    async updateReturnRequestStatus(id, payload) {
        return await ApiClient.put(`/returns/${id}/approve`, payload);
    }

    async deleteReturnRequest(id) {
        return await ApiClient.delete(`/returns/${id}`);
    }

    async deleteWarrantyClaim(id) {
        return await ApiClient.delete(`/warranty-claims/${id}`);
    }
}
