import ApiClient from '../core/ApiClient.js';

class ProductService {
    async getCategories() {
        return await ApiClient.get('/products/categories');
    }

    async getProducts(categorySlug = '', searchQuery = '') {
        let url = '/products?';
        if (categorySlug) url += `category=${encodeURIComponent(categorySlug)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;
        return await ApiClient.get(url);
    }

    async getStockReceipts() {
        return await ApiClient.get('/products/receipts');
    }

    async getPosRecommendations(need) {
        return await ApiClient.post('/products/assist', { need });
    }

    async getBundleSuggestions(productIds) {
        return await ApiClient.post('/products/bundle-suggestions', { product_ids: productIds });
    }

    async getReplenishmentSuggestions() {
        return await ApiClient.get('/products/replenishment-suggestions');
    }

    async createStockReceipt(data) {
        return await ApiClient.post('/products/receipts', data);
    }

    async createProduct(data) {
        return await ApiClient.post('/products', data);
    }

    async updateProduct(id, data) {
        return await ApiClient.put(`/products/${id}`, data);
    }

    async deleteProduct(id) {
        return await ApiClient.delete(`/products/${id}`);
    }
}

export default new ProductService();
