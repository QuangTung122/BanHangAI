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
                    <div class="bg-white p-4 border-b border-slate-200 z-10 shrink-0">
                        <div class="relative w-full max-w-2xl">
                            <svg class="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" id="pos-search" placeholder="Tìm kiếm sản phẩm nhanh... (Hỗ trợ quét mã vạch)" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all">
                        </div>
                        
                        <!-- Quick Categories -->
                        <div class="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide" id="pos-categories">
                            <button class="cat-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-indigo-600 text-white shadow-sm border border-indigo-600" data-slug="">Tất cả</button>
                            ${categories.map(c => `
                                <button class="cat-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-white text-slate-600 border border-slate-200 hover:bg-slate-50" data-slug="${c.slug}">${c.name}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Danh sách Sản phẩm -->
                    <div class="flex-1 overflow-y-auto p-4 md:p-6" id="pos-product-list">
                        ${this.renderProductGrid(products)}
                    </div>
                </div>

                <!-- Khu vực Giỏ hàng (Phải) -->
                <div class="w-[380px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] shrink-0 z-20">
                    <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                        <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            Giỏ hàng
                        </h2>
                        <button id="btn-clear-cart" class="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Xóa giỏ hàng">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex-1 overflow-y-auto p-4 bg-slate-50/50" id="pos-cart-items">
                        ${this.renderCartItems(cartItems)}
                    </div>

                    <!-- Checkout Summary -->
                    <div class="p-5 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div class="flex justify-between items-center mb-3 text-sm text-slate-500">
                            <span>Tạm tính</span>
                            <span class="font-medium text-slate-700">${this.formatMoney(cartTotal)}</span>
                        </div>
                        <div class="flex justify-between items-center mb-6">
                            <span class="text-base font-bold text-slate-800">Tổng tiền</span>
                            <span class="text-xl font-extrabold text-rose-600">${this.formatMoney(cartTotal)}</span>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <!-- Khối Thông tin khách hàng (Luôn hiện) -->
                            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                                <h3 class="text-xs font-bold text-slate-700">Thông tin khách hàng</h3>
                                <input type="text" id="pos-customer-name" placeholder="Họ và tên khách hàng" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
                                <input type="text" id="pos-customer-phone" placeholder="Số điện thoại" maxlength="10" pattern="[0-9]{10}" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-slate-500 block mb-1">Loại thanh toán</label>
                                <select id="pos-payment-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-700">
                                    <option value="full">Trả thẳng</option>
                                    <option value="installment">Trả góp</option>
                                </select>
                            </div>
                            
                            <!-- Khối Trả góp (Mặc định ẩn) -->
                            <div id="pos-installment-box" class="bg-amber-50 border border-amber-200 rounded-lg p-3 hidden space-y-3">
                                <h3 class="text-xs font-bold text-amber-800 border-b border-amber-200 pb-1">Bổ sung hồ sơ trả góp</h3>
                                <input type="text" id="pos-customer-cccd" placeholder="Số CCCD (12 số)" maxlength="12" class="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                                
                                <h3 class="text-xs font-bold text-amber-800 border-b border-amber-200 pb-1 mt-2">Kỳ hạn trả góp</h3>
                                <select id="pos-installment-term" class="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 text-slate-700 font-medium">
                                    <option value="3">3 Tháng (Phí 2%)</option>
                                    <option value="6">6 Tháng (Phí 4%)</option>
                                    <option value="9">9 Tháng (Phí 6%)</option>
                                    <option value="12">12 Tháng (Phí 8%)</option>
                                </select>
                                
                                <div class="bg-amber-100/50 p-2 rounded text-xs space-y-1">
                                    <div class="flex justify-between text-amber-900"><span>Gốc:</span> <span id="pos-inst-base" class="font-bold">0đ</span></div>
                                    <div class="flex justify-between text-amber-900"><span>Phí trả góp:</span> <span id="pos-inst-fee" class="font-bold">0đ</span></div>
                                    <div class="flex justify-between text-indigo-700 border-t border-amber-200 pt-1 mt-1">
                                        <span class="font-bold">Mỗi tháng:</span> <span id="pos-inst-monthly" class="font-extrabold">0đ</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-slate-500 block mb-1">Hình thức nhận tiền</label>
                                <select id="pos-receipt-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-700">
                                    <option value="transfer">Chuyển khoản ngân hàng</option>
                                    <option value="cash">Tiền mặt</option>
                                    <option value="card">Quẹt thẻ</option>
                                </select>
                            </div>
                        </div>

                        <button id="btn-checkout" class="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
                            Thanh toán & In hóa đơn
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
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
                    <svg class="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <p class="font-medium">Không tìm thấy sản phẩm nào</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                ${products.map(p => `
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                        <div class="relative pt-[100%] bg-slate-50 flex items-center justify-center">
                            <!-- Image placeholder if no image -->
                            <div class="absolute inset-0 flex items-center justify-center p-4">
                                ${p.image_url 
                                    ? `<img src="${p.image_url}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300">`
                                    : `<svg class="w-16 h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`
                                }
                            </div>
                        </div>
                        <div class="p-4 flex flex-col flex-1">
                            <div class="text-xs text-indigo-600 font-semibold mb-1">${p.category_name || 'Khác'}</div>
                            <h3 class="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2 flex-1">${p.name}</h3>
                            ${p.tags ? `
                                <div class="flex flex-wrap gap-1 mb-2">
                                    ${p.tags.split(',').map(tag => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md border border-slate-200">${tag.trim()}</span>`).join('')}
                                </div>
                            ` : ''}
                            <div class="flex items-end justify-between mt-auto mb-3">
                                <div class="text-rose-600 font-extrabold">${this.formatMoney(p.price)}</div>
                                <div class="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-md">Kho: ${p.stock_quantity}</div>
                            </div>
                            <button class="btn-add-cart w-full py-2 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-1" data-id="${p.id}" ${p.stock_quantity === 0 ? 'disabled' : ''}>
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
                    <svg class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    <p class="text-sm font-medium">Giỏ hàng trống</p>
                </div>
            `;
        }

        return `
            <div class="space-y-3">
                ${items.map(item => `
                    <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col relative group">
                        <button class="btn-remove-item absolute top-2 right-2 text-slate-300 hover:text-rose-500 bg-white p-1 rounded-md transition-colors z-10" data-id="${item.product.id}">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                        <div class="pr-8 mb-2">
                            <h4 class="text-xs font-bold text-slate-800 line-clamp-2">${item.product.name}</h4>
                            <div class="text-rose-600 font-bold text-sm mt-1">${this.formatMoney(item.product.price)}</div>
                        </div>
                        <div class="flex justify-between items-center border-t border-slate-50 pt-2 mt-1">
                            <div class="text-[10px] text-slate-400">Tổng: <span class="font-bold text-slate-700">${this.formatMoney(item.product.price * item.quantity)}</span></div>
                            <div class="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                                <button class="btn-qty-minus w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-colors" data-id="${item.product.id}">-</button>
                                <input type="number" class="w-8 text-center text-xs font-bold bg-transparent outline-none text-slate-800 pointer-events-none" value="${item.quantity}" readonly>
                                <button class="btn-qty-plus w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-colors" data-id="${item.product.id}">+</button>
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
        document.querySelectorAll('.text-xl.font-extrabold.text-rose-600').forEach(el => {
            el.innerText = this.formatMoney(total);
        });
    }

    updateActiveCategory(slug) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (btn.dataset.slug === slug) {
                btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-indigo-600 text-white shadow-sm border border-indigo-600';
            } else {
                btn.className = 'cat-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
