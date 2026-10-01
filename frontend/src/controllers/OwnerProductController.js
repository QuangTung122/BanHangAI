import ProductService from '../services/ProductService.js';
import OwnerProductView from '../views/pages/OwnerProductView.js';

export default class OwnerProductController {
    constructor() {
        this.view = new OwnerProductView();
        this.products = [];
        this.allProducts = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.searchCategory = '';
        this.replenishmentSuggestions = [];
        
        this.loadData();
    }

    async loadData() {
        try {
            const [catRes, prodRes, allProdRes, replenishmentRes] = await Promise.all([
                ProductService.getCategories(),
                ProductService.getProducts(this.searchCategory, this.searchQuery),
                ProductService.getProducts(),
                ProductService.getReplenishmentSuggestions().catch(() => null)
            ]);
            
            if (catRes.status === 200 && catRes.data.success) {
                this.categories = catRes.data.data;
            }
            if (prodRes.status === 200 && prodRes.data.success) {
                this.products = prodRes.data.data;
            }
            if (allProdRes.status === 200 && allProdRes.data.success) {
                this.allProducts = allProdRes.data.data;
            }
            if (replenishmentRes?.data?.success) this.replenishmentSuggestions = replenishmentRes.data.data.suggestions || [];
            
            this.renderFiltered();
        } catch (error) {
            console.error(error);
        }
    }

    renderFiltered() {
        let filtered = this.products;
        if (this.currentFilter === 'abundant') {
            filtered = this.products.filter(p => p.stock_quantity > (p.low_stock_threshold || 5));
        } else if (this.currentFilter === 'low') {
            filtered = this.products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 5));
        }
        
        this.view.render(filtered, this.categories, this.currentFilter, this.replenishmentSuggestions);
        this.view.setReceiptProducts(this.allProducts);
        this.bindEvents();
    }

    bindEvents() {
        this.view.bindAddProduct(this.handleAddProductClick.bind(this));
        this.view.bindCloseModal(this.handleCloseModal.bind(this));
        this.view.bindSaveProduct(this.handleSaveProduct.bind(this));
        this.view.bindStockReceipt(this.handleCreateStockReceipt.bind(this), this.handleLoadStockReceipts.bind(this));
        this.view.bindAIGenerate(this.handleAIGenerate.bind(this));
        this.view.bindGenerateSKU(this.handleGenerateSKU.bind(this));
        this.view.bindFilterTabs(this.handleFilterChange.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));

        // Edit & Delete
        this.view.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const p = this.products.find(x => x.id === id);
                if (p) this.view.showModal(p);
            });
        });
        
        this.view.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                    const res = await ProductService.deleteProduct(id);
                    if (res.status === 200 && res.data.success) {
                        this.loadData();
                    } else {
                        alert(res.data.message || 'Lỗi khi xóa');
                    }
                }
            });
        });
    }

    handleSearch(keyword, category) {
        if (this.searchQuery !== keyword || this.searchCategory !== category) {
            this.searchQuery = keyword;
            this.searchCategory = category;
            this.loadData();
        }
    }

    handleFilterChange(filter) {
        if (this.currentFilter !== filter) {
            this.currentFilter = filter;
            this.renderFiltered();
        }
    }

    handleAddProductClick() {
        this.view.showModal(null);
    }

    handleCloseModal() {
        this.view.hideModal();
    }

    handleGenerateSKU() {
        const newSKU = 'SKU-' + Date.now().toString().slice(-6);
        this.view.setSKU(newSKU);
    }

    async handleSaveProduct(formData, id) {
        try {
            let res;
            if (id) {
                res = await ProductService.updateProduct(id, formData);
            } else {
                res = await ProductService.createProduct(formData);
            }
            
            if (res.status === 200 || res.status === 201) {
                this.view.hideModal();
                this.loadData(); // reload
            } else {
                alert(res.data.message || 'Lỗi khi lưu sản phẩm');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi hệ thống');
        }
    }

    async handleCreateStockReceipt(payload) {
        try {
            const res = await ProductService.createStockReceipt(payload);
            if (res.status === 201 && res.data.success) {
                this.view.hideStockReceiptModal();
                window.showToast?.(`Đã nhập kho thành công · Phiếu #${res.data.data.id}`, 'success');
                this.loadData();
            } else {
                window.showToast?.(res.data?.message || 'Không thể ghi nhận phiếu nhập', 'error');
            }
        } catch (error) {
            console.error('Lỗi tạo phiếu nhập:', error);
            window.showToast?.(error.response?.data?.message || 'Lỗi hệ thống khi nhập hàng', 'error');
        }
    }

    async handleLoadStockReceipts() {
        const res = await ProductService.getStockReceipts();
        if (res.status !== 200 || !res.data.success) {
            throw new Error(res.data?.message || 'Không tải được lịch sử nhập kho');
        }
        return res.data.data;
    }

    handleAIGenerate(nameInput) {
        if (!nameInput) {
            alert('Vui lòng nhập tên sản phẩm trước khi gợi ý.');
            return;
        }

        const existingProduct = this.products.find(p => p.name.toLowerCase().trim() === nameInput.toLowerCase().trim());
        
        if (existingProduct) {
            // Lấy dữ liệu sản phẩm đã có điền vào form
            this.view.populateForm(existingProduct);
            // Hiển thị thông báo nhỏ
            this.view.btnAI.innerHTML = `<svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Đã tải dữ liệu cũ`;
            setTimeout(() => {
                this.view.setAILoading(false); // reset button state
            }, 2000);
            return;
        }
        
        // Mock AI request
        this.view.setAILoading(true);
        setTimeout(() => {
            this.view.setAIDescription(`Sản phẩm ${nameInput} mang đến trải nghiệm tuyệt vời với thiết kế hiện đại và tính năng vượt trội. Phù hợp cho mọi nhu cầu sử dụng hàng ngày.`);
            this.view.setAILoading(false);
        }, 1500);
    }

    destroy() {
        // cleanup
    }
}
