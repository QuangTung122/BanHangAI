# Từ Điển Dữ Liệu Chi Tiết (Database Dictionary)

Bộ tài liệu này liệt kê TOÀN BỘ cấu trúc Database đang phục vụ cho 11 Controller hiện tại của BanHangAI (Bao gồm Audit, Attendance, Installments, Warranty, Chat...).

## 1. Bảng `users` (Quản lý Nhân sự & Phân quyền)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã User |
| email | VARCHAR(100)| | UNIQUE, NOT NULL | Dùng để Login |
| password_hash | VARCHAR(255)| | NOT NULL | Băm bằng bcrypt |
| full_name | VARCHAR(100)| | NOT NULL | Tên hiển thị |
| role | ENUM | | 'ADMIN', 'OWNER', 'STAFF' | Phân quyền truy cập |
| is_active | BOOLEAN | | DEFAULT 1 | 0 = Khóa tài khoản |

## 2. Bảng `products` (Danh mục Hàng hóa)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã SP nội bộ |
| sku | VARCHAR(50)| | UNIQUE, NOT NULL | Mã vạch (Barcode) |
| name | VARCHAR(255)| | NOT NULL | Tên sản phẩm |
| import_price | DECIMAL(12,2)| | >= 0 | Giá nhập kho (Giá vốn) |
| retail_price | DECIMAL(12,2)| | >= 0 | Giá bán lẻ |
| stock_qty | INT | | DEFAULT 0 | Số lượng tồn kho thực tế |
| status | ENUM | | 'ACTIVE', 'OUT_OF_STOCK' | Trạng thái hiển thị |

## 3. Bảng `orders` (Hóa Đơn Tổng)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã HĐ |
| staff_id | INT | FK | -> users.id | Người lập HĐ |
| customer_name| VARCHAR(100)| | Có thể NULL | Tên khách lẻ |
| total_amount | DECIMAL(15,2)| | NOT NULL | Tổng cộng (Sau giảm giá)|
| payment_type | ENUM | | 'CASH', 'CARD', 'TRANSFER'| Hình thức thanh toán |
| created_at | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Ngày giờ bán |

## 4. Bảng `order_details` (Chi Tiết Hóa Đơn)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| order_id | INT | FK | -> orders.id (ON DELETE CASCADE) | Trỏ về Hóa Đơn |
| product_id | INT | FK | -> products.id | Trỏ về Sản Phẩm |
| quantity | INT | | > 0 | Số lượng mua |
| unit_price | DECIMAL(12,2)| | NOT NULL | Giá tại thời điểm chốt Bill|

## 5. Bảng `transactions` (Sổ Quỹ / Dòng Tiền)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã Phiếu |
| user_id | INT | FK | -> users.id | Người tạo phiếu |
| amount | DECIMAL(15,2)| | NOT NULL | Số tiền |
| trans_type | ENUM | | 'INCOME', 'EXPENSE' | Thu (INCOME) / Chi (EXPENSE) |
| reference_id | INT | | Tùy chọn | Trỏ về OrderID hoặc WarrantyID |

## 6. Bảng `attendances` (Chấm Công)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã ca làm |
| staff_id | INT | FK | -> users.id | Người chấm công |
| check_in_time| TIMESTAMP | | NOT NULL | Giờ bắt đầu |
| check_out_time| TIMESTAMP | | NULL | Giờ kết thúc |

## 7. Bảng `installments` (Trả Góp)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| order_id | INT | PK, FK | -> orders.id | Áp dụng cho đơn nào |
| customer_cccd| VARCHAR(20)| | NOT NULL | Căn cước công dân |
| total_months | INT | | > 0 | Kì hạn trả góp |
| interest_rate| DECIMAL(5,2)| | Tỉ lệ % | Lãi suất |

## 8. Bảng `audit_logs` (Nhật ký Hệ Thống)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| user_id | INT | FK | -> users.id | Ai thao tác |
| action | VARCHAR(50)| | 'CREATE', 'UPDATE', 'DELETE' | Loại thao tác |
| table_name | VARCHAR(50)| | | Bảng bị ảnh hưởng |
| payload | JSON | | | Dữ liệu cũ/mới (Diff) |
| timestamp | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Thời gian thực hiện |

## 9. Bảng `chat_messages` (Team Chat)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| sender_id | INT | FK | -> users.id | Người gửi |
| receiver_id | INT | FK | -> users.id (Có thể NULL) | Người nhận (Nếu DM) |
| content | TEXT | | NOT NULL | Nội dung chat |
| created_at | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Thời gian gửi |

## 10. Bảng `return_warranties` (Bảo Hành/Đổi Trả)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| order_id | INT | FK | -> orders.id | Hóa đơn gốc |
| product_id | INT | FK | -> products.id | SP bị lỗi |
| return_type | ENUM | | 'WARRANTY', 'REFUND' | Bảo hành hoặc Đổi trả tiền |
| status | ENUM | | 'PENDING', 'RESOLVED' | Trạng thái xử lý |
