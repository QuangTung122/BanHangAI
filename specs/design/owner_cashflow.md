# Design Specs: Cashflow (Owner)

## 1. Tổng quan
- **Chức năng:** Sổ quỹ, dòng tiền
- **Vai trò:** Owner

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: CASHFLOW                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Cashflow]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Cashflow.

## 4. API Endpoints
- `GET /api/owner/cashflow` - Lấy danh sách
- `POST /api/owner/cashflow` - Thêm mới/Xử lý
- `PUT /api/owner/cashflow/:id` - Cập nhật
- `DELETE /api/owner/cashflow/:id` - Xóa
