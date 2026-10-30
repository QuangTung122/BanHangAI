import { createOrder, addInstallmentPayment } from '../src/controllers/orderController.js';
import * as db from '../src/services/db.js';

class MockRes {
    constructor() { this.statusCode = 200; this.body = null; }
    status(code) { this.statusCode = code; return this; }
    json(data) { this.body = data; return this; }
}

async function runTests() {
    console.log("=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG MODULE TRẢ GÓP ===");
    let passed = 0; let failed = 0;
    const staffRow = await db.get("SELECT id FROM users WHERE role = 'staff' AND is_active = 1 LIMIT 1");
    const mockUserId = staffRow?.id || 3;
    const mockUser = { id: mockUserId, role: 'staff' };

    try {
        // Setup: Create a new installment order
        const createReq = { 
            body: { 
                items: [{ product_id: 1, quantity: 1, unit_price: 3000 }], 
                total_amount: 3000, payment_type: 'installment', payment_method: 'cash',
                customer_name: 'Test Khach', customer_phone: '0901234567', customer_cccd: '001099001234',
                installment_term: 3, monthly_fee: 1000 
            }, 
            user: mockUser 
        };
        const createRes = new MockRes();
        await createOrder(createReq, createRes);
        const orderId = createRes.body.data.order_id;
        
        console.log(`Đã tạo đơn hàng trả góp ID: ${orderId} (3 kỳ)`);
        
        // Test 1: Thu 1 kỳ
        const req1 = { params: { id: orderId }, body: { pay_all: false, payment_method: 'cash' }, user: { id: mockUserId } };
        const res1 = new MockRes();
        await addInstallmentPayment(req1, res1);
        
        // order created with 1 paid month (kỳ 1 tự động đóng lúc mua). So now it should be 2 paid months.
        if (res1.statusCode === 200 && res1.body.data.paid_months === 2) {
            console.log("✅ INST-01: Thu cước 1 kỳ -> PASS");
            passed++;
        } else {
            console.log("❌ INST-01: Thu cước 1 kỳ -> FAIL", res1.body);
            failed++;
        }

        // Test 2: Tất toán (pay_all)
        const req2 = { params: { id: orderId }, body: { pay_all: true, payment_method: 'transfer' }, user: { id: mockUserId } };
        const res2 = new MockRes();
        await addInstallmentPayment(req2, res2);
        
        if (res2.statusCode === 200 && res2.body.data.paid_months === 3) {
            console.log("✅ INST-02: Thu tất toán (pay_all) -> PASS");
            passed++;
        } else {
            console.log("❌ INST-02: Thu tất toán (pay_all) -> FAIL", res2.body);
            failed++;
        }

        // Test 3: Thu cước khi đã tất toán
        const req3 = { params: { id: orderId }, body: { pay_all: false, payment_method: 'cash' }, user: { id: mockUserId } };
        const res3 = new MockRes();
        await addInstallmentPayment(req3, res3);
        
        if (res3.statusCode === 400) { // Expecting "Khách hàng đã thanh toán đủ các kỳ hạn"
            console.log("✅ INST-ERR-01: Thu cước đơn đã tất toán bị chặn -> PASS");
            passed++;
        } else {
            console.log("❌ INST-ERR-01: Thu cước đơn đã tất toán bị chặn -> FAIL (Backend cho phép thu lố)", res3.body);
            failed++;
        }
        
    } catch (e) {
        console.error("LỖI KỊCH BẢN TEST:", e);
    }

    console.log("=== TỔNG KẾT ===");
    console.log(`PASS: ${passed}`);
    console.log(`FAIL: ${failed}`);
    process.exit(0);
}

runTests();
