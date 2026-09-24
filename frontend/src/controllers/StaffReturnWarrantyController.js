import StaffReturnWarrantyView from '../views/pages/StaffReturnWarrantyView.js';
import ReturnWarrantyService from '../services/ReturnWarrantyService.js';
import OrderModel from '../models/OrderModel.js';

export default class StaffReturnWarrantyController {
    constructor() {
        this.view = new StaffReturnWarrantyView();
        this.orderModel = new OrderModel();
        this.service = new ReturnWarrantyService();
        this.orders = [];
        this.selectedOrder = null;
        this.historyData = [];
        this.activeFeeWarrantyId = null;

        this.init();
    }

    async init() {
        try {
            const res = await this.orderModel.fetchOrders();
            if (res && res.success) {
                this.orders = res.data || [];
            }
        } catch (error) {
            console.error('Lỗi tải hóa đơn cho đổi trả:', error);
            this.orders = [];
        }

        this.view.render(this.orders);
        this.bindEvents();
        this.fetchHistory();
    }

    async fetchHistory() {
        try {
            const [returnsRes, warrantyRes] = await Promise.all([
                this.service.getReturnRequests(),
                this.service.getWarrantyClaims()
            ]);

            let data = [];
            if (returnsRes.data && returnsRes.data.success) {
                const returns = returnsRes.data.data.map(r => ({
                    ...r, 
                    idPrefix: 'RET-', 
                    displayType: r.return_type,
                    timestamp: new Date((r.requested_at || '').replace(' ', 'T')).getTime() || 0
                }));
                data = [...data, ...returns];
            }
            if (warrantyRes.data && warrantyRes.data.success) {
                const warranties = warrantyRes.data.data.map(w => ({
                    ...w, 
                    idPrefix: 'WAR-', 
                    displayType: 'warranty',
                    timestamp: new Date((w.claimed_at || '').replace(' ', 'T')).getTime() || 0
                }));
                data = [...data, ...warranties];
            }

            // Sắp xếp mới nhất lên đầu
            data.sort((a, b) => b.timestamp - a.timestamp);
            this.historyData = data;
            
            this.filterHistory();
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
            this.view.renderHistory([]);
        }
    }

    filterHistory() {
        const filter = document.getElementById('history-type-filter')?.value || 'all';
        let filtered = this.historyData;
        if (filter === 'return') {
            filtered = this.historyData.filter(i => i.idPrefix === 'RET-');
        } else if (filter === 'warranty') {
            filtered = this.historyData.filter(i => i.idPrefix === 'WAR-');
        }
        this.view.renderHistory(filtered);
    }

    bindEvents() {
        const container = this.view.container;

        // Xử lý Tabs chính
        container.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.main-tab-btn');
            if (tabBtn) {
                const tabId = tabBtn.dataset.tab;
                
                container.querySelectorAll('.main-tab-btn').forEach(btn => {
                    btn.classList.toggle('bg-indigo-600', btn.dataset.tab === tabId);
                    btn.classList.toggle('text-white', btn.dataset.tab === tabId);
                    btn.classList.toggle('bg-white', btn.dataset.tab !== tabId);
                    btn.classList.toggle('text-slate-700', btn.dataset.tab !== tabId);
                });

                document.getElementById('tab-create').classList.toggle('hidden', tabId !== 'create');
                document.getElementById('tab-history').classList.toggle('hidden', tabId !== 'history');

                if (tabId === 'history') {
                    this.fetchHistory();
                }
            }
        });

        const searchBtn = container.querySelector('#btn-search-return');
        const searchInput = container.querySelector('#return-search');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.filterOrders(searchInput.value));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.filterOrders(searchInput.value);
            });
        }

        container.querySelector('#history-type-filter')?.addEventListener('change', () => this.filterHistory());
        container.querySelector('#btn-refresh-history')?.addEventListener('click', () => this.fetchHistory());

        container.addEventListener('click', async (e) => {
            // Xem Modal
            const trackBtn = e.target.closest('.btn-track');
            if (trackBtn) {
                const id = Number(trackBtn.dataset.id);
                const type = trackBtn.dataset.type;
                const data = this.historyData.find(i => i.id === id && i.idPrefix === type);
                if (data) {
                    this.view.showTrackingModal(data, type);
                }
                return;
            }

            // Nút hoàn thành bảo hành (hiện modal thu phí)
            const completeWarrantyBtn = e.target.closest('.btn-complete-warranty');
            if (completeWarrantyBtn) {
                const id = Number(completeWarrantyBtn.dataset.id);
                this.activeFeeWarrantyId = id;
                this.view.showWarrantyFeeModal(id);
                return;
            }

            // Nút hoàn thành đổi trả
            const completeReturnBtn = e.target.closest('.btn-complete-return');
            if (completeReturnBtn) {
                const id = Number(completeReturnBtn.dataset.id);
                this.activeReturnId = id;
                this.view.showReturnActionModal(id);
                return;
            }

            const closeReturnModal = e.target.closest('#btn-close-return-modal');
            if (closeReturnModal) {
                this.view.hideReturnActionModal();
                this.activeReturnId = null;
                return;
            }

            const submitReturnBtnAction = e.target.closest('#btn-submit-return-action');
            if (submitReturnBtnAction && this.activeReturnId) {
                const type = document.getElementById('return-action-type').value;
                const amount = Number(document.getElementById('return-action-amount').value || 0);
                const notes = document.getElementById('return-action-notes').value || '';

                if (type !== 'none' && amount <= 0) {
                    window.showToast?.('Vui lòng nhập số tiền hợp lệ', 'warning');
                    return;
                }

                submitReturnBtnAction.disabled = true;
                submitReturnBtnAction.innerText = 'Đang xử lý...';

                try {
                    const payload = {
                        status: 'completed',
                        action: type,
                        refund_amount: type !== 'none' ? amount : 0,
                        notes: notes + (type === 'refund' ? ` (Chi hoàn tiền: ${this.view.formatMoney(amount)})` : type === 'collect' ? ` (Thu thêm: ${this.view.formatMoney(amount)})` : '')
                    };

                    const res = await this.service.updateReturnRequestStatus(this.activeReturnId, payload);
                    if (res.data && res.data.success) {
                        window.showToast?.('Đã hoàn tất phiếu đổi trả', 'success');
                        this.view.hideReturnActionModal();
                        this.fetchHistory();
                    } else {
                        window.showToast?.(res.data?.message || 'Lỗi hệ thống', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    window.showToast?.('Lỗi hệ thống', 'error');
                } finally {
                    submitReturnBtnAction.disabled = false;
                    submitReturnBtnAction.innerText = 'Xác nhận Hoàn thành';
                }
                return;
            }

            const deleteBtn = e.target.closest('.btn-delete-ticket');
            if (deleteBtn) {
                const id = Number(deleteBtn.dataset.id);
                const type = deleteBtn.dataset.type;
                if (confirm('Bạn có chắc chắn muốn xóa phiếu này? Hành động này không thể hoàn tác.')) {
                    try {
                        const res = type === 'WAR-' 
                            ? await this.service.deleteWarrantyClaim(id)
                            : await this.service.deleteReturnRequest(id);
                            
                        if (res.data && res.data.success) {
                            window.showToast?.('Đã xóa phiếu thành công', 'success');
                            this.fetchHistory();
                        } else {
                            window.showToast?.(res.data?.message || 'Không thể xóa phiếu', 'error');
                        }
                    } catch (err) {
                        console.error(err);
                        window.showToast?.('Lỗi hệ thống khi xóa', 'error');
                    }
                }
                return;
            }

            const closeTrackModal = e.target.closest('#btn-close-tracking-modal');
            if (closeTrackModal) {
                this.view.hideTrackingModal();
                return;
            }

            const closeFeeModal = e.target.closest('#btn-close-fee-modal');
            if (closeFeeModal) {
                this.view.hideWarrantyFeeModal();
                this.activeFeeWarrantyId = null;
                return;
            }

            const submitFeeBtn = e.target.closest('#btn-submit-fee');
            if (submitFeeBtn && this.activeFeeWarrantyId) {
                const feeAmount = Number(document.getElementById('fee-amount').value || 0);
                const notes = document.getElementById('fee-notes').value || '';
                
                submitFeeBtn.disabled = true;
                submitFeeBtn.innerText = 'Đang xử lý...';

                try {
                    const res = await this.service.updateWarrantyClaimStatus(this.activeFeeWarrantyId, { 
                        status: 'completed',
                        resolution_notes: notes + (feeAmount > 0 ? ` (Thu phí: ${this.view.formatMoney(feeAmount)})` : ''),
                        fee_amount: feeAmount
                    });

                    if (res.data && res.data.success) {
                        window.showToast?.('Đã hoàn thành bảo hành', 'success');
                        this.view.hideWarrantyFeeModal();
                        this.fetchHistory();
                    } else {
                        window.showToast?.(res.data?.message || 'Lỗi hệ thống', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    window.showToast?.('Lỗi hệ thống', 'error');
                } finally {
                    submitFeeBtn.disabled = false;
                    submitFeeBtn.innerText = 'Xác nhận thu & Hoàn thành';
                }
                return;
            }

            const orderCard = e.target.closest('.order-card');
            if (orderCard) {
                const orderId = Number(orderCard.dataset.orderId);
                const order = this.orders.find(o => Number(o.id) === orderId);
                if (order) {
                    this.selectedOrder = order;
                    this.view.renderDetail(order);
                }
                return;
            }

            const action = e.target.closest('.action-btn');
            if (action) {
                const itemId = Number(action.dataset.itemId);
                const actionType = action.dataset.action;
                const item = (this.selectedOrder?.items || []).find(i => Number(i.id) === itemId);
                if (item) {
                    this.view.showForm(actionType, item);
                }
                return;
            }

            const closeBtn = e.target.closest('.close-form-btn') || e.target.closest('.cancel-return-btn');
            if (closeBtn) {
                if (this.selectedOrder) {
                    this.view.renderDetail(this.selectedOrder);
                }
                return;
            }

            const submitBtn = e.target.closest('.submit-return-btn');
            if (submitBtn) {
                const type = submitBtn.dataset.type; // 'exchange', 'refund', 'warranty'
                const itemId = Number(submitBtn.dataset.itemId);
                
                const selectedItem = (this.selectedOrder?.items || []).find(i => Number(i.id) === itemId);
                const reason = container.querySelector('#return-reason')?.value?.trim();
                
                if (!reason) {
                    window.showToast?.('Vui lòng nhập lý do chi tiết', 'warning');
                    return;
                }

                let remainingDays = 0;
                if (selectedItem?.warranty_months) {
                    const orderDate = new Date(this.selectedOrder.created_at);
                    const expireDate = new Date(orderDate);
                    expireDate.setMonth(expireDate.getMonth() + selectedItem.warranty_months);
                    const diff = expireDate.getTime() - new Date().getTime();
                    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }

                const payload = {
                    order_id: this.selectedOrder?.id,
                    customer_id: null,
                    customer_name: this.selectedOrder?.customer_name,
                    customer_phone: this.selectedOrder?.customer_phone,
                    return_type: type === 'exchange' ? 'exchange' : 'refund',
                    reason,
                    exchange_product_id: container.querySelector('#return-exchange-product')?.value || null,
                    notes: reason,
                    items: [{
                        order_item_id: selectedItem?.id,
                        product_id: selectedItem?.product_id,
                        product_name: selectedItem?.product_name,
                        quantity: selectedItem?.quantity || 1,
                        unit_price: selectedItem?.unit_price || 0,
                        condition_status: container.querySelector('#return-condition')?.value || 'new',
                        defect_type: type === 'warranty' ? (container.querySelector('#warranty-type')?.value || 'repair') : null,
                        warranty_remaining_days: remainingDays,
                        refund_amount: 0,
                        exchange_to_product_id: container.querySelector('#return-exchange-product')?.value || null,
                        exchange_delta_amount: 0
                    }]
                };

                submitBtn.disabled = true;
                submitBtn.innerText = 'Đang xử lý...';

                try {
                    if (type === 'warranty') {
                        const warrantyMonths = selectedItem?.warranty_months || 0;
                        const startDate = new Date(this.selectedOrder.created_at || Date.now());
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + warrantyMonths);

                        const warrantyPayload = {
                            order_id: this.selectedOrder?.id,
                            order_item_id: selectedItem?.id,
                            product_id: selectedItem?.product_id,
                            customer_id: null,
                            customer_name: this.selectedOrder?.customer_name,
                            customer_phone: this.selectedOrder?.customer_phone,
                            serial_number: 'SN-' + Date.now(),
                            warranty_months: warrantyMonths,
                            warranty_start_date: startDate.toISOString(),
                            warranty_end_date: endDate.toISOString(),
                            claim_type: container.querySelector('#warranty-type')?.value || 'repair',
                            issue_description: reason,
                            issue_code: 'GENERAL',
                            created_by: null
                        };
                        
                        const res = await this.service.createWarrantyClaim(warrantyPayload);
                        if (res.data && res.data.success) {
                            window.showToast?.('Yêu cầu bảo hành đã được tạo thành công!', 'success');
                            if (this.selectedOrder) this.view.renderDetail(this.selectedOrder);
                            this.fetchHistory();
                        } else {
                            window.showToast?.(res.data?.message || 'Tạo bảo hành thất bại', 'error');
                        }
                    } else {
                        const res = await this.service.createReturnRequest(payload);
                        if (res.data && res.data.success) {
                            window.showToast?.('Phiếu đổi trả đã được tạo thành công!', 'success');
                            if (this.selectedOrder) this.view.renderDetail(this.selectedOrder);
                            this.fetchHistory();
                        } else {
                            window.showToast?.(res.data?.message || 'Tạo yêu cầu thất bại', 'error');
                        }
                    }
                } catch (err) {
                    console.error('Lỗi gọi API:', err);
                    window.showToast?.('Đã xảy ra lỗi hệ thống.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Xác nhận tạo phiếu';
                }
            }
        });
    }

    filterOrders(keyword = '') {
        const q = keyword.trim().toLowerCase();
        if (!q) {
            this.view.renderOrderList(this.orders);
            document.getElementById('return-order-list').innerHTML = this.view.renderOrderList(this.orders);
            return;
        }

        const filtered = this.orders.filter(order => {
            const code = (order.invoice_code || '').toLowerCase();
            const name = (order.customer_name || '').toLowerCase();
            const phone = (order.customer_phone || '').toLowerCase();
            return code.includes(q) || name.includes(q) || phone.includes(q);
        });

        document.getElementById('return-order-list').innerHTML = this.view.renderOrderList(filtered);
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
