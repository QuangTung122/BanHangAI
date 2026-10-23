# Design Specs: System Configuration (Admin)

## 1. Tổng quan
- **Chức năng:** Cấu hình hệ thống
- **Vai trò:** Admin

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: SYSTEM CONFIGURATION                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính System Configuration]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến System Configuration.

## 4. API Endpoints
- `GET /api/admin/system` - Lấy danh sách
- `POST /api/admin/system` - Thêm mới/Xử lý
- `PUT /api/admin/system/:id` - Cập nhật
- `DELETE /api/admin/system/:id` - Xóa
