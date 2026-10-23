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
        this.currentSort = 'name_asc';

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
        const categories = [...new Set(this.productModel.products.map(p => p.category_name || p.category || 'Khác'))].sort((a, b) => a.localeCompare(b, 'vi'));
        
        this.view.render(this.productModel.products, categories, this.myStats);
        this.view.setTotalProducts(this.productModel.products.length);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        const handleFilter = () => {
            let filtered = this.productModel.products;
            
            // Lọc theo Category
            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(p => (p.category_name || p.category || 'Khác') === this.currentCategory);
            }

            // Lọc theo Stock
            if (this.currentStock === 'in_stock') {
                filtered = filtered.filter(p => p.stock_quantity > (p.low_stock_threshold || 5));
            } else if (this.currentStock === 'low_stock') {
                filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5));
            } else if (this.currentStock === 'out_of_stock') {
                filtered = filtered.filter(p => p.stock_quantity === 0);
            }
            
            // Lọc theo Keyword
            if (this.currentSearch) {
                const kw = this.currentSearch;
                const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
                filtered = filtered.filter(p => normalize([p.name, p.sku, p.id, p.category_name, p.description, p.tags].join(' ')).includes(normalize(kw)));
            }

            const priceMin = this.readNumber('filter-price-min');
            const priceMax = this.readNumber('filter-price-max');
            const stockMin = this.readNumber('filter-stock-min');
            const stockMax = this.readNumber('filter-stock-max');
            if (priceMin !== null) filtered = filtered.filter(p => Number(p.price) >= priceMin);
            if (priceMax !== null) filtered = filtered.filter(p => Number(p.price) <= priceMax);
            if (stockMin !== null) filtered = filtered.filter(p => Number(p.stock_quantity) >= stockMin);
            if (stockMax !== null) filtered = filtered.filter(p => Number(p.stock_quantity) <= stockMax);

            const sorters = {
                name_asc: (a, b) => String(a.name).localeCompare(String(b.name), 'vi'),
                name_desc: (a, b) => String(b.name).localeCompare(String(a.name), 'vi'),
                price_asc: (a, b) => Number(a.price) - Number(b.price),
                price_desc: (a, b) => Number(b.price) - Number(a.price),
                stock_asc: (a, b) => Number(a.stock_quantity) - Number(b.stock_quantity),
                stock_desc: (a, b) => Number(b.stock_quantity) - Number(a.stock_quantity)
            };
            filtered = [...filtered].sort(sorters[this.currentSort] || sorters.name_asc);
            
            this.view.updateTable(filtered);
        };

        this.readNumber = (id) => {
            const value = container.querySelector(`#${id}`)?.value;
            if (value === '' || value === undefined) return null;
            const number = Number(value);
            return Number.isFinite(number) && number >= 0 ? number : null;
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

        ['filter-price-min', 'filter-price-max', 'filter-stock-min', 'filter-stock-max'].forEach((id) => {
            container.querySelector(`#${id}`)?.addEventListener('input', handleFilter);
        });
        container.querySelector('#filter-sort')?.addEventListener('change', (event) => {
            this.currentSort = event.target.value;
            handleFilter();
        });
        container.querySelector('#reset-product-filters')?.addEventListener('click', () => {
            container.querySelector('#search-product').value = '';
            container.querySelector('#filter-category').value = 'all';
            container.querySelector('#filter-stock').value = 'all';
            ['filter-price-min', 'filter-price-max', 'filter-stock-min', 'filter-stock-max'].forEach(id => { container.querySelector(`#${id}`).value = ''; });
            container.querySelector('#filter-sort').value = 'name_asc';
            this.currentSearch = '';
            this.currentCategory = 'all';
            this.currentStock = 'all';
            this.currentSort = 'name_asc';
            handleFilter();
        });

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
