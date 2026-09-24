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
        // Tag select inputs with data-filterKey in view? Wait, I didn't tag them in view.
        // Let's manually map them based on DOM hierarchy or IDs.
        const filterPanel = document.getElementById('advanced-filter-panel');
        if (!filterPanel) return;

        const selects = filterPanel.querySelectorAll('select');
        if (selects.length >= 4) {
            // type, source, payment_method, user_id
            selects[0].dataset.filterKey = 'type';
            selects[1].dataset.filterKey = 'source';
            selects[2].dataset.filterKey = 'payment_method';
            selects[3].dataset.filterKey = 'user_id';

            selects.forEach(select => {
                // Restore value
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
        
        // Mở modal
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

        // Xem chi tiết Hóa đơn / Phiếu (Popup)
        container.addEventListener('click', async (e) => {
            const btnInvoice = e.target.closest('.btn-view-invoice');
            if (btnInvoice) {
                const id = btnInvoice.dataset.id;
                
                // Tìm transaction tương ứng
                const tx = this.transactions.find(t => t.invoice_id === id || (id.startsWith('PT-') || id.startsWith('PC-')) && id.endsWith(String(t.id).padStart(4, '0')));
                if (!tx) return;

                const modal = document.getElementById('modal-invoice-detail');
                const title = document.getElementById('detail-invoice-id');
                const contentContainer = modal.querySelector('.p-5.bg-slate-50');

                if (modal && title && contentContainer) {
                    title.textContent = id;
                    const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
                    const dateFmt = new Date(tx.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

                    if (id.startsWith('INV')) {
                        // Render UI tải dữ liệu
                        contentContainer.innerHTML = `<div class="text-center py-4"><span class="text-slate-500 text-sm font-medium">Đang tải chi tiết hóa đơn...</span></div>`;
                        modal.classList.remove('hidden');
                        setTimeout(() => modal.classList.remove('opacity-0'), 10);
                        
                        try {
                            const OrderService = (await import('../services/OrderService.js')).default;
                            const orderSvc = new OrderService();
                            const res = await orderSvc.getOrders();
                            const orders = res.data?.data || [];
                            const order = orders.find(o => o.invoice_code === id);
                            
                            if (order) {
                                this.activeOrder = order; // Lưu tạm để in lại
                                contentContainer.innerHTML = `
                                    <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Khách hàng:</span><span class="font-bold text-slate-800">${order.customer_name || 'Khách Lẻ'}</span></div>
                                    <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Người bán:</span><span class="font-medium text-slate-800">@${order.cashier_name}</span></div>
                                    <div class="flex justify-between text-sm mb-4"><span class="text-slate-500">Thời gian:</span><span class="font-medium text-slate-800">${new Date(order.created_at).toLocaleString('vi-VN')}</span></div>
                                    <div class="border-t border-slate-200 pt-3 border-dashed">
                                        ${order.items.map(item => `
                                            <div class="flex justify-between text-sm mb-1">
                                                <span class="text-slate-700">${item.product_name} <span class="text-xs text-slate-400">x${item.quantity}</span></span>
                                                <span class="text-slate-800 font-medium">${fmt.format(item.unit_price * item.quantity)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="border-t border-slate-200 pt-3 mt-3 border-dashed flex justify-between items-center">
                                        <span class="font-bold text-slate-700">TỔNG CỘNG:</span>
                                        <span class="font-black text-indigo-600 text-lg">${fmt.format(order.total_amount)}</span>
                                    </div>
                                    <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                        <button id="btn-reprint-cashflow" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-bold transition-colors">
                                            In lại Hóa Đơn
                                        </button>
                                    </div>
                                `;
                            } else {
                                contentContainer.innerHTML = `<div class="text-center py-4 text-rose-500 text-sm font-bold">Không tìm thấy chi tiết hóa đơn. (Đơn hàng quá cũ)</div>`;
                            }
                        } catch (err) {
                            contentContainer.innerHTML = `<div class="text-center py-4 text-rose-500 text-sm font-bold">Lỗi khi tải dữ liệu</div>`;
                        }
                    } else {
                        // Phiếu Thu / Chi thủ công
                        let attachmentHtml = '';
                        if (tx.attachment_url) {
                            // Check if image
                            const ext = tx.attachment_url.split('.').pop().toLowerCase();
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                                attachmentHtml = `<div class="mt-3"><span class="text-slate-500 text-sm">Chứng từ đính kèm:</span><br><a href="${tx.attachment_url}" target="_blank"><img src="${tx.attachment_url}" class="max-w-full h-auto mt-2 rounded border border-slate-200 max-h-48 object-contain"></a></div>`;
                            } else {
                                attachmentHtml = `<div class="mt-3"><span class="text-slate-500 text-sm">Chứng từ đính kèm:</span> <a href="${tx.attachment_url}" target="_blank" class="text-indigo-600 font-bold underline text-sm ml-2">Tải xuống / Xem file</a></div>`;
                            }
                        }

                        contentContainer.innerHTML = `
                            <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Loại phiếu:</span><span class="font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}">${tx.type === 'income' ? 'PHIẾU THU' : 'PHIẾU CHI'}</span></div>
                            <div class="flex justify-between text-sm mb-2"><span class="text-slate-500">Người lập:</span><span class="font-medium text-slate-800">@${tx.username}</span></div>
                            <div class="flex justify-between text-sm mb-4"><span class="text-slate-500">Thời gian:</span><span class="font-medium text-slate-800">${dateFmt}</span></div>
                            <div class="border-t border-slate-200 pt-3 border-dashed">
                                <div class="text-sm mb-2 flex justify-between"><span class="text-slate-500">Danh mục:</span> <span class="font-bold text-slate-700">${tx.category}</span></div>
                                <div class="text-sm mb-2 flex flex-col gap-1">
                                    <span class="text-slate-500">Diễn giải:</span> 
                                    <span class="text-slate-800 bg-white p-2 border border-slate-100 rounded">${tx.description || 'Không có mô tả'}</span>
                                </div>
                            </div>
                            <div class="border-t border-slate-200 pt-3 mt-3 border-dashed flex justify-between items-center">
                                <span class="font-bold text-slate-700">SỐ TIỀN:</span>
                                <span class="font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'} text-lg">${fmt.format(tx.amount)}</span>
                            </div>
                            ${attachmentHtml}
                        `;
                        modal.classList.remove('hidden');
                        setTimeout(() => modal.classList.remove('opacity-0'), 10);
                    }
                }
            }
            
            // Đóng Invoice Detail Mock
            const btnCloseInvoice = e.target.closest('#btn-close-invoice');
            if (btnCloseInvoice || e.target.id === 'modal-invoice-detail') {
                const modal = document.getElementById('modal-invoice-detail');
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }

            // In lại hóa đơn
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
                
                // Add extra fields not directly from standard form inputs
                formData.set('payment_method', document.getElementById('tx-payment-method').value || 'cash');
                formData.set('amount', parseFloat(document.getElementById('tx-amount').value));
                formData.set('category', document.getElementById('tx-category').value);
                formData.set('description', document.getElementById('tx-description').value);
                formData.set('source', 'manual');
                // invoice_id is null by default, omit it
                
                // Add file attachment if selected
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
        order.items.forEach(item => {
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
                    <h2 style="margin-top: 15px;">HÓA ĐƠN BÁN HÀNG</h2>
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
