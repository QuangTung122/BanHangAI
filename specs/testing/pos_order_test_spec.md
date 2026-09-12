
# Đặc Tả Kiểm Thử (Test Specs) & Báo Cáo Thực Thi: Module Bán Hàng (POS) & Đơn Hàng

Dưới đây là danh sách các kịch bản kiểm thử (Test Cases) dành cho Module POS và Đơn hàng, kèm theo kết quả **thực thi tự động** (Actual Test Run) trực tiếp vào Controller của Backend.

---

## 📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

- **Ngày chạy test:** 10/09/2026
- **Tổng số kịch bản đã chạy:** 3 (Bằng script tự động `run_pos_tests.js`)
- **PASS:** 3
- **FAIL:** 0

> [!TIP] 💡 Đã Sửa Lỗi (Bug Fixed)
> Đã bổ sung logic kiểm tra `if (!items || items.length === 0)` vào `createOrder` trong `orderController.js`. Hệ thống không còn cho phép thanh toán giỏ hàng rỗng.

---

## 1. Test Cases - Validate Giao Diện & Form

| Test ID   | Tên Kịch Bản                   | Các Bước Thực Hiện (Steps)                 | Kết Quả Mong Đợi (Expected)             | Kết Quả Thực Tế (Actual)                                             | Trạng Thái     |
| --------- | --------------------------------- | ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| POS-UI-01 | Thanh toán khi giỏ hàng trống | Gửi request tạo đơn hàng với`items: []` | Trả về lỗi 400 "Giỏ hàng đang trống" | Đã xử lý bắt lỗi`items` trống, trả về HTTP 400 đúng chuẩn. | ✅**PASS** |
| POS-UI-02 | Thiếu thông tin khách hàng    | Để trống Tên hoặc SĐT khi gọi API        | Báo lỗi "Vui lòng nhập họ tên"        | *(Đang chờ test UI)*                                                 | ➖ Pending       |
| POS-UI-03 | Nhập sai định dạng SĐT       | Nhập SĐT "090" (chưa đủ 10 số)            | Báo lỗi SĐT không hợp lệ              | *(Đang chờ test UI)*                                                 | ➖ Pending       |
| POS-UI-04 | Thiếu số CCCD khi mua Trả góp | Đổi Loại thanh toán "Trả góp", bỏ CCCD   | Báo lỗi thiếu CCCD                       | *(Đang chờ test UI)*                                                 | ➖ Pending       |

## 2. Test Cases - Nghiệp vụ Bán Trả Thẳng (Full Payment)

| Test ID     | Tên Kịch Bản         | Các Bước Thực Hiện (Steps)                      | Kết Quả Mong Đợi (Expected)             | Kết Quả Thực Tế (Actual)                                                        | Trạng Thái     |
| ----------- | ----------------------- | ---------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------- |
| POS-FULL-01 | Bán đứt thành công | Gửi request đủ thông tin,`payment_type = full` | Đơn hàng tạo thành công (201 Created) | Trả về`success: true`, mã invoice sinh tự động hợp lệ, tồn kho bị trừ. | ✅**PASS** |
| POS-FULL-02 | Tự động ghi Sổ quỹ | Chạy tiếp sau POS-FULL-01 kiểm tra Sổ quỹ       | Thấy 1 record Transaction loại 'income'   | DB ghi nhận tự động đúng luồng.                                              | ✅**PASS** |

## 3. Test Cases - Nghiệp vụ Bán Trả Góp (Installment)

| Test ID     | Tên Kịch Bản                   | Các Bước Thực Hiện (Steps)                        | Kết Quả Mong Đợi (Expected)                  | Kết Quả Thực Tế (Actual)                                           | Trạng Thái     |
| ----------- | --------------------------------- | ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------- | ---------------- |
| POS-INST-01 | Tính toán UI Trả góp chuẩn   | Nhập SP 10M, Trả góp 6 tháng (phí 4%)             | UI hiện: Gốc 10M, Phí 400k, Mỗi tháng 1.73M | *(Đang chờ test UI Frontend)*                                      | ➖ Pending       |
| POS-INST-02 | Tạo đơn trả góp thành công | Gửi request`payment_type = installment`, kỳ hạn 6 | Trả về 201 Created, sinh record installment    | Trả về`success: true`, Sổ quỹ tự động thu kỳ 1 thành công. | ✅**PASS** |

## 4. Test Cases - Edge Cases (Lỗi Ngoại Lệ)

| Test ID    | Tên Kịch Bản                | Các Bước Thực Hiện (Steps)  | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual)              | Trạng Thái |
| ---------- | ------------------------------ | -------------------------------- | ------------------------------- | ----------------------------------------- | ------------ |
| POS-ERR-01 | Bán quá số lượng tồn kho | Đặt số lượng mua > tồn kho | Báo lỗi hết hàng            | *(Đang chờ bổ sung kịch bản test)* | ➖ Pending   |
