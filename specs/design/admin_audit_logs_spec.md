# Đặc tả Hệ thống & Thiết kế Giao diện: Nhật ký hoạt động (Audit Logs)

## 1. Use Cases & Business Rules
- **Chỉ Admin** mới có quyền truy cập trang Nhật ký hoạt động.
- Hệ thống tự động lưu vết các sự kiện sau:
  - **Hệ thống (System):** Thay đổi cấu hình (AI, BGM), Reset Database.
  - **Xác thực (Auth):** Đăng nhập thành công, đăng nhập thất bại, đăng xuất.
  - **Dữ liệu (Data):** Thêm/Sửa/Xóa tài khoản, sản phẩm, khuyến mãi.
- **Dữ liệu lưu vết:** Bao gồm User ID, Tên User, Hành động (Action), Chi tiết (Old Data/New Data dưới dạng JSON), IP (nếu có), và Thời gian.

## 2. Database Schema (Bảng `audit_logs`)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ID tự tăng |
| `user_id` | INTEGER | NULL | ID của người thực hiện (NULL nếu là khách chưa đăng nhập) |
| `action_type` | TEXT | NOT NULL | Loại hành động (AUTH, SYSTEM, DATA) |
| `action_desc` | TEXT | NOT NULL | Mô tả ngắn (VD: "Đăng nhập thất bại") |
| `details` | TEXT | NULL | JSON string chứa dữ liệu cũ/mới để đối chiếu |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Thời gian thực hiện |

## 3. API Specification
- **GET `/api/audit-logs`**
  - **Query Params:** `page`, `limit`, `action_type`, `user_id`, `from_date`, `to_date`.
  - **Auth:** Middleware `requireAuth`, `requireRole(['admin'])`.
  - **Response:** JSON list của logs kèm theo tổng số trang (total_pages).

## 4. Wireframe / UI Layout
Giao diện nằm trong màn hình Main Workspace khi Admin click vào menu "Nhật ký hoạt động".

```text
+-------------------------------------------------------------------------+
| [Tiêu đề] Nhật ký hoạt động hệ thống                                    |
+-------------------------------------------------------------------------+
| [Bộ lọc]                                                                |
| Loại hành động: [Tất cả | Auth | System | Data] (Dropdown)              |
| Từ ngày: [ DatePicker ]   Đến ngày: [ DatePicker ]                      |
| User ID: [ Nhập ID... ]   [ Nút: Áp dụng Lọc ] [ Nút: Làm mới ]         |
+-------------------------------------------------------------------------+
| Bảng dữ liệu:                                                           |
| Thời gian       | Người dùng   | Loại   | Hành động         | Chi tiết  |
|-----------------|--------------|--------|-------------------|-----------|
| 14/09 22:15     | admin (ID:1) | SYSTEM | Cập nhật BGM      | [Xem JSON]|
| 14/09 20:00     | staff (ID:4) | AUTH   | Đăng nhập         | [Xem JSON]|
| 13/09 18:30     | Khách (IP)   | AUTH   | Sai mật khẩu      | [Xem JSON]|
+-------------------------------------------------------------------------+
| Phân trang: [ < Trang trước ]  1 / 5  [ Trang sau > ]                   |
+-------------------------------------------------------------------------+
```
*(Khi click [Xem JSON], một Modal (Toast hoặc Pop-up) sẽ hiện ra chứa chuỗi JSON format đẹp mắt để Admin đọc biến động dữ liệu).*
