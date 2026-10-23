export default class StaffProductView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(products, categories, myStats) {
        const catOptions = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        
        // Calculate global stats
        const totalProducts = products.length;
        const inStock = products.filter(p => p.stock_quantity > (p.low_stock_threshold || 5)).length;
        const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)).length;

        let html = `
            <div class="h-full flex gap-5 overflow-hidden">
                <!-- PANEL TRÁI (8 phần) -->
                <div class="w-8/12 flex flex-col gap-4">
                    
                    <!-- Dashboard Widgets -->
                    <div class="grid grid-cols-5 gap-3 shrink-0">
                        <!-- Global 1 -->
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[11px] font-black text-indigo-700 uppercase tracking-wide">Tổng mã SP</p>
                            <h3 class="text-2xl font-black text-slate-900 mt-1">${totalProducts}</h3>
                        </div>
                        <!-- Global 2 -->
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[11px] font-black text-emerald-700 uppercase tracking-wide">Dồi dào</p>
                            <h3 class="text-2xl font-black text-emerald-700 mt-1">${inStock}</h3>
                        </div>
                        <!-- Global 3 -->
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[11px] font-black text-amber-800 uppercase tracking-wide">Sắp hết</p>
                            <h3 class="text-2xl font-black text-amber-700 mt-1">${lowStock}</h3>
                        </div>
                        <!-- Personal 1 -->
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div class="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                            <p class="text-[11px] font-black text-slate-700 uppercase tracking-wide">Đơn hôm nay</p>
                            <div class="flex items-baseline gap-1 mt-0.5">
                                <h3 class="text-xl font-black text-slate-900">${myStats.today.full + myStats.today.installment}</h3>
                            </div>
                            <div class="flex gap-2 mt-0.5 text-[10px] font-bold text-slate-600">
                                <span>Thẳng: <b class="text-indigo-700">${myStats.today.full}</b></span>
                                <span>Góp: <b class="text-purple-700">${myStats.today.installment}</b></span>
                            </div>
                        </div>
                        <!-- Personal 2 -->
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div class="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-600"></div>
                            <p class="text-[11px] font-black text-slate-700 uppercase tracking-wide">Đơn tháng này</p>
                            <div class="flex items-baseline gap-1 mt-0.5">
                                <h3 class="text-xl font-black text-slate-900">${myStats.month.full + myStats.month.installment}</h3>
                            </div>
                            <div class="flex gap-2 mt-0.5 text-[10px] font-bold text-slate-600">
                                <span>Thẳng: <b class="text-emerald-700">${myStats.month.full}</b></span>
                                <span>Góp: <b class="text-purple-700">${myStats.month.installment}</b></span>
                            </div>
                        </div>
                    </div>

                    <!-- Bảng dữ liệu -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <!-- Toolbar -->
                        <div class="p-3.5 border-b border-slate-200 flex flex-col gap-3 bg-slate-50">
                            <div class="flex items-center gap-2">
                                <div class="relative w-full">
                                    <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    <input type="search" id="search-product" placeholder="Tên, mã SKU, mã sản phẩm, thương hiệu..." class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-inner">
                                </div>
                                <button type="button" id="reset-product-filters" class="shrink-0 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100">Xóa lọc</button>
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                <select id="filter-category" class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600">
                                    <option value="all">Mọi danh mục</option>
                                    ${catOptions}
                                </select>
                                <select id="filter-stock" class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600">
                                    <option value="all">Mọi trạng thái kho</option>
                                    <option value="in_stock">Còn hàng (Dồi dào)</option>
                                    <option value="low_stock">Sắp hết hàng</option>
                                    <option value="out_of_stock">Đã hết hàng (0)</option>
                                </select>
                                <input type="number" id="filter-price-min" min="0" placeholder="Giá từ (₫)" aria-label="Giá tối thiểu" class="min-w-0 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
                                <input type="number" id="filter-price-max" min="0" placeholder="Giá đến (₫)" aria-label="Giá tối đa" class="min-w-0 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
                                <input type="number" id="filter-stock-min" min="0" placeholder="Tồn từ" aria-label="Tồn kho tối thiểu" class="min-w-0 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
                                <input type="number" id="filter-stock-max" min="0" placeholder="Tồn đến" aria-label="Tồn kho tối đa" class="min-w-0 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold">
                                <select id="filter-sort" class="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold">
                                    <option value="name_asc">Tên A → Z</option>
                                    <option value="name_desc">Tên Z → A</option>
                                    <option value="price_asc">Giá thấp → cao</option>
                                    <option value="price_desc">Giá cao → thấp</option>
                                    <option value="stock_asc">Tồn thấp → cao</option>
                                    <option value="stock_desc">Tồn cao → thấp</option>
                                </select>
                                <div id="product-filter-count" class="col-span-3 flex items-center text-xs font-semibold text-slate-600">Hiển thị ${products.length} / ${products.length} sản phẩm</div>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="flex-1 overflow-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 bg-slate-100 shadow-sm z-10 border-b border-slate-200">
                                    <tr class="text-xs uppercase tracking-wider text-slate-700 font-black">
                                        <th class="p-3.5">Sản Phẩm</th>
                                        <th class="p-3.5">Giá Bán</th>
                                        <th class="p-3.5">Tồn Kho</th>
                                        <th class="p-3.5 text-center">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody id="product-table-body" class="divide-y divide-slate-100 text-sm">
                                    ${this.renderRows(products)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL PHẢI (4 phần) - Master Detail -->
                <div class="w-4/12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative" id="detail-panel">
                    <div class="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <img src="assets/images/logo-system.png" alt="Empty" class="w-20 h-20 mb-3 opacity-60">
                        <p class="text-sm font-bold text-slate-700">Chọn một sản phẩm bên trái<br>để xem đầy đủ thông tin chi tiết</p>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderRows(products) {
        if (!products || products.length === 0) {
            return `<tr><td colspan="4" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Không tìm thấy sản phẩm nào.</span>
                <span class="text-slate-500 text-xs mt-0.5">Thử đổi từ khóa hoặc bộ lọc</span>
            </div>
        </td></tr>`;
        }
        
        return products.map(p => {
            const price = this.formatMoney(p.price);
            const stock = p.stock_quantity;
            
            let statusBadge = '';
            let stockColor = '';
            let rowClass = 'hover:bg-slate-50 cursor-pointer product-row transition-colors';
            
            if (stock === 0) {
                statusBadge = `<span class="px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md text-[10px] font-black border border-rose-300">Hết hàng</span>`;
                stockColor = 'text-rose-600 font-black';
                rowClass += ' bg-rose-50/20';
            } else if (stock <= (p.low_stock_threshold || 5)) {
                statusBadge = `<span class="px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md text-[10px] font-black border border-amber-300">Sắp hết</span>`;
                stockColor = 'text-amber-700 font-black text-base';
                rowClass += ' bg-amber-50/20';
            } else {
                statusBadge = `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-black border border-emerald-300">Còn hàng</span>`;
                stockColor = 'text-emerald-700 font-black text-base';
            }
            
            return `
                <tr class="${rowClass}" data-id="${p.id}">
                    <td class="p-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 p-1">
                                <img src="${p.image_url || 'assets/images/logo-system.png'}" onerror="this.onerror=null;this.src='assets/images/logo-system.png'" alt="Ảnh ${p.name}" class="w-full h-full object-contain">
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 text-sm line-clamp-1">${p.name}</div>
                                <div class="text-[11px] font-bold text-slate-500 mt-0.5">SKU-${p.id.toString().padStart(6, '0')} • ${p.category_name || p.category || 'Khác'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-3 font-black text-indigo-700 text-sm">${price}</td>
                    <td class="p-3 ${stockColor}">${stock}</td>
                    <td class="p-3 text-center">${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    renderDetailPanel(product) {
        if (!product) return;
        const panel = document.getElementById('detail-panel');
        if (!panel) return;

        const stock = product.stock_quantity;
        let statusBadge = stock === 0 
            ? `<span class="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md text-xs font-black border border-rose-300">Hết hàng</span>`
            : (stock <= (product.low_stock_threshold || 5) ? `<span class="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md text-xs font-black border border-amber-300">Sắp hết</span>` : `<span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md text-xs font-black border border-emerald-300">Còn hàng</span>`);
            
        const descText = product.description || 'Sản phẩm chính hãng, đầy đủ phụ kiện và bảo hành.';

        panel.innerHTML = `
            <div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <h3 class="text-sm font-black text-slate-900">Chi tiết sản phẩm</h3>
                <span class="text-xs font-bold text-slate-600">SKU-${product.id.toString().padStart(6, '0')}</span>
            </div>
            
            <div class="flex-1 overflow-auto p-5 flex flex-col custom-scrollbar">
                <!-- Image -->
                <div class="w-full bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center shrink-0 mb-4 relative">
                    <img src="${product.image_url || 'assets/images/logo-system.png'}" onerror="this.onerror=null;this.src='assets/images/logo-system.png'" alt="${product.name}" class="w-44 h-44 object-contain">
                    <div class="absolute top-3 left-3">
                        ${statusBadge}
                    </div>
                </div>
                
                <!-- Info -->
                <div class="space-y-4">
                    <div>
                        <span class="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1.5 inline-block">${product.category_name || product.category || 'Khác'}</span>
                        <h2 class="text-base font-black text-slate-900 leading-snug">${product.name}</h2>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p class="text-[11px] text-slate-600 uppercase font-black mb-0.5">Giá bán lẻ</p>
                            <p class="text-lg font-black text-indigo-700">${this.formatMoney(product.price)}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p class="text-[11px] text-slate-600 uppercase font-black mb-0.5">Tồn kho hiện tại</p>
                            <p class="text-lg font-black ${stock === 0 ? 'text-rose-600' : (stock <= (product.low_stock_threshold || 5) ? 'text-amber-700' : 'text-emerald-700')}">${stock} <span class="text-xs font-bold text-slate-600">${product.unit || 'Cái'}</span></p>
                        </div>
                    </div>
                    
                    <div class="pt-1">
                        <h4 class="text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wide">Mô tả đặc tính</h4>
                        <div class="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl">
                            ${descText}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateTable(products) {
        document.getElementById('product-table-body').innerHTML = this.renderRows(products);
        const count = document.getElementById('product-filter-count');
        if (count) count.textContent = `Hiển thị ${products.length} / ${this.totalProducts} sản phẩm`;
    }

    setTotalProducts(total) {
        this.totalProducts = total;
    }

    highlightRow(productId) {
        document.querySelectorAll('.product-row').forEach(row => {
            row.classList.remove('bg-indigo-50', 'border-l-4', 'border-indigo-600');
            if (parseInt(row.dataset.id) === productId) {
                row.classList.add('bg-indigo-50', 'border-l-4', 'border-indigo-600');
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
