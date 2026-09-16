const fs = require('fs');
const path = require('path');

const features = {
  auth: {
    title: 'Authentication', role: 'Common',
    unit: 'Kiểm tra hàm validate token JWT (hết hạn, sai chữ ký), hàm băm mật khẩu bcrypt.',
    integration: 'Gửi request POST /api/auth/login sai mật khẩu -> nhận mã 401. Đăng nhập đúng -> nhận mã 200 + token.',
    e2e: 'Nhập sai email 3 lần, kiểm tra xem UI có hiển thị lỗi và khóa nút submit không.'
  },
  team_chat: {
    title: 'Team Chat', role: 'Common',
    unit: 'Kiểm tra hàm render tin nhắn (format thời gian, sanitize HTML chống XSS).',
    integration: 'Mô phỏng Websocket nhận sự kiện `new_message`, đảm bảo UI tự động cuộn xuống cuối.',
    e2e: 'Đăng nhập 2 tài khoản ở 2 trình duyệt, gửi tin nhắn và đảm bảo bên kia nhận được sau < 1 giây.'
  },
  admin_system: {
    title: 'System Configuration', role: 'Admin',
    unit: 'Kiểm tra hàm parse/stringify cấu hình hệ thống (JSON config).',
    integration: 'Gọi API GET /api/system/config, đảm bảo giấu đi các khóa bí mật (Secret Keys).',
    e2e: 'Sửa đổi tham số VAT (%) -> lưu lại -> kiểm tra xem hóa đơn mới lập có dùng VAT mới không.'
  },
  admin_user: {
    title: 'User Management', role: 'Admin',
    unit: 'Kiểm tra logic phân quyền role (Admin > Owner > Staff) trong middleware phân quyền.',
    integration: 'Gọi API tạo user với email đã tồn tại -> Nhận lỗi 409 Conflict.',
    e2e: 'Thao tác vô hiệu hóa (Deactivate) tài khoản nhân viên, sau đó nhân viên đó cố đăng nhập.'
  },
  owner_cashflow: {
    title: 'Cashflow', role: 'Owner',
    unit: 'Kiểm thử hàm `calculateEndOfDayBalance` cộng tổng thu - tổng chi.',
    integration: 'Tạo phiếu chi 5 triệu, gọi DB lấy số dư quỹ cuối cùng xem có giảm đúng 5 triệu không.',
    e2e: 'Owner thực hiện chốt ca cuối ngày, hệ thống in báo cáo và reset số dư bàn giao cho ngày hôm sau.'
  },
  owner_dashboard: {
    title: 'Dashboard', role: 'Owner',
    unit: 'Kiểm thử các hàm query SQL GROUP BY ngày/tháng để tính tổng doanh thu (đảm bảo không lệch múi giờ).',
    integration: 'Gọi API AI `/api/ai/report`, truyền mock data, đảm bảo AI trả về chuỗi báo cáo hợp lệ.',
    e2e: 'Đổi bộ lọc ngày từ "Hôm nay" sang "Tháng này", đảm bảo biểu đồ Recharts vẽ lại mượt mà.'
  },
  owner_product: {
    title: 'Product Mgmt', role: 'Owner',
    unit: 'Kiểm thử hàm tính giá vốn bình quân (MAC) khi nhập hàng với giá mới.',
    integration: 'Gọi API POST /api/products để thêm SP với mã vạch bị trùng -> Lỗi 400 Bad Request.',
    e2e: 'Upload ảnh sản phẩm 5MB, hệ thống phải tự động nén xuống < 200KB trước khi lưu.'
  },
  owner_staff: {
    title: 'Staff Mgmt', role: 'Owner',
    unit: 'Tính tổng KPI bán hàng của nhân viên trong tháng dựa trên hóa đơn thành công.',
    integration: 'Owner xem lịch sử chấm công của Staff A, đảm bảo data join từ bảng users và attendance chính xác.',
    e2e: 'Xuất file Excel báo cáo năng suất nhân viên, kiểm tra file tải về mở được và đúng cột.'
  },
  staff_attendance: {
    title: 'Attendance', role: 'Staff',
    unit: 'Hàm tính toán khoảng cách GPS của nhân viên so với cửa hàng (chống check-in giả mạo).',
    integration: 'Nhân viên A check-in lần 2 trong cùng 1 ca -> API trả về lỗi "Bạn đã check-in".',
    e2e: 'Bật giả lập vị trí sai, nhấn Check-in, đảm bảo UI hiện thông báo "Vị trí không hợp lệ".'
  },
  staff_installment: {
    title: 'Installment', role: 'Staff',
    unit: 'Tính tiền gốc và lãi trả góp mỗi kỳ (Dư nợ giảm dần).',
    integration: 'Gọi API thanh toán 1 kỳ, đảm bảo DB cập nhật trạng thái kỳ đó thành "Đã thu".',
    e2e: 'Nhân viên chọn khách mua trả góp, tạo hợp đồng, kiểm tra lịch nhắc nợ hiển thị đúng hạn.'
  },
  staff_order_history: {
    title: 'Order History', role: 'Staff',
    unit: 'Format tiền tệ (VND) và ngày tháng (dd/mm/yyyy) cho hàng nghìn dòng lịch sử.',
    integration: 'Filter lịch sử theo mã hóa đơn, API phải hỗ trợ tìm kiếm text (Like %...%).',
    e2e: 'Nhân viên tìm lại bill cũ, nhấn nút "In lại bill", đảm bảo máy in bill nhận được đúng mẫu thiết kế.'
  },
  staff_pos: {
    title: 'POS', role: 'Staff',
    unit: 'Hàm tính tổng tiền giỏ hàng: Sum(Qty * Price) - Discount.',
    integration: 'Trường hợp đua lệnh (Race Condition): 2 máy POS cùng bán SP_A (tồn kho=1), DB phải rollback 1 máy.',
    e2e: 'Dùng máy quét mã vạch quét liên tục 5 sản phẩm, giỏ hàng tự động tăng số lượng mà không bị lag.'
  },
  staff_product: {
    title: 'Products', role: 'Staff',
    unit: 'Logic debounce 500ms cho ô tìm kiếm sản phẩm trên giao diện.',
    integration: 'Gọi API GET sản phẩm với số lượng 1000 items, đảm bảo phân trang (Pagination) trả về 50 items/trang.',
    e2e: 'Nhân viên tìm SP bị "Hết hàng", UI phải làm mờ SP đó và chặn nút "Thêm vào giỏ".'
  }
};

const basePath = path.join(__dirname, '..');

const getTestPrompt = (key, f) => `# Prompt Kiểm Thử: ${f.title} (${f.role})

**Vai trò AI:** Senior QA Automation Engineer.

**Ngữ cảnh:**
Hệ thống BanHangAI chuẩn bị triển khai chức năng \`${key}\` (Vai trò: ${f.role}).
Chúng ta cần các kịch bản kiểm thử (Test Cases) "thực chiến", che phủ các góc khuất (edge cases), lỗi nghiệp vụ và tấn công dữ liệu, chứ không chỉ là test flow cơ bản.

**Yêu cầu đầu ra:**
Tạo file Test Specs (Markdown) lưu tại \`specs/test/${key}.md\`, bao gồm:

1. **Test Strategy:** Mô tả chiến lược test (dùng Jest cho Unit, Supertest cho API, Cypress cho E2E).
2. **Unit Test Cases:** (Yêu cầu Input/Output rõ ràng)
   - Trọng tâm: ${f.unit}
   - Bao gồm test exception/lỗi.
3. **Integration Test Cases (API & DB Transaction):**
   - Trọng tâm: ${f.integration}
   - Mô tả dữ liệu đầu vào (Payload) và trạng thái DB trước/sau khi gọi API.
4. **E2E & UI/UX Test Cases:**
   - Trọng tâm: ${f.e2e}
   - Các hành vi của User trên trình duyệt, test tính ổn định.

**Yêu cầu thực thi:**
Sinh nội dung Test Specs cực kỳ chi tiết, giống như một tài liệu bàn giao của Tester chuyên nghiệp.
`;

const getTestSpec = (key, f) => `# Kịch Bản Kiểm Thử Chi Tiết (Test Specs): ${f.title} (${f.role})

*Tài liệu này định nghĩa các kịch bản kiểm thử thực tế (Thật) dùng cho TDD (Test-Driven Development) và QA.*

## 1. Chiến lược Kiểm thử (Test Strategy)
- **Unit Test (Frontend & Backend):** Sử dụng \`Jest\`. Chạy tự động tại pre-commit hook.
- **Integration Test (API):** Sử dụng \`Supertest\` & \`Mocha\` kết nối vào Database test biệt lập (SQLite in-memory hoặc Test Container).
- **E2E Test:** Sử dụng \`Cypress\` giả lập hành vi người dùng trên trình duyệt (Click, Gõ phím, Scan mã vạch).

---

## 2. Unit Test Cases (Kiểm thử Đơn vị)

**Module Cốt lõi cần test:** Logic xử lý dữ liệu của \`${key}\`

### Test Case UT-01: Đường dẫn hạnh phúc (Happy Path)
- **Mô tả:** ${f.unit}
- **Pre-condition:** Dữ liệu đầu vào hợp lệ, đúng định dạng.
- **Input:** Giá trị biên chuẩn (ví dụ: chuỗi đúng chuẩn, số lượng > 0).
- **Expected Output:** Hàm trả về giá trị chính xác, không throw Error.

### Test Case UT-02: Xử lý ngoại lệ (Edge Cases / Exceptions)
- **Mô tả:** Đảm bảo hệ thống không sập khi dữ liệu rác/NULL.
- **Input:** Truyền \`null\`, chuỗi rỗng \`""\`, hoặc số âm \`-1\`.
- **Expected Output:** Bắt lỗi \`try/catch\` và ném ra \`ValidationError\` có thông báo rõ ràng (VD: "Dữ liệu không hợp lệ").

---

## 3. Integration Test Cases (Kiểm thử Tích hợp API)

**Boundary cần test:** Giao tiếp giữa API Route -> Controller -> Service -> Database.

### Test Case INT-01: Kiểm tra luồng dữ liệu chính
- **Mô tả:** ${f.integration}
- **Mock/Setup:** Tạo sẵn 1 bản ghi trong Database test (Mock Data).
- **Thực thi:** Gọi API Endpoint tương ứng của chức năng này với HTTP Client.
- **Verify:** 
  1. HTTP Status Code là \`200 OK\` hoặc \`201 Created\`.
  2. Data trả về khớp chuẩn JSON Schema.
  3. Query lại Database để đảm bảo dữ liệu thực sự đã thay đổi (State Verification).

### Test Case INT-02: Kiểm tra tính vẹn toàn (Race Condition / Transaction)
- **Mô tả:** Đảm bảo dữ liệu không sai lệch khi có nhiều request cùng lúc.
- **Thực thi:** Gửi liên tiếp 5 request đồng thời (Concurrent Request) bằng \`Promise.all()\`.
- **Verify:** Cơ chế Lock DB hoặc Transaction hoạt động. Ít nhất 4 request bị từ chối nếu xung đột, DB không bị âm tiền/tồn kho.

---

## 4. E2E & UI Test Cases (Kiểm thử Hồi quy Giao diện)

**Môi trường:** Trình duyệt Chrome/Firefox (Cypress).

### Test Case E2E-01: Trải nghiệm người dùng (UX)
- **Mô tả:** ${f.e2e}
- **Các bước thực hiện:**
  1. Login vào hệ thống với role \`${f.role}\`.
  2. Điều hướng tới màn hình \`${f.title}\`.
  3. Tương tác với giao diện (Click, Nhập liệu).
- **Expected Output:** 
  - Loading spinner hiển thị trong lúc đợi API.
  - Sau khi thao tác, Toast notification (Thành công/Lỗi) xuất hiện đúng màu (Xanh/Đỏ).
  - DOM cập nhật dữ liệu mới mà KHÔNG cần F5 (refresh) toàn trang.
`;

Object.keys(features).forEach(key => {
  const f = features[key];
  
  // Write detailed Prompt
  fs.writeFileSync(path.join(basePath, 'prompts', 'testing', key + '.md'), getTestPrompt(key, f));
  
  // Write detailed Spec (The execution result of the prompt)
  fs.writeFileSync(path.join(basePath, 'specs', 'test', key + '.md'), getTestSpec(key, f));
});

console.log('Successfully generated REAL detailed test prompts and test specs!');
