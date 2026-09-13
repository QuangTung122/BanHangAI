import ApiClient from '../core/ApiClient.js';

class TransactionService {
    async getTransactions(filters = {}) {
        let queryParams = [];
        if (filters.month) queryParams.push(`month=${filters.month}`);
        if (filters.type) queryParams.push(`type=${filters.type}`);
        if (filters.source) queryParams.push(`source=${filters.source}`);
        if (filters.payment_method) queryParams.push(`payment_method=${filters.payment_method}`);
        if (filters.user_id) queryParams.push(`user_id=${filters.user_id}`);
        
        const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
        return await ApiClient.get(`/transactions${queryString}`);
    }

    async getSummary(month = '') {
        const url = month ? `/transactions/summary?month=${month}` : '/transactions/summary';
        return await ApiClient.get(url);
    }

    async createTransaction(data) {
        if (data instanceof FormData) {
            return await ApiClient.postFormData('/transactions', data);
        }
        return await ApiClient.post('/transactions', data);
    }

    async collectFromStaff(data) {
        return await ApiClient.post('/transactions/collect', data);
    }
}

export default TransactionService;
