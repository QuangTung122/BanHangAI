# Design Specs: Authentication (Common)

## 1. Tổng quan
- **Chức năng:** Đăng nhập, đăng xuất
- **Vai trò:** Common

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: AUTHENTICATION                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Authentication]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Authentication.

## 4. API Endpoints
- `GET /api/auth` - Lấy danh sách
- `POST /api/auth` - Thêm mới/Xử lý
- `PUT /api/auth/:id` - Cập nhật
- `DELETE /api/auth/:id` - Xóa
