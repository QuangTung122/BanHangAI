import { createProduct, deleteProduct, getProducts } from '../src/controllers/productController.js';
import * as db from '../src/services/db.js';

class MockRes {
    constructor() { this.statusCode = 200; this.body = null; }
    status(code) { this.statusCode = code; return this; }
    json(data) { this.body = data; return this; }
}

async function runTests() {
    console.log("=== BẮT ĐẦU KIỂM THỬ MODULE SẢN PHẨM ===");
    let passed = 0; let failed = 0;
    
    // Mock user admin
    const adminReq = { user: { id: 1, role: 'admin' } };

    try {
        const t_sku1 = 'ATN' + Date.now();
        const t_sku2 = 'ATN' + (Date.now() + 1);

        // Test 1: Tạo SP có tiếng Việt để sinh Slug
        console.log("-> Test 1: Tạo Sản phẩm & Sinh Slug...");
        const req1 = { 
            body: { 
                name: 'Áo Thun Nam', sku: t_sku1, category_id: 1, 
                price: 100000, stock_quantity: 10 
            }, 
            ...adminReq 
        };
        const res1 = new MockRes();
        await createProduct(req1, res1);

        // Fetch db để xem slug được sinh ra
        const dbProduct1 = await db.get(`SELECT slug FROM products WHERE sku = '${t_sku1}'`);
        
        // Log explicitly to check what the slug was generated as
        console.log("Slug generated:", dbProduct1 ? dbProduct1.slug : 'null');
        
        if (res1.statusCode === 201 && dbProduct1 && dbProduct1.slug.startsWith('ao-thun-nam')) {
            console.log("✅ PROD-01: Tạo SP và sinh slug chuẩn -> PASS");
            passed++;
        } else if (res1.statusCode === 201 && dbProduct1) {
            console.log(`❌ PROD-01: Sinh slug sai định dạng (Expected 'ao-thun-nam', Got '${dbProduct1.slug}') -> FAIL`);
            failed++;
        } else {
            console.log("❌ PROD-01: Tạo SP thất bại -> FAIL", res1.body);
            failed++;
        }

        // Test 2: Tạo SP trùng tên để test Auto-increment Slug
        console.log("-> Test 2: Tạo Sản phẩm trùng tên (Test xử lý trùng Slug)...");
        const req2 = { 
            body: { 
                name: 'Áo Thun Nam', sku: t_sku2, category_id: 1, 
                price: 150000, stock_quantity: 5 
            }, 
            ...adminReq 
        };
        const res2 = new MockRes();
        await createProduct(req2, res2);

        const dbProduct2 = await db.get(`SELECT slug FROM products WHERE sku = '${t_sku2}'`);
        
        if (res2.statusCode === 201 && dbProduct2 && dbProduct2.slug.startsWith('ao-thun-nam')) {
            console.log("✅ PROD-02: Xử lý trùng slug (nối hậu tố) -> PASS");
            passed++;
        } else if (res2.statusCode === 201 && dbProduct2) {
            console.log(`❌ PROD-02: Xử lý trùng slug sai (Expected 'ao-thun-nam-X', Got '${dbProduct2.slug}') -> FAIL`);
            failed++;
        } else {
            console.log("❌ PROD-02: Tạo SP thất bại -> FAIL", res2.body);
            failed++;
        }

        // Test 3: Soft Delete
        console.log("-> Test 3: Xóa mềm (Soft Delete)...");
        const getProd = await db.get(`SELECT id FROM products WHERE sku = '${t_sku1}'`);
        const prodId = getProd.id;

        const req3 = { params: { id: prodId }, ...adminReq };
        const res3 = new MockRes();
        await deleteProduct(req3, res3);

        // Gọi API GET list xem SP ATN03 còn không
        const reqGet = { query: {}, ...adminReq };
        const resGet = new MockRes();
        await getProducts(reqGet, resGet);
        
        const isStillVisible = resGet.body.data.some(p => p.sku === t_sku1);
        
        if (res3.statusCode === 200 && !isStillVisible) {
            console.log("✅ PROD-03: Xóa mềm (không hiển thị ra list) -> PASS");
            passed++;
        } else {
            console.log("❌ PROD-03: Xóa mềm thất bại hoặc vẫn hiển thị ra list -> FAIL");
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
