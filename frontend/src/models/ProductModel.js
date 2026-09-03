import ProductService from '../services/ProductService.js';

export default class ProductModel {
    constructor() {
        this.categories = [];
        this.products = [];
    }

    async fetchCategories() {
        const { data } = await ProductService.getCategories();
        if (data && data.success) {
            this.categories = data.data;
        }
        return data;
    }

    async fetchProducts(categorySlug = '', search = '') {
        const { data } = await ProductService.getProducts(categorySlug, search);
        if (data && data.success) {
            this.products = data.data;
        }
        return data;
    }
}
