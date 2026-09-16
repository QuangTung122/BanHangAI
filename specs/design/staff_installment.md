# Design Specs: Installment (Staff)

## 1. Tổng quan
- **Chức năng:** Mua trả góp
- **Vai trò:** Staff

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: INSTALLMENT                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Installment]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Installment.

## 4. API Endpoints
- `GET /api/staff/installment` - Lấy danh sách
- `POST /api/staff/installment` - Thêm mới/Xử lý
- `PUT /api/staff/installment/:id` - Cập nhật
- `DELETE /api/staff/installment/:id` - Xóa
