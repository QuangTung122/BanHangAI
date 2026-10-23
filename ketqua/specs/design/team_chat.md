# Design Specs: Team Chat (Common)

## 1. Tổng quan
- **Chức năng:** Chat nội bộ
- **Vai trò:** Common

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: TEAM CHAT                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Team Chat]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Team Chat.

## 4. API Endpoints
- `GET /api/team/chat` - Lấy danh sách
- `POST /api/team/chat` - Thêm mới/Xử lý
- `PUT /api/team/chat/:id` - Cập nhật
- `DELETE /api/team/chat/:id` - Xóa
