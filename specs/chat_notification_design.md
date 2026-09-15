# Thiết kế Đặc tả chức năng Chat & Thông báo Nội bộ

## 1. Yêu cầu & Luồng nghiệp vụ
### 1.1. Chức năng Chat (Trò chuyện nội bộ)
- **Mục tiêu:** Cho phép trao đổi thông tin, tương tác công việc giữa các nhân sự (Owner, Admin, Staff).
- **Phân quyền & Luồng:**
  - `Staff` (Nhân viên): Chỉ có thể gửi tin nhắn cho `Owner` (để xin duyệt nghỉ, duyệt giá) hoặc `Admin` (hỗ trợ kỹ thuật hệ thống). Không chat được với Staff khác để tránh buôn chuyện trong giờ làm.
  - `Admin` (Quản trị viên): Có thể chat với bất kỳ ai để hỗ trợ, thông báo kỹ thuật.
  - `Owner` (Chủ cửa hàng): Có thể chat với bất kỳ ai để điều hành, giám sát.
- **Tính năng:** Chat 1-1, hiển thị trạng thái chưa đọc/đã đọc (seen), gửi text theo thời gian thực (polling hoặc websocket).

### 1.2. Chức năng Thông báo (Notification)
- **Mục tiêu:** Báo động cho người dùng khi có tin nhắn mới hoặc sự kiện hệ thống khẩn cấp (vd: yêu cầu duyệt chi, cảnh báo hết hàng).
- **Tính năng:**
  - Hiển thị số lượng thông báo chưa đọc trên biểu tượng quả chuông (Badge).
  - Nhấp vào quả chuông xổ ra danh sách thông báo (Dropdown) xem nhanh.
  - Đánh dấu đã đọc cho từng thông báo hoặc "Đọc tất cả".

## 2. Thiết kế Cơ sở Dữ liệu (SQLite)
Cần bổ sung/cập nhật bảng trong `backend/database/init.sql`:

**Bảng `messages` (Lưu lịch sử Chat):**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `sender_id`: INTEGER (Khóa ngoại -> users.id)
- `receiver_id`: INTEGER (Khóa ngoại -> users.id)
- `content`: TEXT NOT NULL
- `is_read`: BOOLEAN DEFAULT 0
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Bảng `notifications` (Lưu Thông báo hệ thống/Tin nhắn):**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id`: INTEGER (Người nhận, Khóa ngoại -> users.id)
- `title`: VARCHAR(255)
- `message`: TEXT
- `type`: VARCHAR(50) (Giá trị: 'system', 'chat', 'order')
- `related_id`: INTEGER (ID của entity liên quan, ví dụ order_id hoặc message_id)
- `is_read`: BOOLEAN DEFAULT 0
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## 3. Thiết kế Wireframe (UI/UX)

### 3.1. Wireframe Nút Thông báo & Cửa sổ Dropdown (Layout Header)
```text
[Thanh Header - Góc phải màn hình]
[ Avatar User ] | [ 🔔 (3) ] <-- Nút chuông có vòng đỏ báo số 3 (Badge)

Khi click chuột vào [ 🔔 (3) ], thả xuống (Dropdown):
+---------------------------------------+
| Thông báo của bạn           [Đọc hết] |
|---------------------------------------|
| 🔵 [Hệ thống] Đơn hàng #123 đã hủy   |
|    10 phút trước                      |
|---------------------------------------|
| 🔵 [Tin nhắn] Owner: Em duyệt nhé...  |
|    1 giờ trước                        |
|---------------------------------------|
| ⚪ [Hệ thống] Đăng nhập thiết bị mới  |
|    Hôm qua                            |
+---------------------------------------+
```

### 3.2. Wireframe Khung Chat (Component góc dưới phải)
```text
+---------------------------------------+
| 🟢 [ Chat với: Owner ]            [-] |
|---------------------------------------|
|                                       |
| [Owner] 10:00: Nhớ kiểm kê kho nhé.   |
|                                       |
| [Bạn]   10:05: Dạ em đã nắm thông tin.|
|                 (Đã xem)              |
|---------------------------------------|
| Nhập tin nhắn tại đây...        [Gửi] |
+---------------------------------------+
```
