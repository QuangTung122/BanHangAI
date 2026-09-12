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
            <div class="h-full flex gap-4 overflow-hidden">
                <!-- PANEL TRÁI (7 phần) -->
                <div class="w-8/12 flex flex-col gap-4">
                    
                    <!-- Dashboard Widgets -->
                    <div class="grid grid-cols-5 gap-3 shrink-0">
                        <!-- Global 1 -->
                        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[10px] font-bold text-indigo-500 uppercase">Tổng mã SP</p>
                            <h3 class="text-xl font-black text-indigo-700">${totalProducts}</h3>
                        </div>
                        <!-- Global 2 -->
                        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[10px] font-bold text-emerald-500 uppercase">Dồi dào</p>
                            <h3 class="text-xl font-black text-emerald-700">${inStock}</h3>
                        </div>
                        <!-- Global 3 -->
                        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p class="text-[10px] font-bold text-orange-500 uppercase">Sắp hết</p>
                            <h3 class="text-xl font-black text-orange-700">${lowStock}</h3>
                        </div>
                        <!-- Personal 1 -->
                        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div class="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase">Đơn hôm nay</p>
                            <div class="flex items-baseline gap-1 mt-1">
                                <h3 class="text-lg font-black text-slate-800">${myStats.today.full + myStats.today.installment}</h3>
                            </div>
                            <div class="flex gap-2 mt-1 text-[9px] font-medium text-slate-400">
                                <span>Thẳng: <b class="text-indigo-600">${myStats.today.full}</b></span>
                                <span>Góp: <b class="text-purple-600">${myStats.today.installment}</b></span>
                            </div>
                        </div>
                        <!-- Personal 2 -->
                        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div class="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase">Đơn tháng này</p>
                            <div class="flex items-baseline gap-1 mt-1">
                                <h3 class="text-lg font-black text-slate-800">${myStats.month.full + myStats.month.installment}</h3>
                            </div>
                            <div class="flex gap-2 mt-1 text-[9px] font-medium text-slate-400">
                                <span>Thẳng: <b class="text-emerald-600">${myStats.month.full}</b></span>
                                <span>Góp: <b class="text-purple-600">${myStats.month.installment}</b></span>
                            </div>
                        </div>
                    </div>

                    <!-- Bảng dữ liệu -->
                    <div class="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex-1 flex flex-col overflow-hidden">
                        <!-- Toolbar -->
                        <div class="p-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
                            <div class="flex items-center gap-2 w-full max-w-md">
                                <div class="relative w-full">
                                    <svg class="w-4 h-4 absolute left-3 top-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    <input type="text" id="search-product" placeholder="Tìm sản phẩm..." class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all transition-colors">
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <select id="filter-category" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all">
                                    <option value="all">Mọi danh mục</option>
                                    ${catOptions}
                                </select>
                                <select id="filter-stock" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all">
                                    <option value="all">Mọi trạng thái</option>
                                    <option value="in_stock">Còn hàng (Dồi dào)</option>
                                    <option value="low_stock">Sắp hết hàng</option>
                                    <option value="out_of_stock">Hết hàng (0)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="flex-1 overflow-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 bg-white shadow-sm z-10">
                                    <tr class="border-b border-slate-200 shadow-sm text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-50/80 backdrop-blur">
                                        <th class="p-3">Sản Phẩm</th>
                                        <th class="p-3">Giá Bán</th>
                                        <th class="p-3">Kho</th>
                                        <th class="p-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody id="product-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                                    ${this.renderRows(products)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL PHẢI (3 phần) - Master Detail -->
                <div class="w-4/12 bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative" id="detail-panel">
                    <div class="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <img src="assets/images/logo-system.png" alt="Empty" class="w-24 h-24 mb-4 object-contain drop-shadow-md">
                        <p class="text-sm font-medium text-slate-500">Chọn một sản phẩm bên trái<br>để xem thông tin chi tiết</p>
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
                <img src="assets/images/logo-system.png" class="w-32 h-32 mb-4 drop-shadow-md">
                <span class="text-slate-500 font-medium">Không tìm thấy sản phẩm nào.</span>
            </div>
        </td></tr>`;
        }
        
        return products.map(p => {
            const price = this.formatMoney(p.price);
            const stock = p.stock_quantity;
            
            let statusBadge = '';
            let stockColor = '';
            let rowClass = 'hover:bg-indigo-50/50 cursor-pointer product-row transition-colors';
            
            if (stock === 0) {
                statusBadge = `<span class="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">Hết hàng</span>`;
                stockColor = 'text-rose-500 font-bold';
                rowClass += ' bg-rose-50/30 opacity-75';
            } else if (stock <= (p.low_stock_threshold || 5)) {
                statusBadge = `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold flex items-center gap-1 w-max mx-auto"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sắp hết</span>`;
                stockColor = 'text-amber-600 font-bold text-lg';
                rowClass += ' bg-amber-50/20';
            } else {
                statusBadge = `<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">Còn hàng</span>`;
                stockColor = 'text-green-600 font-bold text-lg';
            }
            
            return `
                <tr class="${rowClass}" data-id="${p.id}">
                    <td class="p-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded border border-slate-200 overflow-hidden flex-shrink-0 p-0.5">
                                <img src="${p.image_url || 'https://via.placeholder.com/150'}" alt="" class="w-full h-full object-contain">
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 text-sm line-clamp-1">${p.name}</div>
                                <div class="text-[10px] text-slate-500 mt-0.5">SKU-${p.id.toString().padStart(6, '0')} • ${p.category}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-3 font-bold text-indigo-600 text-sm">${price}</td>
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
            ? `<span class="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold">Hết hàng</span>`
            : (stock <= (product.low_stock_threshold || 5) ? `<span class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Sắp hết</span>` : `<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Còn hàng</span>`);
            
        const descText = product.description || 'Sản phẩm chính hãng, bảo hành 12 tháng. Phụ kiện đi kèm gồm cáp sạc, sách hướng dẫn.';

        panel.innerHTML = `
            <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h3 class="text-sm font-bold text-slate-800">Thông tin chi tiết</h3>
                <span class="text-xs font-medium text-slate-400">SKU-${product.id.toString().padStart(6, '0')}</span>
            </div>
            
            <div class="flex-1 overflow-auto p-5 flex flex-col">
                <!-- Image -->
                <div class="w-full bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-center shrink-0 mb-5 relative group">
                    <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}" class="w-48 h-48 object-contain transition-transform group-hover:scale-110">
                    <div class="absolute top-3 left-3">
                        ${statusBadge}
                    </div>
                </div>
                
                <!-- Info -->
                <div class="space-y-4">
                    <div>
                        <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">${product.category}</span>
                        <h2 class="text-lg font-bold text-slate-800 leading-tight">${product.name}</h2>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Giá bán lẻ</p>
                            <p class="text-lg font-black text-rose-600">${this.formatMoney(product.price)}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Tồn kho</p>
                            <p class="text-lg font-black ${stock === 0 ? 'text-rose-600' : (stock <= (product.low_stock_threshold || 5) ? 'text-amber-600' : 'text-green-600')}">${stock} <span class="text-xs font-medium text-slate-500">cái</span></p>
                        </div>
                    </div>
                    
                    <div class="pt-2">
                        <h4 class="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Mô tả cấu hình</h4>
                        <div class="text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg">
                            ${descText}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateTable(products) {
        document.getElementById('product-table-body').innerHTML = this.renderRows(products);
    }

    highlightRow(productId) {
        document.querySelectorAll('.product-row').forEach(row => {
            row.classList.remove('bg-indigo-50', 'border-l-4', 'border-indigo-500');
            if (parseInt(row.dataset.id) === productId) {
                row.classList.add('bg-indigo-50', 'border-l-4', 'border-indigo-500');
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}

