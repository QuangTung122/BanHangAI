# Design Specs: Staff Mgmt (Owner)

## 1. Tổng quan
- **Chức năng:** Quản lý nhân viên
- **Vai trò:** Owner

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: STAFF MGMT                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Staff Mgmt]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Staff Mgmt.

## 4. API Endpoints
- `GET /api/owner/staff` - Lấy danh sách
- `POST /api/owner/staff` - Thêm mới/Xử lý
- `PUT /api/owner/staff/:id` - Cập nhật
- `DELETE /api/owner/staff/:id` - Xóa
