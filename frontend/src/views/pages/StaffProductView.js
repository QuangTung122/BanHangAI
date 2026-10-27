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
            <div class="h-full flex flex-col gap-2.5 overflow-hidden">
                <!-- 5 Widgets Thống kê Tinh gọn (Compact Stats Bar) -->
                <div class="grid grid-cols-5 gap-2 shrink-0">
                    <!-- Global 1 -->
                    <div class="bg-white py-2 px-3 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black text-[#5745f5] uppercase tracking-wider leading-none">Tổng mã SP</p>
                            <h3 class="text-base font-black text-[#182033] mt-1 leading-none">${totalProducts}</h3>
                        </div>
                        <span class="w-6 h-6 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center text-xs font-bold">📦</span>
                    </div>
                    <!-- Global 2 -->
                    <div class="bg-white py-2 px-3 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black text-emerald-700 uppercase tracking-wider leading-none">Dồi dào</p>
                            <h3 class="text-base font-black text-emerald-700 mt-1 leading-none">${inStock}</h3>
                        </div>
                        <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                    </div>
                    <!-- Global 3 -->
                    <div class="bg-white py-2 px-3 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black text-amber-800 uppercase tracking-wider leading-none">Sắp hết</p>
                            <h3 class="text-base font-black text-amber-700 mt-1 leading-none">${lowStock}</h3>
                        </div>
                        <span class="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">⚠️</span>
                    </div>
                    <!-- Personal 1 -->
                    <div class="bg-white py-2 px-3 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between relative overflow-hidden">
                        <div class="absolute right-0 top-0 bottom-0 w-1 bg-[#5745f5]"></div>
                        <div>
                            <p class="text-[10px] font-black text-[#7b8499] uppercase tracking-wider leading-none">Đơn hôm nay</p>
                            <div class="flex items-baseline gap-2 mt-1">
                                <h3 class="text-base font-black text-[#182033] leading-none">${myStats.today.full + myStats.today.installment}</h3>
                                <span class="text-[10px] text-[#7b8499]">Thẳng: <b class="text-[#5745f5]">${myStats.today.full}</b> | Góp: <b class="text-purple-700">${myStats.today.installment}</b></span>
                            </div>
                        </div>
                    </div>
                    <!-- Personal 2 -->
                    <div class="bg-white py-2 px-3 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between relative overflow-hidden">
                        <div class="absolute right-0 top-0 bottom-0 w-1 bg-emerald-600"></div>
                        <div>
                            <p class="text-[10px] font-black text-[#7b8499] uppercase tracking-wider leading-none">Đơn tháng này</p>
                            <div class="flex items-baseline gap-2 mt-1">
                                <h3 class="text-base font-black text-[#182033] leading-none">${myStats.month.full + myStats.month.installment}</h3>
                                <span class="text-[10px] text-[#7b8499]">Thẳng: <b class="text-emerald-700">${myStats.month.full}</b> | Góp: <b class="text-purple-700">${myStats.month.installment}</b></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vùng Làm Việc Chính (Không gian tối đa) -->
                <div class="flex-1 flex gap-3 overflow-hidden min-h-0">
                    <!-- PANEL TRÁI (8/12) - Bảng Dữ Liệu -->
                    <div class="w-8/12 bg-white rounded-xl shadow-xs border border-[#e7eaf2] flex flex-col overflow-hidden">
                        <!-- Toolbar Bộ lọc Gọn gàng -->
                        <div class="p-2.5 border-b border-[#e7eaf2] flex flex-col gap-2 bg-[#fafbfd]">
                            <div class="flex items-center gap-2">
                                <div class="relative w-full">
                                    <svg class="w-4 h-4 absolute left-3 top-2 text-[#7b8499]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    <input type="search" id="search-product" placeholder="Tìm tên, mã SKU, thương hiệu..." class="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs text-[#182033] font-semibold focus:outline-none focus:border-[#5745f5]">
                                </div>
                                <button type="button" id="reset-product-filters" class="shrink-0 px-3 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#7b8499] hover:bg-[#f5f6fa] transition-colors cursor-pointer">Xóa lọc</button>
                            </div>
                            <div class="grid grid-cols-4 gap-1.5">
                                <select id="filter-category" class="px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs text-[#182033] font-semibold focus:outline-none focus:border-[#5745f5] cursor-pointer">
                                    <option value="all">Mọi danh mục</option>
                                    ${catOptions}
                                </select>
                                <select id="filter-stock" class="px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs text-[#182033] font-semibold focus:outline-none focus:border-[#5745f5] cursor-pointer">
                                    <option value="all">Mọi trạng thái kho</option>
                                    <option value="in_stock">Còn hàng (Dồi dào)</option>
                                    <option value="low_stock">Sắp hết hàng</option>
                                    <option value="out_of_stock">Đã hết hàng (0)</option>
                                </select>
                                <input type="number" id="filter-price-min" min="0" placeholder="Giá từ (₫)" aria-label="Giá tối thiểu" class="min-w-0 px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold">
                                <input type="number" id="filter-price-max" min="0" placeholder="Giá đến (₫)" aria-label="Giá tối đa" class="min-w-0 px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold">
                                <input type="number" id="filter-stock-min" min="0" placeholder="Tồn từ" aria-label="Tồn kho tối thiểu" class="min-w-0 px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold">
                                <input type="number" id="filter-stock-max" min="0" placeholder="Tồn đến" aria-label="Tồn kho tối đa" class="min-w-0 px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold">
                                <select id="filter-sort" class="px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs text-[#182033] font-semibold cursor-pointer">
                                    <option value="name_asc">Tên A → Z</option>
                                    <option value="name_desc">Tên Z → A</option>
                                    <option value="price_asc">Giá thấp → cao</option>
                                    <option value="price_desc">Giá cao → thấp</option>
                                    <option value="stock_asc">Tồn thấp → cao</option>
                                    <option value="stock_desc">Tồn cao → thấp</option>
                                </select>
                                <div id="product-filter-count" class="col-span-1 flex items-center justify-end text-[11px] font-semibold text-[#7b8499]">Hiển thị ${products.length} SP</div>
                            </div>
                        </div>

                        <!-- Table Sản Phẩm Rộng Rãi -->
                        <div class="flex-1 overflow-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse min-w-[500px]">
                                <thead class="sticky top-0 bg-[#fafbfd] shadow-xs z-10 border-b border-[#e7eaf2]">
                                    <tr class="text-[11px] uppercase tracking-wider text-[#7b8499] font-black">
                                        <th class="p-2.5">Sản Phẩm</th>
                                        <th class="p-2.5">Giá Bán</th>
                                        <th class="p-2.5">Tồn Kho</th>
                                        <th class="p-2.5 text-center">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody id="product-table-body" class="divide-y divide-[#e7eaf2] text-xs">
                                    ${this.renderRows(products)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- PANEL PHẢI (4/12) - Master Detail -->
                    <div class="w-4/12 bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col relative" id="detail-panel">
                        <div class="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <div class="w-12 h-12 rounded-xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-lg mb-2">🔍</div>
                            <p class="text-xs font-bold text-[#182033]">Chọn sản phẩm bên trái<br>để xem đầy đủ thông tin chi tiết</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderRows(products) {
        if (!products || products.length === 0) {
            return `<tr><td colspan="4" class="p-8 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-10 h-10 rounded-xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-lg mb-2">📦</div>
                <span class="text-[#182033] font-bold text-xs">Không tìm thấy sản phẩm nào</span>
                <span class="text-[#7b8499] text-[11px] mt-0.5">Thử đổi từ khóa hoặc bộ lọc</span>
            </div>
        </td></tr>`;
        }
        
        return products.map(p => {
            const price = this.formatMoney(p.price);
            const stock = p.stock_quantity;
            
            let statusBadge = '';
            let stockColor = '';
            let rowClass = 'hover:bg-[#fafbfd] cursor-pointer product-row transition-colors';
            
            if (stock === 0) {
                statusBadge = `<span class="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-bold border border-rose-200">Hết hàng</span>`;
                stockColor = 'text-rose-600 font-bold';
                rowClass += ' bg-rose-50/20';
            } else if (stock <= (p.low_stock_threshold || 5)) {
                statusBadge = `<span class="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold border border-amber-200">Sắp hết</span>`;
                stockColor = 'text-amber-700 font-bold';
                rowClass += ' bg-amber-50/20';
            } else {
                statusBadge = `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">Còn hàng</span>`;
                stockColor = 'text-emerald-700 font-bold';
            }
            
            return `
                <tr class="${rowClass}" data-id="${p.id}">
                    <td class="p-2.5">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 bg-white rounded-lg border border-[#e7eaf2] overflow-hidden shrink-0 p-0.5 flex items-center justify-center">
                                <img src="${p.image_url || 'assets/images/logo-system.png'}" onerror="this.onerror=null;this.src='assets/images/logo-system.png'" alt="Ảnh ${p.name}" class="w-full h-full object-contain">
                            </div>
                            <div class="min-w-0">
                                <div class="font-bold text-[#182033] text-xs truncate max-w-[240px]">${p.name}</div>
                                <div class="text-[10px] text-[#7b8499] mt-0.5">SKU-${p.id.toString().padStart(6, '0')} • ${p.category_name || p.category || 'Khác'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-2.5 font-bold text-[#5745f5] text-xs whitespace-nowrap">${price}</td>
                    <td class="p-2.5 ${stockColor} whitespace-nowrap">${stock}</td>
                    <td class="p-2.5 text-center whitespace-nowrap">${statusBadge}</td>
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
            ? `<span class="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[11px] font-bold border border-rose-200">Hết hàng</span>`
            : (stock <= (product.low_stock_threshold || 5) ? `<span class="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[11px] font-bold border border-amber-200">Sắp hết</span>` : `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-bold border border-emerald-200">Còn hàng</span>`);
            
        const descText = product.description || 'Sản phẩm chính hãng, đầy đủ phụ kiện và bảo hành.';

        panel.innerHTML = `
            <div class="p-3 border-b border-[#e7eaf2] bg-[#fafbfd] flex justify-between items-center shrink-0">
                <h3 class="text-xs font-black text-[#182033]">Chi tiết sản phẩm</h3>
                <span class="text-[10px] font-mono font-bold text-[#7b8499]">SKU-${product.id.toString().padStart(6, '0')}</span>
            </div>
            
            <div class="flex-1 overflow-auto p-4 flex flex-col custom-scrollbar space-y-3">
                <!-- Image -->
                <div class="w-full bg-[#f8f9fc] rounded-xl p-3 border border-[#e7eaf2] flex items-center justify-center shrink-0 relative">
                    <img src="${product.image_url || 'assets/images/logo-system.png'}" onerror="this.onerror=null;this.src='assets/images/logo-system.png'" alt="${product.name}" class="w-36 h-36 object-contain">
                    <div class="absolute top-2 left-2">
                        ${statusBadge}
                    </div>
                </div>
                
                <!-- Info -->
                <div class="space-y-2.5">
                    <div>
                        <span class="text-[10px] font-bold text-[#5745f5] bg-[#f0edff] border border-[#e1dcff] px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">${product.category_name || product.category || 'Khác'}</span>
                        <h2 class="text-xs font-bold text-[#182033] leading-snug">${product.name}</h2>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-[#f8f9fc] p-2.5 rounded-xl border border-[#e7eaf2]">
                            <p class="text-[10px] text-[#7b8499] uppercase font-bold mb-0.5">Giá bán lẻ</p>
                            <p class="text-sm font-black text-[#5745f5]">${this.formatMoney(product.price)}</p>
                        </div>
                        <div class="bg-[#f8f9fc] p-2.5 rounded-xl border border-[#e7eaf2]">
                            <p class="text-[10px] text-[#7b8499] uppercase font-bold mb-0.5">Tồn kho</p>
                            <p class="text-sm font-black ${stock === 0 ? 'text-rose-600' : (stock <= (product.low_stock_threshold || 5) ? 'text-amber-700' : 'text-emerald-700')}">${stock} <span class="text-[10px] font-normal text-[#7b8499]">${product.unit || 'Cái'}</span></p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-[10px] font-bold text-[#7b8499] mb-1 uppercase tracking-wide">Mô tả sản phẩm</h4>
                        <div class="text-xs font-medium text-[#182033] leading-relaxed bg-[#f8f9fc] border border-[#e7eaf2] p-2.5 rounded-xl">
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
        if (count) count.textContent = `Hiển thị ${products.length} / ${this.totalProducts} SP`;
    }

    setTotalProducts(total) {
        this.totalProducts = total;
    }

    highlightRow(productId) {
        document.querySelectorAll('.product-row').forEach(row => {
            row.classList.remove('bg-[#f0edff]/60', 'border-l-4', 'border-[#5745f5]');
            if (parseInt(row.dataset.id) === productId) {
                row.classList.add('bg-[#f0edff]/60', 'border-l-4', 'border-[#5745f5]');
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
