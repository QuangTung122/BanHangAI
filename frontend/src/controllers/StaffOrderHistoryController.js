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
            await this.orderModel.fetchOrders('full'); // Chỉ lấy đơn trả thẳng
        } catch (error) {
            console.error('Không thể kết nối đến Backend Server:', error);
        }

        this.view.render(this.orderModel.orders);
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        // Tìm kiếm
        const searchInput = container.querySelector('#search-order');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.toLowerCase().trim();
                const filtered = this.orderModel.orders.filter(o => 
                    (o.invoice_code && o.invoice_code.toLowerCase().includes(keyword)) ||
                    (o.customer_phone && o.customer_phone.includes(keyword))
                );
                this.view.updateTable(filtered);
            });
        }

        // Click xem chi tiết
        container.addEventListener('click', (e) => {
            const btnView = e.target.closest('.btn-view-invoice');
            if (btnView) {
                const id = parseInt(btnView.dataset.id);
                const order = this.orderModel.orders.find(o => o.id === id);
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
