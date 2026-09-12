# Đặc Tả Kiểm Thử & Báo Cáo Thực Thi: Module Sổ Quỹ (Cashflow)

Dưới đây là danh sách kịch bản kiểm thử (Test Cases) kèm theo kết quả **thực thi tự động** (Actual Test Run) trên Backend Controller.

---

## 📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

- **Ngày chạy test:** 10/09/2026
- **Tổng số kịch bản đã chạy:** 2 (Bằng script tự động `run_cashflow_tests.js`)
- **PASS:** 2
- **FAIL:** 0

> [!TIP] Đã Sửa Lỗi (Bug Fixed)
> Đã sửa lỗi API `/summary` bỏ sót nhân viên. Bằng cách đổi JOIN thành LEFT JOIN, hệ thống nay đã có thể tính toán quỹ tiền mặt một cách chính xác kể cả khi có nhân viên bị ẩn hoặc xóa. Quá trình thu tiền hiện tại hoạt động trơn tru.

---

## 1. Test Cases - Nghiệp vụ Sổ Quỹ (Backend API)

| Test ID | Tên Kịch Bản                           | Các Bước Thực Hiện (Steps)                                                                    | Kết Quả Mong Đợi (Expected)                                    | Kết Quả Thực Tế (Actual)                                                 | Trạng Thái     |
| ------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------- |
| CASH-01 | Lập Phiếu Thu/Chi Thủ công            | Gọi API`POST /transaction` tạo Phiếu thu 500k.                                                | `total_income` trong `/summary` phải tăng thêm 500k.        | Summary tự động cập nhật và cộng đúng 500k.                         | ✅**PASS** |
| CASH-02 | Bàn giao tiền từ Nhân viên (Collect) | Insert 1 giao dịch thu tiền mặt cho NV. Lấy số dư NV cầm. Gọi API`collect` thu tiền NV. | Quỹ NV về 0, quỹ Owner (safe) tăng lên. API trả về success. | Quỹ NV đã được API tổng hợp chính xác (nhờ LEFT JOIN) và API collect thu quỹ chuẩn, dư nợ NV về 0. | ✅**PASS** |

## 2. Test Cases - UI / Frontend (Đang chờ)

| Test ID    | Tên Kịch Bản        | Các Bước Thực Hiện (Steps)                     | Kết Quả Mong Đợi (Expected)                                                      | Kết Quả Thực Tế (Actual) | Trạng Thái |
| ---------- | ---------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ------------ |
| CASH-UI-01 | Phân quyền View      | Đăng nhập tài khoản Staff, truy cập Sổ Quỹ. | Không thấy menu Sổ quỹ, nếu gõ URL bị văng ra.                               | *(Chờ kiểm thử tay)*    | ➖ Pending   |
| CASH-UI-02 | Giao diện thu quỹ NV | Bấm vào "Chi tiết tiền mặt" -> "Thu".          | Popup hiện lên xác nhận bàn giao tiền. Gửi API thành công lưới tải lại. | *(Chờ kiểm thử tay)*    | ➖ Pending   |
