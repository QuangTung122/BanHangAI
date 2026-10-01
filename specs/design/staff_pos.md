# Design Specs: POS (Staff)

## 1. Tổng quan
- **Chức năng:** Bán hàng nhanh
- **Vai trò:** Staff

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: POS                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính POS]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến POS.

## 4. API Endpoints
- `GET /api/staff/pos` - Lấy danh sách
- `POST /api/staff/pos` - Thêm mới/Xử lý
- `PUT /api/staff/pos/:id` - Cập nhật
- `DELETE /api/staff/pos/:id` - Xóa
- `POST /api/products/assist` - Lọc sản phẩm theo nhu cầu, ngân sách, dữ liệu giá/tồn; AI chỉ diễn giải kết quả đã lọc.
- `POST /api/products/bundle-suggestions` - Gợi ý sản phẩm mua kèm dựa trên đơn hàng đã thanh toán và phụ kiện còn hàng.
- POS hiển thị gợi ý ngay trong luồng bán hàng; nhân viên chủ động thêm sản phẩm vào giỏ và vẫn xác nhận giá/tồn thực tế.
