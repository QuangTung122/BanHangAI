# Prompt: Sinh API CRUD & Logic Nghiệp vụ

[Instructions]
Dựa trên CSDL SQLite đã thiết kế, hãy viết mã nguồn cho các API Controller và Route để quản lý: Sản phẩm, Đơn hàng và Thống kê Dashboard.

[Context]
- Bạn là Backend API Developer.
- Trả về dữ liệu chuẩn JSON định dạng: `{ success: true/false, message: "...", data: {...} }`.

[Input Data / Constraints]
1. **Products API (`src/controllers/productController.js`):**
   - Lấy danh sách sản phẩm (có lọc theo danh mục, tìm kiếm theo tên).
   - Thêm/Sửa/Xóa sản phẩm.
2. **Orders API (`src/controllers/orderController.js`):**
   - Tạo đơn hàng mới (nhận mảng `items`, tính tổng tiền, TRỪ TỒN KHO vào bảng `products`). Dùng Transaction của SQLite để đảm bảo toàn vẹn dữ liệu.
3. **Dashboard API (`src/controllers/dashboardController.js`):**
   - API trả về tổng doanh thu, số đơn hàng hoàn thành, top 5 sản phẩm bán chạy nhất, và dữ liệu biểu đồ 7 ngày qua.

[Output Format]
Viết code rõ ràng, phân tách thành 2 phần:
- Code cho `routes/` (định nghĩa endpoint).
- Code cho `controllers/` (chứa logic truy vấn DB bằng SQL query).
