import StaffOrderHistoryView from '../views/pages/StaffOrderHistoryView.js';
import OrderModel from '../models/OrderModel.js';

export default class StaffOrderHistoryController {
    constructor() {
        this.view = new StaffOrderHistoryView();
        this.orderModel = new OrderModel();
        
        this.currentSearch = '';
        this.activeOrder = null;

        this.init();
    }

    async init() {
        try {
            await this.orderModel.fetchPendingBotOrders();
        } catch (error) {
            console.error('Không thể tải hàng đợi đơn Bot:', error);
        }
        try {
            await this.orderModel.fetchOrders('full'); // Chỉ lấy đơn trả thẳng
        } catch (error) {
            console.error('Không thể tải lịch sử đơn hàng:', error);
        }

        this.view.render(this.getHistoryOrders(), this.orderModel.pendingBotOrders);
        this.bindEvents();
    }

    getHistoryOrders() {
        return this.orderModel.orders.filter((order) => !(order.status === 'pending' && order.bot_reservation_expires_at));
    }

    bindEvents() {
        const container = this.view.container;

        // Tìm kiếm
        const searchInput = container.querySelector('#search-order');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.toLowerCase().trim();
                const filtered = this.getHistoryOrders().filter(o =>
                    (o.invoice_code && o.invoice_code.toLowerCase().includes(keyword)) ||
                    (o.customer_phone && o.customer_phone.includes(keyword)) ||
                    (o.customer_name && o.customer_name.toLowerCase().includes(keyword))
                );
                this.view.updateTable(filtered);
            });
        }

        // Click xem chi tiết & xác nhận
        container.addEventListener('click', (e) => {
            const confirmOrder = e.target.closest('.btn-confirm-bot-order');
            if (confirmOrder) {
                void this.confirmBotOrder(confirmOrder);
                return;
            }

            const confirmPaymentBtn = e.target.closest('.btn-confirm-payment') || e.target.closest('#btn-modal-confirm-payment');
            if (confirmPaymentBtn) {
                void this.confirmOrderPayment(confirmPaymentBtn);
                return;
            }

            const btnView = e.target.closest('.btn-view-invoice');
            if (btnView) {
                const id = parseInt(btnView.dataset.id);
                const order = [...this.orderModel.orders, ...this.orderModel.pendingBotOrders].find(o => Number(o.id) === id);
                if (order) {
                    this.activeOrder = order;
                    this.view.showModal(order);
                }
            }

            // Đóng Modal
            const btnClose = e.target.closest('#btn-close-modal');
            if (btnClose || (e.target.id === 'invoice-modal')) {
                this.view.hideModal();
                this.activeOrder = null;
            }

            // In lại
            const btnReprint = e.target.closest('#btn-reprint');
            if (btnReprint) {
                if (this.activeOrder) {
                    this.printReceipt(this.activeOrder);
                }
            }
        });
    }

    async confirmBotOrder(button) {
        const orderId = Number(button.dataset.id);
        const order = [...this.orderModel.orders, ...this.orderModel.pendingBotOrders].find((item) => Number(item.id) === orderId);
        if (!order || !window.confirm(`Xác nhận đơn #${orderId} của ${order.customer_name || 'khách hàng'}? Đơn sẽ chuyển sang đang chuẩn bị và khách nhận thông báo qua Bot. Thao tác này chưa xác nhận đã thu tiền.`)) return;

        button.disabled = true;
        button.textContent = 'Đang xác nhận...';
        try {
            const result = await this.orderModel.confirmBotOrder(orderId);
            if (!result.data?.success) throw new Error(result.data?.message || 'Không xác nhận được đơn hàng.');
            try {
                await this.orderModel.fetchOrders('full');
            } catch (refreshError) {
                console.error('Đơn đã xác nhận nhưng chưa tải lại lịch sử được:', refreshError);
                const confirmedOrder = this.orderModel.orders.find((item) => Number(item.id) === orderId) || order;
                confirmedOrder.status = 'processing';
                confirmedOrder.invoice_code = result.data.data?.invoice_code || confirmedOrder.invoice_code;
                if (!this.orderModel.orders.some((item) => Number(item.id) === orderId)) this.orderModel.orders.unshift(confirmedOrder);
            }
            try {
                await this.orderModel.fetchPendingBotOrders();
            } catch (refreshError) {
                console.error('Đơn đã xác nhận nhưng chưa tải lại hàng đợi Bot được:', refreshError);
                this.orderModel.pendingBotOrders = this.orderModel.pendingBotOrders.filter((item) => Number(item.id) !== orderId);
            }
            const keyword = this.view.container.querySelector('#search-order')?.value.toLowerCase().trim() || '';
            const filtered = this.getHistoryOrders().filter((item) =>
                (item.invoice_code && item.invoice_code.toLowerCase().includes(keyword)) ||
                (item.customer_phone && item.customer_phone.includes(keyword)) ||
                (item.customer_name && item.customer_name.toLowerCase().includes(keyword)));
            this.view.updateTable(filtered);
            this.view.updatePendingBotOrders(this.orderModel.pendingBotOrders);
            window.alert(`Đã xác nhận đơn và tạo hóa đơn ${result.data.data?.invoice_code || ''}. Khách sẽ nhận thông báo trong Bot.`);
        } catch (error) {
            window.alert(error.message || 'Không xác nhận được đơn hàng.');
            button.disabled = false;
            button.textContent = 'Xác nhận đơn';
        }
    }

    async confirmOrderPayment(button) {
        const orderId = Number(button.dataset.id);
        const order = [...this.orderModel.orders, ...this.orderModel.pendingBotOrders].find((item) => Number(item.id) === orderId);
        if (!order) return;
        const invoiceCode = order.invoice_code || `đơn #${orderId}`;
        const total = this.view.formatMoney(order.total_amount);
        if (!window.confirm(`Xác nhận đã thu ${total} cho ${invoiceCode} và hoàn tất đơn hàng? Thao tác này sẽ ghi nhận doanh thu vào Sổ quỹ và gửi hóa đơn hoàn tất cho khách.`)) return;

        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Đang xử lý...';
        try {
            const result = await this.orderModel.confirmOrderPayment(orderId);
            if (!result.data?.success) throw new Error(result.data?.message || 'Không thể xác nhận thanh toán.');
            await this.orderModel.fetchOrders('full');
            const keyword = this.view.container.querySelector('#search-order')?.value.toLowerCase().trim() || '';
            const filtered = this.getHistoryOrders().filter((item) =>
                (item.invoice_code && item.invoice_code.toLowerCase().includes(keyword)) ||
                (item.customer_phone && item.customer_phone.includes(keyword)) ||
                (item.customer_name && item.customer_name.toLowerCase().includes(keyword)));
            this.view.updateTable(filtered);
            if (this.activeOrder && Number(this.activeOrder.id) === orderId) {
                const updated = this.orderModel.orders.find(o => Number(o.id) === orderId);
                if (updated) {
                    this.activeOrder = updated;
                    this.view.showModal(updated);
                } else {
                    this.view.hideModal();
                }
            }
            window.alert(`Đã xác nhận thanh toán ${total} cho hóa đơn ${result.data.data?.invoice_code || invoiceCode}. Đơn hàng chuyển sang Hoàn tất.`);
        } catch (error) {
            window.alert(error.message || 'Không thể xác nhận thanh toán.');
            button.disabled = false;
            button.textContent = originalText;
        }
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
                    <td style="text-align: right;">${this.view.formatMoney(item.unit_price * item.quantity)}</td>
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
                    <p style="margin: 0; font-weight: bold; font-size: 14px;">Số tiền: ${this.view.formatMoney(order.total_amount)}</p>
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
                        ${order.shipping_fee ? `
                        <tr>
                            <td>Phí giao hàng:</td>
                            <td style="text-align: right;">${this.view.formatMoney(order.shipping_fee)}</td>
                        </tr>` : ''}
                        <tr>
                            <td><strong>TỔNG CỘNG:</strong></td>
                            <td style="text-align: right;"><strong>${this.view.formatMoney(order.total_amount)}</strong></td>
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
