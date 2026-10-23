# Design Specs: Order History (Staff)

## 1. Tổng quan
- **Chức năng:** Lịch sử hóa đơn
- **Vai trò:** Staff

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: ORDER HISTORY                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Order History]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Order History.

## 4. API Endpoints
- `GET /api/staff/order_history` - Lấy danh sách
- `POST /api/staff/order_history` - Thêm mới/Xử lý
- `PUT /api/staff/order_history/:id` - Cập nhật
- `DELETE /api/staff/order_history/:id` - Xóa
