# Prompt Thiết Kế: Module Bán Hàng (POS) & Đơn Hàng

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Dự án BanHangAI đang cần thiết kế chi tiết cho "Module Bán Hàng (POS) & Đơn Hàng". Hệ thống sử dụng Node.js (Express) cho Backend, SQLite cho Database, và Vanilla JS (MVC) cho Frontend.

**Yêu cầu đầu ra (Output):**
Vui lòng tạo một file đặc tả thiết kế (Design Specs) bao gồm 3 phần chính:
1. **Wireframe Giao Diện (Text/ASCII Art):** Phải thể hiện bố cục màn hình POS với 2 cột (Trái: Danh sách sản phẩm, Phải: Giỏ hàng). Đặc biệt, khu vực Giỏ hàng phải có form nhập Thông tin khách hàng (Tên, SĐT), dropdown chọn Hình thức thanh toán (Trả thẳng / Trả góp), và form ẩn hiện hồ sơ trả góp (CCCD, Kỳ hạn 3-6-9-12 tháng, hiển thị phí), dropdown hình thức nhận tiền (Chuyển khoản, Tiền mặt, Thẻ) và Nút Thanh toán & In hóa đơn.
2. **Database Schema:** Cấu trúc các bảng `orders`, `order_items`, `installment_payments` có liên quan đến việc lưu trữ dữ liệu từ giao diện POS trên.
3. **API Specs:** Đặc tả API tạo đơn hàng (`POST /api/order`), giải thích rõ body request từ giao diện sẽ gửi lên những trường gì (items, total_amount, payment_type, payment_method, customer_name, customer_phone, customer_cccd, installment_term, monthly_fee).

**Định dạng:** 
Trả về chuẩn Markdown.
