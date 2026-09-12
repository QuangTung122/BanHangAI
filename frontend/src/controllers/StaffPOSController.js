import StaffPOSView from '../views/pages/StaffPOSView.js';
import ProductModel from '../models/ProductModel.js';
import CartModel from '../models/CartModel.js';

export default class StaffPOSController {
    constructor() {
        this.view = new StaffPOSView();
        this.productModel = new ProductModel();
        this.cartModel = new CartModel();
        
        this.currentCategory = '';
        this.currentSearch = '';
        this.searchTimeout = null;

        this.init();
    }

    async init() {
        try {
            // Tải danh mục và sản phẩm
            await Promise.all([
                this.productModel.fetchCategories(),
                this.productModel.fetchProducts()
            ]);
        } catch (error) {
            console.error('Không thể kết nối đến Backend Server:', error);
            // Vẫn tiếp tục để render giao diện trống thay vì trắng trang
        }

        this.view.render(
            this.productModel.categories,
            this.productModel.products,
            this.cartModel.items,
            this.cartModel.getTotalPrice()
        );

        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        // Ô tìm kiếm (Debounce)
        const searchInput = container.querySelector('#pos-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.reloadProducts();
                }, 300);
            });
        }

        // Chọn Danh mục
        const categoriesContainer = container.querySelector('#pos-categories');
        if (categoriesContainer) {
            categoriesContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.cat-btn');
                if (btn) {
                    this.currentCategory = btn.dataset.slug || '';
                    this.view.updateActiveCategory(this.currentCategory);
                    this.reloadProducts();
                }
            });
        }

        // Sự kiện trên bảng Sản phẩm (Thêm vào giỏ)
        const productList = container.querySelector('#pos-product-list');
        if (productList) {
            productList.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-add-cart');
                if (btn) {
                    const productId = parseInt(btn.dataset.id);
                    const product = this.productModel.products.find(p => p.id === productId);
                    if (product) {
                        const res = this.cartModel.addItem(product);
                        if (res.success) {
                            this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
                        } else {
                            alert(res.message);
                        }
                    }
                }
            });
        }

        // Sự kiện trên Giỏ hàng (+, -, xóa, clear, checkout)
        container.addEventListener('click', (e) => {
            // Tăng
            const btnPlus = e.target.closest('.btn-qty-plus');
            if (btnPlus) {
                const id = parseInt(btnPlus.dataset.id);
                const item = this.cartModel.items.find(i => i.product.id === id);
                if (item) {
                    const res = this.cartModel.updateQuantity(id, item.quantity + 1);
                    if (!res.success) alert(res.message);
                    this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
                }
            }

            // Giảm
            const btnMinus = e.target.closest('.btn-qty-minus');
            if (btnMinus) {
                const id = parseInt(btnMinus.dataset.id);
                const item = this.cartModel.items.find(i => i.product.id === id);
                if (item) {
                    this.cartModel.updateQuantity(id, item.quantity - 1);
                    this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
                }
            }

            // Xóa item
            const btnRemove = e.target.closest('.btn-remove-item');
            if (btnRemove) {
                const id = parseInt(btnRemove.dataset.id);
                this.cartModel.removeItem(id);
                this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
            }

            // Xóa giỏ hàng
            const btnClear = e.target.closest('#btn-clear-cart');
            if (btnClear) {
                if (this.cartModel.items.length > 0 && confirm('Bạn có chắc muốn xóa sạch giỏ hàng?')) {
                    this.cartModel.clearCart();
                    this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
                }
            }

            // Thanh toán
            const btnCheckout = e.target.closest('#btn-checkout');
            if (btnCheckout) {
                this.handleCheckout();
            }
        });

        // Xử lý Thay đổi Loại thanh toán
        const paymentTypeSelect = container.querySelector('#pos-payment-type');
        const installmentBox = container.querySelector('#pos-installment-box');
        const nameInput = container.querySelector('#pos-customer-name');
        
        if (paymentTypeSelect && installmentBox) {
            paymentTypeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'installment') {
                    installmentBox.classList.remove('hidden');
                    nameInput.classList.remove('hidden'); // Show name for installment
                    this.calculateInstallment();
                } else {
                    installmentBox.classList.add('hidden');
                    nameInput.classList.add('hidden');
                }
            });
        }

        // Xử lý Thay đổi Kỳ hạn trả góp
        const termSelect = container.querySelector('#pos-installment-term');
        if (termSelect) {
            termSelect.addEventListener('change', () => {
                this.calculateInstallment();
            });
        }
    }

    calculateInstallment() {
        const total = this.cartModel.getTotalPrice();
        if (total === 0) return;

        const termSelect = this.view.container.querySelector('#pos-installment-term');
        const term = parseInt(termSelect.value); // 3, 6, 9, 12
        
        // Tính % Phí theo quy tắc: 3 tháng=2%, 6 tháng=4%, 9 tháng=6%, 12 tháng=8%
        let feePercent = 0.02; 
        if (term === 6) feePercent = 0.04;
        if (term === 9) feePercent = 0.06;
        if (term === 12) feePercent = 0.08;

        const fee = total * feePercent;
        const monthly = (total + fee) / term;

        this.view.container.querySelector('#pos-inst-base').innerText = this.view.formatMoney(total);
        this.view.container.querySelector('#pos-inst-fee').innerText = this.view.formatMoney(fee);
        this.view.container.querySelector('#pos-inst-monthly').innerText = this.view.formatMoney(monthly);
    }

    async handleCheckout() {
        if (this.cartModel.items.length === 0) {
            alert('Giỏ hàng đang trống!');
            return;
        }

        const paymentType = this.view.container.querySelector('#pos-payment-type').value;
        const phone = this.view.container.querySelector('#pos-customer-phone').value.trim();
        const name = this.view.container.querySelector('#pos-customer-name').value.trim();
        const receiptType = this.view.container.querySelector('#pos-receipt-type').value; // Hình thức nhận tiền
        
        let cccd = null, term = null, monthlyFee = null, qrAmount = this.cartModel.getTotalPrice();

        if (paymentType === 'installment') {
            cccd = this.view.container.querySelector('#pos-customer-cccd').value.trim();
            term = parseInt(this.view.container.querySelector('#pos-installment-term').value);
            
            if (!name || !phone || !cccd) {
                alert('Vui lòng nhập đầy đủ Tên, Số điện thoại và CCCD để làm hồ sơ trả góp!');
                return;
            }
            if (!/^[0-9]{10}$/.test(phone)) {
                alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.');
                return;
            }
            if (!/^[0-9]{12}$/.test(cccd)) {
                alert('Số CCCD phải đủ 12 số!');
                return;
            }
            
            // Tính cước hàng tháng để gán vào QR code (khách thanh toán tháng đầu tiên)
            let feePercent = 0.02; 
            if (term === 6) feePercent = 0.04;
            if (term === 9) feePercent = 0.06;
            if (term === 12) feePercent = 0.08;
            
            const total = this.cartModel.getTotalPrice();
            const fee = total * feePercent;
            monthlyFee = (total + fee) / term;
            qrAmount = monthlyFee; // Chỉ quét QR số tiền tháng đầu
        } else {
            if (phone && !/^[0-9]{10}$/.test(phone)) {
                alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.');
                return;
            }
        }

        const orderData = {
            payment_type: paymentType,
            payment_method: receiptType,
            customer_name: name,
            customer_phone: phone,
            customer_cccd: cccd,
            installment_term: term,
            monthly_fee: monthlyFee
        };

        const btn = this.view.container.querySelector('#btn-checkout');
        btn.innerText = 'Đang xử lý...';
        btn.disabled = true;

        try {
            const { data } = await this.cartModel.createOrder(orderData);
            if (data && data.success) {
                const invoiceCode = data.data.invoice_code;
                const dateStr = new Date(data.data.created_at).toLocaleString('vi-VN');
                
                // Render HTML Hóa đơn
                this.printReceipt(invoiceCode, dateStr, orderData, receiptType, qrAmount);
                
                // Clear giỏ hàng & form
                this.cartModel.clearCart();
                this.view.updateCart(this.cartModel.items, 0);
                this.view.container.querySelector('#pos-customer-name').value = '';
                this.view.container.querySelector('#pos-customer-phone').value = '';
                this.view.container.querySelector('#pos-customer-cccd').value = '';
            } else {
                alert(data?.message || 'Lỗi khi tạo đơn hàng');
            }
        } catch (err) {
            alert('Có lỗi xảy ra kết nối Server');
        } finally {
            btn.innerHTML = `Thanh toán & In hóa đơn
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`;
            btn.disabled = false;
        }
    }

    printReceipt(invoiceCode, dateStr, orderData, receiptType, qrAmount) {
        const iframe = document.getElementById('print-frame');
        if (!iframe) return;
        
        const doc = iframe.contentWindow.document;
        doc.open();
        
        // Generate VietQR URL if Bank Transfer is selected
        let qrHtml = '';
        if (receiptType === 'transfer' || receiptType === 'Chuyển khoản ngân hàng') {
            const bankId = 'MB'; // Demo bank
            const accNo = '0123456789';
            const accName = 'ECOM AI SYSTEM';
            // Compact template with URL encoded parameters
            const qrUrl = `https://img.vietqr.io/image/${bankId}-${accNo}-compact.png?amount=${Math.round(qrAmount)}&addInfo=${encodeURIComponent(invoiceCode)}&accountName=${encodeURIComponent(accName)}`;
            qrHtml = `
                <div style="text-align: center; margin: 15px 0; border: 1px dashed #000; padding: 10px;">
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Quét mã QR để thanh toán</p>
                    <img src="${qrUrl}" style="width: 200px; height: 200px;" />
                    <p style="margin: 5px 0 0 0; font-size: 12px;">Nội dung: ${invoiceCode}</p>
                    <p style="margin: 0; font-weight: bold; font-size: 14px;">Số tiền: ${this.view.formatMoney(qrAmount)}</p>
                </div>
            `;
        }

        // Installment Details HTML
        let instHtml = '';
        if (orderData.payment_type === 'installment') {
            const maskedCCCD = orderData.customer_cccd.slice(0, 3) + '******' + orderData.customer_cccd.slice(-3);
            instHtml = `
                <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
                    <p style="font-weight: bold; text-align: center; margin: 0 0 5px 0;">THÔNG TIN TRẢ GÓP</p>
                    <table style="width: 100%; font-size: 12px;">
                        <tr><td>Khách hàng:</td><td style="text-align: right;">${orderData.customer_name}</td></tr>
                        <tr><td>Điện thoại:</td><td style="text-align: right;">${orderData.customer_phone}</td></tr>
                        <tr><td>Số CCCD:</td><td style="text-align: right;">${maskedCCCD}</td></tr>
                        <tr><td>Kỳ hạn:</td><td style="text-align: right;">${orderData.installment_term} tháng</td></tr>
                        <tr><td><strong>Cước mỗi tháng:</strong></td><td style="text-align: right;"><strong>${this.view.formatMoney(orderData.monthly_fee)}</strong></td></tr>
                    </table>
                </div>
            `;
        } else if (orderData.customer_name || orderData.customer_phone) {
            const cName = orderData.customer_name || 'Khách lẻ';
            const cPhone = orderData.customer_phone || '';
            instHtml = `
                <div style="margin-top: 10px; font-size: 12px;">
                    <p style="margin: 2px 0;">Khách hàng: ${cName} ${cPhone ? '- ' + cPhone : ''}</p>
                </div>
            `;
        }

        // Items HTML
        let itemsHtml = '';
        this.cartModel.items.forEach(item => {
            const unitPrice = item.product.discount_percent 
                ? item.product.price * (1 - item.product.discount_percent / 100) 
                : item.product.price;
            itemsHtml += `
                <tr>
                    <td style="padding: 4px 0;">${item.product.name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${this.view.formatMoney(unitPrice * item.quantity)}</td>
                </tr>
            `;
        });

        const totalAmt = this.cartModel.getTotalPrice();

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
                    <p>Mã HĐ: ${invoiceCode}</p>
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
                            <td style="text-align: right;"><strong>${this.view.formatMoney(totalAmt)}</strong></td>
                        </tr>
                    </table>
                </div>

                ${qrHtml}

                <div class="center" style="margin-top: 20px;">
                    <p>Cảm ơn quý khách đã mua sắm!</p>
                    <p>Hẹn gặp lại</p>
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

    async reloadProducts() {
        await this.productModel.fetchProducts(this.currentCategory, this.currentSearch);
        this.view.updateProductList(this.productModel.products);
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
