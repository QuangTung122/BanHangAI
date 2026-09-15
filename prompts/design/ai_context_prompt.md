# Yêu cầu thiết kế (Design Prompt): Tính cách AI (System Prompt) và API truy vấn dữ liệu ngữ cảnh bảo mật

**Bối cảnh:**
Hệ thống BanHangAI hiện tại đang sử dụng chung 1 System Prompt tĩnh (lấy từ database) cho tất cả các vai trò. Điều này dẫn đến việc AI không phân biệt được người đang chat là Staff (cần tư vấn bán hàng) hay Owner (cần phân tích doanh thu). Ngoài ra, dữ liệu bơm vào cho AI chưa được kiểm soát chặt chẽ, dễ dẫn đến rò rỉ thông tin cá nhân.

**Yêu cầu:**
1. Hãy thiết kế một cơ chế phân quyền ngữ cảnh (Context) dựa trên JWT Token Role của người dùng (`req.user.role`).
2. Thiết kế các câu lệnh SQL truy vấn dữ liệu cụ thể cho `owner` (doanh thu, tồn kho, top bán chạy) và cho `staff` (danh sách sản phẩm).
3. Đảm bảo dữ liệu truy vấn KHÔNG chứa thông tin cá nhân nhạy cảm (mật khẩu, CCCD, sđt) để AI không bao giờ nhìn thấy và làm lộ.
4. Thiết kế 2 đoạn System Prompt riêng biệt, sắc bén và đóng vai xuất sắc (1 cho CFO, 1 cho Trợ lý bán hàng).

**Đầu ra mong đợi:**
Một file tài liệu Đặc tả Thiết kế (Design Spec) trình bày rõ luồng xử lý, các câu query SQL, và nội dung Prompt mẫu.
