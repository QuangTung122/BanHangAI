# Đặc Tả Thiết Kế (Design Specs): Module Bán Hàng (POS) & Đơn Hàng

## 1. Wireframe Giao Diện (Staff POS View)

Bố cục màn hình bán hàng chia làm 2 phần chính: **Khu vực Sản Phẩm (Trái)** và **Khu vực Giỏ Hàng (Phải)**.

```text
+-----------------------------------------------------------------------------------+
|  [🔍 Tìm kiếm sản phẩm... (Hỗ trợ mã vạch)]                                       |
|  [Tất cả] [Đồ điện tử] [Gia dụng] [Mỹ phẩm]                                       |
+---------------------------------------------------------+-------------------------+
|                                                         | [🛒 Giỏ Hàng]   [Xóa] |
|  +----------------+  +----------------+                 |                         |
|  | [Ảnh SP]       |  | [Ảnh SP]       |                 | 1. iPhone 15 Pro Max    |
|  | iPhone 15 Pro  |  | Tủ Lạnh LG     |                 |    1 x 29,000,000đ      |
|  | 29,000,000đ    |  | 15,000,000đ    |                 | 2. Ốp lưng silicon      |
|  | Tồn: 15        |  | Tồn: 5         |                 |    2 x 150,000đ         |
|  +----------------+  +----------------+                 |                         |
|                                                         | ----------------------- |
|  +----------------+  +----------------+                 | Tạm tính: 29,300,000đ   |
|  | [Ảnh SP]       |  |                |                 | TỔNG TIỀN: 29,300,000đ  |
|  | AirPods Pro 2  |  |                |                 |                         |
|  | 5,500,000đ     |  |                |                 | [Thông tin Khách hàng]  |
|  | Tồn: 20        |  |                |                 | - Họ và tên...........  |
|  +----------------+  +----------------+                 | - Số điện thoại.......  |
|                                                         |                         |
|                                                         | [Loại thanh toán  [v]]  |
|                                                         | > Trả góp               |
|                                                         |                         |
|                                                         | * Hồ sơ trả góp:        |
|                                                         | - Số CCCD (12 số).....  |
|                                                         | - Kỳ hạn: [6 Tháng [v]] |
|                                                         |   + Gốc: 29,300,000     |
|                                                         |   + Phí (4%): 1,172,000 |
|                                                         |   + Mỗi tháng: 5,078,666|
|                                                         |                         |
|                                                         | [Nhận tiền qua    [v]]  |
|                                                         | > Chuyển khoản          |
|                                                         |                         |
|                                                         | [ THANH TOÁN & IN HĐ ]  |
+---------------------------------------------------------+-------------------------+
```

## 2. Database Schema

**Bảng `orders`**
- `id` (INTEGER, PK, AI)
- `user_id` (INTEGER, FK) - ID nhân viên thu ngân
- `total_amount` (REAL) - Tổng tiền đơn hàng
- `customer_name` (TEXT) - Tên khách hàng
- `customer_phone` (TEXT) - SĐT khách hàng
- `payment_type` (TEXT) - 'full' (Trả thẳng) hoặc 'installment' (Trả góp)
- `payment_method` (TEXT) - 'cash', 'transfer', 'card'
- `customer_cccd` (TEXT) - Số CCCD (Nếu trả góp)
- `installment_term` (INTEGER) - Số kỳ hạn (VD: 3, 6, 9, 12 tháng)
- `monthly_fee` (REAL) - Số tiền phải đóng mỗi tháng (Gốc + Lãi)
- `created_at` (DATETIME)

**Bảng `order_items`**
- `id` (INTEGER, PK, AI)
- `order_id` (INTEGER, FK)
- `product_id` (INTEGER, FK)
- `quantity` (INTEGER)
- `unit_price` (REAL)

**Bảng `installment_payments`**
- `id` (INTEGER, PK, AI)
- `order_id` (INTEGER, FK)
- `amount` (REAL) - Số tiền đã đóng kỳ này
- `cashier_id` (INTEGER, FK) - Nhân viên thu tiền
- `payment_method` (TEXT) - Hình thức thu
- `created_at` (DATETIME)

## 3. API Specs

**`POST /api/order`**
- **Mục đích:** Tạo đơn hàng mới từ màn hình POS. Xử lý trừ tồn kho và ghi nhận tự động vào Sổ quỹ (`transactions`).
- **Body Request:**
  ```json
  {
    "items": [
      { "product_id": 1, "quantity": 1, "unit_price": 29000000 }
    ],
    "total_amount": 29000000,
    "payment_type": "installment",
    "payment_method": "transfer",
    "customer_name": "Nguyen Van A",
    "customer_phone": "0901234567",
    "customer_cccd": "001099001234",
    "installment_term": 6,
    "monthly_fee": 5078666
  }
  ```
- **Xử lý ngầm (Logic):**
  1. Tạo record `orders`. Lấy `order_id` sinh mã `invoice_code`.
  2. Lặp qua `items`, tạo `order_items` và `UPDATE products SET stock_quantity = stock_quantity - quantity`.
  3. Nếu `payment_type === 'full'`, tạo 1 record `transactions` loại `income` với số tiền `total_amount`.
  4. Nếu `payment_type === 'installment'`, tạo ngay 1 record `installment_payments` cho kỳ đầu tiên (thu trước 1 tháng), và tạo 1 record `transactions` loại `income` với số tiền `monthly_fee`.
- **Response:**
  ```json
  {
    "success": true,
    "data": { "order_id": 123, "invoice_code": "INV-240910-0123", "created_at": "..." }
  }
  ```
