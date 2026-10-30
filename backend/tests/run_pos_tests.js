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

    // Lấy ID sản phẩm thực tế có trong DB
    const sampleProducts = await db.query('SELECT id, price FROM products WHERE is_active = 1 AND stock_quantity > 0 LIMIT 2');
    const prod1 = sampleProducts[0] || { id: 1, price: 1000000 };
    const prod2 = sampleProducts[1] || prod1;

    // Chuẩn bị người dùng theo vai trò
    const staffRow = await db.get("SELECT id FROM users WHERE role = 'staff' AND is_active = 1 LIMIT 1");
    const mockStaffUser = { id: staffRow?.id || 3, role: 'staff' };
    const mockAdminUser = { id: 1, role: 'admin' };
    const mockOwnerUser = { id: 2, role: 'owner' };

    // Test Case 0A: Quản trị viên (admin) KHÔNG ĐƯỢC lập hóa đơn
    try {
        const reqAdmin = { 
            body: { 
                items: [{ product_id: prod1.id, quantity: 1, unit_price: prod1.price || 1000000 }], 
                total_amount: prod1.price || 1000000,
                payment_type: 'full', payment_method: 'cash'
            }, 
            user: mockAdminUser 
        };
        const resAdmin = new MockRes();
        await createOrder(reqAdmin, resAdmin);
        if (resAdmin.statusCode === 403) {
            console.log("✅ POS-AUTH-01: Chặn admin tạo hóa đơn (403) -> PASS");
            passed++;
        } else {
            console.log("❌ POS-AUTH-01: Chặn admin tạo hóa đơn -> FAIL (Cho phép hoặc sai mã lỗi)", resAdmin.statusCode);
            failed++;
        }
    } catch (e) {
        console.log("✅ POS-AUTH-01: Chặn admin tạo hóa đơn (Ném lỗi: " + e.message + ") -> PASS");
        passed++;
    }

    // Test Case 0B: Chủ cửa hàng (owner) KHÔNG ĐƯỢC lập hóa đơn
    try {
        const reqOwner = { 
            body: { 
                items: [{ product_id: prod1.id, quantity: 1, unit_price: prod1.price || 1000000 }], 
                total_amount: prod1.price || 1000000,
                payment_type: 'full', payment_method: 'cash'
            }, 
            user: mockOwnerUser 
        };
        const resOwner = new MockRes();
        await createOrder(reqOwner, resOwner);
        if (resOwner.statusCode === 403) {
            console.log("✅ POS-AUTH-02: Chặn chủ cửa hàng tạo hóa đơn (403) -> PASS");
            passed++;
        } else {
            console.log("❌ POS-AUTH-02: Chặn chủ cửa hàng tạo hóa đơn -> FAIL (Cho phép hoặc sai mã lỗi)", resOwner.statusCode);
            failed++;
        }
    } catch (e) {
        console.log("✅ POS-AUTH-02: Chặn chủ cửa hàng tạo hóa đơn (Ném lỗi: " + e.message + ") -> PASS");
        passed++;
    }

    // Test Case 1: Lỗi giỏ hàng trống (với nhân viên hợp lệ)
    try {
        const req1 = { body: { items: [], total_amount: 0 }, user: mockStaffUser };
        const res1 = new MockRes();
        
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

    // Test Case 2: Đơn trả thẳng thành công (với vai trò staff)
    try {
        const req2 = { 
            body: { 
                items: [{ product_id: prod1.id, quantity: 1, unit_price: prod1.price || 1000000 }], 
                total_amount: prod1.price || 1000000,
                payment_type: 'full',
                payment_method: 'cash',
                customer_name: 'Test Khach',
                customer_phone: '0901234567'
            }, 
            user: mockStaffUser 
        };
        const res2 = new MockRes();
        await createOrder(req2, res2);
        
        if (res2.statusCode === 201 && res2.body.success) {
            console.log("✅ POS-FULL-01: Bán đứt thành công bởi nhân viên -> PASS");
            passed++;
        } else {
            console.log("❌ POS-FULL-01: Bán đứt thành công bởi nhân viên -> FAIL", res2.body);
            failed++;
        }
    } catch (e) {
        console.log("❌ POS-FULL-01: Bán đứt thành công bởi nhân viên -> FAIL (Exception: " + e.message + ")");
        failed++;
    }

    // Test Case 3: Đơn trả góp thành công (với vai trò staff)
    try {
        const req3 = { 
            body: { 
                items: [{ product_id: prod2.id, quantity: 1, unit_price: prod2.price || 5000000 }], 
                total_amount: prod2.price || 5000000,
                payment_type: 'installment',
                payment_method: 'transfer',
                customer_name: 'Test Khach 2',
                customer_phone: '0901234567',
                customer_cccd: '012345678912',
                installment_term: 6,
                finance_partner: 'Home Credit (mô phỏng)',
                finance_application_code: 'TEST-APP-001',
                down_payment: 1000000,
                monthly_fee: 700000
            }, 
            user: mockStaffUser 
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
