# Prompt Lập Trình (Development): Module Quản lý Sản Phẩm

**Vai trò AI:** Fullstack Developer.

**Ngữ cảnh:** Đã có Specs tại `specs/design/product_spec.md`.

**Yêu cầu Backend (`productController.js`):**
- Đảm bảo logic Soft Delete trong hàm `deleteProduct` (`UPDATE products SET is_active = 0`).
- Trong hàm `createProduct` / `updateProduct`: Viết thuật toán tạo `slug` tự động từ tiếng Việt có dấu thành không dấu (VD: "Điện thoại" -> "dien-thoai"), và gắn vòng lặp `while` để thêm hậu tố nếu trùng trong database.

**Yêu cầu Frontend (`OwnerProductView.js`):**
- Viết logic lọc dữ liệu Frontend cho các Tab "Hàng dồi dào" (`stock > low_stock_threshold`) và "Hàng sắp hết" (`stock <= low_stock_threshold`).
- Gắn API calls khi bấm Lưu Sản Phẩm hoặc Xóa Sản Phẩm. Đảm bảo form xử lý tốt việc cập nhật (có ID) và thêm mới (không ID).
