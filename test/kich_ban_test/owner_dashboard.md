# Kịch Bản Kiểm Thử Chi Tiết (Test Specs): Dashboard (Owner)

*Tài liệu này định nghĩa các kịch bản kiểm thử thực tế (Thật) dùng cho TDD (Test-Driven Development) và QA.*

## 1. Chiến lược Kiểm thử (Test Strategy)
- **Unit Test (Frontend & Backend):** Sử dụng `Jest`. Chạy tự động tại pre-commit hook.
- **Integration Test (API):** Sử dụng `Supertest` & `Mocha` kết nối vào Database test biệt lập (SQLite in-memory hoặc Test Container).
- **E2E Test:** Sử dụng `Cypress` giả lập hành vi người dùng trên trình duyệt (Click, Gõ phím, Scan mã vạch).

---

## 2. Unit Test Cases (Kiểm thử Đơn vị)

**Module Cốt lõi cần test:** Logic xử lý dữ liệu của `owner_dashboard`

### Test Case UT-01: Đường dẫn hạnh phúc (Happy Path)
- **Mô tả:** Kiểm thử các hàm query SQL GROUP BY ngày/tháng để tính tổng doanh thu (đảm bảo không lệch múi giờ).
- **Pre-condition:** Dữ liệu đầu vào hợp lệ, đúng định dạng.
- **Input:** Giá trị biên chuẩn (ví dụ: chuỗi đúng chuẩn, số lượng > 0).
- **Expected Output:** Hàm trả về giá trị chính xác, không throw Error.

### Test Case UT-02: Xử lý ngoại lệ (Edge Cases / Exceptions)
- **Mô tả:** Đảm bảo hệ thống không sập khi dữ liệu rác/NULL.
- **Input:** Truyền `null`, chuỗi rỗng `""`, hoặc số âm `-1`.
- **Expected Output:** Bắt lỗi `try/catch` và ném ra `ValidationError` có thông báo rõ ràng (VD: "Dữ liệu không hợp lệ").

---

## 3. Integration Test Cases (Kiểm thử Tích hợp API)

**Boundary cần test:** Giao tiếp giữa API Route -> Controller -> Service -> Database.

### Test Case INT-01: Kiểm tra luồng dữ liệu chính
- **Mô tả:** Gọi API AI `/api/ai/report`, truyền mock data, đảm bảo AI trả về chuỗi báo cáo hợp lệ.
- **Mock/Setup:** Tạo sẵn 1 bản ghi trong Database test (Mock Data).
- **Thực thi:** Gọi API Endpoint tương ứng của chức năng này với HTTP Client.
- **Verify:** 
  1. HTTP Status Code là `200 OK` hoặc `201 Created`.
  2. Data trả về khớp chuẩn JSON Schema.
  3. Query lại Database để đảm bảo dữ liệu thực sự đã thay đổi (State Verification).

### Test Case INT-02: Kiểm tra tính vẹn toàn (Race Condition / Transaction)
- **Mô tả:** Đảm bảo dữ liệu không sai lệch khi có nhiều request cùng lúc.
- **Thực thi:** Gửi liên tiếp 5 request đồng thời (Concurrent Request) bằng `Promise.all()`.
- **Verify:** Cơ chế Lock DB hoặc Transaction hoạt động. Ít nhất 4 request bị từ chối nếu xung đột, DB không bị âm tiền/tồn kho.

---

## 4. E2E & UI Test Cases (Kiểm thử Hồi quy Giao diện)

**Môi trường:** Trình duyệt Chrome/Firefox (Cypress).

### Test Case E2E-01: Trải nghiệm người dùng (UX)
- **Mô tả:** Đổi bộ lọc ngày từ "Hôm nay" sang "Tháng này", đảm bảo biểu đồ Recharts vẽ lại mượt mà.
- **Các bước thực hiện:**
  1. Login vào hệ thống với role `Owner`.
  2. Điều hướng tới màn hình `Dashboard`.
  3. Tương tác với giao diện (Click, Nhập liệu).
- **Expected Output:** 
  - Loading spinner hiển thị trong lúc đợi API.
  - Sau khi thao tác, Toast notification (Thành công/Lỗi) xuất hiện đúng màu (Xanh/Đỏ).
  - DOM cập nhật dữ liệu mới mà KHÔNG cần F5 (refresh) toàn trang.
