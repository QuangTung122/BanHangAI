import { updateWage, getUsers } from '../src/controllers/userController.js';
import * as db from '../src/services/db.js';

class MockRes {
    constructor() { this.statusCode = 200; this.body = null; }
    status(code) { this.statusCode = code; return this; }
    json(data) { this.body = data; return this; }
}

async function runTests() {
    console.log("=== BẮT ĐẦU KIỂM THỬ NHÂN SỰ & CHẤM CÔNG ===");
    let passed = 0; let failed = 0;
    const adminId = 1;
    const staffId = 2; // ID nhân viên để test update lương

    try {
        // Đảm bảo có user 2
        await db.run("DELETE FROM users WHERE id = ?", [staffId]);
        await db.run("DELETE FROM users WHERE username = ?", ['teststaff']);
        await db.run("INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)", [staffId, 'teststaff', 'test', 'staff']);

        // Test 1: Update Lương hợp lệ
        console.log("-> Test Cập nhật lương hợp lệ (25000)...");
        const req1 = { params: { id: staffId }, body: { hourly_wage: 25000 }, user: { id: adminId } };
        const res1 = new MockRes();
        await updateWage(req1, res1);
        
        // Fetch lại xem DB lưu đúng không
        const reqGet = { user: { id: adminId } };
        const resGet = new MockRes();
        await getUsers(reqGet, resGet);
        const updatedUser = resGet.body.data.find(u => u.id === staffId);
        
        console.log("UpdatedUser:", updatedUser);
        if (res1.statusCode === 200 && updatedUser && Number(updatedUser.hourly_wage) === 25000) {
            console.log("✅ STAFF-01: Cập nhật mức lương thành công -> PASS");
            passed++;
        } else {
            console.log("❌ STAFF-01: Cập nhật mức lương -> FAIL", res1.body);
            failed++;
        }

        // Test 2: Update lương số âm (Validate Lương)
        console.log("-> Test Validate Lương (Âm)...");
        const req2 = { params: { id: staffId }, body: { hourly_wage: -5000 }, user: { id: adminId } };
        const res2 = new MockRes();
        await updateWage(req2, res2);
        
        // Lý thuyết: Backend phải chặn số âm và trả về 400
        if (res2.statusCode === 400) {
            console.log("✅ STAFF-02: Chặn lương âm -> PASS");
            passed++;
        } else {
            console.log("❌ STAFF-02: Chặn lương âm -> FAIL (Backend không validate số âm)", res2.body);
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
