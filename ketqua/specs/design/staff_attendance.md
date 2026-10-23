# Design Specs: Attendance (Staff)

## 1. Tổng quan
- **Chức năng:** Chấm công
- **Vai trò:** Staff

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: ATTENDANCE                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Attendance]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Attendance.

## 4. API Endpoints
- `GET /api/staff/attendance` - Lấy danh sách
- `POST /api/staff/attendance` - Thêm mới/Xử lý
- `PUT /api/staff/attendance/:id` - Cập nhật
- `DELETE /api/staff/attendance/:id` - Xóa
