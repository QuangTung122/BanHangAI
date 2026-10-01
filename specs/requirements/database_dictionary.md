# Từ Điển Dữ Liệu Chi Tiết (Database Dictionary)

Schema SQLite chuẩn nằm tại `backend/database/init.sql`. Khi nâng cấp CSDL đã có dữ liệu, `backend/src/services/db.js` bổ sung các bảng, cột và chỉ mục còn thiếu; các bản ghi cũ được liên kết lại theo số điện thoại khách hàng khi có thể.

## 1. Tài khoản và phân quyền

### `users`

`id` (PK), `username` (duy nhất), `password_hash`, `full_name`, `email` (duy nhất, có thể NULL), `phone`, `role` (`admin`/`owner`/`staff`), `is_active`, `hourly_wage`, `current_token`, `created_at`.

### `audit_logs`

`id` (PK), `user_id` (FK → `users.id`, có thể NULL), `action_type`, `action_desc`, `details`, `created_at`. Nhật ký lưu người thao tác và dữ liệu mô tả sự kiện.

## 2. Danh mục, sản phẩm và tồn kho

### `categories`

`id` (PK), `name`, `slug` (duy nhất), `description`, `is_active`.

### `products`

`id` (PK), `category_id` (FK → `categories.id`), `name`, `slug` (duy nhất), `description`, `price`, `stock_quantity`, `image_url`, `is_active`, `sku`, `unit`, `import_price`, `discount_percent`, `low_stock_threshold`, `tags`, `warranty_months`, `created_at`.

### `inventory_movements`

`id` (PK), `product_id` (FK → `products.id`), `movement_type` (`opening`/`purchase`/`sale`/`return`/`adjustment`/`write_off`), `quantity_change` (khác 0; dương là nhập, âm là xuất), `unit_cost`, `reference_type`, `reference_id`, `note`, `user_id` (FK → `users.id`, có thể NULL), `created_at`.

`products.stock_quantity` là tồn hiện hành; sổ biến động ghi nhận tồn đầu kỳ, bán, hàng nguyên trạng nhập lại và điều chỉnh kho. Mỗi cập nhật tồn trong các luồng trên được ghi cùng giao dịch CSDL.

### `suppliers`, `purchase_receipts`, `purchase_receipt_items`

- `suppliers`: `id` (PK), `name`, `phone` (duy nhất nếu có), `email`, `address`, `notes`, `is_active`, `created_at`, `updated_at`.
- `purchase_receipts`: `id` (PK), `supplier_id` (FK → `suppliers.id`), ảnh chụp `supplier_name`, `supplier_invoice`, `total_cost`, `notes`, `received_by` (FK → `users.id`), `created_at`.
- `purchase_receipt_items`: `id` (PK), `receipt_id` (FK → `purchase_receipts.id`), `product_id` (FK → `products.id`, không cho xóa vật lý sản phẩm đã nhập), ảnh chụp `product_name`/`sku`, `quantity`, `unit_cost`, `line_total`.

Ghi nhận phiếu nhập tạo/cập nhật nhà cung cấp, tăng tồn sản phẩm, cập nhật giá nhập gần nhất và ghi `inventory_movements` trong cùng giao dịch. Lịch sử phiếu nhập được giữ để đối chiếu giá vốn và số lượng.

## 3. Khách hàng, hóa đơn và thanh toán

### `customers`

`id` (PK), `full_name`, `phone` (duy nhất, có thể NULL), `email`, `address`, `customer_group`, `notes`, `created_at`, `updated_at`.

### `orders`

`id` (PK), `user_id` (FK → `users.id`), `customer_id` (FK → `customers.id`, có thể NULL), `total_amount`, `financed_total` (tổng hợp đồng trả góp đã làm tròn chính xác), ảnh chụp `customer_name`/`customer_phone`, `shipping_address`, `status`, `payment_type`, `customer_cccd`, `installment_term`, `monthly_fee`, `payment_method`, `created_at`.

Đơn POS được tạo sau khi backend xác nhận giá, giảm giá và tồn kho. Đơn bán tại quầy mang trạng thái `delivered`; đơn trả góp ghi giá trị hợp đồng trong `orders.total_amount`, còn từng khoản thu được ghi riêng.

### `order_items`

`id` (PK), `order_id` (FK → `orders.id`), `product_id` (FK → `products.id`), ảnh chụp `product_name`/`sku`/`warranty_months`, `quantity`, `unit_price`.

Các trường ảnh chụp giữ nguyên nội dung hóa đơn và điều kiện bảo hành tại thời điểm bán, kể cả khi hồ sơ sản phẩm được đổi sau này.

### `installment_payments`

`id` (PK), `order_id` (FK → `orders.id`), `amount`, `cashier_id` (FK → `users.id`), `payment_method`, `created_at`. Số kỳ đã thu được đối chiếu với `orders.installment_term`.

### `transactions`

`id` (PK), `type` (`income`/`expense`), `amount`, `category`, `description`, `reference_id`, `user_id` (FK → `users.id`), `payment_method`, `source` (`manual`/`auto`), `invoice_id`, `attachment_url`, `created_at`.

Đây là sổ tiền thực thu/chi. `orders.total_amount` phản ánh giá trị bán của đơn; doanh thu bán hàng và dòng tiền thực thu là hai chỉ tiêu khác nhau, nhất là với hợp đồng trả góp.

## 4. Đổi trả và bảo hành

### `returns`

`id` (PK), `order_id` (FK → `orders.id`), `customer_id` (khóa lịch sử cũ), `store_customer_id` (FK → `customers.id`, có thể NULL), ảnh chụp `customer_name`/`customer_phone`, `return_type`, `reason`, `requested_at`, `processed_at`, `status`, `approved_by`, `refund_amount`, `exchange_product_id`, `notes`, `created_by`, `is_active`.

### `return_items`

`id` (PK), `return_id` (FK → `returns.id`), `order_item_id` (FK → `order_items.id`), `product_id`, ảnh chụp `product_name`, `quantity`, `unit_price`, `condition_status`, `defect_type`, `warranty_remaining_days`, `refund_amount`, `exchange_to_product_id`, `exchange_delta_amount`, `status`.

Số lượng có thể tiếp nhận được tính từ số lượng trên hóa đơn trừ các phiếu đang chờ, đã duyệt hoặc đã hoàn tất. Chỉ hàng được ghi nhận nguyên trạng mới cộng lại vào tồn.

### `warranty_claims`

`id` (PK), `order_id`, `order_item_id`, `product_id`, `customer_id` (khóa lịch sử cũ), `store_customer_id` (FK → `customers.id`, có thể NULL), ảnh chụp tên/số điện thoại, `serial_number`, `warranty_months`, `warranty_start_date`, `warranty_end_date`, `claim_type`, `issue_description`, `issue_code`, `claimed_at`, `status`, `approved_by`, `created_by`, `notes`, `resolution_notes`, `is_active`.

Thời hạn bảo hành phát sinh từ đơn hàng được đối chiếu với ảnh chụp `order_items.warranty_months`, không lấy cấu hình hiện tại của sản phẩm.

## 5. Chấm công, thông báo và chat

### `attendance`

`id` (PK), `user_id` (FK → `users.id`), `date`, `check_in_time`, `check_out_time`, `total_hours`.

### `messages` và `notifications`

`messages`: `id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`. `notifications`: `id`, `user_id`, `title`, `message`, `type`, `related_id`, `is_read`, `created_at`.

### `chat_sessions` và `chat_messages`

`chat_sessions`: `id`, `user_id`, `session_id`, `created_at`. `chat_messages`: `id`, `session_id`, `sender`, `message_content`, `timestamp`. Các tin nhắn trợ lý AI chỉ lưu vai trò `user` hoặc `assistant`.

## 6. Ghi chú nâng cấp và giới hạn dữ liệu

- Các chỉ mục phục vụ lọc đơn theo trạng thái/thời gian, lịch sử khách, tra cứu tồn kho theo sản phẩm, giao dịch và kỳ trả góp được khai báo tại schema/migration.
- Khách từ đơn cũ được gom theo số điện thoại; liên kết đổi trả/bảo hành và ảnh chụp dòng hóa đơn cũ được backfill khi nâng cấp CSDL.
- Dữ liệu nhà cung cấp và chứng từ nhập hàng nhiều mặt hàng được lưu riêng; xóa dữ liệu demo cũng xóa các dòng chứng từ trước khi xóa sản phẩm.
