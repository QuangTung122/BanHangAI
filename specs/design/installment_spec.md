# Đặc Tả Thiết Kế (Design Specs): Module Quản Lý Trả Góp & Thu Cước

## 1. Wireframe Giao Diện (Staff Installment View)

**Màn hình chính: Lưới danh sách hồ sơ trả góp**
```text
[ Quản lý hồ sơ trả góp ]                        [Bộ lọc: Tất cả [v]] [🔍 Tìm Tên, CCCD...]
-----------------------------------------------------------------------------------------
 KHÁCH HÀNG       MÃ HÓA ĐƠN    KỲ HẠN / DƯ NỢ       ĐẾN HẠN     TIẾN ĐỘ        THAO TÁC
-----------------------------------------------------------------------------------------
 Nguyen Van A     INV-2409-11   Mỗi tháng: 5M        10/10/2026  1/6 tháng      [Lịch sử]
 0901234567                     Dư nợ: 25M           (Đang trả)  [██░░░░░░]     [Thu cước]
-----------------------------------------------------------------------------------------
 Tran Thi B       INV-2408-02   Mỗi tháng: 2M        05/09/2026  3/12 tháng     [Lịch sử]
 0912223333                     Dư nợ: 18M          ! Cần thu !  [███░░░░░]     [Thu cước]
-----------------------------------------------------------------------------------------
 Le Van C         INV-2405-09   Mỗi tháng: 1M        --          3/3 tháng      [Lịch sử]
 0988777666                     Dư nợ: 0M            (Tất toán)  [████████]     [Disabled]
-----------------------------------------------------------------------------------------
```

**Popup Modal: Thu Cước Trả Góp**
```text
+-------------------------------------------------+
|  THU CƯỚC TRẢ GÓP - Khách: Nguyen Van A       X |
|-------------------------------------------------|
|  - Tổng dư nợ: 25,000,000đ                      |
|  - Số kỳ còn lại: 5 kỳ                          |
|  - Số tiền mỗi kỳ: 5,000,000đ                   |
|                                                 |
|  Tùy chọn thu:                                  |
|  ( ) Thu 1 kỳ (5,000,000đ)                      |
|  ( ) Tất toán toàn bộ (25,000,000đ)             |
|                                                 |
|  Hình thức thanh toán:                          |
|  [ Tiền mặt [v] ]                               |
|                                                 |
|          [ Hủy ]       [ XÁC NHẬN THU TIỀN ]    |
+-------------------------------------------------+
```

## 2. Database Schema (Các bảng liên quan)

- **`orders`**: Điều kiện `payment_type = 'installment'`. Chứa `installment_term` (tổng số kỳ), `monthly_fee` (tiền mỗi kỳ).
- **`installment_payments`**: Lưu từng lần đóng họ. `order_id`, `amount`, `cashier_id`, `created_at`.
- **`transactions`**: Sổ quỹ. Mỗi lần thu cước sẽ tự động sinh 1 bản ghi `type='income'`, `category='Thu tiền trả góp'`, `source='auto'`.

## 3. API Specs

**`GET /api/order?type=installment`**
- Lấy toàn bộ đơn trả góp.
- JOIN với `installment_payments` để đếm `paid_months` (số kỳ đã đóng).
- Tính `next_due_date` = `created_at` + `paid_months` tháng. 
- Tính Trạng thái: Trễ hạn (nếu `next_due_date` < hôm nay), Tất toán (nếu `paid_months >= installment_term`).

**`POST /api/order/:id/payments`**
- **Body:** `{ "pay_all": false, "payment_method": "cash" }`
- **Xử lý ngầm:**
  1. Kiểm tra đơn hàng có tồn tại và chưa đóng đủ số kỳ.
  2. Nếu `pay_all = false`: `monthsToPay = 1`. Nếu `true`: `monthsToPay = installment_term - paid_months`.
  3. Dùng vòng lặp `INSERT` vào bảng `installment_payments`.
  4. Mỗi lần insert, ghi kèm 1 record vào `transactions` (Thu tiền trả góp kỳ X).
- **Response:** `{ "success": true, "message": "Thu cước thành công" }`
