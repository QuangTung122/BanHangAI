export default class StaffPOSView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(categories, products, cartItems, cartTotal) {
        let html = `
            <div class="flex h-full w-full bg-slate-100 overflow-hidden rounded-2xl shadow-sm border border-slate-200">
                <!-- Khu vực Sản phẩm (Trái) -->
                <div class="flex-1 flex flex-col h-full bg-slate-50 relative">
                    <!-- Thanh tìm kiếm & Phân loại -->
                    <div class="bg-white p-5 border-b border-slate-200 shadow-sm z-10 shrink-0">
                        <div class="relative w-full max-w-2xl group">
                            <svg class="w-5 h-5 absolute left-4 top-3 text-slate-500 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" id="pos-search" placeholder="Tìm kiếm sản phẩm nhanh theo tên, mã SKU..." class="w-full pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner">
                        </div>
                        
                        <!-- Quick Categories -->
                        <div class="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-hide" id="pos-categories">
                            <button class="cat-btn px-5 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-200 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700" data-slug="">Tất cả</button>
                            ${categories.map(c => `
                                <button class="cat-btn px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 bg-white text-slate-700 border border-slate-300 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/50 shadow-sm" data-slug="${c.slug}">${c.name}</button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="px-4 py-3 bg-indigo-50 border-b border-indigo-100 shrink-0">
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input id="pos-ai-need" type="text" maxlength="300" class="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-semibold text-slate-800" placeholder="Tư vấn theo nhu cầu: laptop học tập dưới 15 triệu...">
                            <button id="btn-pos-ai-search" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg">Gợi ý sản phẩm</button>
                        </div>
                        <div id="pos-ai-results" class="hidden mt-2 text-sm"></div>
                    </div>

                    <!-- Danh sách Sản phẩm -->
                    <div class="flex-1 overflow-y-auto p-4 md:p-5" id="pos-product-list">
                        ${this.renderProductGrid(products)}
                    </div>
                </div>

                <!-- Khu vực Giỏ hàng (Phải) -->
                <div class="w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg shrink-0 z-20 relative">
                    <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 shrink-0 z-10">
                        <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            Giỏ hàng thanh toán
                        </h2>
                        <button id="btn-clear-cart" class="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all" title="Xóa toàn bộ giỏ">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex-1 overflow-y-auto p-4 bg-slate-50 divide-y divide-slate-200" id="pos-cart-items">
                        ${this.renderCartItems(cartItems)}
                    </div>
                    <div id="pos-bundle-suggestions" class="hidden max-h-48 overflow-y-auto border-t border-indigo-100 bg-indigo-50/60 p-3"></div>

                    <!-- Checkout Summary -->
                    <div class="p-5 bg-white border-t border-slate-200 shrink-0 shadow-lg relative z-20 max-h-[55vh] overflow-y-auto custom-scrollbar">
                        <div class="flex justify-between items-center mb-2.5 text-sm">
                            <span class="font-bold text-slate-600">Tạm tính hàng hóa</span>
                            <span class="font-extrabold text-slate-900">${this.formatMoney(cartTotal)}</span>
                        </div>
                        <div class="flex justify-between items-center mb-5 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200">
                            <span class="text-sm font-black text-indigo-950 uppercase tracking-wide">Tổng thanh toán</span>
                            <span class="text-2xl font-black text-indigo-700 tracking-tight">${this.formatMoney(cartTotal)}</span>
                        </div>
                        
                        <div class="space-y-3.5 mb-5">
                            <!-- Khối Thông tin khách hàng -->
                            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                                <h3 class="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    Thông tin khách hàng
                                </h3>
                                <input type="text" id="pos-customer-name" placeholder="Họ và tên khách hàng (tùy chọn)" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
                                <input type="text" id="pos-customer-phone" placeholder="Số điện thoại khách hàng" maxlength="10" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Phương thức thanh toán</label>
                                <select id="pos-payment-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-bold text-slate-900 cursor-pointer shadow-sm">
                                    <option value="full">Trả thẳng (Thanh toán 100%)</option>
                                    <option value="installment">Trả góp qua đối tác tài chính</option>
                                </select>
                            </div>
                            
                            <!-- Khối Trả góp -->
                            <div id="pos-installment-box" class="bg-amber-50 border border-amber-300 rounded-xl p-3.5 hidden space-y-2.5">
                                <h3 class="text-xs font-black text-amber-900 uppercase tracking-wide border-b border-amber-200 pb-1">Hồ sơ đối tác tài chính (mô phỏng)</h3>
                                <input type="text" id="pos-customer-cccd" placeholder="Số CCCD chính chủ (12 số)" maxlength="12" class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-amber-600">

                                <label class="text-xs font-bold text-amber-900 block mt-2 uppercase tracking-wide">Đối tác cho vay</label>
                                <select id="pos-finance-partner" class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 font-bold">
                                    <option>Home Credit (mô phỏng)</option>
                                    <option>FE CREDIT (mô phỏng)</option>
                                    <option>Ngân hàng liên kết (mô phỏng)</option>
                                </select>
                                <input type="text" id="pos-finance-reference" placeholder="Mã hồ sơ demo (có thể để trống)" maxlength="80" class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 font-bold placeholder-slate-400">
                                
                                <label class="text-xs font-bold text-amber-900 block mt-2 uppercase tracking-wide">Kỳ hạn khách đăng ký</label>
                                <select id="pos-installment-term" class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm focus:outline-none focus:border-amber-600 text-slate-900 font-bold cursor-pointer">
                                    <option value="3">3 tháng</option>
                                    <option value="6">6 tháng</option>
                                    <option value="9">9 tháng</option>
                                    <option value="12">12 tháng</option>
                                    <option value="18">18 tháng</option>
                                    <option value="24">24 tháng</option>
                                </select>
                                <label class="text-xs font-bold text-amber-900 block mt-2 uppercase tracking-wide">Khách trả trước tại cửa hàng</label>
                                <input type="number" id="pos-down-payment" min="0" step="1000" value="0" class="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-slate-900">
                                
                                <div class="bg-white p-3 rounded-lg text-xs space-y-1 mt-2 border border-amber-200">
                                    <div class="flex justify-between text-slate-700 font-bold"><span>Khách trả tại quầy:</span> <span id="pos-inst-down" class="font-black text-slate-900">0đ</span></div>
                                    <div class="flex justify-between text-indigo-900 border-t border-amber-200 pt-1.5 mt-1 font-black">
                                        <span>Đối tác tài chính giải ngân demo:</span> <span id="pos-inst-financed" class="font-black text-indigo-700">0đ</span>
                                    </div>
                                    <p class="text-[11px] text-amber-900 pt-1">Cửa hàng hỗ trợ hồ sơ; hợp đồng và các kỳ thanh toán thuộc khách hàng với bên cho vay. Demo mặc định mô phỏng hồ sơ được duyệt.</p>
                                </div>
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Hình thức nhận tiền</label>
                                <select id="pos-receipt-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-bold text-slate-900 cursor-pointer shadow-sm">
                                    <option value="transfer">Chuyển khoản VietQR</option>
                                    <option value="cash">Tiền mặt tại quầy</option>
                                    <option value="card">Quẹt thẻ POS</option>
                                </select>
                            </div>
                        </div>

                        <button id="btn-checkout" class="w-full py-3.5 bg-indigo-600 text-white font-black rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-wide">
                            Thanh toán & Xuất hóa đơn
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
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
        if (!products || products.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                    <img src="assets/images/logo-system.png" alt="Empty" class="w-24 h-24 mb-4 object-contain opacity-60">
                    <p class="font-bold text-base text-slate-700">Không tìm thấy sản phẩm nào phù hợp</p>
                    <p class="text-xs text-slate-500 mt-1">Thử gõ từ khóa khác hoặc chuyển sang danh mục khác</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                ${products.map(p => `
                    <div class="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer">
                        <div class="relative pt-[85%] bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3">
                            <div class="absolute inset-0 flex items-center justify-center p-3">
                                ${p.image_url 
                                    ? `<img src="${p.image_url}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300">`
                                    : `<svg class="w-16 h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`
                                }
                            </div>
                        </div>
                        <div class="p-3.5 flex flex-col flex-1">
                            <div class="text-[11px] text-indigo-700 font-extrabold tracking-wider uppercase mb-1">${p.category_name || 'Khác'}</div>
                            <h3 class="text-sm font-black text-slate-900 line-clamp-2 leading-snug mb-1.5 flex-1 group-hover:text-indigo-600 transition-colors">${p.name}</h3>
                            
                            ${p.tags ? `
                                <div class="flex flex-wrap gap-1 mb-2.5">
                                    ${p.tags.split(',').map(tag => `<span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">${tag.trim()}</span>`).join('')}
                                </div>
                            ` : ''}

                            <div class="flex items-end justify-between mt-auto mb-3">
                                <div class="flex flex-col">
                                    ${p.discount_percent ? `<span class="text-xs text-slate-400 line-through font-medium mb-0.5">${this.formatMoney(p.price)}</span>` : ''}
                                    <div class="text-indigo-700 font-black text-base flex items-center gap-1.5">
                                        ${this.formatMoney(p.price * (1 - (p.discount_percent || 0)/100))}
                                        ${p.discount_percent ? `<span class="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-[10px] font-black">-${p.discount_percent}%</span>` : ''}
                                    </div>
                                </div>
                                <div class="text-[11px] font-black px-2 py-0.5 ${p.stock_quantity <= 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} rounded border">
                                    Kho: ${p.stock_quantity}
                                </div>
                            </div>
                            <button class="btn-add-cart w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5" data-id="${p.id}" ${p.stock_quantity === 0 ? 'disabled' : ''}>
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>
                                ${p.stock_quantity === 0 ? 'Tạm hết hàng' : 'Thêm vào đơn'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCartItems(items) {
        if (!items || items.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                    <svg class="w-16 h-16 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    <p class="text-sm font-bold text-slate-600">Giỏ hàng đang trống</p>
                    <p class="text-xs text-slate-400 mt-0.5">Chọn sản phẩm bên trái để lên đơn</p>
                </div>
            `;
        }

        return `
            <div class="space-y-2.5">
                ${items.map(item => `
                    <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col relative group">
                        <button class="btn-remove-item absolute top-2 right-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors" data-id="${item.product.id}" title="Xóa món">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <div class="pr-8 mb-2">
                            <h4 class="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">${item.product.name}</h4>
                            <div class="flex items-center gap-1.5 mt-1">
                                <div class="text-indigo-700 font-black text-sm">${this.formatMoney(item.product.price * (1 - (item.product.discount_percent || 0)/100))}</div>
                                ${item.product.discount_percent ? `<span class="text-xs text-slate-400 line-through">${this.formatMoney(item.product.price)}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex justify-between items-center border-t border-slate-100 pt-2.5">
                            <div class="text-xs font-bold text-slate-600">Tổng: <span class="font-black text-slate-900 text-sm">${this.formatMoney(item.product.price * (1 - (item.product.discount_percent || 0)/100) * item.quantity)}</span></div>
                            <div class="flex items-center bg-slate-100 rounded-lg border border-slate-300 p-0.5">
                                <button class="btn-qty-minus w-6 h-6 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-white rounded font-black text-sm transition-all" data-id="${item.product.id}">-</button>
                                <span class="w-7 text-center text-xs font-black text-slate-900 select-none">${item.quantity}</span>
                                <button class="btn-qty-plus w-6 h-6 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-white rounded font-black text-sm transition-all" data-id="${item.product.id}">+</button>
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
        document.querySelectorAll('.font-extrabold.text-slate-900').forEach(el => {
            if (el.innerText.includes('đ')) el.innerText = this.formatMoney(total);
        });
        document.querySelectorAll('.text-2xl.font-black.text-indigo-700').forEach(el => {
            el.innerText = this.formatMoney(total);
        });
        const downPaymentInput = document.getElementById('pos-down-payment');
        if (downPaymentInput) {
            const downPayment = Math.min(total, Math.max(0, Number(downPaymentInput.value) || 0));
            downPaymentInput.max = String(total);
            downPaymentInput.value = String(downPayment);
            document.getElementById('pos-inst-down').innerText = this.formatMoney(downPayment);
            document.getElementById('pos-inst-financed').innerText = this.formatMoney(total - downPayment);
        }
    }

    renderPosRecommendations(data, loading = false) {
        const target = document.getElementById('pos-ai-results');
        if (!target) return;
        target.classList.remove('hidden');
        if (loading) {
            target.innerHTML = '<div class="animate-pulse text-indigo-800 font-semibold">Đang lọc dữ liệu sản phẩm…</div>';
            return;
        }
        const products = data?.products || [];
        target.innerHTML = `<div class="rounded-lg border border-indigo-100 bg-white p-3">
            <p class="text-slate-700 mb-2">${data?.explanation || 'Không có gợi ý.'}</p>
            ${products.length ? `<div class="space-y-2">${products.map((p) => `<div class="flex items-center justify-between gap-3 border-t border-slate-100 pt-2"><div><p class="font-bold text-slate-900">${p.name}</p><p class="text-xs text-slate-500">${p.match_reason} · Còn ${p.stock_quantity}</p></div><div class="text-right"><p class="font-black text-indigo-700">${this.formatMoney(p.price * (1 - (p.discount_percent || 0) / 100))}</p><button class="btn-ai-add-cart text-xs font-bold text-indigo-700" data-id="${p.id}">Thêm vào giỏ</button></div></div>`).join('')}</div>` : ''}
            <p class="text-[11px] text-slate-400 mt-2">${data?.ai_used ? 'AI diễn giải kết quả đã lọc.' : 'Gợi ý dựa trên quy tắc và dữ liệu hệ thống.'} Giá và tồn kho lấy từ CSDL.</p></div>`;
    }

    renderBundleSuggestions(products, loading = false) {
        const target = document.getElementById('pos-bundle-suggestions');
        if (!target) return;
        target.classList.toggle('hidden', !loading && (!products || products.length === 0));
        if (loading) {
            target.innerHTML = '<p class="text-xs font-bold text-indigo-800">Đang tìm sản phẩm mua kèm…</p>';
            return;
        }
        target.innerHTML = `<p class="text-[11px] uppercase tracking-wide font-black text-indigo-800 mb-2">Có thể bán kèm</p>${(products || []).map((p) => `<div class="flex justify-between items-center gap-2 py-1.5 border-t border-indigo-100"><div class="min-w-0"><p class="text-xs font-bold text-slate-800 truncate">${p.name}</p><p class="text-[10px] text-slate-500">${p.reason} · Còn ${p.stock_quantity}</p></div><div class="text-right shrink-0"><p class="text-xs font-black text-indigo-700">${this.formatMoney(p.price * (1 - (p.discount_percent || 0) / 100))}</p><button class="btn-bundle-add text-[10px] font-bold text-indigo-700" data-id="${p.id}">Thêm</button></div></div>`).join('')}`;
    }

    updateActiveCategory(slug) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (btn.dataset.slug === slug) {
                btn.className = 'cat-btn px-5 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-200 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700';
            } else {
                btn.className = 'cat-btn px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 bg-white text-slate-700 border border-slate-300 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/50 shadow-sm';
            }
        });
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
