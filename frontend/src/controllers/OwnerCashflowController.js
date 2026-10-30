import OwnerCashflowView from '../views/pages/OwnerCashflowView.js';
import TransactionService from '../services/TransactionService.js';
import OrderModel from '../models/OrderModel.js';

export default class OwnerCashflowController {
    constructor() {
        this.view = new OwnerCashflowView();
        this.transactionService = new TransactionService();
        this.orderModel = new OrderModel();
        
        this.summary = {};
        this.transactions = [];
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        this.filters = {
            month: `${yyyy}-${mm}`,
            type: '',
            source: '',
            payment_method: '',
            user_id: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
    }

    async loadData() {
        try {
            const [summaryRes, transRes] = await Promise.all([
                this.transactionService.getSummary(this.filters.month),
                this.transactionService.getTransactions(this.filters)
            ]);
            
            if (summaryRes.data && summaryRes.data.success) {
                this.summary = summaryRes.data.data;
            }
            if (transRes.data && transRes.data.success) {
                this.transactions = transRes.data.data;
            }
            
            this.view.render(this.summary, this.transactions);
            this.bindSearchEvent();
            this.bindFilterEvents();
            
            if (this.filters.month) {
                const select = document.getElementById('filter-month');
                if (select) select.value = this.filters.month;
            }
            // Restore filter values in UI
            document.querySelectorAll('#advanced-filter-panel select').forEach(select => {
                if (select.dataset.filterKey && this.filters[select.dataset.filterKey] !== undefined) {
                    select.value = this.filters[select.dataset.filterKey];
                }
            });

        } catch (err) {
            console.error('Lỗi tải dữ liệu Sổ quỹ:', err);
        }
    }

    bindSearchEvent() {
        const searchInput = document.getElementById('search-tx');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            let filtered = this.transactions;
            
            if (term) {
                filtered = this.transactions.filter(t => 
                    (t.category || '').toLowerCase().includes(term) ||
                    (t.description || '').toLowerCase().includes(term) ||
                    (t.username || '').toLowerCase().includes(term) ||
                    (t.invoice_id || '').toLowerCase().includes(term)
                );
            }
            
            const tbody = document.querySelector('table tbody');
            if (tbody) {
                tbody.innerHTML = this.view.renderRows(filtered);
            }
        });
    }

    bindFilterEvents() {
        const filterPanel = document.getElementById('advanced-filter-panel');
        if (!filterPanel) return;

        const selects = filterPanel.querySelectorAll('select');
        if (selects.length >= 4) {
            selects[0].dataset.filterKey = 'type';
            selects[1].dataset.filterKey = 'source';
            selects[2].dataset.filterKey = 'payment_method';
            selects[3].dataset.filterKey = 'user_id';

            selects.forEach(select => {
                if (this.filters[select.dataset.filterKey] !== undefined) {
                    select.value = this.filters[select.dataset.filterKey];
                }

                select.addEventListener('change', (e) => {
                    this.filters[e.target.dataset.filterKey] = e.target.value;
                    this.loadData();
                });
            });
        }
    }

    bindEvents() {
        const container = this.view.container;
        
        // Mở modal tạo phiếu
        container.addEventListener('click', (e) => {
            const btnCreate = e.target.closest('#btn-create-transaction');
            if (btnCreate) {
                const modal = document.getElementById('modal-transaction');
                const inner = modal.querySelector('div');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    inner.classList.remove('scale-95');
                }, 10);
            }
        });
        
        // Mở modal Chi tiết tiền mặt
        container.addEventListener('click', (e) => {
            const btnCashBreakdown = e.target.closest('#cash-breakdown-trigger');
            if (btnCashBreakdown) {
                const modal = document.getElementById('modal-cash-breakdown');
                if (modal) {
                    const inner = modal.querySelector('div');
                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        modal.classList.remove('opacity-0');
                        inner.classList.remove('scale-95');
                    }, 10);
                }
            }
        });

        // Đóng modal Chi tiết tiền mặt
        container.addEventListener('click', (e) => {
            const btnClose = e.target.closest('#btn-close-cash-breakdown');
            if (btnClose || e.target.id === 'modal-cash-breakdown') {
                const modal = document.getElementById('modal-cash-breakdown');
                if (modal) {
                    const inner = modal.querySelector('div');
                    modal.classList.add('opacity-0');
                    inner.classList.add('scale-95');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                    }, 300);
                }
            }
        });

        // Đóng modal Thu / Chi
        container.addEventListener('click', (e) => {
            const btnClose = e.target.closest('#btn-close-modal') || e.target.closest('#btn-cancel-tx');
            if (btnClose || e.target.id === 'modal-transaction') {
                const modal = document.getElementById('modal-transaction');
                const inner = modal.querySelector('div');
                modal.classList.add('opacity-0');
                inner.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    document.getElementById('form-transaction').reset();
                }, 300);
            }
        });

        // Xem chi tiết Hóa đơn gốc / Phiếu chứng từ (Popup)
        container.addEventListener('click', async (e) => {
            const btnInvoice = e.target.closest('.btn-view-invoice');
            if (btnInvoice) {
                const id = btnInvoice.dataset.id;
                const txId = btnInvoice.dataset.txId;
                
                // Tìm transaction tương ứng
                const tx = this.transactions.find(t => 
                    (txId && t.id === Number(txId)) ||
                    t.invoice_id === id || 
                    ((id.startsWith('PT-') || id.startsWith('PC-')) && id.endsWith(String(t.id).padStart(4, '0')))
                );
                if (!tx) return;

                const modal = document.getElementById('modal-invoice-detail');
                const headingEl = document.getElementById('detail-modal-heading');
                const title = document.getElementById('detail-invoice-id');
                const contentContainer = document.getElementById('invoice-detail-content') || modal?.querySelector('.p-5');

                if (modal && contentContainer) {
                    const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
                    const dateFmt = new Date(tx.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const isInvoice = !!tx.invoice_id || id.startsWith('INV') || !!(tx.reference_id && (tx.category === 'Bán hàng' || tx.category === 'Trả góp' || tx.source === 'auto'));

                    if (isInvoice) {
                        if (headingEl) headingEl.textContent = 'Hóa Đơn Gốc';
                        if (title) title.textContent = tx.invoice_id || id;

                        // Render UI đang tải dữ liệu
                        contentContainer.innerHTML = `
                            <div class="text-center py-8">
                                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5745f5] border-t-transparent mb-2.5"></div>
                                <p class="text-xs font-bold text-[#7b8499]">Đang tải dữ liệu hóa đơn gốc...</p>
                            </div>
                        `;
                        modal.classList.remove('hidden');
                        setTimeout(() => {
                            modal.classList.remove('opacity-0');
                            const inner = modal.querySelector('div');
                            if (inner) inner.classList.remove('scale-95');
                        }, 10);
                        
                        try {
                            const OrderService = (await import('../services/OrderService.js')).default;
                            const orderSvc = new OrderService();
                            const res = await orderSvc.getOrders();
                            const orders = res.data?.data || [];
                            const targetInvoiceCode = tx.invoice_id || (id.startsWith('INV') ? id : '');
                            const targetRefId = tx.reference_id;

                            const order = orders.find(o => 
                                (targetInvoiceCode && o.invoice_code === targetInvoiceCode) ||
                                (o.invoice_code === id) ||
                                (targetRefId && Number(o.id) === Number(targetRefId))
                            );
                            
                            if (order) {
                                this.activeOrder = order; // Lưu tạm để in lại
                                if (title) title.textContent = order.invoice_code;

                                const orderDateStr = new Date(order.created_at).toLocaleString('vi-VN');
                                const totalFormatted = fmt.format(order.total_amount);

                                let statusLabel = 'Đã hoàn tất';
                                let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                if (order.status === 'cancelled') {
                                    statusLabel = 'Đã hủy';
                                    statusClass = 'bg-rose-50 text-rose-700 border-rose-200';
                                } else if (order.status === 'pending') {
                                    statusLabel = 'Chờ xác nhận';
                                    statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
                                } else if (order.status === 'processing') {
                                    statusLabel = order.has_payment ? 'Đã thanh toán · Chờ xuất' : 'Chờ thu tiền';
                                    statusClass = 'bg-[#f0edff] text-[#5745f5] border-[#e1dcff]';
                                } else if (order.status === 'shipped') {
                                    statusLabel = order.has_payment ? 'Đang giao hàng' : 'Đang giao · Chưa thanh toán';
                                    statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
                                } else if (order.status === 'delivered') {
                                    statusLabel = 'Giao thành công';
                                    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                }

                                const paymentMethodLabel = {
                                    cash: 'Tiền mặt',
                                    transfer: 'Chuyển khoản',
                                    card: 'Thẻ POS'
                                }[order.payment_method] || order.payment_method || (order.payment_type === 'installment' ? 'Trả góp' : 'Tiền mặt');

                                const itemsHtml = (order.items || []).map(item => `
                                    <tr class="border-b border-[#e7eaf2] last:border-0 hover:bg-[#f8f9fc] transition-colors">
                                        <td class="py-2.5 px-3 font-bold text-[#182033] text-xs">
                                            <div>${item.product_name}</div>
                                            ${item.warranty_months ? `<span class="text-[10px] text-[#7b8499] font-medium">Bảo hành: ${item.warranty_months} tháng</span>` : ''}
                                        </td>
                                        <td class="py-2.5 px-3 text-center font-bold text-[#7b8499] text-xs">${item.quantity}</td>
                                        <td class="py-2.5 px-3 text-right font-medium text-[#7b8499] text-xs">${fmt.format(item.unit_price)}</td>
                                        <td class="py-2.5 px-3 text-right font-black text-[#5745f5] text-xs">${fmt.format(item.unit_price * item.quantity)}</td>
                                    </tr>
                                `).join('');

                                let installmentBox = '';
                                if (order.payment_type === 'installment') {
                                    installmentBox = `
                                        <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                                                    <span>💳</span> Hồ sơ mua trả góp (${order.finance_partner || 'Đối tác tài chính'})
                                                </span>
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    Kỳ hạn: ${order.installment_term || '--'} tháng
                                                </span>
                                            </div>
                                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-amber-200/60">
                                                <div>
                                                    <span class="text-[10px] text-amber-800 font-bold block">Khách trả trước:</span>
                                                    <span class="font-black text-amber-900">${fmt.format(order.down_payment || 0)}</span>
                                                </div>
                                                <div>
                                                    <span class="text-[10px] text-amber-800 font-bold block">Vay trả góp:</span>
                                                    <span class="font-black text-amber-900">${fmt.format(order.financed_amount || 0)}</span>
                                                </div>
                                                <div>
                                                    <span class="text-[10px] text-amber-800 font-bold block">Tiền góp/tháng:</span>
                                                    <span class="font-black text-amber-900">${fmt.format(order.monthly_fee || 0)}</span>
                                                </div>
                                                <div>
                                                    <span class="text-[10px] text-amber-800 font-bold block">Đã thanh toán:</span>
                                                    <span class="font-black text-emerald-700">${order.paid_months || 0} kỳ (${fmt.format(order.total_paid || 0)})</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }

                                contentContainer.innerHTML = `
                                    <div class="space-y-4">
                                        <!-- Header banner: Hóa đơn gốc -->
                                        <div class="bg-white rounded-xl p-3.5 border border-[#e7eaf2] shadow-xs flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <div class="flex items-center gap-2">
                                                    <span class="px-2.5 py-0.5 bg-[#f0edff] text-[#5745f5] text-[10px] font-black uppercase rounded-md border border-[#e1dcff]">Hóa đơn gốc</span>
                                                    <span class="font-mono text-sm font-black text-[#5745f5]">${order.invoice_code}</span>
                                                </div>
                                                <p class="text-[11px] text-[#7b8499] font-medium mt-1">Thời gian lập: <span class="font-bold text-[#182033]">${orderDateStr}</span></p>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusClass}">${statusLabel}</span>
                                            </div>
                                        </div>

                                        <!-- Customer & Cashier Info -->
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div class="bg-white p-3 rounded-xl border border-[#e7eaf2] shadow-xs space-y-1">
                                                <p class="text-[10px] font-black uppercase tracking-wider text-[#7b8499]">Khách Hàng</p>
                                                <p class="font-black text-[#182033] text-sm">${order.customer_name || 'Khách vãng lai'}</p>
                                                <p class="text-[11px] text-[#7b8499] font-semibold">SĐT: <span class="text-[#182033] font-bold">${order.customer_phone || 'Không lưu'}</span></p>
                                                ${order.shipping_address ? `<p class="text-[11px] text-[#7b8499] truncate">Đ/C: ${order.shipping_address}</p>` : ''}
                                            </div>
                                            <div class="bg-white p-3 rounded-xl border border-[#e7eaf2] shadow-xs space-y-1">
                                                <p class="text-[10px] font-black uppercase tracking-wider text-[#7b8499]">Thông Tin Thanh Toán</p>
                                                <p class="text-xs font-bold text-[#182033]">Thu ngân: <span class="text-[#5745f5]">@${order.cashier_name || 'Hệ thống'}</span></p>
                                                <p class="text-xs font-bold text-[#182033]">Hình thức: <span class="inline-block px-2 py-0.5 bg-[#f0edff] text-[#5745f5] text-[10px] font-bold rounded border border-[#e1dcff]">${paymentMethodLabel}</span></p>
                                                <p class="text-[11px] text-[#7b8499] font-semibold">Tình trạng: <span class="text-emerald-700 font-bold">${order.has_payment ? 'Đã thu tiền' : 'Chưa thu đủ'}</span></p>
                                            </div>
                                        </div>

                                        ${installmentBox}

                                        <!-- Items Table -->
                                        <div class="bg-white rounded-xl border border-[#e7eaf2] overflow-hidden shadow-xs">
                                            <div class="px-3 py-2 bg-[#fafbfd] border-b border-[#e7eaf2] flex items-center justify-between">
                                                <span class="text-[11px] font-black text-[#182033] uppercase tracking-wider">Danh mục sản phẩm</span>
                                                <span class="text-[10px] font-bold text-[#7b8499]">${(order.items || []).length} mặt hàng</span>
                                            </div>
                                            <table class="w-full text-left border-collapse">
                                                <thead class="bg-[#fafbfd] text-[#7b8499] text-[10px] font-black uppercase tracking-wider border-b border-[#e7eaf2]">
                                                    <tr>
                                                        <th class="py-2 px-3">Sản phẩm</th>
                                                        <th class="py-2 px-3 text-center">SL</th>
                                                        <th class="py-2 px-3 text-right">Đơn giá</th>
                                                        <th class="py-2 px-3 text-right">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-[#e7eaf2]">
                                                    ${itemsHtml}
                                                </tbody>
                                                <tfoot class="bg-[#fafbfd] border-t border-[#e7eaf2] text-xs">
                                                    ${order.shipping_fee ? `
                                                    <tr>
                                                        <td colspan="3" class="py-2 px-3 text-right font-bold text-[#7b8499]">Phí giao hàng:</td>
                                                        <td class="py-2 px-3 text-right font-bold text-[#182033]">${fmt.format(order.shipping_fee)}</td>
                                                    </tr>` : ''}
                                                    <tr>
                                                        <td colspan="3" class="py-3 px-3 text-right font-black uppercase text-xs text-[#7b8499]">Tổng cộng thanh toán:</td>
                                                        <td class="py-3 px-3 text-right font-black text-[#5745f5] text-base">${totalFormatted}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="pt-2 flex items-center justify-end gap-2.5">
                                            <button id="btn-modal-close-bottom" class="px-4 py-2 bg-white border border-[#e7eaf2] text-[#7b8499] hover:bg-[#f5f6fa] hover:text-[#182033] rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                                Đóng
                                            </button>
                                            <button id="btn-reprint-cashflow" class="px-4 py-2 bg-[#5745f5] hover:bg-[#4735e5] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                In lại Hóa Đơn Gốc
                                            </button>
                                        </div>
                                    </div>
                                `;
                            } else {
                                contentContainer.innerHTML = `
                                    <div class="text-center py-8">
                                        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center text-xl mx-auto mb-3">⚠️</div>
                                        <p class="text-rose-600 font-bold text-sm">Không tìm thấy thông tin chi tiết hóa đơn gốc.</p>
                                        <p class="text-xs text-[#7b8499] mt-1">Mã hóa đơn: <span class="font-mono font-bold">${tx.invoice_id || id}</span> (Đơn hàng có thể đã quá cũ hoặc được nhập thủ công)</p>
                                        <div class="mt-4">
                                            <button id="btn-modal-close-bottom" class="px-4 py-2 bg-white border border-[#e7eaf2] text-[#7b8499] hover:bg-[#f5f6fa] hover:text-[#182033] rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                                Đóng
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }
                        } catch (err) {
                            console.error('Lỗi khi tải chi tiết hóa đơn:', err);
                            contentContainer.innerHTML = `
                                <div class="text-center py-8">
                                    <p class="text-rose-500 text-sm font-bold">Lỗi khi tải dữ liệu hóa đơn gốc từ máy chủ.</p>
                                    <div class="mt-4">
                                        <button id="btn-modal-close-bottom" class="px-4 py-2 bg-white border border-[#e7eaf2] text-[#7b8499] hover:bg-[#f5f6fa] hover:text-[#182033] rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        // Phiếu Thu / Chi thủ công
                        if (headingEl) headingEl.textContent = 'Chi tiết chứng từ';
                        if (title) title.textContent = id;

                        let attachmentHtml = '';
                        if (tx.attachment_url) {
                            const ext = tx.attachment_url.split('.').pop().toLowerCase();
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                                attachmentHtml = `
                                    <div class="mt-3 p-3 bg-white border border-[#e7eaf2] rounded-xl">
                                        <span class="text-[#7b8499] text-xs font-bold block mb-2">Chứng từ đính kèm:</span>
                                        <a href="${tx.attachment_url}" target="_blank" class="block">
                                            <img src="${tx.attachment_url}" class="max-w-full h-auto rounded-lg border border-[#e7eaf2] max-h-48 object-contain mx-auto hover:opacity-90 transition-opacity">
                                        </a>
                                    </div>
                                `;
                            } else {
                                attachmentHtml = `
                                    <div class="mt-3 p-3 bg-white border border-[#e7eaf2] rounded-xl flex items-center justify-between">
                                        <span class="text-[#7b8499] text-xs font-bold">Tài liệu đính kèm:</span>
                                        <a href="${tx.attachment_url}" target="_blank" class="text-[#5745f5] font-bold underline text-xs">Tải xuống / Xem file</a>
                                    </div>
                                `;
                            }
                        }

                        contentContainer.innerHTML = `
                            <div class="space-y-3">
                                <div class="bg-white p-3.5 rounded-xl border border-[#e7eaf2] shadow-xs flex items-center justify-between">
                                    <div>
                                        <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'}">
                                            ${tx.type === 'income' ? 'Phiếu Thu (+)' : 'Phiếu Chi (-)'}
                                        </span>
                                        <h4 class="font-bold text-[#182033] text-sm mt-1.5">${tx.category}</h4>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-[10px] text-[#7b8499] font-bold block">Số tiền</span>
                                        <span class="text-base font-black ${tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}">${tx.type === 'income' ? '+' : '-'} ${fmt.format(tx.amount)}</span>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div class="bg-white p-3 rounded-xl border border-[#e7eaf2] shadow-xs">
                                        <span class="text-[10px] text-[#7b8499] font-bold uppercase block">Người lập</span>
                                        <span class="font-bold text-[#182033] mt-0.5 block">@${tx.username || '--'}</span>
                                    </div>
                                    <div class="bg-white p-3 rounded-xl border border-[#e7eaf2] shadow-xs">
                                        <span class="text-[10px] text-[#7b8499] font-bold uppercase block">Thời gian</span>
                                        <span class="font-medium text-[#182033] mt-0.5 block">${dateFmt}</span>
                                    </div>
                                </div>

                                <div class="bg-white p-3.5 rounded-xl border border-[#e7eaf2] shadow-xs">
                                    <span class="text-[10px] text-[#7b8499] font-bold uppercase block mb-1">Diễn giải / Nội dung</span>
                                    <p class="text-xs font-semibold text-[#182033] bg-[#f5f6fa] p-2.5 rounded-lg border border-[#e7eaf2] leading-relaxed">
                                        ${tx.description || 'Không có ghi chú diễn giải.'}
                                    </p>
                                </div>

                                ${attachmentHtml}

                                <div class="pt-2 flex justify-end">
                                    <button id="btn-modal-close-bottom" class="px-4 py-2 bg-white border border-[#e7eaf2] text-[#7b8499] hover:bg-[#f5f6fa] hover:text-[#182033] rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        `;

                        modal.classList.remove('hidden');
                        setTimeout(() => {
                            modal.classList.remove('opacity-0');
                            const inner = modal.querySelector('div');
                            if (inner) inner.classList.remove('scale-95');
                        }, 10);
                    }
                }
            }
            
            // Đóng Modal Chi tiết Hóa đơn / Chứng từ
            const btnCloseInvoice = e.target.closest('#btn-close-invoice') || e.target.closest('#btn-modal-close-bottom');
            if (btnCloseInvoice || e.target.id === 'modal-invoice-detail') {
                const modal = document.getElementById('modal-invoice-detail');
                if (modal) {
                    modal.classList.add('opacity-0');
                    const inner = modal.querySelector('div');
                    if (inner) inner.classList.add('scale-95');
                    setTimeout(() => modal.classList.add('hidden'), 300);
                }
            }

            // In lại hóa đơn gốc
            const btnReprint = e.target.closest('#btn-reprint-cashflow');
            if (btnReprint) {
                if (this.activeOrder) {
                    this.printReceipt(this.activeOrder);
                }
            }
        });
        
        // Đổi tháng
        container.addEventListener('change', (e) => {
            if (e.target.id === 'filter-month') {
                this.filters.month = e.target.value;
                this.loadData();
            }
        });
        
        // Mở modal Thu Tiền
        container.addEventListener('click', (e) => {
            const btnCollect = e.target.closest('.btn-collect-cash');
            if (btnCollect) {
                const id = btnCollect.dataset.id;
                const name = btnCollect.dataset.name;
                const max = parseFloat(btnCollect.dataset.max || 0);
                
                document.getElementById('collect-staff-id').value = id;
                document.getElementById('collect-staff-name').textContent = name;
                document.getElementById('collect-amount').max = max;
                document.getElementById('collect-amount').value = max;
                const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
                document.getElementById('collect-max-label').textContent = fmt.format(max);
                
                // Đóng modal chi tiết tiền mặt nếu đang mở
                const cashBreakdownModal = document.getElementById('modal-cash-breakdown');
                if (cashBreakdownModal && !cashBreakdownModal.classList.contains('hidden')) {
                    cashBreakdownModal.classList.add('hidden');
                    cashBreakdownModal.classList.add('opacity-0');
                }

                const modal = document.getElementById('modal-collect-cash');
                const inner = modal.querySelector('div');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    inner.classList.remove('scale-95');
                }, 10);
            }
        });
        
        // Đóng modal Thu Tiền
        container.addEventListener('click', (e) => {
            const btnClose = e.target.closest('#btn-close-collect-modal');
            if (btnClose || e.target.id === 'modal-collect-cash') {
                const modal = document.getElementById('modal-collect-cash');
                const inner = modal.querySelector('div');
                modal.classList.add('opacity-0');
                inner.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    document.getElementById('form-collect-cash').reset();
                }, 300);
            }
        });
        
        // Nút Tất cả (Thu tiền)
        container.addEventListener('click', (e) => {
            if (e.target.id === 'btn-collect-all') {
                const max = document.getElementById('collect-amount').max;
                document.getElementById('collect-amount').value = max;
            }
        });

        // Submit form
        container.addEventListener('submit', async (e) => {
            if (e.target.id === 'form-transaction') {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                formData.set('payment_method', document.getElementById('tx-payment-method').value || 'cash');
                formData.set('amount', parseFloat(document.getElementById('tx-amount').value));
                formData.set('category', document.getElementById('tx-category').value);
                formData.set('description', document.getElementById('tx-description').value);
                formData.set('source', 'manual');
                
                const fileInput = document.getElementById('tx-attachment');
                if (fileInput && fileInput.files.length > 0) {
                    formData.set('attachment', fileInput.files[0]);
                }
                
                try {
                    const res = await this.transactionService.createTransaction(formData);
                    if (res.data && res.data.success) {
                        alert('✅ ' + res.data.message);
                        document.getElementById('btn-close-modal').click();
                        this.loadData();
                    } else {
                        alert('❌ Lỗi: ' + (res.data?.message || 'Không thể tạo phiếu'));
                    }
                } catch (error) {
                    alert('❌ Lỗi kết nối');
                }
            }
            
            if (e.target.id === 'form-collect-cash') {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    staff_id: formData.get('staff_id'),
                    amount: parseFloat(formData.get('amount')),
                    receive_method: formData.get('receive_method'),
                    description: formData.get('description')
                };
                
                try {
                    const res = await this.transactionService.collectFromStaff(data);
                    if (res.data && res.data.success) {
                        alert('✅ ' + res.data.message);
                        document.getElementById('btn-close-collect-modal').click();
                        this.loadData(); // Tải lại trang sổ quỹ để update số tiền
                    } else {
                        alert('❌ Lỗi: ' + (res.data?.message || 'Không thể thu tiền'));
                    }
                } catch (error) {
                    alert('❌ Lỗi kết nối');
                }
            }
        });
    }

    printReceipt(order) {
        const iframe = document.getElementById('print-frame');
        if (!iframe) return;
        
        const doc = iframe.contentWindow.document;
        doc.open();
        
        const dateStr = new Date(order.created_at).toLocaleString('vi-VN');
        
        let instHtml = '';
        if (order.customer_name || order.customer_phone) {
            const cName = order.customer_name || 'Khách lẻ';
            const cPhone = order.customer_phone || '';
            instHtml = `
                <div style="margin-top: 10px; font-size: 12px;">
                    <p style="margin: 2px 0;">Khách hàng: ${cName} ${cPhone ? '- ' + cPhone : ''}</p>
                    <p style="margin: 2px 0;">Thu ngân: ${order.cashier_name || ''}</p>
                </div>
            `;
        } else if (order.cashier_name) {
            instHtml = `
                <div style="margin-top: 10px; font-size: 12px;">
                    <p style="margin: 2px 0;">Thu ngân: ${order.cashier_name}</p>
                </div>
            `;
        }

        let itemsHtml = '';
        (order.items || []).forEach(item => {
            itemsHtml += `
                <tr>
                    <td style="padding: 4px 0;">${item.product_name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unit_price * item.quantity)}</td>
                </tr>
            `;
        });

        let qrHtml = '';
        if (order.payment_method === 'transfer' || order.payment_method === 'Chuyển khoản ngân hàng') {
            const bankId = 'MB'; // Demo bank
            const accNo = '0123456789';
            const accName = 'ECOM AI SYSTEM';
            const qrUrl = `https://img.vietqr.io/image/${bankId}-${accNo}-compact.png?amount=${Math.round(order.total_amount)}&addInfo=${encodeURIComponent(order.invoice_code)}&accountName=${encodeURIComponent(accName)}`;
            qrHtml = `
                <div style="text-align: center; margin: 15px 0; border: 1px dashed #000; padding: 10px;">
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Quét mã QR để thanh toán</p>
                    <img src="${qrUrl}" style="width: 200px; height: 200px;" />
                    <p style="margin: 5px 0 0 0; font-size: 12px;">Nội dung: ${order.invoice_code}</p>
                    <p style="margin: 0; font-weight: bold; font-size: 14px;">Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</p>
                </div>
            `;
        }

        doc.write(`
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; color: #000; width: 300px; margin: 0 auto; padding: 10px; }
                    .center { text-align: center; }
                    h2 { margin: 5px 0; font-size: 16px; }
                    p { margin: 3px 0; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
                    th { border-bottom: 1px dashed #000; padding-bottom: 5px; text-align: left; }
                    th:nth-child(2) { text-align: center; }
                    th:nth-child(3) { text-align: right; }
                </style>
            </head>
            <body>
                <div class="center">
                    <h2>CỬA HÀNG E-COM AI</h2>
                    <p>Địa chỉ: 123 AI Street, Tech City</p>
                    <p>Hotline: 1900 1000</p>
                    <h2 style="margin-top: 15px;">HÓA ĐƠN BÁN HÀNG GỐC</h2>
                    <p>Mã HĐ: ${order.invoice_code}</p>
                    <p>Ngày: ${dateStr}</p>
                </div>
                
                ${instHtml}

                <table>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Thành tiền</th>
                    </tr>
                    ${itemsHtml}
                </table>

                <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
                    <table style="width: 100%; font-size: 14px;">
                        ${order.shipping_fee ? `
                        <tr>
                            <td>Phí giao hàng:</td>
                            <td style="text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee)}</td>
                        </tr>` : ''}
                        <tr>
                            <td><strong>TỔNG CỘNG:</strong></td>
                            <td style="text-align: right;"><strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</strong></td>
                        </tr>
                    </table>
                </div>

                ${qrHtml}

                <div class="center" style="margin-top: 20px;">
                    <p>(Bản sao - In lại)</p>
                    <p>Cảm ơn quý khách đã mua sắm!</p>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.focus();
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        doc.close();
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
