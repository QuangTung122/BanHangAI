import OwnerCashflowView from '../views/pages/OwnerCashflowView.js';
import TransactionService from '../services/TransactionService.js';

export default class OwnerCashflowController {
    constructor() {
        this.view = new OwnerCashflowView();
        this.transactionService = new TransactionService();
        
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

        // Xem chi tiết Hóa đơn (Popup)
        container.addEventListener('click', (e) => {
            const btnInvoice = e.target.closest('.btn-view-invoice');
            if (btnInvoice) {
                const id = btnInvoice.dataset.id;
                const modal = document.getElementById('modal-invoice-detail');
                const title = document.getElementById('detail-invoice-id');
                if (modal && title) {
                    title.textContent = id;
                    modal.classList.remove('hidden');
                    setTimeout(() => modal.classList.remove('opacity-0'), 10);
                }
            }
            
            // Đóng Invoice Detail Mock
            const btnCloseInvoice = e.target.closest('#btn-close-invoice');
            if (btnCloseInvoice || e.target.id === 'modal-invoice-detail') {
                const modal = document.getElementById('modal-invoice-detail');
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
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
                const data = {
                    type: formData.get('type'),
                    payment_method: document.getElementById('tx-payment-method').value || 'cash',
                    amount: parseFloat(document.getElementById('tx-amount').value),
                    category: document.getElementById('tx-category').value,
                    description: document.getElementById('tx-description').value,
                    source: 'manual', // since it's created via UI popup manually
                    invoice_id: null
                };
                
                try {
                    const res = await this.transactionService.createTransaction(data);
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

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
