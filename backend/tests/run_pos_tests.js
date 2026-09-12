import { createOrder } from '../src/controllers/orderController.js';
import * as db from '../src/services/db.js';

// Mock Response object
class MockRes {
    constructor() {
        this.statusCode = 200;
        this.body = null;
    }
    status(code) {
        this.statusCode = code;
        return this;
    }
    json(data) {
        this.body = data;
        return this;
    }
}

async function runTests() {
    console.log("=== BẮT ĐẦU THỰC THI KIỂM THỬ TỰ ĐỘNG ===");
    let passed = 0;
    let failed = 0;

    // Chuẩn bị dữ liệu mock
    const mockUserId = 1;

    // Test Case 1: Lỗi giỏ hàng trống (Mô phỏng validate từ controller, dù hiện tại controller không check items.length, ta thử xem)
    try {
        const req1 = { body: { items: [], total_amount: 0 }, user: { id: mockUserId } };
        const res1 = new MockRes();
        
        // Wait, controller tries to loop over items. If empty, it might succeed or fail. Let's see.
        // Actually, orderController doesn't validate empty items, but let's test it.
        await createOrder(req1, res1);
        if (res1.statusCode === 201) {
            console.log("❌ POS-UI-01: Thanh toán khi giỏ hàng trống -> FAIL (Controller không báo lỗi, tạo đơn rỗng)");
            failed++;
        } else {
            console.log("✅ POS-UI-01: Thanh toán khi giỏ hàng trống -> PASS");
            passed++;
        }
    } catch (e) {
        console.log("✅ POS-UI-01: Thanh toán khi giỏ hàng trống -> PASS (Có ném lỗi: " + e.message + ")");
        passed++;
    }

    // Test Case 2: Đơn trả thẳng thành công
    try {
        const req2 = { 
            body: { 
                items: [{ product_id: 1, quantity: 1, unit_price: 1000 }], 
                total_amount: 1000,
                payment_type: 'full',
                payment_method: 'cash',
                customer_name: 'Test Khach',
                customer_phone: '0901234567'
            }, 
            user: { id: mockUserId } 
        };
        const res2 = new MockRes();
        await createOrder(req2, res2);
        
        if (res2.statusCode === 201 && res2.body.success) {
            console.log("✅ POS-FULL-01: Bán đứt thành công -> PASS");
            passed++;
        } else {
            console.log("❌ POS-FULL-01: Bán đứt thành công -> FAIL", res2.body);
            failed++;
        }
    } catch (e) {
        console.log("❌ POS-FULL-01: Bán đứt thành công -> FAIL (Exception: " + e.message + ")");
        failed++;
    }

    // Test Case 3: Đơn trả góp thành công
    try {
        const req3 = { 
            body: { 
                items: [{ product_id: 2, quantity: 1, unit_price: 5000 }], 
                total_amount: 5000,
                payment_type: 'installment',
                payment_method: 'transfer',
                customer_name: 'Test Khach 2',
                customer_phone: '0901234567',
                customer_cccd: '012345678912',
                installment_term: 6,
                monthly_fee: 1000
            }, 
            user: { id: mockUserId } 
        };
        const res3 = new MockRes();
        await createOrder(req3, res3);
        
        if (res3.statusCode === 201 && res3.body.success) {
            console.log("✅ POS-INST-02: Tạo đơn trả góp thành công -> PASS");
            passed++;
        } else {
            console.log("❌ POS-INST-02: Tạo đơn trả góp thành công -> FAIL", res3.body);
            failed++;
        }
    } catch (e) {
        console.log("❌ POS-INST-02: Tạo đơn trả góp thành công -> FAIL (Exception: " + e.message + ")");
        failed++;
    }

    console.log("=== TỔNG KẾT ===");
    console.log(`Tổng số test: ${passed + failed}`);
    console.log(`PASS: ${passed}`);
    console.log(`FAIL: ${failed}`);
    process.exit(0);
}

runTests();
