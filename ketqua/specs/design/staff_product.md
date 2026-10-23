# Design Specs: Products (Staff)

## 1. Tổng quan
- **Chức năng:** Xem tồn kho
- **Vai trò:** Staff

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: PRODUCTS                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Products]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Products.

## 4. API Endpoints
- `GET /api/staff/product` - Lấy danh sách
- `POST /api/staff/product` - Thêm mới/Xử lý
- `PUT /api/staff/product/:id` - Cập nhật
- `DELETE /api/staff/product/:id` - Xóa
