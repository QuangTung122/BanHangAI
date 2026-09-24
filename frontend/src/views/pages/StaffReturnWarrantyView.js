export default class StaffReturnWarrantyView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(orders = []) {
        this.container.innerHTML = `
            <div class="space-y-6 relative h-full">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                    <div class="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 shrink-0">
                        <div>
                            <h2 class="text-lg font-black text-slate-900">Đổi trả hàng & Tiếp nhận Bảo hành</h2>
                            <p class="text-xs text-slate-600 font-semibold mt-0.5">Xử lý các yêu cầu đổi hàng, hoàn tiền hoặc bảo hành sản phẩm của khách hàng</p>
                        </div>
                        <div class="flex gap-2">
                            <button data-tab="create" class="main-tab-btn px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-sm">Tạo yêu cầu mới</button>
                            <button data-tab="history" class="main-tab-btn px-4 py-2 rounded-xl text-xs font-black bg-white text-slate-700 border border-slate-300 hover:bg-slate-100">Lịch sử yêu cầu</button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-hidden relative bg-slate-100">
                        <!-- Tab Tạo Yêu Cầu -->
                        <div id="tab-create" class="absolute inset-0 p-5 md:p-6 overflow-y-auto">
                            <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6 h-full">
                                <div class="space-y-4 flex flex-col h-full">
                                    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0">
                                        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Tìm kiếm hóa đơn gốc</label>
                                        <div class="flex gap-2">
                                            <input id="return-search" type="text" placeholder="Mã hóa đơn / SĐT / Tên khách hàng..." class="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-inner" />
                                            <button id="btn-search-return" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-sm">Tìm</button>
                                        </div>
                                    </div>

                                    <div id="return-order-list" class="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
                                        ${this.renderOrderList(orders)}
                                    </div>
                                </div>

                                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-y-auto h-full relative" id="return-detail-panel">
                                    <div class="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                                        <svg class="w-16 h-16 mb-2 opacity-50 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p class="font-bold text-sm text-slate-700">Chọn một hóa đơn bên trái để xử lý yêu cầu đổi trả hoặc bảo hành</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab Lịch Sử -->
                        <div id="tab-history" class="absolute inset-0 p-5 md:p-6 overflow-y-auto hidden">
                            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-full flex flex-col">
                                <div class="flex gap-4 mb-4 shrink-0">
                                    <select id="history-type-filter" class="px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600">
                                        <option value="all">Tất cả (Đổi trả & Bảo hành)</option>
                                        <option value="return">Phiếu Đổi trả</option>
                                        <option value="warranty">Phiếu Bảo hành</option>
                                    </select>
                                    <button id="btn-refresh-history" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 border border-slate-300">Làm mới</button>
                                </div>
                                <div class="flex-1 overflow-auto border border-slate-200 rounded-xl rounded-b-none">
                                    <table class="w-full text-left border-collapse">
                                        <thead class="bg-slate-50 sticky top-0 z-10">
                                            <tr>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Mã Phiếu</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Hóa Đơn Gốc</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Khách Hàng</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Loại Yêu Cầu</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Người Lập</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200">Ngày Tạo</th>
                                                <th class="py-3 px-4 text-xs font-black uppercase text-slate-600 border-b border-slate-200 text-right">Theo Dõi</th>
                                            </tr>
                                        </thead>
                                        <tbody id="history-list" class="divide-y divide-slate-100 text-sm font-medium">
                                            <tr><td colspan="7" class="p-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Modal Thu tiền bảo hành -->
                <div id="warranty-fee-modal" class="fixed inset-0 z-[100] hidden bg-slate-900/50 flex items-center justify-center">
                    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in-up">
                        <h3 class="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                            <span class="text-xl">💰</span> Phiếu Thu Tiền Bảo Hành
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Mã Phiếu Bảo Hành</label>
                                <div id="fee-warranty-id" class="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl"></div>
                            </div>
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Chi phí sửa chữa / Dịch vụ (VNĐ)</label>
                                <input type="number" id="fee-amount" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm" placeholder="Nhập số tiền..." value="0">
                            </div>
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Ghi chú (Chi tiết linh kiện/công sửa)</label>
                                <textarea id="fee-notes" rows="2" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm" placeholder="Thay màn hình, phí dịch vụ..."></textarea>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                            <button id="btn-close-fee-modal" class="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button id="btn-submit-fee" class="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md">Xác nhận thu & Hoàn thành</button>
                        </div>
                    </div>
                </div>

                <!-- Modal Xử lý Đổi Trả -->
                <div id="return-action-modal" class="fixed inset-0 z-[100] hidden bg-slate-900/50 flex items-center justify-center">
                    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in-up">
                        <h3 class="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                            <span class="text-xl">🔄</span> Hoàn Tất Đổi Trả
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Mã Phiếu Đổi Trả</label>
                                <div id="action-return-id" class="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl"></div>
                            </div>
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Loại Giao Dịch</label>
                                <select id="return-action-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm">
                                    <option value="none">Không phát sinh tiền (Đổi ngang)</option>
                                    <option value="refund">Hoàn tiền cho khách (Chi tiền)</option>
                                    <option value="collect">Thu thêm tiền khách (Thu tiền)</option>
                                </select>
                            </div>
                            <div id="return-action-amount-group" class="hidden">
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Số tiền (VNĐ)</label>
                                <input type="number" id="return-action-amount" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm" placeholder="Nhập số tiền..." value="0">
                            </div>
                            <div>
                                <label class="block text-xs font-black uppercase text-slate-600 mb-1">Ghi chú xử lý</label>
                                <textarea id="return-action-notes" rows="2" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm" placeholder="Chi tiết..."></textarea>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                            <button id="btn-close-return-modal" class="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button id="btn-submit-return-action" class="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md">Xác nhận Hoàn thành</button>
                        </div>
                    </div>
                </div>

                <!-- Modal Lịch sử Theo dõi -->
                <div id="tracking-modal" class="fixed inset-0 z-[100] hidden bg-slate-900/50 flex items-center justify-center">
                    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <div class="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                            <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                                <span class="text-xl">🔍</span> Chi Tiết Phiếu
                            </h3>
                            <button id="btn-close-tracking-modal" class="text-slate-400 hover:text-slate-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div id="tracking-content" class="space-y-3 text-sm">
                            Đang tải...
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    renderOrderList(orders) {
        if (!orders || orders.length === 0) {
            return `
                <div class="border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-600 font-bold text-sm bg-white">
                    Không tìm thấy hóa đơn nào phù hợp.
                </div>
            `;
        }

        return orders.slice(0, 15).map(order => `
            <button class="order-card w-full text-left border border-slate-200 rounded-2xl p-4 hover:border-indigo-500 hover:shadow-md transition-all bg-white" data-order-id="${order.id}">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <div class="font-black text-indigo-700 text-sm">${order.invoice_code || 'INV-' + order.id}</div>
                        <div class="text-xs text-slate-600 font-semibold mt-0.5">${new Date(order.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">Đã thanh toán</span>
                </div>
                <div class="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700 font-semibold space-y-0.5">
                    <div>Khách hàng: <strong class="text-slate-900 font-black">${order.customer_name || 'Khách vãng lai'}</strong></div>
                    <div>Số điện thoại: <strong class="text-slate-900 font-black">${order.customer_phone || '--'}</strong></div>
                </div>
            </button>
        `).join('');
    }

    renderDetail(order) {
        const items = order.items || [];

        const itemHtml = items.map(item => `
            <div class="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <div class="font-black text-slate-900 text-sm">${item.product_name || 'Sản phẩm'}</div>
                        <div class="text-xs text-slate-700 font-semibold mt-1">Số lượng: <b class="text-slate-900">${item.quantity}</b> • Đơn giá: <b class="text-indigo-700">${this.formatMoney(item.unit_price)}</b></div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] uppercase font-bold text-slate-500">Chế độ</div>
                        <div class="text-xs font-black text-indigo-700">${item.warranty_months ? 'BH ' + item.warranty_months + ' tháng' : 'Không BH'}</div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-200">
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-colors shadow-sm" data-action="exchange" data-item-id="${item.id}">Đổi hàng</button>
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-black bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors shadow-sm" data-action="refund" data-item-id="${item.id}">Trả hàng hoàn tiền</button>
                    <button class="action-btn px-3 py-1.5 rounded-lg text-xs font-black bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-300 transition-colors shadow-sm" data-action="warranty" data-item-id="${item.id}">Nhận bảo hành</button>
                </div>
            </div>
        `).join('');

        this.container.querySelector('#return-detail-panel').innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                        <div class="text-[11px] uppercase tracking-wider text-slate-600 font-bold">Hóa đơn gốc</div>
                        <div class="text-base font-black text-indigo-700">${order.invoice_code || 'INV-' + order.id}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[11px] uppercase tracking-wider text-slate-600 font-bold">Tổng thanh toán</div>
                        <div class="text-lg font-black text-slate-900">${this.formatMoney(order.total_amount || 0)}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div class="text-xs text-slate-600 font-bold uppercase mb-0.5">Khách hàng</div>
                        <div class="font-black text-slate-900 text-sm">${order.customer_name || 'Khách vãng lai'}</div>
                    </div>
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div class="text-xs text-slate-600 font-bold uppercase mb-0.5">Số điện thoại</div>
                        <div class="font-black text-slate-900 text-sm">${order.customer_phone || '--'}</div>
                    </div>
                </div>

                <div class="space-y-3 mt-4">
                    <h3 class="font-bold text-slate-800 border-b border-slate-200 pb-2">Chọn sản phẩm cần xử lý:</h3>
                    ${itemHtml || '<div class="text-sm text-slate-500 font-bold py-4">Không có sản phẩm trong đơn hàng.</div>'}
                </div>
            </div>
        `;
    }

    showForm(type, item) {
        const panel = this.container.querySelector('#return-detail-panel');
        let formFields = '';

        if (type === 'exchange') {
            formFields += `
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Sản phẩm đổi thay thế</label>
                    <select id="return-exchange-product" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-sm">
                        <option value="">-- Đổi cùng loại (Mới 100%) --</option>
                    </select>
                </div>
            `;
        } else if (type === 'warranty') {
            formFields += `
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Hình thức tiếp nhận</label>
                    <select id="warranty-type" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-sm">
                        <option value="repair">Gửi trung tâm bảo hành sửa chữa</option>
                        <option value="replace">Đổi mới linh kiện tại chỗ</option>
                        <option value="inspection">Giữ máy thẩm định lỗi</option>
                    </select>
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="space-y-4 animate-fade-in-up">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                        <div class="text-[11px] uppercase tracking-wider text-slate-600 font-bold">Quy trình xử lý</div>
                        <div class="text-lg font-black text-slate-900">${type === 'exchange' ? 'Đổi hàng mới' : type === 'refund' ? 'Trả hàng & Hoàn tiền' : 'Tiếp nhận Bảo hành'}</div>
                    </div>
                    <button class="close-form-btn px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-black hover:bg-slate-100 shadow-sm">Quay lại danh sách</button>
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Sản phẩm áp dụng</label>
                        <div class="font-black text-slate-900 text-sm bg-white border border-slate-200 p-2.5 rounded-lg">${item.product_name || 'Sản phẩm'}</div>
                    </div>

                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Lý do chi tiết *</label>
                        <textarea id="return-reason" rows="3" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="Mô tả tình trạng hàng, lý do khách muốn đổi/trả/bảo hành..."></textarea>
                    </div>

                    ${formFields}

                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Tình trạng ngoại quan</label>
                        <select id="return-condition" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 shadow-sm">
                            <option value="new">Nguyên seal / Như mới</option>
                            <option value="used">Đã qua sử dụng (Còn đủ phụ kiện)</option>
                            <option value="defective">Lỗi kỹ thuật phần cứng</option>
                            <option value="damaged">Hư hỏng vật lý / Cấn móp</option>
                        </select>
                    </div>

                    <div class="flex gap-3 pt-3">
                        <button class="submit-return-btn flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 shadow-md" data-type="${type}" data-item-id="${item.id}">Xác nhận tạo phiếu</button>
                        <button class="cancel-return-btn flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-black text-sm hover:bg-slate-100 shadow-sm">Hủy</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistory(historyData) {
        const listEl = this.container.querySelector('#history-list');
        if (!listEl) return;

        if (!historyData || historyData.length === 0) {
            listEl.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-500 font-bold">Chưa có dữ liệu yêu cầu nào.</td></tr>';
            return;
        }

        const getTypeBadge = (type) => {
            if (type === 'exchange') return '<span class="text-indigo-600 font-bold"><span class="mr-1">🔄</span>Đổi hàng</span>';
            if (type === 'refund') return '<span class="text-rose-600 font-bold"><span class="mr-1">💰</span>Trả hàng</span>';
            if (type === 'warranty') return '<span class="text-blue-600 font-bold"><span class="mr-1">🔧</span>Bảo hành</span>';
            return type;
        };

        listEl.innerHTML = historyData.map(item => {
            let actionBtn = '';
            if (item.idPrefix === 'WAR-' && item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'rejected') {
                actionBtn = `<button class="btn-complete-warranty px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[11px] font-black hover:bg-emerald-600 shadow-sm" data-id="${item.id}">Hoàn thành</button>`;
            } else if (item.idPrefix === 'RET-' && item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'rejected') {
                actionBtn = `<button class="btn-complete-return px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-[11px] font-black hover:bg-indigo-600 shadow-sm" data-id="${item.id}">Hoàn thành</button>`;
            }

            return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 border-b border-slate-100 font-black text-slate-900">${item.idPrefix}${item.id}</td>
                <td class="py-3 px-4 border-b border-slate-100 font-bold text-indigo-700">${item.invoice_code || ('INV-' + item.order_id)}</td>
                <td class="py-3 px-4 border-b border-slate-100 font-bold text-slate-700">${item.customer_name || 'Khách vãng lai'}</td>
                <td class="py-3 px-4 border-b border-slate-100">${getTypeBadge(item.displayType)}</td>
                <td class="py-3 px-4 border-b border-slate-100 text-sm font-semibold text-slate-700">${item.creator_name || 'Hệ thống'}</td>
                <td class="py-3 px-4 border-b border-slate-100 text-slate-500 font-semibold text-xs">${new Date(item.created_at || item.requested_at || item.claimed_at).toLocaleString('vi-VN')}</td>
                <td class="py-3 px-4 border-b border-slate-100 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${actionBtn}
                        <button class="btn-track px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-black hover:bg-slate-50 shadow-sm" data-id="${item.id}" data-type="${item.idPrefix}">Theo dõi</button>
                        <button class="btn-delete-ticket px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-black hover:bg-rose-100 shadow-sm" data-id="${item.id}" data-type="${item.idPrefix}">Xóa</button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    showWarrantyFeeModal(warrantyId) {
        document.getElementById('fee-warranty-id').innerText = 'WAR-' + warrantyId;
        document.getElementById('fee-amount').value = '0';
        document.getElementById('fee-notes').value = '';
        document.getElementById('warranty-fee-modal').classList.remove('hidden');
    }

    hideWarrantyFeeModal() {
        document.getElementById('warranty-fee-modal').classList.add('hidden');
    }

    showReturnActionModal(returnId) {
        document.getElementById('action-return-id').innerText = 'RET-' + returnId;
        document.getElementById('return-action-type').value = 'none';
        document.getElementById('return-action-amount').value = '0';
        document.getElementById('return-action-amount-group').classList.add('hidden');
        document.getElementById('return-action-notes').value = '';
        document.getElementById('return-action-modal').classList.remove('hidden');

        document.getElementById('return-action-type').onchange = (e) => {
            if (e.target.value === 'none') {
                document.getElementById('return-action-amount-group').classList.add('hidden');
            } else {
                document.getElementById('return-action-amount-group').classList.remove('hidden');
            }
        };
    }

    hideReturnActionModal() {
        document.getElementById('return-action-modal').classList.add('hidden');
    }

    showTrackingModal(data, type) {
        let content = '';
        if (type === 'WAR-') {
            content = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div class="text-xs text-slate-500 uppercase font-bold">Mã Hóa Đơn</div>
                        <div class="font-black text-indigo-700">INV-${data.order_id}</div>
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 uppercase font-bold">Trạng thái</div>
                        <div class="font-black text-slate-900">${data.status}</div>
                    </div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div class="text-xs text-slate-500 uppercase font-bold mb-1">Mô tả lỗi</div>
                    <div class="text-sm font-semibold text-slate-800">${data.issue_description || 'Không có mô tả'}</div>
                </div>
                ${data.resolution_notes ? `
                <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-200 mt-3">
                    <div class="text-xs text-indigo-500 uppercase font-bold mb-1">Ghi chú sửa chữa</div>
                    <div class="text-sm font-semibold text-indigo-900">${data.resolution_notes}</div>
                </div>
                ` : ''}
            `;
        } else {
            content = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div class="text-xs text-slate-500 uppercase font-bold">Mã Hóa Đơn</div>
                        <div class="font-black text-indigo-700">INV-${data.order_id}</div>
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 uppercase font-bold">Trạng thái</div>
                        <div class="font-black text-slate-900">${data.status}</div>
                    </div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div class="text-xs text-slate-500 uppercase font-bold mb-1">Lý do đổi trả</div>
                    <div class="text-sm font-semibold text-slate-800">${data.reason || 'Không có lý do'}</div>
                </div>
                ${data.refund_amount ? `
                <div class="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <span class="text-xs uppercase font-bold block mb-1">Hoàn tiền</span>
                    <span class="text-sm font-black">${this.formatMoney(data.refund_amount)}</span>
                </div>
                ` : ''}
            `;
        }
        
        document.getElementById('tracking-content').innerHTML = content;
        document.getElementById('tracking-modal').classList.remove('hidden');
    }

    hideTrackingModal() {
        document.getElementById('tracking-modal').classList.add('hidden');
    }

    formatMoney(amount = 0) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}
