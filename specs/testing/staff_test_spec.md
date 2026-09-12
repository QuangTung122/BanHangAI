# Đặc Tả Kiểm Thử & Báo Cáo Thực Thi: Module Nhân Sự & Chấm Công

Dưới đây là danh sách kịch bản kiểm thử (Test Cases) kèm theo kết quả **thực thi tự động** (Actual Test Run) vào Backend Controller của Nhân sự.

---

## 📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ (TEST SUMMARY)
- **Ngày chạy test:** 10/09/2026
- **Tổng số kịch bản đã chạy:** 2 (Bằng script tự động `run_staff_tests.js`)
- **PASS:** 2
- **FAIL:** 0

> [!TIP] Đã Sửa Lỗi (Bug Fixed)
> Hàm `updateWage` đã được thêm bộ lọc kiểm tra (validate) không cho phép nhập lương âm (`< 0`) và validate `isNaN`. Các bản ghi trong cơ sở dữ liệu đều đã được update ổn định, chính xác.

---

## 1. Test Cases - Nghiệp vụ Quản lý Nhân sự (Backend API)

| Test ID | Tên Kịch Bản | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|---|---|---|---|---|---|
| STAFF-01 | Cập nhật lương hợp lệ | Gọi API `PUT /user/:id/wage` với `hourly_wage = 25000`. Sau đó `GET /user` kiểm tra lại. | API trả về 200. DB cập nhật đúng giá trị 25,000. | API trả về 200. DB cập nhật và lưu trữ đúng 25,000đ. | ✅ **PASS** |
| STAFF-02 | Validate Lương Âm | Gọi API `PUT /user/:id/wage` với `hourly_wage = -5000` | Trả về lỗi 400 "Mức lương không hợp lệ" | Hệ thống ném lỗi 400 đúng như kịch bản, chặn việc ghi đè DB. | ✅ **PASS** |

## 2. Test Cases - UI / Frontend (Đang chờ)

| Test ID | Tên Kịch Bản | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|---|---|---|---|---|---|
| STAFF-UI-01 | Tính Lương Tạm Tính (Bảng công) | Nhập `standard_hours = 8`, `ot = 2`, `wage = 25000` | Hiển thị: 275,000 đ | *(Chờ kiểm thử tay)* | ➖ Pending |
| STAFF-UI-02 | Render Tab | Chuyển đổi giữa 2 tab Nhân viên & Bảng công | Ẩn hiện nội dung đúng chuẩn, URL thay đổi (nếu có routing). | *(Chờ kiểm thử tay)* | ➖ Pending |
