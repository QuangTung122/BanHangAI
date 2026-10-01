# Design Specs: Dashboard (Owner)

## 1. Tổng quan
- **Chức năng:** Biểu đồ, báo cáo AI
- **Vai trò:** Owner

## 2. Wireframe Giao Diện (ASCII Art)
```text
+-----------------------------------------------------------------------------+
|  [BanHangAI]   |   Menu chức năng: DASHBOARD                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Khu vực chức năng chính Dashboard]                                           |
|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |
|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## 3. Database Schema (Backend)
- Cần ánh xạ với bảng nghiệp vụ liên quan đến Dashboard.

## 4. API Endpoints
- `GET /api/owner/dashboard` - Lấy danh sách
- `POST /api/owner/dashboard` - Thêm mới/Xử lý
- `PUT /api/owner/dashboard/:id` - Cập nhật
- `DELETE /api/owner/dashboard/:id` - Xóa
- `POST /api/dashboard/insight` - Tổng hợp số liệu tháng từ CSDL; dùng Ollama để diễn giải khi khả dụng và fallback tổng hợp theo quy tắc khi AI lỗi.
- AI không tự ghi dữ liệu và không được tạo số giá/tồn kho/doanh thu; các tỷ lệ so sánh chỉ hiển thị khi có số liệu kỳ đối chiếu thực.
