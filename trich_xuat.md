# Cấu trúc Cơ sở dữ liệu Hệ thống BanHangAI

Tài liệu này chứa cấu trúc các bảng thực tế (Schema) đang chạy trong hệ thống, bao gồm ý nghĩa các biến (cột) dữ liệu trong từng bảng.

## Bảng: `categories`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                                                                 |
| ----------------- | --------------- | ----------------------------------------------------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)                                             |
| `name`          | TEXT            | Tên danh mục                                                          |
| `slug`          | TEXT            | Đường dẫn tĩnh thân thiện (URL Slug)                             |
| `description`   | TEXT            | Mô tả chi tiết                                                       |
| `is_active`     | BOOLEAN         | Trạng thái hoạt động (1: Kích hoạt/Hiện diện, 0: Bị xóa/Ẩn) |

## Bảng: `products`

| Tên Cột (Biến)       | Kiểu dữ liệu | Mô tả                                                                 |
| ----------------------- | --------------- | ----------------------------------------------------------------------- |
| `id`                  | INTEGER         | Khóa chính (ID duy nhất)                                             |
| `category_id`         | INTEGER         | ID Danh mục tương ứng                                               |
| `name`                | TEXT            | Tên sản phẩm                                                         |
| `slug`                | TEXT            | Đường dẫn tĩnh thân thiện (URL Slug)                             |
| `description`         | TEXT            | Mô tả chi tiết                                                       |
| `price`               | INTEGER         | Giá bán sản phẩm                                                    |
| `stock_quantity`      | INTEGER         | Số lượng hàng tồn kho hiện tại                                   |
| `image_url`           | TEXT            | Đường dẫn ảnh đại diện                                          |
| `is_active`           | BOOLEAN         | Trạng thái hoạt động (1: Kích hoạt/Hiện diện, 0: Bị xóa/Ẩn) |
| `created_at`          | DATETIME        | Thời gian tạo bản ghi                                                |
| `sku`                 | TEXT            | Mã vạch / Mã SKU sản phẩm                                          |
| `unit`                | TEXT            | Đơn vị tính (cái, chiếc, thùng, v.v.)                            |
| `import_price`        | INTEGER         | Giá nhập sản phẩm                                                   |
| `discount_percent`    | INTEGER         | Phần trăm giảm giá (%)                                              |
| `low_stock_threshold` | INTEGER         | Ngưỡng cảnh báo sắp hết hàng                                     |
| `tags`                | TEXT            | Các thẻ từ khóa                                                     |
| `warranty_months`     | INTEGER         | Số tháng bảo hành mặc định                                       |

## Bảng: `orders`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                                              |
| ----------------- | --------------- | ---------------------------------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)                          |
| `user_id`       | INTEGER         | ID tài khoản liên quan (nhân viên/khách hàng) |
| `total_amount`  | INTEGER         | Tổng số tiền / Tổng giá trị                    |

| `status` | TEXT | Trạng thái hiện tại của bản ghi |
| `created_at` | DATETIME | Thời gian tạo bản ghi |
| `payment_type` | TEXT | Loại thanh toán (toàn bộ, trả góp...) |

| `installment_term` | INTEGER | Số tháng trả góp |
| `monthly_fee` | INTEGER | Số tiền trả góp hàng tháng |

## Bảng: `order_items`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                     |
| ----------------- | --------------- | --------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất) |
| `order_id`      | INTEGER         | ID đơn hàng liên quan   |
| `product_id`    | INTEGER         | ID sản phẩm               |
| `quantity`      | INTEGER         | Số lượng mua/thao tác   |
| `unit_price`    | INTEGER         | Đơn giá                  |

## Bảng: `installment_payments`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                              |
| ----------------- | --------------- | ------------------------------------ |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)          |
| `order_id`      | INTEGER         | ID đơn hàng liên quan            |
| `amount`        | DECIMAL(10,2)   | Số tiền                            |
| `cashier_id`    | INTEGER         | ID nhân viên thu ngân nhận tiền |
| `created_at`    | DATETIME        | Thời gian tạo bản ghi             |

## Bảng: `attendance`

| Tên Cột (Biến)  | Kiểu dữ liệu | Mô tả                                              |
| ------------------ | --------------- | ---------------------------------------------------- |
| `id`             | INTEGER         | Khóa chính (ID duy nhất)                          |
| `user_id`        | INTEGER         | ID tài khoản liên quan (nhân viên/khách hàng) |
| `date`           | TEXT            | Ngày làm việc                                     |
| `check_in_time`  | TEXT            | Giờ chấm công vào                                |
| `check_out_time` | TEXT            | Giờ chấm công ra                                  |
| `total_hours`    | REAL            | Tổng số giờ làm việc trong ca                   |

## Bảng: `transactions`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                                                               |
| ----------------- | --------------- | --------------------------------------------------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)                                           |
| `type`          | TEXT            | Loại giao dịch (income: thu, expense: chi)                          |
| `amount`        | REAL            | Số tiền                                                             |
| `category`      | TEXT            | Hạng mục giao dịch                                                 |
| `description`   | TEXT            | Mô tả chi tiết                                                     |
| `reference_id`  | INTEGER         | ID của chứng từ liên quan (hóa đơn, đổi trả, bảo hành...) |
| `user_id`       | INTEGER         | ID tài khoản liên quan (nhân viên/khách hàng)                  |
| `created_at`    | DATETIME        | Thời gian tạo bản ghi                                              |
| `source`        | TEXT            | Nguồn tạo giao dịch (system, manual, v.v.)                         |
| `invoice_id`    | TEXT            | Mã số hóa đơn tham chiếu                                        |

## Bảng: `users`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                     |
| ----------------- | --------------- | --------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất) |

| `role` | TEXT | Vai trò trong hệ thống (admin, owner, staff) |
| `created_at` | DATETIME | Thời gian tạo bản ghi |
| `is_active` | BOOLEAN | Trạng thái hoạt động (1: Kích hoạt/Hiện diện, 0: Bị xóa/Ẩn) |

## Bảng: `audit_logs`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                                              |
| ----------------- | --------------- | ---------------------------------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)                          |
| `user_id`       | INTEGER         | ID tài khoản liên quan (nhân viên/khách hàng) |
| `action_type`   | TEXT            | Loại hành động (VD: create_order, login)         |
| `action_desc`   | TEXT            | Mô tả ngắn gọn về hành động                  |
| `created_at`    | DATETIME        | Thời gian tạo bản ghi                             |

## Bảng: `returns`

| Tên Cột (Biến) | Kiểu dữ liệu | Mô tả                                |
| ----------------- | --------------- | -------------------------------------- |
| `id`            | INTEGER         | Khóa chính (ID duy nhất)            |
| `order_id`      | INTEGER         | ID đơn hàng liên quan              |
| `customer_id`   | INTEGER         | ID khách hàng (nếu có tài khoản) |

| `return_type` | TEXT | Loại đổi trả (refund: hoàn tiền, exchange: đổi ngang) |
| `reason` | TEXT | Lý do yêu cầu |
| `requested_at` | DATETIME | Thời gian khách yêu cầu |
| `processed_at` | DATETIME | Thời gian đã xử lý xong |
| `status` | TEXT | Trạng thái hiện tại của bản ghi |
| `approved_by` | INTEGER | ID nhân viên phê duyệt |
| `refund_amount` | REAL | Số tiền hoàn lại cho khách |
| `exchange_product_id` | INTEGER | ID sản phẩm đổi mới (nếu có) |
| `notes` | TEXT | Ghi chú thêm |
| `created_by` | INTEGER | ID người tạo phiếu trên hệ thống |
| `is_active` | INTEGER | Trạng thái hoạt động (1: Kích hoạt/Hiện diện, 0: Bị xóa/Ẩn) |

## Bảng: `return_items`

| Tên Cột (Biến)           | Kiểu dữ liệu | Mô tả                                               |
| --------------------------- | --------------- | ----------------------------------------------------- |
| `id`                      | INTEGER         | Khóa chính (ID duy nhất)                           |
| `return_id`               | INTEGER         | ID phiếu đổi trả gốc                             |
| `order_item_id`           | INTEGER         | ID chi tiết sản phẩm trong đơn hàng             |
| `product_id`              | INTEGER         | ID sản phẩm                                         |
| `product_name`            | TEXT            | Tên sản phẩm tại thời điểm xử lý             |
| `quantity`                | INTEGER         | Số lượng mua/thao tác                             |
| `unit_price`              | REAL            | Đơn giá                                            |
| `condition_status`        | TEXT            | Tình trạng sản phẩm (new, defective, used)        |
| `defect_type`             | TEXT            | Phân loại lỗi                                      |
| `warranty_remaining_days` | INTEGER         | Số ngày bảo hành còn lại                        |
| `refund_amount`           | REAL            | Số tiền hoàn lại cho khách                       |
| `exchange_to_product_id`  | INTEGER         | Sản phẩm muốn đổi sang                           |
| `exchange_delta_amount`   | REAL            | Số tiền chênh lệch cần thu thêm hoặc trả lại |
| `status`                  | TEXT            | Trạng thái hiện tại của bản ghi                 |

## Bảng: `warranty_claims`

| Tên Cột (Biến)       | Kiểu dữ liệu | Mô tả                                                                        |
| ----------------------- | --------------- | ------------------------------------------------------------------------------ |
| `id`                  | INTEGER         | Khóa chính (ID duy nhất)                                                    |
| `order_id`            | INTEGER         | ID đơn hàng liên quan                                                      |
| `order_item_id`       | INTEGER         | ID chi tiết sản phẩm trong đơn hàng                                      |
| `product_id`          | INTEGER         | ID sản phẩm                                                                  |
| `customer_id`         | INTEGER         | ID khách hàng (nếu có tài khoản)                                         |
| `serial_number`       | TEXT            | Số seri của sản phẩm cần bảo hành                                       |
| `warranty_start_date` | DATETIME        | Ngày bắt đầu bảo hành                                                    |
| `warranty_end_date`   | DATETIME        | Ngày hết hạn bảo hành                                                     |
| `warranty_months`     | INTEGER         | Số tháng bảo hành mặc định                                              |
| `claim_type`          | TEXT            | Loại yêu cầu bảo hành                                                     |
| `issue_description`   | TEXT            | Mô tả lỗi gặp phải                                                        |
| `issue_code`          | TEXT            | Mã lỗi hệ thống (nếu có)                                                 |
| `claimed_at`          | DATETIME        | Thời điểm tiếp nhận bảo hành                                            |
| `status`              | TEXT            | Trạng thái hiện tại của bản ghi                                          |
| `approved_by`         | INTEGER         | ID nhân viên phê duyệt                                                     |
| `created_by`          | INTEGER         | ID người tạo phiếu trên hệ thống                                        |
| `notes`               | TEXT            | Ghi chú thêm                                                                 |
| `resolution_notes`    | TEXT            | Ghi chú về kết quả xử lý bảo hành (sửa chữa, thay mới, thu phí...) |
| `is_active`           | INTEGER         | Trạng thái hoạt động (1: Kích hoạt/Hiện diện, 0: Bị xóa/Ẩn)        |
