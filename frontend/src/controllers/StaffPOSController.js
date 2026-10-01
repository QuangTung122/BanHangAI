import StaffPOSView from '../views/pages/StaffPOSView.js';
import ProductModel from '../models/ProductModel.js';
import CartModel from '../models/CartModel.js';
import ProductService from '../services/ProductService.js';

export default class StaffPOSController {
    constructor() {
        this.view = new StaffPOSView();
        this.productModel = new ProductModel();
        this.cartModel = new CartModel();
        
        this.currentCategory = '';
        this.currentSearch = '';
        this.searchTimeout = null;
        this.bundleTimeout = null;

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
        this.refreshBundleSuggestions();
    }

    bindEvents() {
        const container = this.view.container;
        container.querySelector('#btn-pos-ai-search')?.addEventListener('click', () => this.recommendProducts());
        container.querySelector('#pos-ai-need')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); this.recommendProducts(); }
        });

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

        // Phím tắt (Keyboard Shortcuts)
        this.handleKeydown = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.handleKeydown);

        // Sự kiện trên bảng Sản phẩm (Thêm vào giỏ)
        const productList = container.querySelector('#pos-product-list');
        if (productList) {
            productList.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-add-cart');
                if (btn) {
                    const productId = parseInt(btn.dataset.id);
                    const product = this.productModel.products.find(p => p.id === productId);
                    if (product) {
                        const qtyStr = prompt(`Nhập số lượng cho ${product.name}:`, "1");
                        if (qtyStr !== null) {
                            const qty = parseInt(qtyStr, 10);
                            if (isNaN(qty) || qty <= 0) {
                                alert("Số lượng không hợp lệ!");
                                return;
                            }
                            const res = this.cartModel.addItem(product, qty);
                            if (res.success) {
                                this.updateCart();
                            } else {
                                alert(res.message);
                            }
                        }
                    }
                }
            });
        }

        // Sự kiện trên Giỏ hàng (+, -, xóa, clear, checkout)
        container.addEventListener('click', (e) => {
            const suggestedAdd = e.target.closest('.btn-ai-add-cart, .btn-bundle-add');
            if (suggestedAdd) {
                const productId = Number(suggestedAdd.dataset.id);
                const product = this.productModel.products.find((item) => item.id === productId)
                    || this.suggestedProducts?.find((item) => item.id === productId);
                if (product) {
                    const result = this.cartModel.addItem(product, 1);
                    if (result.success) this.updateCart(); else alert(result.message);
                }
            }
            // Tăng
            const btnPlus = e.target.closest('.btn-qty-plus');
            if (btnPlus) {
                const id = parseInt(btnPlus.dataset.id);
                const item = this.cartModel.items.find(i => i.product.id === id);
                if (item) {
                    const res = this.cartModel.updateQuantity(id, item.quantity + 1);
                    if (!res.success) alert(res.message);
                    this.updateCart();
                }
            }

            // Giảm
            const btnMinus = e.target.closest('.btn-qty-minus');
            if (btnMinus) {
                const id = parseInt(btnMinus.dataset.id);
                const item = this.cartModel.items.find(i => i.product.id === id);
                if (item) {
                    this.cartModel.updateQuantity(id, item.quantity - 1);
                    this.updateCart();
                }
            }

            // Xóa item
            const btnRemove = e.target.closest('.btn-remove-item');
            if (btnRemove) {
                const id = parseInt(btnRemove.dataset.id);
                this.cartModel.removeItem(id);
                this.updateCart();
            }

            // Xóa giỏ hàng
            const btnClear = e.target.closest('#btn-clear-cart');
            if (btnClear) {
                if (this.cartModel.items.length > 0 && confirm('Bạn có chắc muốn xóa sạch giỏ hàng?')) {
                    this.cartModel.clearCart();
                    this.updateCart();
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
        container.querySelector('#pos-down-payment')?.addEventListener('input', () => this.calculateInstallment());
    }

    calculateInstallment() {
        const total = this.cartModel.getTotalPrice();
        if (total === 0) return;

        const termSelect = this.view.container.querySelector('#pos-installment-term');
        const downPayment = Math.min(total, Math.max(0, Number(this.view.container.querySelector('#pos-down-payment')?.value) || 0));
        this.view.container.querySelector('#pos-inst-down').innerText = this.view.formatMoney(downPayment);
        this.view.container.querySelector('#pos-inst-financed').innerText = this.view.formatMoney(total - downPayment);
    }

    updateCart() {
        this.view.updateCart(this.cartModel.items, this.cartModel.getTotalPrice());
        this.refreshBundleSuggestions();
    }

    async recommendProducts() {
        const input = this.view.container.querySelector('#pos-ai-need');
        const need = input?.value.trim() || '';
        if (need.length < 3) { alert('Vui lòng mô tả nhu cầu khách ít nhất 3 ký tự.'); return; }
        const button = this.view.container.querySelector('#btn-pos-ai-search');
        button.disabled = true;
        this.view.renderPosRecommendations(null, true);
        try {
            const response = await ProductService.getPosRecommendations(need);
            if (response.data?.success) {
                this.suggestedProducts = response.data.data.products || [];
                this.view.renderPosRecommendations(response.data.data);
            }
            else this.view.renderPosRecommendations({ explanation: response.data?.message || 'Không thể tạo gợi ý.' });
        } catch (error) {
            console.error('POS recommendation failed:', error);
            this.view.renderPosRecommendations({ explanation: 'Không kết nối được dịch vụ gợi ý. Có thể tiếp tục tìm sản phẩm bằng bộ lọc thường.' });
        } finally { button.disabled = false; }
    }

    refreshBundleSuggestions() {
        clearTimeout(this.bundleTimeout);
        const ids = this.cartModel.items.map((item) => item.product.id);
        if (!ids.length) { this.view.renderBundleSuggestions([]); return; }
        this.bundleTimeout = setTimeout(async () => {
            this.view.renderBundleSuggestions([], true);
            try {
                const response = await ProductService.getBundleSuggestions(ids);
                const products = response.data?.data?.products || [];
                this.suggestedProducts = [...(this.suggestedProducts || []), ...products.filter((product) => !(this.suggestedProducts || []).some((known) => known.id === product.id))];
                this.view.renderBundleSuggestions(products);
            } catch (error) {
                console.warn('Bundle suggestions unavailable:', error);
                this.view.renderBundleSuggestions([]);
            }
        }, 250);
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
        
        let cccd = null, term = null, qrAmount = this.cartModel.getTotalPrice();
        let financePartner = null, financeReference = null, downPayment = 0;

        if (paymentType === 'installment') {
            cccd = this.view.container.querySelector('#pos-customer-cccd').value.trim();
            term = parseInt(this.view.container.querySelector('#pos-installment-term').value);
            financePartner = this.view.container.querySelector('#pos-finance-partner').value;
            financeReference = this.view.container.querySelector('#pos-finance-reference').value.trim();
            downPayment = Number(this.view.container.querySelector('#pos-down-payment').value || 0);
            
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
            const total = this.cartModel.getTotalPrice();
            if (!Number.isSafeInteger(downPayment) || downPayment < 0 || downPayment >= total) {
                alert('Tiền khách trả trước phải nhỏ hơn tổng hóa đơn để còn khoản tài chính giải ngân.');
                return;
            }
            qrAmount = downPayment;
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
            finance_partner: financePartner,
            finance_application_code: financeReference,
            down_payment: downPayment
        };

        const btn = this.view.container.querySelector('#btn-checkout');
        btn.innerText = 'Đang xử lý...';
        btn.disabled = true;

        try {
            const { data } = await this.cartModel.createOrder(orderData);
            if (data && data.success) {
                const savedOrder = data.data;
                const invoiceCode = savedOrder.invoice_code;
                const dateStr = new Date(savedOrder.created_at).toLocaleString('vi-VN');
                orderData.total_amount = savedOrder.total_amount;
                orderData.down_payment = savedOrder.down_payment ?? downPayment;
                orderData.financed_amount = savedOrder.financed_amount;
                orderData.finance_partner = savedOrder.finance_partner || financePartner;
                orderData.finance_application_code = savedOrder.finance_application_code;
                orderData.items = savedOrder.items;
                const confirmedPayment = paymentType === 'installment' ? (savedOrder.down_payment || 0) : savedOrder.total_amount;
                
                // Render HTML Hóa đơn
                this.printReceipt(invoiceCode, dateStr, orderData, receiptType, confirmedPayment);
                
                // Clear giỏ hàng & form
                this.cartModel.clearCart();
                this.updateCart();
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
        if ((receiptType === 'transfer' || receiptType === 'Chuyển khoản ngân hàng') && Number(qrAmount) > 0) {
            const bankId = 'MB'; // Demo bank
            const accNo = '0123456789';
            const accName = 'ECOM AI SYSTEM';
            // Compact template with URL encoded parameters
            const qrUrl = `https://img.vietqr.io/image/${bankId}-${accNo}-compact.png?amount=${Math.round(qrAmount)}&addInfo=${encodeURIComponent(invoiceCode)}&accountName=${encodeURIComponent(accName)}`;
            qrHtml = `
                <div style="text-align: center; margin: 15px 0; border: 1px dashed #000; padding: 10px;">
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Quét mã QR để thanh toán tại cửa hàng</p>
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
                    <p style="font-weight: bold; text-align: center; margin: 0 0 5px 0;">HỒ SƠ TÀI CHÍNH (MÔ PHỎNG)</p>
                    <table style="width: 100%; font-size: 12px;">
                        <tr><td>Khách hàng:</td><td style="text-align: right;">${orderData.customer_name}</td></tr>
                        <tr><td>Đối tác:</td><td style="text-align: right;">${orderData.finance_partner}</td></tr>
                        <tr><td>Mã hồ sơ:</td><td style="text-align: right;">${orderData.finance_application_code}</td></tr>
                        <tr><td>CCCD:</td><td style="text-align: right;">${maskedCCCD}</td></tr>
                        <tr><td>Kỳ hạn đăng ký:</td><td style="text-align: right;">${orderData.installment_term} tháng</td></tr>
                        <tr><td>Khách trả tại quầy:</td><td style="text-align: right;">${this.view.formatMoney(orderData.down_payment)}</td></tr>
                        <tr><td>Đối tác giải ngân demo:</td><td style="text-align: right;">${this.view.formatMoney(orderData.financed_amount)}</td></tr>
                    </table>
                    <p style="font-size: 10px;">Kỳ thanh toán và nghĩa vụ vay do khách hàng thực hiện theo hợp đồng với bên cho vay.</p>
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
        const receiptItems = Array.isArray(orderData.items)
            ? orderData.items
            : this.cartModel.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.discount_percent
                    ? item.product.price * (1 - item.product.discount_percent / 100)
                    : item.product.price
            }));
        receiptItems.forEach(item => {
            itemsHtml += `
                <tr>
                    <td style="padding: 4px 0;">${item.name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${this.view.formatMoney(item.unit_price * item.quantity)}</td>
                </tr>
            `;
        });

        const totalAmt = orderData.total_amount ?? this.cartModel.getTotalPrice();

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

    handleKeydown(e) {
        // Chỉ bắt phím tắt khi không gõ trong các input khác (ngoại trừ ô tìm kiếm pos-search)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            if (e.target.id !== 'pos-search') return;
        }
        
        if (e.key === 'F1') {
            e.preventDefault();
            this.handleCheckout();
        } else if (e.key === 'F2') {
            e.preventDefault();
            const searchInput = this.view.container.querySelector('#pos-search');
            if (searchInput) searchInput.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (this.cartModel.items.length > 0 && confirm('Bạn có chắc muốn xóa sạch giỏ hàng?')) {
                this.cartModel.clearCart();
                this.updateCart();
            }
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        clearTimeout(this.bundleTimeout);
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
