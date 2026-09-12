# Đặc Tả Kiểm Thử & Báo Cáo Thực Thi: Module Quản lý Sản Phẩm

Dưới đây là danh sách kịch bản kiểm thử (Test Cases) kèm theo kết quả **thực thi tự động** (Actual Test Run) trên Backend Controller của chức năng Kho Hàng (Sản phẩm).

---

## 📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

- **Ngày chạy test:** 10/09/2026
- **Tổng số kịch bản đã chạy:** 3 (Bằng script tự động `run_product_tests.js`)
- **PASS:** 3
- **FAIL:** 0

> [!TIP] 💡 Đã Sửa Lỗi (Bug Fixed)
> Thuật toán tạo `slug` đã được viết lại bằng cách sử dụng `.normalize('NFD')` kết hợp với bảng Regex loại bỏ dấu tiếng Việt chuẩn xác (Bao gồm cả ký tự 'đ', 'Đ'). Hiện tại khi nhập "Áo Thun Nam" đã tự động tạo slug chuẩn SEO thành `ao-thun-nam`.

---

## 1. Test Cases - Nghiệp vụ Quản lý Sản phẩm (Backend API)

| Test ID | Tên Kịch Bản         | Các Bước Thực Hiện (Steps)                                                  | Kết Quả Mong Đợi (Expected)                                                   | Kết Quả Thực Tế (Actual)                                                            | Trạng Thái     |
| ------- | ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| PROD-01 | Tạo SP & Sinh Slug     | Gọi API`POST /product` tạo SP tên "Áo Thun Nam".                           | Trả về 201. Lưu DB có slug là`ao-thun-nam`.                                | Hệ thống xử lý triệt để dấu tiếng Việt, tạo slug`ao-thun-nam` chính xác. | ✅**PASS** |
| PROD-02 | Xử lý trùng Slug     | Tiếp tục gọi API`POST /product` tạo SP khác vẫn tên "Áo Thun Nam".     | Trả về 201. Lưu DB có slug là`ao-thun-nam-1` (hoặc hậu tố tương tự). | Tính năng tự nối hậu tố hoạt động hoàn hảo khi phát hiện trùng lặp.      | ✅**PASS** |
| PROD-03 | Xóa Mềm (Soft Delete) | Gọi API`DELETE /product/:id`. Sau đó gọi `GET /product` lấy danh sách. | API GET không trả về sản phẩm vừa xóa (vì`is_active=0`).                | Sản phẩm đã bị ẩn khỏi danh sách GET. Cơ chế Soft Delete hoạt động đúng. | ✅**PASS** |

## 2. Test Cases - UI / Frontend (Đang chờ)

| Test ID    | Tên Kịch Bản      | Các Bước Thực Hiện (Steps)                           | Kết Quả Mong Đợi (Expected)                                        | Kết Quả Thực Tế (Actual) | Trạng Thái |
| ---------- | -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- | ------------ |
| PROD-UI-01 | Lọc Hàng sắp hết | Bấm tab "Hàng sắp hế t" trên UI.                     | Lưới chỉ hiện các SP có`Tồn kho <= Ngưỡng`. Chữ báo đỏ. | *(Chờ kiểm thử tay)*    | ➖ Pending   |
| PROD-UI-02 | Nút AI Gợi ý      | Mở form Thêm SP, nhập tên SP, bấm nút "AI Gợi ý". | Form tự điền Giá nhập, Giá bán, Danh mục phù hợp.            | *(Chờ kiểm thử tay)*    | ➖ Pending   |
