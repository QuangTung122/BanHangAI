import StaffProductView from '../views/pages/StaffProductView.js';
import ProductModel from '../models/ProductModel.js';
import OrderModel from '../models/OrderModel.js';

export default class StaffProductController {
    constructor() {
        this.view = new StaffProductView();
        this.productModel = new ProductModel();
        this.orderModel = new OrderModel();
        
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentStock = 'all';

        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.productModel.fetchProducts(),
                this.orderModel.getMyStats()
            ]).then(results => {
                const res = results[1];
                if (res && res.success && res.data && res.data.today && res.data.month) {
                    this.myStats = res.data;
                } else {
                    this.myStats = { today: {full:0, installment:0}, month: {full:0, installment:0} };
                }
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tồn kho:', error);
            this.myStats = { today: {full:0, installment:0}, month: {full:0, installment:0} };
        }

        // Lấy danh sách category duy nhất
        const categories = [...new Set(this.productModel.products.map(p => p.category))];
        
        this.view.render(this.productModel.products, categories, this.myStats);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        const handleFilter = () => {
            let filtered = this.productModel.products;
            
            // Lọc theo Category
            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(p => p.category === this.currentCategory);
            }

            // Lọc theo Stock
            if (this.currentStock === 'in_stock') {
                filtered = filtered.filter(p => p.stock_quantity >= 5);
            } else if (this.currentStock === 'low_stock') {
                filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity < 5);
            } else if (this.currentStock === 'out_of_stock') {
                filtered = filtered.filter(p => p.stock_quantity === 0);
            }
            
            // Lọc theo Keyword
            if (this.currentSearch) {
                const kw = this.currentSearch;
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(kw) ||
                    p.id.toString().includes(kw)
                );
            }
            
            this.view.updateTable(filtered);
        };

        const searchInput = container.querySelector('#search-product');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase().trim();
                handleFilter();
            });
        }

        const categorySelect = container.querySelector('#filter-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                handleFilter();
            });
        }

        const stockSelect = container.querySelector('#filter-stock');
        if (stockSelect) {
            stockSelect.addEventListener('change', (e) => {
                this.currentStock = e.target.value;
                handleFilter();
            });
        }

        container.addEventListener('click', (e) => {
            // Click vào row
            const row = e.target.closest('.product-row');
            if (row) {
                const id = parseInt(row.dataset.id);
                const product = this.productModel.products.find(p => p.id === id);
                if (product) {
                    this.view.renderDetailPanel(product);
                    this.view.highlightRow(id);
                }
            }
        });
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
