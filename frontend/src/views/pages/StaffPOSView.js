export default class StaffPOSView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(categories, products, cartItems, cartTotal) {
        let html = `
            <div class="flex h-full w-full bg-slate-100 overflow-hidden">
                <!-- Khu vực Sản phẩm (Trái) -->
                <div class="flex-1 flex flex-col h-full bg-slate-50 relative">
                    <!-- Thanh tìm kiếm & Phân loại -->
                    <div class="bg-white p-6 border-b border-slate-100 shadow-sm z-10 shrink-0">
                        <div class="relative w-full max-w-2xl group">
                            <svg class="w-5 h-5 absolute left-5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" id="pos-search" placeholder="Tìm kiếm sản phẩm nhanh... (Hỗ trợ quét mã vạch)" class="w-full pl-12 pr-6 py-3 bg-white border border-slate-200/80 rounded-full text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm focus:shadow-md">
                        </div>
                        
                        <!-- Quick Categories -->
                        <div class="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide" id="pos-categories">
                            <button class="cat-btn px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-transparent hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95" data-slug="">Tất cả</button>
                            ${categories.map(c => `
                                <button class="cat-btn px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95" data-slug="${c.slug}">${c.name}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Danh sách Sản phẩm -->
                    <div class="flex-1 overflow-y-auto p-4 md:p-6" id="pos-product-list">
                        ${this.renderProductGrid(products)}
                    </div>
                </div>

                <!-- Khu vực Giỏ hàng (Phải) -->
                <div class="w-[400px] bg-white border-l border-slate-100 flex flex-col h-full shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] shrink-0 z-20 relative">
                    <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 shrink-0 z-10">
                        <h2 class="text-lg font-black text-slate-800 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            Giỏ hàng
                        </h2>
                        <button id="btn-clear-cart" class="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all active:scale-90" title="Xóa giỏ hàng">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex-1 overflow-y-auto p-4 bg-slate-50/50" id="pos-cart-items">
                        ${this.renderCartItems(cartItems)}
                    </div>

                    <!-- Checkout Summary -->
                    <div class="p-5 pb-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)] relative z-20 rounded-t-2xl max-h-[55vh] overflow-y-auto custom-scrollbar">
                        <div class="flex justify-between items-center mb-3 text-sm text-slate-500 font-medium">
                            <span>Tạm tính</span>
                            <span class="font-bold text-slate-700">${this.formatMoney(cartTotal)}</span>
                        </div>
                        <div class="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span class="text-base font-black text-slate-800">Tổng tiền</span>
                            <span class="text-2xl font-black text-indigo-700 tracking-tight">${this.formatMoney(cartTotal)}</span>
                        </div>
                        
                        <div class="space-y-4 mb-6">
                            <!-- Khối Thông tin khách hàng (Luôn hiện) -->
                            <div class="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                                <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <h3 class="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Thông tin khách hàng</h3>
                                <input type="text" id="pos-customer-name" placeholder="Họ và tên khách hàng" class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm">
                                <input type="text" id="pos-customer-phone" placeholder="Số điện thoại" maxlength="10" pattern="[0-9]{10}" class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm">
                            </div>

                            <div>
                                <label class="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">Loại thanh toán</label>
                                <select id="pos-payment-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 font-semibold text-slate-700 shadow-sm transition-all cursor-pointer">
                                    <option value="full">Trả thẳng</option>
                                    <option value="installment">Trả góp</option>
                                </select>
                            </div>
                            
                            <!-- Khối Trả góp (Mặc định ẩn) -->
                            <div id="pos-installment-box" class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4 hidden space-y-3 relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <h3 class="text-[11px] font-bold text-amber-800 uppercase tracking-wide border-b border-amber-200/60 pb-1.5">Bổ sung hồ sơ trả góp</h3>
                                <input type="text" id="pos-customer-cccd" placeholder="Số CCCD (12 số)" maxlength="12" class="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 shadow-sm transition-all">
                                
                                <h3 class="text-[11px] font-bold text-amber-800 uppercase tracking-wide border-b border-amber-200/60 pb-1.5 mt-3">Kỳ hạn trả góp</h3>
                                <select id="pos-installment-term" class="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 text-slate-700 font-semibold shadow-sm transition-all cursor-pointer">
                                    <option value="3">3 Tháng (Phí 2%)</option>
                                    <option value="6">6 Tháng (Phí 4%)</option>
                                    <option value="9">9 Tháng (Phí 6%)</option>
                                    <option value="12">12 Tháng (Phí 8%)</option>
                                </select>
                                
                                <div class="bg-white/60 p-3 rounded-lg text-xs space-y-1.5 mt-2 shadow-inner border border-amber-100">
                                    <div class="flex justify-between text-amber-900 font-medium"><span>Gốc:</span> <span id="pos-inst-base" class="font-bold">0đ</span></div>
                                    <div class="flex justify-between text-amber-900 font-medium"><span>Phí trả góp:</span> <span id="pos-inst-fee" class="font-bold">0đ</span></div>
                                    <div class="flex justify-between text-indigo-700 border-t border-amber-200/60 pt-2 mt-2">
                                        <span class="font-bold">Mỗi tháng:</span> <span id="pos-inst-monthly" class="font-black text-sm">0đ</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">Hình thức nhận tiền</label>
                                <select id="pos-receipt-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 font-semibold text-slate-700 shadow-sm transition-all cursor-pointer">
                                    <option value="transfer">Chuyển khoản ngân hàng</option>
                                    <option value="cash">Tiền mặt</option>
                                    <option value="card">Quẹt thẻ</option>
                                </select>
                            </div>
                        </div>

                        <button id="btn-checkout" class="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 text-sm flex items-center justify-center gap-2 uppercase tracking-wide">
                            Thanh toán & In hóa đơn
                            <svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Hidden iframe for printing -->
            <iframe id="print-frame" style="display:none;"></iframe>

        `;
        
        this.container.innerHTML = html;
        setTimeout(() => document.getElementById('pos-search').focus(), 100);
    }

    renderProductGrid(products) {
        if (products.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-slate-400">
                    <img src="assets/images/logo-system.png" alt="Empty" class="w-32 h-32 mb-4 object-contain drop-shadow-md">
                    <p class="font-medium">Không tìm thấy sản phẩm nào</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                ${products.map(p => `
                    <div class="bg-white rounded-2xl border border-transparent shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer active:scale-[0.98]">
                        <div class="relative pt-[100%] bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors duration-300 flex items-center justify-center p-4">
                            <!-- Image placeholder if no image -->
                            <div class="absolute inset-0 flex items-center justify-center p-4">
                                ${p.image_url 
                                    ? `<img src="${p.image_url}" class="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500">`
                                    : `<svg class="w-16 h-16 text-slate-300 group-hover:text-indigo-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`
                                }
                            </div>
                        </div>
                        <div class="p-4 flex flex-col flex-1">
                            <div class="text-[11px] text-indigo-600 font-bold tracking-wide uppercase mb-1.5">${p.category_name || 'Khác'}</div>
                            <h3 class="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2 flex-1 group-hover:text-indigo-700 transition-colors">${p.name}</h3>
                            ${p.tags ? `
                                <div class="flex flex-wrap gap-1.5 mb-3">
                                    ${p.tags.split(',').map(tag => `<span class="px-2.5 py-0.5 bg-slate-100 group-hover:bg-white group-hover:border-indigo-100 text-slate-500 text-[10px] font-semibold rounded-full border border-slate-200 transition-colors">${tag.trim()}</span>`).join('')}
                                </div>
                            ` : ''}
                            <div class="flex items-end justify-between mt-auto mb-4">
                                <div class="flex flex-col">
                                    ${p.discount_percent ? `<span class="text-[11px] text-slate-400 line-through mb-0.5">${this.formatMoney(p.price)}</span>` : ''}
                                    <div class="text-indigo-700 font-black text-base flex items-center gap-1.5">
                                        ${this.formatMoney(p.price * (1 - (p.discount_percent || 0)/100))}
                                        ${p.discount_percent ? `<span class="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">-${p.discount_percent}%</span>` : ''}
                                    </div>
                                </div>
                                <div class="text-[11px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">Kho: ${p.stock_quantity}</div>
                            </div>
                            <button class="btn-add-cart w-full py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5" data-id="${p.id}" ${p.stock_quantity === 0 ? 'disabled' : ''}>
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                ${p.stock_quantity === 0 ? 'Hết hàng' : 'Thêm vào đơn'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCartItems(items) {
        if (items.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-slate-400">
                    <img src="assets/images/logo-system.png" alt="Empty" class="w-20 h-20 mb-3 object-contain drop-shadow-md">
                    <p class="text-sm font-medium">Giỏ hàng trống</p>
                </div>
            `;
        }

        return `
            <div class="space-y-3">
                ${items.map(item => `
                    <div class="bg-white p-3.5 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col relative group">
                        <button class="btn-remove-item absolute top-2.5 right-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all active:scale-90 z-10" data-id="${item.product.id}">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                        <div class="pr-9 mb-2.5">
                            <h4 class="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">${item.product.name}</h4>
                            <div class="flex items-center gap-1.5 mt-1">
                                <div class="text-rose-600 font-black text-[15px]">${this.formatMoney(item.product.price * (1 - (item.product.discount_percent || 0)/100))}</div>
                                ${item.product.discount_percent ? `<span class="text-[10px] text-slate-400 line-through">${this.formatMoney(item.product.price)}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                            <div class="text-[11px] text-slate-500 font-medium">Tổng: <span class="font-bold text-slate-800 text-[13px]">${this.formatMoney(item.product.price * (1 - (item.product.discount_percent || 0)/100) * item.quantity)}</span></div>
                            <div class="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shadow-inner">
                                <button class="btn-qty-minus w-7 h-7 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm active:scale-90 rounded-md transition-all font-bold" data-id="${item.product.id}">-</button>
                                <input type="number" class="w-8 text-center text-xs font-bold bg-transparent outline-none text-slate-800 pointer-events-none" value="${item.quantity}" readonly>
                                <button class="btn-qty-plus w-7 h-7 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm active:scale-90 rounded-md transition-all font-bold" data-id="${item.product.id}">+</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateProductList(products) {
        const list = document.getElementById('pos-product-list');
        if (list) list.innerHTML = this.renderProductGrid(products);
    }

    updateCart(items, total) {
        const cartEl = document.getElementById('pos-cart-items');
        if (cartEl) cartEl.innerHTML = this.renderCartItems(items);
        
        // Update all total display elements
        document.querySelectorAll('.font-medium.text-slate-700').forEach(el => {
            if (el.innerText.includes('đ')) el.innerText = this.formatMoney(total);
        });
        document.querySelectorAll('.text-2xl.font-black.text-indigo-700').forEach(el => {
            el.innerText = this.formatMoney(total);
        });
    }

    updateActiveCategory(slug) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (btn.dataset.slug === slug) {
                btn.className = 'cat-btn px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-transparent hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95';
            } else {
                btn.className = 'cat-btn px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95';
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}

