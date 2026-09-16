# Sổ Tay Hướng Dẫn Sử Dụng (User Manual) - BanHangAI

Chào mừng bạn đến với **BanHangAI** - Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo. Tài liệu này được biên soạn nhằm hướng dẫn người dùng làm quen và thao tác với hệ thống một cách nhanh chóng, chính xác theo từng vai trò (Role).

---

## 1. Hướng Dẫn Đăng Nhập & Bắt Đầu
1. Truy cập vào đường dẫn hệ thống do quản trị viên cung cấp.
2. Tại màn hình **Đăng nhập (Login)**, nhập \`Email\` và \`Mật khẩu\`.
3. Nhấn **Đăng nhập**. Hệ thống sẽ tự động điều hướng bạn tới đúng giao diện làm việc (Dashboard, POS, hoặc System Admin) tùy thuộc vào quyền hạn của bạn.

---

## 2. Dành Cho Nhân Viên Bán Hàng (Staff)

Giao diện của Staff được thiết kế tối ưu cho tốc độ và sự tiện lợi khi phục vụ khách hàng.

### 2.1. Chấm Công (Attendance)
- Ngay khi tới ca làm, truy cập menu **Chấm Công**.
- Nhấn nút **Check-in**. Hệ thống sẽ ghi nhận thời gian bắt đầu ca.
- Khi kết thúc ca làm, nhấn **Check-out**. *Lưu ý: Bạn bắt buộc phải check-out để hệ thống ghi nhận đủ giờ làm việc trong ngày.*

### 2.2. Bán Hàng Nhanh (POS)
- Truy cập menu **Bán Hàng**.
- **Thêm sản phẩm:** Bạn có thể dùng súng quét mã vạch (Barcode Scanner) quét trực tiếp lên sản phẩm, hoặc gõ tên vào ô "Tìm kiếm". Sản phẩm sẽ tự động nhảy vào Giỏ hàng bên phải.
- **Tư vấn AI:** Nếu khách yêu cầu tư vấn (Ví dụ: "Tìm chuột máy tính dưới 300k, kết nối Bluetooth"), hãy gõ câu này vào khung **Trợ lý AI** góc trái màn hình. AI sẽ tự động phân tích kho hàng thực tế và gợi ý 3 sản phẩm phù hợp nhất.
- **Thanh toán:** Kiểm tra lại số lượng và tổng tiền. Nhập số tiền khách đưa, hệ thống sẽ tự tính tiền thối. Nhấn **Thanh toán & In hóa đơn** (Hệ thống sẽ tự động trừ tồn kho).

### 2.3. Bán Trả Góp (Installment)
- Chuyển sang tab **Trả Góp** nếu khách không thanh toán 100%.
- Nhập thông tin Khách hàng (Tên, CCCD/CMND, Số điện thoại).
- Chọn kỳ hạn trả góp (3, 6, 9 tháng). Hệ thống sẽ tự tính toán số tiền gốc và lãi cần đóng mỗi tháng.
- Xác nhận tạo hồ sơ. 

### 2.4. Đổi Trả & Bảo Hành (Return & Warranty)
- Truy cập menu **Bảo Hành**.
- Gõ Mã Hóa Đơn cũ của khách vào ô tìm kiếm.
- Chọn sản phẩm bị lỗi và chọn hình thức: **Đổi trả (Refund)** hoặc **Bảo hành (Warranty)**.
- Ghi chú tình trạng lỗi và nhấn Xác nhận. Hệ thống sẽ cộng lại tồn kho và lập phiếu Chi hoàn tiền (nếu là Refund).

---

## 3. Dành Cho Chủ Cửa Hàng (Owner)

Vai trò Owner tập trung vào việc quản lý, giám sát dòng tiền và ra quyết định kinh doanh nhờ AI.

### 3.1. Phân Tích Kinh Doanh AI (Dashboard)
- Truy cập menu **Tổng Quan**.
- **Báo cáo tự động:** Trợ lý AI sẽ tổng hợp dữ liệu doanh thu, sản phẩm bán chạy, sản phẩm tồn kho lâu ngày và viết sẵn một bản báo cáo bằng chữ (Ví dụ: "Doanh thu hôm nay tăng 15% so với hôm qua, Tai nghe X1 sắp hết hàng, nên nhập thêm").
- **Hỏi đáp Dữ liệu:** Bạn có thể đặt câu hỏi trực tiếp với AI tại ô Chat. Ví dụ: *"Tháng này nhân viên nào bán được nhiều nhất?"*. AI sẽ query dữ liệu và trả lời bạn ngay lập tức.

### 3.2. Quản Lý Dòng Tiền & Sổ Quỹ (Cashflow)
- Truy cập menu **Sổ Quỹ**.
- Theo dõi lịch sử Thu (từ hóa đơn khách mua) và Chi (từ bảo hành, nhập hàng, hoặc chi phí điện nước).
- Cuối ngày, Owner nhấn nút **Chốt Ca**. Hệ thống sẽ khóa sổ ngày hôm đó, in báo cáo tổng, và chuyển số dư cuối kỳ làm số dư đầu kỳ cho ngày mai.

### 3.3. Quản Lý Hàng Hóa (Products)
- Thêm mới sản phẩm, đặt Giá nhập (Giá vốn) và Giá bán lẻ.
- Quản lý số lượng tồn kho. Khi bạn nhập thêm hàng, giá vốn sẽ tự động tính lại theo công thức Bình quân gia quyền (MAC).

### 3.4. Quản Lý Nhân Viên (Staff KPI)
- Xem bảng chấm công tổng hợp của tất cả nhân viên.
- Theo dõi doanh số bán hàng của từng nhân viên theo ngày/tháng để dễ dàng tính hoa hồng hoặc KPI.

---

## 4. Dành Cho Quản Trị Viên (Admin)

Admin chịu trách nhiệm vận hành kỹ thuật và kiểm soát truy cập hệ thống.

### 4.1. Quản Lý Tài Khoản (User Management)
- Tạo tài khoản mới cho nhân viên. Phải cấp đúng **Role (Quyền)**: STAFF (Nhân viên) hoặc OWNER (Quản lý).
- Khi có nhân viên nghỉ việc, nhấn **Vô Hiệu Hóa (Deactivate)** thay vì xóa. Hệ thống sẽ ngay lập tức "đá" nhân viên đó ra khỏi mọi thiết bị đang đăng nhập.

### 4.2. Cấu Hình Hệ Thống (System Config)
- Thay đổi các tham số toàn cục như: Mức thuế VAT (%), Tên cửa hàng, Địa chỉ in trên hóa đơn.

### 4.3. Nhật Ký Hoạt Động (Audit Logs)
- Truy cập menu **Nhật Ký**. Nơi đây lưu lại toàn bộ hành động xóa, sửa dữ liệu (Ai làm, làm lúc nào, địa chỉ IP nào). Rất hữu ích để truy vết khi nghi ngờ có gian lận nội bộ.

---

## 5. Tính Năng Dùng Chung (Team Chat)
Bất kể bạn là Admin, Owner hay Staff, bạn đều có thể truy cập module **Team Chat**.
- Sử dụng để nhắn tin trao đổi công việc nhanh chóng theo từng Kênh (Channels) hoặc tin nhắn trực tiếp (Direct Message).
- Khi có tin nhắn mới, hệ thống sẽ hiện thông báo (Push Notification) nhỏ ở góc phải màn hình.
