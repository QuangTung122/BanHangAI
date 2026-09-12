import { getSummary, createTransaction, collectFromStaff } from '../src/controllers/transactionController.js';
import * as db from '../src/services/db.js';

class MockRes {
    constructor() { this.statusCode = 200; this.body = null; }
    status(code) { this.statusCode = code; return this; }
    json(data) { this.body = data; return this; }
}

async function runTests() {
    console.log("=== BẮT ĐẦU KIỂM THỬ SỔ QUỸ (CASHFLOW) ===");
    let passed = 0; let failed = 0;
    const ownerId = 1; // Giả sử id=1 là owner
    const staffId = 2; // Giả sử id=2 là staff

    try {
        // Lấy summary ban đầu
        const resInit = new MockRes();
        await getSummary({ user: { id: ownerId }, query: {} }, resInit);
        const initIncome = resInit.body?.data?.total_income || 0;
        
        // Test 1: Tạo phiếu thu thủ công
        console.log("-> Đang tạo phiếu thu thủ công 500k...");
        const req1 = { 
            body: { type: 'income', amount: 500000, category: 'Khác', description: 'Test', payment_method: 'cash' }, 
            user: { id: ownerId }, query: {}
        };
        const res1 = new MockRes();
        await createTransaction(req1, res1);
        
        // Check Summary lại xem income có tăng 500k không
        const resSum = new MockRes();
        await getSummary({ user: { id: ownerId }, query: {} }, resSum);
        
        if (res1.statusCode === 201 && (resSum.body.data.total_income - initIncome) === 500000) {
            console.log("✅ CASH-01: Lập phiếu thu manual cập nhật đúng Summary -> PASS");
            passed++;
        } else {
            console.log("❌ CASH-01: Lập phiếu thu manual -> FAIL", resSum.body.data);
            failed++;
        }

        // Test 2: Bàn giao tiền (Collect)
        // Đầu tiên tạo 1 giao dịch tiền mặt do staff bán (để staff có quỹ)
        await db.run("INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source) VALUES ('income', 1000000, 'Bán hàng', 'Test', ?, 'cash', 'auto')", [staffId]);
        
        const resSumBefore = new MockRes();
        await getSummary({ user: { id: ownerId }, query: {} }, resSumBefore);
        let staffCashBefore = 0;
        if(resSumBefore.body?.data?.cash_breakdown && resSumBefore.body.data.cash_breakdown.counters) {
            const counter = resSumBefore.body.data.cash_breakdown.counters.find(c => c.user_id === staffId);
            if(counter) staffCashBefore = counter.amount;
        }
        
        console.log(`-> Quỹ nhân viên (id=${staffId}) trước thu: ${staffCashBefore}`);
        
        const reqCollect = { body: { staff_id: staffId, amount: staffCashBefore }, user: { id: ownerId }, query: {} };
        const resCollect = new MockRes();
        await collectFromStaff(reqCollect, resCollect);
        
        const resSumAfter = new MockRes();
        await getSummary({ user: { id: ownerId }, query: {} }, resSumAfter);
        let staffCashAfter = 0;
        if(resSumAfter.body.data.cash_breakdown && resSumAfter.body.data.cash_breakdown.counters) {
            const counter = resSumAfter.body.data.cash_breakdown.counters.find(c => c.user_id === staffId);
            if(counter) staffCashAfter = counter.amount;
        }

        if (resCollect.statusCode === 200 && staffCashAfter === 0) {
            console.log("✅ CASH-02: Bàn giao tiền (Owner thu tiền mặt từ Staff) -> PASS");
            passed++;
        } else {
            console.log("❌ CASH-02: Bàn giao tiền -> FAIL (Quỹ NV còn dư hoặc API lỗi)", { staffCashAfter, resBody: resCollect.body });
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
