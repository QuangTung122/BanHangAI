export default class CartModel {
    constructor() {
        // Mỗi item: { product, quantity }
        this.items = [];
    }

    addItem(product) {
        const exist = this.items.find(item => item.product.id === product.id);
        if (exist) {
            if (exist.quantity < product.stock_quantity) {
                exist.quantity += 1;
            } else {
                return { success: false, message: 'Vượt quá số lượng tồn kho' };
            }
        } else {
            if (product.stock_quantity > 0) {
                this.items.push({ product, quantity: 1 });
            } else {
                return { success: false, message: 'Sản phẩm đã hết hàng' };
            }
        }
        return { success: true };
    }

    updateQuantity(productId, newQty) {
        const item = this.items.find(i => i.product.id === productId);
        if (item) {
            if (newQty <= 0) {
                this.removeItem(productId);
            } else if (newQty <= item.product.stock_quantity) {
                item.quantity = newQty;
            } else {
                return { success: false, message: 'Vượt quá số lượng tồn kho' };
            }
        }
        return { success: true };
    }

    removeItem(productId) {
        this.items = this.items.filter(i => i.product.id !== productId);
    }

    clearCart() {
        this.items = [];
    }

    getDiscountedPrice(product) {
        if (!product.discount_percent) return product.price;
        return product.price * (1 - product.discount_percent / 100);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (this.getDiscountedPrice(item.product) * item.quantity), 0);
    }

    async createOrder(orderData) {
        const { default: ApiClient } = await import('../core/ApiClient.js');
        const payload = {
            ...orderData,
            total_amount: this.getTotalPrice(),
            items: this.items.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
                unit_price: this.getDiscountedPrice(i.product)
            }))
        };
        return await ApiClient.request('/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}
