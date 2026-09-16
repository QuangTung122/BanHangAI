# User Stories (Đặc tả câu chuyện người dùng toàn diện)

Tài liệu này bao quát toàn bộ các luồng nghiệp vụ trong hệ thống BanHangAI dựa trên 3 vai trò: **Admin, Owner, Staff**.

## EPIC 1: Quản Trị Hệ Thống (Admin)
**US 1.1: Quản lý Tài khoản (User Management)**
- *Story:* Là Quản trị viên, tôi muốn Thêm/Sửa/Xóa/Khóa tài khoản và phân quyền (Role) để kiểm soát truy cập hệ thống.
- *Acceptance Criteria (AC):*
  - Form tạo tài khoản bắt buộc nhập Email hợp lệ, SDT.
  - Role chỉ được chọn: ADMIN, OWNER, STAFF.
  - Khi vô hiệu hóa (Deactivate), user đó lập tức bị đá (logout) khỏi mọi phiên đăng nhập (thu hồi JWT).
  - Không cho phép tự xóa tài khoản của chính mình.

**US 1.2: Cấu hình Hệ thống (System Configuration)**
- *Story:* Là Quản trị viên, tôi muốn thiết lập các tham số toàn cục (VAT, Ngôn ngữ, Thuế) để đồng bộ mọi giao dịch.
- *AC:*
  - Có màn hình danh sách tham số (Key-Value).
  - Update cấu hình phải lưu vào Audit Log (Ai sửa, lúc nào, từ giá trị A sang B).

**US 1.3: Xem Nhật ký hệ thống (Audit Logs)**
- *Story:* Là Quản trị viên, tôi muốn xem lịch sử các hành động quan trọng để truy vết khi có lỗi hoặc phá hoại.
- *AC:* 
  - Ghi nhận mọi HTTP Method (POST, PUT, DELETE) với IP và UserID tương ứng.
  - Cung cấp bộ lọc theo Date Range và User.

## EPIC 2: Phân tích & Vận hành (Owner)
**US 2.1: Xem Báo cáo Doanh thu & AI Insight (Dashboard)**
- *Story:* Là Chủ cửa hàng, tôi muốn xem Dashboard và nhận phân tích kinh doanh từ AI để ra quyết định.
- *AC:*
  - Biểu đồ đường (Line chart) cho doanh thu 7 ngày/30 ngày.
  - Danh sách Top 5 sản phẩm bán chạy/bán ế.
  - Trợ lý AI tự động sinh nhận xét dạng text (Ví dụ: "Hôm nay doanh thu giảm 10%, đề xuất đẩy mạnh quảng cáo sản phẩm X").

**US 2.2: Quản lý Dòng tiền (Cashflow)**
- *Story:* Là Chủ cửa hàng, tôi muốn theo dõi toàn bộ giao dịch Thu/Chi tự động và thủ công để chốt sổ quỹ.
- *AC:*
  - Bảng thống kê dòng tiền với 3 tab: Thu, Chi, Tiền mặt thực tế.
  - Khi Staff bán hàng bằng Cash, hệ thống tự động ghi nhận 1 phiếu "Thu".
  - Tính năng "Chốt ca": In báo cáo cuối ngày và chốt số dư đầu kỳ cho ngày mai.

**US 2.3: Quản lý Nhân sự & KPI (Staff Management)**
- *Story:* Là Chủ cửa hàng, tôi muốn xem lịch sử chấm công và doanh số của từng nhân viên.
- *AC:*
  - Xem được bảng chấm công (Check-in/out).
  - Cột tính toán tổng doanh số (Sum Total Orders) của từng nhân viên trong tháng.

**US 2.4: Quản lý Sản phẩm & Tồn kho (Product Management)**
- *Story:* Là Chủ cửa hàng, tôi muốn nhập kho và thay đổi giá bán sản phẩm.
- *AC:*
  - Form nhập hàng hỗ trợ nhập nhiều mặt hàng cùng lúc.
  - Cập nhật tồn kho (Cộng dồn vào Stock cũ). Giá vốn (MAC) tự động điều chỉnh.

## EPIC 3: Bán hàng & Dịch vụ (Staff)
**US 3.1: Màn hình Bán hàng nhanh (POS)**
- *Story:* Là Nhân viên, tôi muốn quét mã vạch và lập hóa đơn thật nhanh.
- *AC:*
  - Có thể chọn sản phẩm từ lưới (Grid) hoặc dùng máy quét mã vạch.
  - Tính tổng tiền = (Đơn giá * Số lượng) - Giảm giá.
  - Không cho phép chọn quá số lượng tồn kho hiện tại (Nếu Tồn = 2, thêm 3 sẽ báo lỗi).
  - Thanh toán xong tự in Bill và reset giỏ hàng.

**US 3.2: Tư vấn AI (Chatbot)**
- *Story:* Là Nhân viên, tôi muốn AI trả lời các câu hỏi về sản phẩm để dễ tư vấn khách.
- *AC:*
  - Nhập câu hỏi tự nhiên.
  - AI chỉ sử dụng dữ liệu tồn kho thực tế (Context) để gợi ý, nếu hết hàng phải báo hết.

**US 3.3: Chấm công (Attendance)**
- *Story:* Là Nhân viên, tôi muốn nhấn Check-in/Check-out khi tới cửa hàng.
- *AC:*
  - Hệ thống lấy thời gian thực từ server (không dùng time của máy cá nhân).
  - Giới hạn: Chỉ check-in 1 lần mỗi ca.

**US 3.4: Bán Trả góp (Installment)**
- *Story:* Là Nhân viên, tôi muốn lập hồ sơ trả góp cho khách hàng mua món đồ giá trị cao.
- *AC:*
  - Lưu hồ sơ Khách hàng (Tên, CCCD).
  - Tự động chia lịch trả nợ (Ví dụ 6 tháng, lãi suất X%). Cảnh báo nếu khách sắp tới hạn.

**US 3.5: Trả hàng / Bảo hành (Return & Warranty)**
- *Story:* Là Nhân viên, tôi muốn xử lý khách mang hàng tới đổi/trả.
- *AC:*
  - Phải nhập đúng số Hóa đơn (Bill ID) cũ.
  - Khi hoàn trả, tự động cộng lại Tồn kho và tạo Phiếu "Chi" trả lại tiền khách.

## EPIC 4: Giao tiếp Nội bộ (Common)
**US 4.1: Team Chat**
- *Story:* Là Người dùng hệ thống, tôi muốn nhắn tin trực tiếp với quản lý hoặc đồng nghiệp.
- *AC:*
  - Giao tiếp Real-time (Websocket).
  - Phân tách theo Kênh (Channel) hoặc Nhắn tin riêng (Direct Message).
  - Có tính năng thông báo (Push Notification) khi có tin nhắn mới.
