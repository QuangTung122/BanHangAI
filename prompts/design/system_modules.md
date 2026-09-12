# Prompts Thiết Kế Hệ Thống BanHangAI

Tài liệu này chứa các mẫu câu lệnh (prompts) được tinh chỉnh để giao việc cho AI (như Claude, Gemini, ChatGPT) thực hiện **thiết kế chi tiết** cho các chức năng chính của hệ thống BanHangAI.

Kết quả (output) do AI sinh ra từ các prompt này sẽ được lưu trữ dưới dạng tài liệu đặc tả (specs) trong thư mục `@specs/design/`. Các prompt này được viết dựa trên kiến trúc thực tế của hệ thống: **Backend Node.js (Express, SQLite)** và **Frontend Vanilla JS (MVC)**.

---

## 1. Prompt: Thiết Kế Module Quản Lý Đơn Hàng & Bán Trả Góp

**Mục đích:** Đặc tả luồng bán hàng, đặc biệt là nghiệp vụ bán trả góp, thu cước hàng tháng và tự động ghi sổ quỹ.

**Nội dung Prompt:**

```text
Bạn là một System Architect và Business Analyst. Hãy viết tài liệu đặc tả thiết kế (Design Specs) cho "Module Quản Lý Đơn Hàng & Trả Góp" của hệ thống BanHangAI.
Tech stack: Backend Node.js (Express), Database SQLite, Frontend Vanilla JS.

Vui lòng cung cấp tài liệu bao gồm các phần sau:
1. **Thiết kế Database (Schema)**: 
   - Bảng `orders`: Lưu thông tin khách hàng (CCCD, tên, sđt), loại thanh toán (full/installment), kỳ hạn (installment_term), phí hàng tháng (monthly_fee).
   - Bảng `order_items`: Lưu chi tiết sản phẩm và số lượng, giá bán.
   - Bảng `installment_payments`: Lưu lịch sử đóng họ/trả góp từng kỳ của đơn hàng.
2. **Đặc tả API (RESTful)**:
   - `POST /api/order`: Logic xử lý tạo đơn (sinh mã hóa đơn INV-YYMMDD-ID, trừ tồn kho `products`, tự động ghi nhận vào `transactions` (sổ quỹ) với payment_type tương ứng).
   - `GET /api/order`: Lấy danh sách đơn hàng, tính toán số kỳ đã đóng và ngày đến hạn tiếp theo.
   - `POST /api/order/:id/payments`: Logic thu tiền trả góp (có tùy chọn pay_all để tất toán), kiểm tra số kỳ còn lại, ghi log sổ quỹ.
3. **Wireframe/UI Flow**: Mô tả các component trên Frontend (Form tạo đơn hàng chọn trả góp/trả thẳng, Bảng theo dõi khách nợ).
```

---

## 2. Prompt: Thiết Kế Module Sổ Quỹ & Giao Dịch (Cashbook / Transactions)

**Mục đích:** Đặc tả hệ thống theo dõi dòng tiền (thu/chi), quản lý tài chính tự động và thủ công.

**Nội dung Prompt:**

```text
Bạn là một System Architect. Hãy viết tài liệu đặc tả thiết kế cho "Module Quản Lý Sổ Quỹ (Transactions)" của hệ thống BanHangAI.
Tech stack: Backend Node.js (Express), Database SQLite, Frontend Vanilla JS.

Vui lòng cung cấp tài liệu bao gồm:
1. **Cấu trúc Database**:
   - Bảng `transactions`: Lưu các trường type (income/expense), amount, category (Bán hàng, Thu tiền trả góp, Chi phí sinh hoạt...), description, user_id (người thao tác), payment_method, source (auto/manual), invoice_id.
2. **Đặc tả API**:
   - `GET /api/transaction`: Lấy danh sách giao dịch, có hỗ trợ filter theo type, từ ngày - đến ngày. Trả về kèm theo số dư tổng (Total Balance), Tổng thu, Tổng chi.
   - `POST /api/transaction`: API cho phép tạo phiếu thu/chi thủ công (manual).
3. **Logic Nghiệp vụ cốt lõi**:
   - Nêu rõ cơ chế "Auto-recording": Làm thế nào các module khác (như Order) gọi tới luồng tạo Transaction tự động mà không làm phá vỡ tính toàn vẹn dữ liệu.
4. **UI Flow**: Mô tả giao diện Dashboard Sổ quỹ hiển thị biểu đồ dòng tiền (sử dụng Chart.js) và lưới danh sách thu chi.
```

---

## 3. Prompt: Thiết Kế Module Trợ Lý AI (AI Chat Assistant)

**Mục đích:** Đặc tả tích hợp AI (Google Generative AI) để hỗ trợ nhân viên tra cứu dữ liệu bán hàng bằng ngôn ngữ tự nhiên.

**Nội dung Prompt:**

```text
Bạn là chuyên gia tích hợp AI & Backend Developer. Hãy thiết kế tài liệu đặc tả cho "Module Trợ Lý AI" của hệ thống BanHangAI.
Tech stack: Node.js, Express, SQLite, @google/generative-ai.

Nội dung tài liệu yêu cầu:
1. **Kiến trúc luồng dữ liệu (Data Flow)**:
   - Cách Frontend gửi câu hỏi (prompt) của người dùng.
   - Cách Backend chặn (intercept) câu hỏi, chèn thêm System Prompt (context về database hiện tại như tổng doanh thu, số lượng đơn, tồn kho).
   - Luồng gọi tới Google Gemini API và trả kết quả về cho client.
2. **Đặc tả API**:
   - `POST /api/chat`: Nhận `message` từ client, query các thống kê cơ bản từ SQLite (như doanh thu hôm nay, khách nợ), nối vào ngữ cảnh để hỏi Gemini, sau đó parse response trả về dạng JSON.
3. **Prompt Engineering (Nội bộ)**: 
   - Viết mẫu System Prompt chuẩn để nạp cho Gemini, giúp AI hiểu vai trò của nó là "Trợ lý ảo BanHangAI", chỉ trả lời các câu hỏi liên quan đến số liệu kinh doanh.
4. **Bảo mật**: Các rủi ro khi truyền data hệ thống cho API bên thứ 3 và cách phòng tránh (chỉ truyền data thống kê đã được ẩn danh).
```

---

## 4. Prompt: Thiết Kế Module Quản Lý Nhân Sự & Chấm Công (User & Attendance)

**Mục đích:** Quản lý tài khoản nhân viên (cashier/admin) và hệ thống check-in/check-out.

**Nội dung Prompt:**

```text
Hãy viết tài liệu thiết kế (Design Specs) cho "Module Nhân Sự và Chấm Công" của hệ thống BanHangAI (Node.js + SQLite).

Yêu cầu tài liệu:
1. **Thiết kế Database**:
   - Bảng `users`: Thông tin nhân viên, role (admin/owner/cashier), trạng thái hoạt động.
   - Bảng `attendance`: user_id, check_in_time, check_out_time, date, status (hợp lệ, đi muộn, về sớm).
2. **Đặc tả API**:
   - `POST /api/attendance/check-in` & `POST /api/attendance/check-out`: Xử lý ghi nhận thời gian chấm công dựa trên thời gian server thực.
   - `GET /api/attendance/my-attendance`: Xem lịch sử chấm công cá nhân.
   - `GET /api/user`: Lấy danh sách nhân sự (Dành cho Admin).
3. **Logic Nghiệp vụ**:
   - Ràng buộc: Mỗi nhân viên chỉ được check-in 1 lần 1 ngày, chỉ được check-out nếu đã check-in.
4. **UI Flow**: Mô tả màn hình hiển thị đồng hồ thời gian thực và nút Check-in/Check-out lớn trên Dashboard cho nhân viên.
```
