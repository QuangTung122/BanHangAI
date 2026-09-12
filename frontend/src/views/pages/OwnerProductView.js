export default class OwnerProductView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(products, categories, currentFilter = 'all') {
        this.categories = categories;
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

        let rows = products.map((p, idx) => `
            <tr class="hover:bg-slate-50/80 transition-colors/80 transition-colors border-b border-slate-100 last:border-0">
                <td class="p-4 text-xs font-bold text-slate-400">#${idx + 1}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                            ${p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : `<svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`}
                        </div>
                        <span class="font-bold text-slate-800 text-sm">${p.name}</span>
                    </div>
                </td>
                <td class="p-4 text-sm font-medium text-slate-500">${p.category_name || 'Khác'}</td>
                <td class="p-4 text-sm font-medium text-slate-500">${fmt.format(p.import_price || 0)}</td>
                <td class="p-4 text-sm font-bold text-indigo-600">${fmt.format(p.price || 0)}</td>
                <td class="p-4">
                    <span class="font-bold ${p.stock_quantity <= (p.low_stock_threshold || 5) ? 'text-rose-500' : 'text-emerald-500'}">${p.stock_quantity}</span>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <button class="btn-edit p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" data-id="${p.id}" title="Sửa">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn-delete p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" data-id="${p.id}" title="Xóa">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (products.length === 0) {
            rows = `<tr><td colspan="7" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Chưa có sản phẩm nào.</span>
            </div>
        </td></tr>`;
        }

        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex-1 flex flex-col z-0">
                    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-slate-800">Quản lý Kho hàng & Sản phẩm</h2>
                            <p class="text-xs text-slate-500 mt-1">Hệ thống cập nhật real-time mọi giao dịch từ POS bán hàng.</p>
                        </div>
                        <button id="btn-add-product" class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all duration-200 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Thêm sản phẩm mới
                        </button>
                    </div>
                    
                    <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50 flex-wrap">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input type="text" id="search-product" class="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all w-64 bg-white" placeholder="Tìm kiếm sản phẩm...">
                                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <select id="filter-category" class="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all min-w-[150px] bg-white">
                                <option value="">Tất cả danh mục</option>
                                ${categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}
                            </select>
                            <button id="btn-search" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg transition-colors">Lọc</button>
                        </div>
                        <div class="flex gap-2">
                            <button class="filter-tab px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}" data-filter="all">Tất cả</button>
                            <button class="filter-tab px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentFilter === 'abundant' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}" data-filter="abundant">Hàng dồi dào</button>
                            <button class="filter-tab px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentFilter === 'low' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:bg-slate-100'}" data-filter="low">Hàng sắp hết</button>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-10 border-b border-slate-100">
                                <tr>
                                    <th class="p-4 w-16">ID</th>
                                    <th class="p-4">Tên Sản Phẩm</th>
                                    <th class="p-4">Danh Mục</th>
                                    <th class="p-4">Giá Nhập</th>
                                    <th class="p-4">Giá Bán</th>
                                    <th class="p-4">Tồn Kho</th>
                                    <th class="p-4 w-24">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Thêm/Sửa Sản Phẩm -->
            <div id="modal-product" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-all duration-300">
                <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300">
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            </div>
                            <h3 class="text-lg font-bold text-slate-800" id="modal-title">Thêm sản phẩm mới</h3>
                        </div>
                        <div class="flex items-center gap-3">
                            <button type="button" id="btn-ai-generate" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded flex items-center gap-1 transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                AI Gợi ý thông tin
                            </button>
                            <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6 overflow-y-auto flex-1 bg-slate-50">
                        <form id="form-product" class="space-y-6">
                            <input type="hidden" id="prod-id">
                            
                            <!-- 1. Thông tin chung -->
                            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">1</span>
                                    Thông tin chung
                                </h4>
                                <div class="grid grid-cols-2 gap-5">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Mã SP (SKU / Barcode) *</label>
                                        <div class="flex gap-2">
                                            <input type="text" id="prod-sku" required class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Mã tự động hoặc quét mã vạch">
                                            <button type="button" id="btn-generate-sku" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Tạo mã</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Tên sản phẩm *</label>
                                        <input type="text" id="prod-name" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Ví dụ: iPhone 15 Pro Max...">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Danh mục *</label>
                                        <select id="prod-category" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none">
                                            <option value="">-- Chọn danh mục --</option>
                                            ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Đơn vị tính</label>
                                        <input type="text" id="prod-unit" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Cái, Chiếc, Hộp...">
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Giá & Hình ảnh -->
                            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">2</span>
                                    Giá & Hình ảnh
                                </h4>
                                <div class="grid grid-cols-3 gap-5 mb-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Giá nhập</label>
                                        <input type="number" id="prod-import-price" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Giá bán *</label>
                                        <input type="number" id="prod-price" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Giảm giá (%)</label>
                                        <input type="number" id="prod-discount" min="0" max="100" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" value="0">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1">Link Ảnh (URL)</label>
                                    <input type="url" id="prod-image" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="https://...">
                                </div>
                                <div class="mt-4">
                                    <label class="block text-xs font-bold text-slate-500 mb-1">Các thẻ đặc trưng (Tags)</label>
                                    <input type="text" id="prod-tags" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Ví dụ: Titan Tự Nhiên, 256GB (cách nhau bởi dấu phẩy)">
                                </div>
                            </div>

                            <!-- 3. Tồn kho & Quản lý -->
                            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
                                    Tồn kho & Quản lý
                                </h4>
                                <div class="grid grid-cols-3 gap-5">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Số lượng kho *</label>
                                        <input type="number" id="prod-stock" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Mức cảnh báo hết</label>
                                        <input type="number" id="prod-low-stock" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none" value="5">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 mb-1">Trạng thái bán</label>
                                        <select id="prod-status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none">
                                            <option value="1">Đang kinh doanh</option>
                                            <option value="0">Ngừng kinh doanh</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. Mô tả & AI -->
                            <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">4</span>
                                        Mô tả & Dữ liệu cho AI
                                    </h4>
                                </div>
                                <textarea id="prod-desc" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all focus:ring-1 focus:ring-indigo-500 outline-none resize-none" placeholder="Mô tả sản phẩm, công dụng, đối tượng... (Giúp AI tư vấn tốt hơn)"></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-3 shrink-0">
                        <button type="button" id="btn-cancel-modal" class="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50/80 transition-colors">Hủy</button>
                        <button type="submit" form="form-product" class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Lưu Sản Phẩm</button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.cacheDOM();
    }

    cacheDOM() {
        this.modal = document.getElementById('modal-product');
        this.modalTitle = document.getElementById('modal-title');
        this.form = document.getElementById('form-product');
        this.btnClose = document.getElementById('btn-close-modal');
        this.btnCancel = document.getElementById('btn-cancel-modal');
        this.btnAI = document.getElementById('btn-ai-generate');
    }

    bindAddProduct(handler) {
        const btn = document.getElementById('btn-add-product');
        if (btn) btn.addEventListener('click', handler);
    }

    bindCloseModal(handler) {
        if (this.btnClose) this.btnClose.addEventListener('click', handler);
        if (this.btnCancel) this.btnCancel.addEventListener('click', handler);
    }

    bindGenerateSKU(handler) {
        const btn = document.getElementById('btn-generate-sku');
        if (btn) btn.addEventListener('click', handler);
    }

    bindFilterTabs(handler) {
        this.container.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                handler(filter);
            });
        });
    }

    bindSearch(handler) {
        const btnSearch = document.getElementById('btn-search');
        const inputSearch = document.getElementById('search-product');
        const selectCategory = document.getElementById('filter-category');
        
        const triggerSearch = () => {
            const keyword = inputSearch ? inputSearch.value.trim() : '';
            const category = selectCategory ? selectCategory.value : '';
            handler(keyword, category);
        };

        if (btnSearch) {
            btnSearch.addEventListener('click', triggerSearch);
        }
        
        if (inputSearch) {
            inputSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') triggerSearch();
            });
        }
    }

    setSKU(sku) {
        const input = document.getElementById('prod-sku');
        if (input) input.value = sku;
    }

    bindSaveProduct(handler) {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('prod-id').value;
                const data = {
                    sku: document.getElementById('prod-sku').value,
                    name: document.getElementById('prod-name').value,
                    category_id: document.getElementById('prod-category').value,
                    unit: document.getElementById('prod-unit').value,
                    import_price: parseInt(document.getElementById('prod-import-price').value || 0),
                    price: parseInt(document.getElementById('prod-price').value || 0),
                    discount_percent: parseInt(document.getElementById('prod-discount').value || 0),
                    image_url: document.getElementById('prod-image').value,
                    tags: document.getElementById('prod-tags').value,
                    stock_quantity: parseInt(document.getElementById('prod-stock').value || 0),
                    low_stock_threshold: parseInt(document.getElementById('prod-low-stock').value || 5),
                    is_active: parseInt(document.getElementById('prod-status').value || 1),
                    description: document.getElementById('prod-desc').value,
                };
                handler(data, id || null);
            });
        }
    }

    bindAIGenerate(handler) {
        if (this.btnAI) {
            this.btnAI.addEventListener('click', () => {
                const name = document.getElementById('prod-name').value;
                handler(name);
            });
        }
    }

    showModal(product = null) {
        if (this.form) this.form.reset();
        
        if (product) {
            this.modalTitle.innerText = 'Cập nhật sản phẩm';
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-sku').value = product.sku || '';
            document.getElementById('prod-name').value = product.name || '';
            document.getElementById('prod-category').value = product.category_id || '';
            document.getElementById('prod-unit').value = product.unit || '';
            document.getElementById('prod-import-price').value = product.import_price || 0;
            document.getElementById('prod-price').value = product.price || 0;
            document.getElementById('prod-discount').value = product.discount_percent || 0;
            document.getElementById('prod-image').value = product.image_url || '';
            document.getElementById('prod-tags').value = product.tags || '';
            document.getElementById('prod-stock').value = product.stock_quantity || 0;
            document.getElementById('prod-low-stock').value = product.low_stock_threshold || 5;
            document.getElementById('prod-status').value = product.is_active !== undefined ? product.is_active : 1;
            document.getElementById('prod-desc').value = product.description || '';
        } else {
            this.modalTitle.innerText = 'Thêm sản phẩm mới';
            document.getElementById('prod-id').value = '';
            document.getElementById('prod-sku').value = 'SKU-' + Date.now().toString().slice(-6);
            document.getElementById('prod-tags').value = '';
        }

        this.modal.classList.remove('hidden');
        setTimeout(() => {
            this.modal.classList.remove('opacity-0');
            this.modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    }

    populateForm(product) {
        if (!product) return;
        this.modalTitle.innerText = 'Cập nhật sản phẩm';
        document.getElementById('prod-id').value = product.id;
        document.getElementById('prod-sku').value = product.sku || '';
        document.getElementById('prod-name').value = product.name || '';
        document.getElementById('prod-category').value = product.category_id || '';
        document.getElementById('prod-unit').value = product.unit || '';
        document.getElementById('prod-import-price').value = product.import_price || 0;
        document.getElementById('prod-price').value = product.price || 0;
        document.getElementById('prod-discount').value = product.discount_percent || 0;
        document.getElementById('prod-image').value = product.image_url || '';
        document.getElementById('prod-tags').value = product.tags || '';
        document.getElementById('prod-stock').value = product.stock_quantity || 0;
            document.getElementById('prod-low-stock').value = product.low_stock_threshold || 5;
            document.getElementById('prod-status').value = product.is_active !== undefined ? product.is_active : 1;
        document.getElementById('prod-desc').value = product.description || '';
    }

    hideModal() {
        if (!this.modal) return;
        this.modal.classList.add('opacity-0');
        this.modal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => this.modal.classList.add('hidden'), 300);
    }

    setAILoading(isLoading) {
        if (!this.btnAI) return;
        if (isLoading) {
            this.btnAI.innerHTML = `<svg class="animate-spin w-4 h-4 mr-1" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Đang nghĩ...`;
            this.btnAI.disabled = true;
        } else {
            this.btnAI.innerHTML = `<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> AI Gợi ý mô tả`;
            this.btnAI.disabled = false;
        }
    }

    setAIDescription(text) {
        const ta = document.getElementById('prod-desc');
        if (ta) ta.value = text;
    }
}

