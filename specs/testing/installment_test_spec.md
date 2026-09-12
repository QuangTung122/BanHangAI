# Đặc Tả Kiểm Thử & Báo Cáo Thực Thi: Module Quản Lý Trả Góp

Dưới đây là danh sách kịch bản kiểm thử (Test Cases) kèm theo kết quả **thực thi tự động** (Actual Test Run) trên Backend Controller.

---

## 📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ (TEST SUMMARY)
- **Ngày chạy test:** 10/09/2026
- **Tổng số kịch bản đã chạy:** 3 (Bằng script tự động `run_installment_tests.js`)
- **PASS:** 3
- **FAIL:** 0

> [!TIP] Đánh giá chất lượng
> Backend xử lý luồng trả góp rất tốt! Logic chặn thu tiền lố kỳ (Over-charging) hoạt động chuẩn xác. Chức năng tất toán tự động tính toán đúng số kỳ còn lại.

---

## 1. Test Cases - Nghiệp vụ Thu Cước

| Test ID | Tên Kịch Bản | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|---|---|---|---|---|---|
| INST-01 | Thu cước 1 kỳ | Gọi API `POST /order/:id/payments`, param `pay_all=false` | Đơn hàng tăng thêm 1 kỳ đã đóng (`paid_months`). Sổ quỹ sinh 1 record Thu tiền. | Tăng chính xác số kỳ đã đóng. | ✅ **PASS** |
| INST-02 | Thu Tất toán (Pay All) | Gọi API với param `pay_all=true` | Tự động tính số kỳ còn lại, vòng lặp sinh đủ record thanh toán và chuyển trạng thái đơn thành Tất toán. | Trả về đủ số `paid_months` bằng đúng `installment_term`. | ✅ **PASS** |

## 2. Test Cases - Edge Cases (Lỗi Ngoại Lệ)

| Test ID | Tên Kịch Bản | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|---|---|---|---|---|---|
| INST-ERR-01 | Thu cước khi đã Tất toán | Đơn hàng đã đóng đủ 100% kỳ. Tiếp tục gọi API Thu cước. | API trả về lỗi HTTP 400 "Khách hàng đã thanh toán đủ các kỳ hạn". Không ghi đè DB. | Backend bắt được lỗi, trả về HTTP 400 chính xác. | ✅ **PASS** |

## 3. Test Cases - UI / Frontend (Đang chờ)

| Test ID | Tên Kịch Bản | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|---|---|---|---|---|---|
| INST-UI-01 | Lọc danh sách | Bấm chọn bộ lọc "Trễ hạn" | UI chỉ hiển thị các hóa đơn có `next_due_date` nhỏ hơn ngày hôm nay. | *(Chờ kiểm thử tay)* | ➖ Pending |
| INST-UI-02 | Tính toán Dư nợ UI | Xem bảng danh sách | Dư nợ = Tổng tiền - (Kỳ đã đóng * Mỗi tháng) | *(Chờ kiểm thử tay)* | ➖ Pending |
