# Design Specs: User Management (Admin)

## 1. Tổng quan
- **Chức năng:** Quản lý tài khoản
- **Vai trò:** Admin

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: USER MANAGEMENT                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính User Management]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến User Management.

## 4. API Endpoints
- `GET /api/admin/user` - Lấy danh sách
- `POST /api/admin/user` - Thêm mới/Xử lý
- `PUT /api/admin/user/:id` - Cập nhật
- `DELETE /api/admin/user/:id` - Xóa
