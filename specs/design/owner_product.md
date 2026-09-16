# Design Specs: Product Mgmt (Owner)

## 1. Tổng quan
- **Chức năng:** Quản lý hàng hóa
- **Vai trò:** Owner

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: PRODUCT MGMT                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Product Mgmt]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Product Mgmt.

## 4. API Endpoints
- `GET /api/owner/product` - Lấy danh sách
- `POST /api/owner/product` - Thêm mới/Xử lý
- `PUT /api/owner/product/:id` - Cập nhật
- `DELETE /api/owner/product/:id` - Xóa
