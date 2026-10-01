export default class OwnerProductView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(products, categories, currentFilter = 'all', replenishmentSuggestions = []) {
        this.categories = categories;
        this.receiptProducts = this.receiptProducts || [];
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

        let rows = products.map((p, idx) => `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-200">
                <td class="p-4 text-xs font-black text-slate-500">#${idx + 1}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                            ${p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-contain">` : `<svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`}
                        </div>
                        <div>
                            <span class="font-bold text-slate-900 text-sm block leading-snug">${p.name}</span>
                            <span class="text-[11px] font-bold text-slate-500">SKU: ${p.sku || '--'}</span>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-sm font-bold text-slate-700">${p.category_name || 'Khác'}</td>
                <td class="p-4 text-sm font-bold text-slate-700">${fmt.format(p.import_price || 0)}</td>
                <td class="p-4 text-sm font-black text-indigo-700">${fmt.format(p.price || 0)}</td>
                <td class="p-4">
                    <span class="font-black px-2.5 py-1 rounded-md text-xs border ${p.stock_quantity <= (p.low_stock_threshold || 5) ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}">
                        ${p.stock_quantity} ${p.unit || 'Cái'}
                    </span>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <button class="btn-edit p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors" data-id="${p.id}" title="Sửa thông tin">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn-delete p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors" data-id="${p.id}" title="Xóa">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (products.length === 0) {
            rows = `<tr><td colspan="7" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <img src="assets/images/logo-system.png" class="w-20 h-20 mb-3 opacity-60">
                <span class="text-slate-700 font-bold text-base">Chưa có sản phẩm nào trong kho.</span>
                <span class="text-slate-500 text-xs mt-1">Bấm nút "Thêm sản phẩm mới" để bắt đầu nạp kho</span>
            </div>
        </td></tr>`;
        }

        let html = `
            <div class="h-full flex flex-col gap-6 relative">
                <section class="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 md:p-5">
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <div><h3 class="font-black text-slate-900">Hỗ trợ quyết định nhập hàng</h3><p class="text-xs text-slate-600 mt-1">Dựa trên tồn kho và lượng bán 30 ngày gần nhất; chỉ là đề xuất để owner xem xét.</p></div>
                        <span class="text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">AI + quy tắc dữ liệu</span>
                    </div>
                    ${replenishmentSuggestions.length ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">${replenishmentSuggestions.slice(0, 6).map((item) => `<div class="border ${item.priority === 'critical' ? 'border-rose-200 bg-rose-50/60' : 'border-amber-100 bg-amber-50/40'} rounded-xl p-3"><div class="flex justify-between gap-2"><p class="font-bold text-sm text-slate-900">${item.name}</p><span class="text-[10px] font-black uppercase ${item.priority === 'critical' ? 'text-rose-700' : 'text-amber-800'}">${item.priority === 'critical' ? 'Ưu tiên cao' : 'Theo dõi'}</span></div><p class="text-xs text-slate-600 mt-1">Tồn ${item.stock_quantity} · Bán ${item.sold_30_days} trong 30 ngày${item.days_of_stock !== null ? ` · khoảng ${item.days_of_stock} ngày tồn` : ''}</p><p class="text-xs font-black text-indigo-700 mt-1">Tham khảo nhập: ${item.suggested_quantity}</p></div>`).join('')}</div>` : '<p class="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">Chưa có sản phẩm cần ưu tiên nhập theo ngưỡng và dữ liệu bán gần đây.</p>'}
                </section>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                    <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-black text-slate-900">Quản lý Kho hàng & Sản phẩm</h2>
                            <p class="text-xs text-slate-600 font-semibold mt-0.5">Theo dõi số lượng tồn kho, giá nhập và giá bán lẻ theo thời gian thực</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button id="btn-view-stock-receipts" class="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl border border-slate-300 transition-all">Lịch sử nhập kho</button>
                            <button id="btn-stock-receipt" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all">+ Nhập hàng</button>
                            <button id="btn-add-product" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>
                                Thêm sản phẩm mới
                            </button>
                        </div>
                    </div>
                    
                    <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50 flex-wrap">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input type="text" id="search-product" class="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all w-64 bg-white" placeholder="Tìm theo tên sản phẩm...">
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <select id="filter-category" class="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all min-w-[150px] bg-white">
                                <option value="">Tất cả danh mục</option>
                                ${categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}
                            </select>
                            <button id="btn-search" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors shadow-sm">Lọc dữ liệu</button>
                        </div>
                        <div class="flex gap-2">
                            <button class="filter-tab px-3.5 py-1.5 text-xs font-black rounded-lg transition-colors ${currentFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200 bg-white border border-slate-300'}" data-filter="all">Tất cả</button>
                            <button class="filter-tab px-3.5 py-1.5 text-xs font-black rounded-lg transition-colors ${currentFilter === 'abundant' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-300'}" data-filter="abundant">Hàng dồi dào</button>
                            <button class="filter-tab px-3.5 py-1.5 text-xs font-black rounded-lg transition-colors ${currentFilter === 'low' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-800 hover:bg-rose-100 bg-rose-50 border border-rose-300'}" data-filter="low">Hàng sắp hết</button>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-100 text-slate-700 text-xs uppercase font-black tracking-wider sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th class="p-4 w-16">ID</th>
                                    <th class="p-4">Tên Sản Phẩm</th>
                                    <th class="p-4">Danh Mục</th>
                                    <th class="p-4">Giá Nhập</th>
                                    <th class="p-4">Giá Bán</th>
                                    <th class="p-4">Tồn Kho</th>
                                    <th class="p-4 w-28">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-slate-100">
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Thêm/Sửa Sản Phẩm -->
            <div id="modal-product" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-all duration-300">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300 overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-200">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>
                            </div>
                            <h3 class="text-base font-black text-slate-900" id="modal-title">Thêm sản phẩm mới</h3>
                        </div>
                        <div class="flex items-center gap-3">
                            <button id="btn-close-modal" class="text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6 overflow-y-auto flex-1 bg-slate-50 custom-scrollbar">
                        <form id="form-product" class="space-y-5">
                            <input type="hidden" id="prod-id">
                            
                            <!-- 1. Thông tin chung -->
                            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">1</span>
                                    Thông tin cơ bản
                                </h4>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Mã SP (SKU / Barcode) *</label>
                                        <div class="flex gap-2">
                                            <input type="text" id="prod-sku" required class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Mã tự động hoặc gõ mã...">
                                            <button type="button" id="btn-generate-sku" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-lg border border-slate-300 transition-colors whitespace-nowrap">Tạo mã</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Tên sản phẩm *</label>
                                        <input type="text" id="prod-name" required class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Ví dụ: iPhone 15 Pro Max 256GB...">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Danh mục *</label>
                                        <select id="prod-category" required class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none">
                                            <option value="">-- Chọn danh mục --</option>
                                            ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Đơn vị tính</label>
                                        <input type="text" id="prod-unit" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Chiếc, Hộp, Bộ...">
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Giá & Hình ảnh -->
                            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">2</span>
                                    Giá cả & Hình ảnh sản phẩm
                                </h4>
                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Giá nhập vốn (VNĐ)</label>
                                        <input type="number" id="prod-import-price" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Giá bán niêm yết (VNĐ) *</label>
                                        <input type="number" id="prod-price" required class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-black text-indigo-700 focus:border-indigo-600 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Giảm giá (%)</label>
                                        <input type="number" id="prod-discount" min="0" max="100" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" value="0">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Link Ảnh sản phẩm (URL)</label>
                                    <input type="url" id="prod-image" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:border-indigo-600 outline-none" placeholder="https://...">
                                </div>
                                <div class="mt-4">
                                    <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Thẻ đặc trưng (Tags)</label>
                                    <input type="text" id="prod-tags" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" placeholder="Titan Tự Nhiên, 256GB, Chính hãng...">
                                </div>
                            </div>

                            <!-- 3. Tồn kho & Quản lý -->
                            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">3</span>
                                    Tồn kho & Trạng thái kinh doanh
                                </h4>
                                <div class="grid grid-cols-4 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Số lượng nhập kho *</label>
                                        <input type="number" id="prod-stock" required class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" value="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Cảnh báo sắp hết</label>
                                        <input type="number" id="prod-low-stock" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" value="5">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Bảo hành (tháng)</label>
                                        <input type="number" id="prod-warranty" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none" value="12" min="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Trạng thái bán</label>
                                        <select id="prod-status" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:border-indigo-600 outline-none">
                                            <option value="1">Đang kinh doanh</option>
                                            <option value="0">Ngừng kinh doanh</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. Mô tả chi tiết -->
                            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">4</span>
                                    Mô tả chi tiết sản phẩm
                                </h4>
                                <textarea id="prod-desc" rows="3" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:border-indigo-600 outline-none resize-none" placeholder="Nhập mô tả tóm tắt tính năng sản phẩm..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                        <button type="button" id="btn-cancel-modal" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-black rounded-lg hover:bg-slate-50 transition-colors">Đóng</button>
                        <button type="submit" form="form-product" class="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Lưu Sản Phẩm</button>
                    </div>
                </div>
            </div>

            <div id="modal-stock-receipt" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center hidden p-4">
                <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
                        <div>
                            <h3 class="text-base font-black text-slate-900">Lập phiếu nhập kho</h3>
                            <p class="text-xs text-slate-600 mt-1">Ghi nhà cung cấp, giá vốn và số lượng. Hệ thống cập nhật tồn kho cùng phiếu nhập.</p>
                        </div>
                        <button type="button" id="btn-close-stock-receipt" class="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100">×</button>
                    </div>
                    <form id="form-stock-receipt" class="flex flex-col min-h-0">
                        <div class="p-6 overflow-y-auto space-y-5">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div><label class="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp *</label><input id="receipt-supplier-name" required maxlength="120" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="Tên nhà cung cấp"></div>
                                <div><label class="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label><input id="receipt-supplier-phone" maxlength="20" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="Số liên hệ"></div>
                                <div><label class="block text-xs font-bold text-slate-700 mb-1">Số hóa đơn nhà cung cấp</label><input id="receipt-supplier-invoice" maxlength="80" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="Không bắt buộc"></div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-2"><h4 class="text-sm font-black text-slate-800">Sản phẩm nhập</h4><button type="button" id="btn-add-receipt-line" class="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-black">+ Thêm dòng</button></div>
                                <div id="receipt-lines" class="space-y-2"></div>
                            </div>
                            <div><label class="block text-xs font-bold text-slate-700 mb-1">Ghi chú</label><textarea id="receipt-notes" maxlength="500" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="Tình trạng giao hàng, điều khoản bảo hành..."></textarea></div>
                        </div>
                        <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                            <button type="button" id="btn-cancel-stock-receipt" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-black rounded-lg">Hủy</button>
                            <button type="submit" id="btn-submit-stock-receipt" class="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-700">Ghi nhận nhập kho</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="modal-stock-receipt-history" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center hidden p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50"><h3 class="text-base font-black text-slate-900">Lịch sử nhập kho</h3><button type="button" id="btn-close-stock-receipt-history" class="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600">×</button></div>
                    <div class="overflow-auto p-4"><table class="w-full text-left text-sm"><thead class="bg-slate-100 text-xs uppercase text-slate-600"><tr><th class="p-3">Mã phiếu</th><th class="p-3">Nhà cung cấp</th><th class="p-3">Hóa đơn NCC</th><th class="p-3">Sản phẩm</th><th class="p-3">Tổng nhập</th><th class="p-3">Người nhận</th><th class="p-3">Ngày nhập</th></tr></thead><tbody id="stock-receipt-history-rows"><tr><td colspan="7" class="p-8 text-center text-slate-500">Đang tải...</td></tr></tbody></table></div>
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

    setReceiptProducts(products) {
        this.receiptProducts = products || [];
    }

    bindStockReceipt(onSubmit, onHistory) {
        const modal = document.getElementById('modal-stock-receipt');
        const historyModal = document.getElementById('modal-stock-receipt-history');
        const lines = document.getElementById('receipt-lines');
        const form = document.getElementById('form-stock-receipt');
        const addLineButton = document.getElementById('btn-add-receipt-line');
        const openButton = document.getElementById('btn-stock-receipt');
        const historyButton = document.getElementById('btn-view-stock-receipts');

        openButton?.addEventListener('click', () => {
            form?.reset();
            if (lines) lines.innerHTML = '';
            this.appendStockReceiptLine();
            modal?.classList.remove('hidden');
        });
        document.getElementById('btn-close-stock-receipt')?.addEventListener('click', () => this.hideStockReceiptModal());
        document.getElementById('btn-cancel-stock-receipt')?.addEventListener('click', () => this.hideStockReceiptModal());
        document.getElementById('btn-close-stock-receipt-history')?.addEventListener('click', () => historyModal?.classList.add('hidden'));

        addLineButton?.addEventListener('click', () => this.appendStockReceiptLine());
        lines?.addEventListener('click', (event) => {
            const removeButton = event.target.closest('.btn-remove-receipt-line');
            if (removeButton) {
                const line = removeButton.closest('.receipt-line');
                if (lines.children.length > 1) line?.remove();
                else if (line) {
                    line.querySelector('.receipt-quantity').value = '1';
                    const selected = line.querySelector('.receipt-product-select')?.selectedOptions[0];
                    line.querySelector('.receipt-unit-cost').value = selected?.dataset.cost || '0';
                }
            }
        });
        lines?.addEventListener('change', (event) => {
            const select = event.target.closest('.receipt-product-select');
            if (!select) return;
            const selected = select.selectedOptions[0];
            const costInput = select.closest('.receipt-line')?.querySelector('.receipt-unit-cost');
            if (costInput && selected) costInput.value = selected.dataset.cost || '0';
        });

        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const receiptItems = [...(lines?.querySelectorAll('.receipt-line') || [])].map((line) => ({
                product_id: Number(line.querySelector('.receipt-product-select')?.value),
                quantity: Number(line.querySelector('.receipt-quantity')?.value),
                unit_cost: Number(line.querySelector('.receipt-unit-cost')?.value)
            }));
            if (!receiptItems.length || receiptItems.some((item) => !item.product_id || !item.quantity || item.unit_cost < 0)) {
                window.showToast?.('Hãy chọn sản phẩm, số lượng và giá nhập hợp lệ cho từng dòng.', 'warning');
                return;
            }

            const submitButton = document.getElementById('btn-submit-stock-receipt');
            submitButton.disabled = true;
            submitButton.innerText = 'Đang ghi nhận...';
            try {
                await onSubmit({
                    supplier_name: document.getElementById('receipt-supplier-name').value.trim(),
                    supplier_phone: document.getElementById('receipt-supplier-phone').value.trim(),
                    supplier_invoice: document.getElementById('receipt-supplier-invoice').value.trim(),
                    notes: document.getElementById('receipt-notes').value.trim(),
                    items: receiptItems
                });
            } finally {
                submitButton.disabled = false;
                submitButton.innerText = 'Ghi nhận nhập kho';
            }
        });

        historyButton?.addEventListener('click', async () => {
            historyModal?.classList.remove('hidden');
            const rows = document.getElementById('stock-receipt-history-rows');
            if (rows) rows.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-500">Đang tải...</td></tr>';
            try {
                const receipts = await onHistory();
                this.renderStockReceiptHistory(receipts || []);
            } catch (error) {
                if (rows) rows.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-rose-600">Không tải được lịch sử nhập kho.</td></tr>';
            }
        });
    }

    appendStockReceiptLine() {
        const lines = document.getElementById('receipt-lines');
        if (!lines || !this.receiptProducts?.length) {
            window.showToast?.('Cần tạo ít nhất một sản phẩm trước khi lập phiếu nhập.', 'warning');
            return;
        }
        const options = this.receiptProducts.map((product) =>
            `<option value="${product.id}" data-cost="${product.import_price || 0}">${product.name}${product.sku ? ` · ${product.sku}` : ''}</option>`
        ).join('');
        const line = document.createElement('div');
        line.className = 'receipt-line grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl';
        line.innerHTML = `
            <select class="receipt-product-select px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" required>${options}</select>
            <input class="receipt-quantity px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" type="number" min="1" step="1" value="1" required aria-label="Số lượng nhập">
            <input class="receipt-unit-cost px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold" type="number" min="0" step="1" value="${this.receiptProducts[0].import_price || 0}" required aria-label="Giá nhập một sản phẩm">
            <button type="button" class="btn-remove-receipt-line px-3 py-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg text-xs font-black">Xóa dòng</button>
        `;
        lines.appendChild(line);
    }

    renderStockReceiptHistory(receipts) {
        const rows = document.getElementById('stock-receipt-history-rows');
        if (!rows) return;
        if (!receipts.length) {
            rows.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-500">Chưa có phiếu nhập kho.</td></tr>';
            return;
        }
        const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        rows.innerHTML = receipts.map((receipt) => {
            const totalQuantity = (receipt.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const receivedAt = new Date(`${String(receipt.created_at || '').replace(' ', 'T')}Z`);
            return `<tr class="border-b border-slate-100"><td class="p-3 font-black text-indigo-700">PN-${receipt.id}</td><td class="p-3">${receipt.supplier_name}</td><td class="p-3">${receipt.supplier_invoice || '--'}</td><td class="p-3">${(receipt.items || []).length} mã · ${totalQuantity} sản phẩm</td><td class="p-3 font-bold">${money.format(receipt.total_cost || 0)}</td><td class="p-3">${receipt.receiver_name || '--'}</td><td class="p-3">${Number.isNaN(receivedAt.getTime()) ? '--' : receivedAt.toLocaleString('vi-VN')}</td></tr>`;
        }).join('');
    }

    hideStockReceiptModal() {
        document.getElementById('modal-stock-receipt')?.classList.add('hidden');
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
                    warranty_months: parseInt(document.getElementById('prod-warranty').value || 0),
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
            this.modalTitle.innerText = 'Cập nhật thông tin sản phẩm';
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
            document.getElementById('prod-warranty').value = product.warranty_months || 0;
            document.getElementById('prod-status').value = product.is_active !== undefined ? product.is_active : 1;
            document.getElementById('prod-desc').value = product.description || '';
        } else {
            this.modalTitle.innerText = 'Thêm sản phẩm mới vào kho';
            document.getElementById('prod-id').value = '';
            document.getElementById('prod-sku').value = 'SKU-' + Date.now().toString().slice(-6);
            document.getElementById('prod-tags').value = '';
            document.getElementById('prod-warranty').value = '12';
        }

        this.modal.classList.remove('hidden');
        setTimeout(() => {
            this.modal.classList.remove('opacity-0');
            this.modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    }

    populateForm(product) {
        if (!product) return;
        this.showModal(product);
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
