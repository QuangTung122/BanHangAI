export default class StaffPOSView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(categories, products, cartItems, cartTotal) {
        let html = `
            <div class="flex h-full w-full bg-[#f5f6fa] overflow-hidden rounded-xl border border-[#e7eaf2] shadow-xs">
                <!-- Khu vực Không gian bán hàng (Workspace - Trái) -->
                <div class="flex-1 flex flex-col h-full bg-[#f5f6fa] relative min-w-0 overflow-hidden">
                    <!-- Thanh tìm kiếm & Phân loại danh mục Tinh gọn -->
                    <div class="p-2.5 pb-2 shrink-0 space-y-2">
                        <div class="relative w-full group">
                            <svg class="w-4 h-4 absolute left-3.5 top-2.5 text-[#7b8499] group-focus-within:text-[#5745f5] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input 
                                type="search" 
                                id="pos-search" 
                                placeholder="Tìm tên sản phẩm, mã SKU hoặc quét mã vạch..." 
                                class="w-full pl-10 pr-4 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs font-semibold text-[#182033] placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#f0edff] transition-all shadow-xs"
                            />
                        </div>
                        
                        <!-- Quick Categories (Chips) -->
                        <div class="flex gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar" id="pos-categories" aria-label="Danh mục">
                            <button class="cat-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 bg-[#5745f5] text-white border border-[#5745f5] shadow-xs" data-slug="">Tất cả</button>
                            ${categories.map(c => `
                                <button class="cat-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 bg-white text-[#7b8499] border border-[#e7eaf2] hover:border-[#5745f5] hover:text-[#5745f5] hover:bg-[#f0edff]/50 shadow-xs" data-slug="${c.slug}">${c.name}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Tip / Gợi ý AI Tinh gọn -->
                    <div class="px-2.5 shrink-0">
                        <section class="bg-[#f0edff] border border-[#e1dcff] p-2 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="text-[#5745f5] text-sm select-none font-bold shrink-0" aria-hidden="true">✦</span>
                                <div class="truncate">
                                    <span class="text-xs font-bold text-[#5745f5]">Trợ lý bán hàng:</span>
                                    <span class="text-[11px] text-[#7b8499] font-medium ml-1">Nhấn + để thêm nhanh vào đơn</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <input 
                                    id="pos-ai-need" 
                                    type="text" 
                                    maxlength="300" 
                                    class="w-48 px-2.5 py-1 bg-white border border-[#e1dcff] rounded-lg text-xs font-semibold text-[#182033] focus:outline-none focus:border-[#5745f5] placeholder-[#7b8499]" 
                                    placeholder="Nhu cầu: học tập, pin trâu..."
                                />
                                <button id="btn-pos-ai-search" class="px-3 py-1 bg-[#5745f5] hover:bg-[#4735e5] text-white text-xs font-bold rounded-lg shrink-0 transition-all shadow-xs cursor-pointer">
                                    Gợi ý
                                </button>
                            </div>
                        </section>
                        <div id="pos-ai-results" class="hidden mt-1.5 text-xs"></div>
                    </div>

                    <!-- Danh sách Sản phẩm (Product Grid - Rộng rãi) -->
                    <div class="flex-1 overflow-y-auto p-2.5 pt-2 custom-scrollbar" id="pos-product-list">
                        ${this.renderProductGrid(products)}
                    </div>
                </div>

                <!-- Khu vực Giỏ hàng và Thanh toán (Checkout Sidebar - Phải tinh gọn 340px) -->
                <aside class="w-[340px] md:w-[350px] bg-white border-l border-[#e7eaf2] flex flex-col h-full shadow-sm shrink-0 z-20 relative min-h-0" aria-label="Giỏ hàng và thanh toán">
                    
                    <!-- Cart Header -->
                    <header class="p-3 border-b border-[#e7eaf2] flex justify-between items-center bg-white sticky top-0 shrink-0 z-10">
                        <h2 class="text-sm font-black text-[#182033] flex items-center gap-1.5">
                            <span>Giỏ hàng</span>
                            <small id="cartCount" class="text-xs font-bold text-[#7b8499]">(${cartItems.reduce((acc, i) => acc + i.quantity, 0)})</small>
                        </h2>
                        <button id="btn-clear-cart" class="text-[11px] font-bold text-[#c05b6b] hover:text-rose-700 bg-transparent hover:bg-rose-50 px-2 py-1 rounded-lg transition-all cursor-pointer" title="Xóa tất cả mặt hàng">
                            Xóa tất cả
                        </button>
                    </header>

                    <!-- Cart Scroll Content -->
                    <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        
                        <!-- Khối Khách hàng -->
                        <div class="bg-[#f5f6fa] p-2.5 rounded-xl border border-[#e7eaf2] space-y-1.5">
                            <div class="flex items-center gap-1.5 text-xs font-black text-[#182033]">
                                <span class="text-xs">👤</span>
                                <span>Khách lẻ tại quầy</span>
                            </div>
                            <input 
                                type="text" 
                                id="pos-customer-name" 
                                placeholder="Họ và tên khách (tùy chọn)" 
                                class="w-full px-2.5 py-1 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold text-[#182033] placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5]"
                            />
                            <input 
                                type="text" 
                                id="pos-customer-phone" 
                                placeholder="Số điện thoại khách (10 số)" 
                                maxlength="10" 
                                class="w-full px-2.5 py-1 bg-white border border-[#e7eaf2] rounded-lg text-xs font-semibold text-[#182033] placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5]"
                            />
                        </div>

                        <!-- Danh sách Cart Items -->
                        <div id="pos-cart-items" class="divide-y divide-[#e7eaf2]">
                            ${this.renderCartItems(cartItems)}
                        </div>

                        <!-- Gợi ý sản phẩm bán kèm (Bundle Suggestions) -->
                        <div id="pos-bundle-suggestions" class="hidden rounded-xl border border-[#e1dcff] bg-[#f0edff]/60 p-2.5 text-xs"></div>
                    </div>

                    <!-- Checkout Summary & Action Footer -->
                    <div class="p-3 bg-white border-t border-[#e7eaf2] shrink-0 shadow-sm relative z-20 max-h-[48vh] overflow-y-auto custom-scrollbar">
                        
                        <!-- Bảng Summary -->
                        <div class="space-y-1.5 mb-3 text-xs font-semibold text-[#7b8499]">
                            <div class="flex justify-between items-center">
                                <span>Tạm tính</span>
                                <strong id="subtotal" class="font-bold text-[#182033] text-xs">${this.formatMoney(cartTotal)}</strong>
                            </div>
                            <div class="flex justify-between items-center">
                                <span>Giảm giá</span>
                                <span class="text-xs">0 ₫</span>
                            </div>
                            <div class="flex justify-between items-center pt-1.5 border-t border-[#e7eaf2]">
                                <span class="text-xs font-bold text-[#182033]">Cần thanh toán</span>
                                <strong id="total" class="text-lg font-black text-[#5745f5] tracking-tight leading-none">${this.formatMoney(cartTotal)}</strong>
                            </div>
                        </div>

                        <!-- Phương thức thanh toán -->
                        <div class="space-y-2 mb-3">
                            <div>
                                <label class="block text-[10px] font-bold text-[#7b8499] mb-1 uppercase tracking-wider" for="pos-payment-type">Chế độ thanh toán</label>
                                <select id="pos-payment-type" class="w-full px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] cursor-pointer">
                                    <option value="full">Trả thẳng (100%)</option>
                                    <option value="installment">Trả góp đối tác tài chính</option>
                                </select>
                            </div>

                            <!-- Khối Trả góp -->
                            <div id="pos-installment-box" class="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 hidden space-y-1.5 text-xs">
                                <h3 class="font-black text-amber-950 uppercase tracking-wide border-b border-amber-200 pb-1 text-[11px]">Hồ sơ trả góp demo</h3>
                                <input type="text" id="pos-customer-cccd" placeholder="Số CCCD chính chủ (12 số)" maxlength="12" class="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-amber-600">

                                <label class="font-bold text-amber-900 block text-[10px] uppercase">Đối tác cho vay</label>
                                <select id="pos-finance-partner" class="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#182033]">
                                    <option>Home Credit (mô phỏng)</option>
                                    <option>FE CREDIT (mô phỏng)</option>
                                    <option>Ngân hàng liên kết (mô phỏng)</option>
                                </select>
                                <input type="text" id="pos-finance-reference" placeholder="Mã hồ sơ demo (tùy chọn)" maxlength="80" class="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#182033]">
                                
                                <label class="font-bold text-amber-900 block text-[10px] uppercase">Kỳ hạn</label>
                                <select id="pos-installment-term" class="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#182033]">
                                    <option value="3">3 tháng</option>
                                    <option value="6">6 tháng</option>
                                    <option value="9">9 tháng</option>
                                    <option value="12">12 tháng</option>
                                    <option value="18">18 tháng</option>
                                    <option value="24">24 tháng</option>
                                </select>

                                <label class="font-bold text-amber-900 block text-[10px] uppercase">Trả trước tại quầy</label>
                                <input type="number" id="pos-down-payment" min="0" step="1000" value="0" class="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#182033]">
                                
                                <div class="bg-white p-2 rounded-lg border border-amber-200 text-[10px] space-y-0.5">
                                    <div class="flex justify-between font-bold text-[#7b8499]"><span>Tại quầy:</span> <span id="pos-inst-down" class="font-black text-[#182033]">0đ</span></div>
                                    <div class="flex justify-between font-black text-[#5745f5]"><span>Giải ngân:</span> <span id="pos-inst-financed" class="font-black text-[#5745f5]">0đ</span></div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-[10px] font-bold text-[#7b8499] mb-1 uppercase tracking-wider" for="pos-receipt-type">Hình thức nhận tiền</label>
                                <select id="pos-receipt-type" class="w-full px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] cursor-pointer">
                                    <option value="transfer">Chuyển khoản VietQR</option>
                                    <option value="cash">Tiền mặt tại quầy</option>
                                    <option value="card">Quẹt thẻ POS</option>
                                </select>
                            </div>
                        </div>

                        <!-- Nút Thanh toán full-width -->
                        <button 
                            id="btn-checkout" 
                            class="w-full py-2.5 px-3.5 bg-[#5745f5] hover:bg-[#4735e5] text-white font-bold rounded-xl shadow-sm shadow-[#5745f5]/25 active:scale-[0.98] transition-all text-xs flex items-center justify-between cursor-pointer"
                            ${cartTotal === 0 ? 'disabled' : ''}
                        >
                            <span>Thanh toán & Xuất hóa đơn</span>
                            <span id="payAmount" class="font-black tracking-tight text-sm">${this.formatMoney(cartTotal)}</span>
                        </button>
                    </div>
                </aside>
            </div>
            <!-- Hidden iframe for printing -->
            <iframe id="print-frame" style="display:none;"></iframe>
        `;
        
        this.container.innerHTML = html;
        setTimeout(() => document.getElementById('pos-search')?.focus(), 100);
    }

    renderProductGrid(products) {
        if (!products || products.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-[#7b8499] py-12">
                    <div class="w-12 h-12 rounded-xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-xl mb-2 shadow-inner">H</div>
                    <p class="font-bold text-xs text-[#182033]">Không tìm thấy sản phẩm nào</p>
                    <p class="text-[11px] text-[#7b8499] mt-0.5">Thử gõ từ khóa khác hoặc chọn danh mục khác</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                ${products.map(p => `
                    <div class="product bg-white rounded-xl border border-[#e7eaf2] hover:border-[#5745f5] hover:shadow-sm transition-all duration-150 overflow-hidden flex flex-col group">
                        
                        <!-- Khung ảnh có badge floating -->
                        <div class="h-[120px] bg-gradient-to-br from-[#edf1f4] to-[#dce3e8] relative flex items-center justify-center p-2 overflow-hidden">
                            <span class="product-category absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#7b8499] px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs z-10 uppercase tracking-wider">
                                ${p.category_name || 'Khác'}
                            </span>
                            ${p.image_url 
                                ? `<img src="${p.image_url}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200">`
                                : `<div class="text-3xl text-slate-400 select-none">📦</div>`
                            }
                        </div>

                        <!-- Product Body -->
                        <div class="p-3 flex flex-col flex-1">
                            <h3 class="text-xs font-bold text-[#182033] line-clamp-2 leading-snug mb-1 flex-1 group-hover:text-[#5745f5] transition-colors" title="${p.name}">${p.name}</h3>
                            
                            <div class="flex items-center justify-between text-[11px] text-[#7b8499] mb-2 font-medium">
                                <span>SKU-${p.id.toString().padStart(6, '0')}</span>
                                <span class="font-bold ${p.stock_quantity <= 5 ? 'text-amber-600' : 'text-[#7b8499]'}">Tồn: ${p.stock_quantity}</span>
                            </div>
                            
                            <!-- Price & Add to Cart -->
                            <div class="flex items-center justify-between pt-2 border-t border-[#e7eaf2]/70 mt-auto">
                                <span class="font-black text-[#5745f5] text-xs">${this.formatMoney(p.price)}</span>
                                <button 
                                    class="btn-add-cart w-7 h-7 rounded-lg bg-[#f0edff] hover:bg-[#5745f5] text-[#5745f5] hover:text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95" 
                                    data-id="${p.id}" 
                                    title="Thêm vào đơn"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCartItems(cartItems) {
        if (!cartItems || cartItems.length === 0) {
            return `
                <div class="py-10 text-center text-[#7b8499] flex flex-col items-center justify-center">
                    <span class="text-2xl mb-1.5 opacity-60">🛒</span>
                    <p class="font-bold text-xs text-[#182033]">Chưa có sản phẩm nào</p>
                    <p class="text-[10px] text-[#7b8499] mt-0.5">Chọn sản phẩm bên trái để bắt đầu tạo đơn</p>
                </div>
            `;
        }

        return cartItems.map(item => {
            const product = item.product || item;
            const price = product.discount_percent 
                ? product.price * (1 - product.discount_percent / 100) 
                : product.price;
            return `
            <div class="py-2.5 flex items-center justify-between gap-2 group">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="w-8 h-8 rounded-lg bg-[#f5f6fa] border border-[#e7eaf2] overflow-hidden shrink-0 p-0.5 flex items-center justify-center">
                        <img src="${product.image_url || 'assets/images/logo-system.png'}" onerror="this.onerror=null;this.src='assets/images/logo-system.png'" class="w-full h-full object-contain">
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-bold text-[#182033] truncate" title="${product.name}">${product.name}</h4>
                        <div class="text-[11px] font-bold text-[#5745f5]">${this.formatMoney(price)}</div>
                    </div>
                </div>

                <!-- Qty Control -->
                <div class="flex items-center gap-1 shrink-0">
                    <button class="btn-qty-minus w-5 h-5 rounded bg-[#f5f6fa] hover:bg-[#e7eaf2] text-[#182033] font-black text-xs flex items-center justify-center transition-colors cursor-pointer" data-id="${product.id}">-</button>
                    <span class="w-6 text-center text-xs font-black text-[#182033]">${item.quantity}</span>
                    <button class="btn-qty-plus w-5 h-5 rounded bg-[#f5f6fa] hover:bg-[#e7eaf2] text-[#182033] font-black text-xs flex items-center justify-center transition-colors cursor-pointer" data-id="${product.id}">+</button>
                    <button class="btn-remove-item ml-1 text-[#7b8499] hover:text-rose-600 transition-colors p-0.5 cursor-pointer" data-id="${product.id}" title="Xóa">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    renderBundleSuggestions(suggestions, loading = false) {
        const container = document.getElementById('pos-bundle-suggestions');
        if (!container) return;

        if (!loading && (!suggestions || suggestions.length === 0)) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }

        container.classList.remove('hidden');

        if (loading) {
            container.innerHTML = `
                <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-[#5745f5] text-xs">✨</span>
                    <span class="text-[11px] font-black text-[#5745f5] uppercase tracking-wider">Gợi ý mua kèm (AI)</span>
                </div>
                <p class="text-[11px] text-[#5745f5] animate-pulse">Đang tìm sản phẩm mua kèm…</p>
            `;
            return;
        }

        container.innerHTML = `
            <div class="flex items-center gap-1.5 mb-2">
                <span class="text-[#5745f5] text-xs">✨</span>
                <span class="text-[11px] font-black text-[#5745f5] uppercase tracking-wider">Gợi ý mua kèm (AI)</span>
            </div>
            <div class="space-y-1.5">
                ${suggestions.map(s => {
                    const finalPrice = s.discount_percent 
                        ? s.price * (1 - s.discount_percent / 100) 
                        : s.price;
                    return `
                    <div class="flex items-center justify-between p-1.5 bg-white rounded-lg border border-[#e1dcff] text-xs gap-1.5">
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-semibold text-[#182033]" title="${s.name}">${s.name}</p>
                            ${s.reason ? `<p class="text-[10px] text-[#7b8499] truncate">${s.reason} · Còn ${s.stock_quantity}</p>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="font-bold text-[#5745f5]">${this.formatMoney(finalPrice)}</span>
                            <button class="btn-bundle-add btn-ai-add-cart px-2 py-0.5 rounded bg-[#5745f5] text-white font-bold text-[10px] hover:bg-[#4735e5] transition-colors cursor-pointer" data-id="${s.id}">+ Thêm</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderPosRecommendations(data, loading = false) {
        const target = document.getElementById('pos-ai-results');
        if (!target) return;
        target.classList.remove('hidden');
        if (loading) {
            target.innerHTML = '<div class="p-2.5 rounded-xl bg-white border border-[#e1dcff] text-[#5745f5] font-semibold animate-pulse">Đang tìm kiếm gợi ý phù hợp…</div>';
            return;
        }
        const products = data?.products || [];
        target.innerHTML = `
            <div class="rounded-xl border border-[#e1dcff] bg-white p-2.5 space-y-2 shadow-xs">
                <p class="text-xs text-[#182033] font-medium">${data?.explanation || 'Không có gợi ý.'}</p>
                ${products.length ? `
                    <div class="space-y-1.5 pt-1 border-t border-[#e7eaf2]">
                        ${products.map(p => {
                            const finalPrice = p.discount_percent 
                                ? p.price * (1 - p.discount_percent / 100) 
                                : p.price;
                            return `
                            <div class="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#f5f6fa] border border-[#e7eaf2]">
                                <div class="min-w-0 flex-1">
                                    <p class="text-xs font-bold text-[#182033] truncate" title="${p.name}">${p.name}</p>
                                    <p class="text-[10px] text-[#7b8499]">${p.match_reason || ''} · Còn ${p.stock_quantity}</p>
                                </div>
                                <div class="text-right shrink-0 flex items-center gap-2">
                                    <span class="text-xs font-bold text-[#5745f5]">${this.formatMoney(finalPrice)}</span>
                                    <button class="btn-ai-add-cart btn-bundle-add px-2 py-0.5 rounded bg-[#5745f5] text-white font-bold text-[10px] hover:bg-[#4735e5] transition-colors cursor-pointer" data-id="${p.id}">+ Thêm</button>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                <p class="text-[10px] text-[#7b8499] pt-1 border-t border-[#e7eaf2]">
                    ${data?.ai_used ? 'AI gợi ý theo nhu cầu tìm kiếm.' : 'Gợi ý từ dữ liệu hệ thống.'} Giá và tồn kho lấy từ CSDL.
                </p>
            </div>
        `;
    }

    updateProductList(products) {
        const list = document.getElementById('pos-product-list');
        if (list) list.innerHTML = this.renderProductGrid(products);
    }

    updateActiveCategory(slug) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if ((btn.dataset.slug || '') === slug) {
                btn.className = 'cat-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 bg-[#5745f5] text-white border border-[#5745f5] shadow-xs';
            } else {
                btn.className = 'cat-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 bg-white text-[#7b8499] border border-[#e7eaf2] hover:border-[#5745f5] hover:text-[#5745f5] hover:bg-[#f0edff]/50 shadow-xs';
            }
        });
    }

    updateCart(cartItems, total) {
        const cartItemsEl = document.getElementById('pos-cart-items');
        if (cartItemsEl) cartItemsEl.innerHTML = this.renderCartItems(cartItems);

        const subtotalEl = document.getElementById('subtotal');
        if (subtotalEl) subtotalEl.textContent = this.formatMoney(total);

        const totalEl = document.getElementById('total');
        if (totalEl) totalEl.textContent = this.formatMoney(total);

        const payAmountEl = document.getElementById('payAmount');
        if (payAmountEl) payAmountEl.textContent = this.formatMoney(total);

        const countEl = document.getElementById('cartCount');
        if (countEl) countEl.textContent = `(${cartItems.reduce((acc, i) => acc + i.quantity, 0)})`;

        const checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.disabled = total === 0;
            if (total === 0) {
                checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
