# Prompt Thiết Kế: Module Quản lý Sản Phẩm (Kho hàng)

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Hệ thống BanHangAI cần thiết kế module "Quản lý Kho hàng & Sản phẩm". Giao diện thực tế tham chiếu từ `OwnerProductView.js` và logic Backend từ `productController.js`.

**Yêu cầu đầu ra:**
Vui lòng tạo file Design Specs (Markdown) lưu tại `specs/design/product_spec.md` gồm:
1. **Wireframe Giao Diện (ASCII Art):**
   - Màn hình chính: Nút Thêm sản phẩm. Thanh công cụ tìm kiếm, filter theo danh mục, các tab lọc nhanh (Tất cả / Hàng dồi dào / Hàng sắp hết). Lưới danh sách sản phẩm (ID, Ảnh/Tên, Danh mục, Giá nhập, Giá bán, Tồn kho, Nút Sửa/Xóa).
   - Form Thêm/Sửa Sản phẩm (Modal): Có các trường SKU, Tên, Danh mục, Giá nhập, Giá bán, Tồn kho, Ngưỡng sắp hết (Low stock threshold). Đặc biệt có nút "AI Gợi ý thông tin".
2. **Database Schema:** Cấu trúc bảng `products` và `categories`.
3. **API Specs:**
   - `GET /api/product`: Filter theo search, category.
   - `POST /api/product` và `PUT /api/product/:id`: Thêm/Sửa SP, tự động tạo `slug` độc nhất từ tên.
   - `DELETE /api/product/:id`: Xóa (Soft delete, set `is_active = 0`).
