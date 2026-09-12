# User Stories và Tiêu chí nghiệm thu - Thực tế

## 1. Nhóm Quản trị hệ thống (Admin)
**US01: Cấu hình kết nối AI**
- **User Story:** Là Admin, tôi muốn cấu hình tham số AI (Ollama Host, Model, System Prompt) ngay trên giao diện để có thể thay đổi cách AI phản hồi mà không cần sửa code.
- **Tiêu chí nghiệm thu:**
  1. Có màn hình Cấu hình hệ thống lưu dữ liệu vào bảng `system_configs`.
  2. Mọi request gọi AI sau đó đều đọc config mới nhất.

## 2. Nhóm Chủ cửa hàng (Owner)
**US02: Phân tích Insight AI**
- **User Story:** Là Chủ cửa hàng, tôi muốn xem nhận xét của AI về doanh thu trên Dashboard để nắm bắt tình hình kinh doanh nhanh chóng.
- **Tiêu chí nghiệm thu:**
  1. Dashboard phải hiển thị biểu đồ và top sản phẩm.
  2. Nút "Phân Tích Dữ Liệu Thực" gọi AI bằng ngữ cảnh số liệu hiện tại và in ra lời khuyên bên dưới biểu đồ.

**US03: Quản lý Sản phẩm**
- **User Story:** Là Chủ cửa hàng, tôi muốn thêm mới sản phẩm với đủ thông tin (tên, giá, danh mục, hình ảnh) để nhân viên có thể bán hàng.
- **Tiêu chí nghiệm thu:**
  1. Dữ liệu lưu vào bảng `products`.
  2. Có thể set số lượng tồn kho ban đầu.

## 3. Nhóm Nhân viên (Staff)
**US04: Bán hàng nhanh (POS)**
- **User Story:** Là Nhân viên, tôi muốn một giao diện POS trực quan, tìm sản phẩm nhanh để lập đơn hàng cho khách.
- **Tiêu chí nghiệm thu:**
  1. POS có chức năng tìm kiếm và lọc theo danh mục.
  2. Tính tổng tiền tự động, cảnh báo khi "Hết hàng".
  3. Lập đơn hàng thành công lưu vào `orders` và `order_items`.

**US05: Hồ sơ trả góp**
- **User Story:** Là Nhân viên, tôi muốn nhập thông tin trả góp (CCCD, kỳ hạn) ngay tại màn hình POS nếu khách chọn trả góp.
- **Tiêu chí nghiệm thu:**
  1. Giao diện hiển thị thêm field nhập CCCD, chọn kỳ hạn (3/6/9/12 tháng) khi chọn loại "Trả góp".
  2. Hệ thống tính tự động phí trả góp hàng tháng.

## 4. Nhóm Khách hàng (Customer)
**US06: Chat AI Trải nghiệm**
- **User Story:** Là Khách hàng trên trang chủ, tôi muốn chat với AI để hỏi về các gói sản phẩm của cửa hàng.
- **Tiêu chí nghiệm thu:**
  1. Chatbot ghi nhớ lịch sử cuộc trò chuyện trong cùng một Session (`chat_sessions`).
  2. Trả lời mạch lạc, sử dụng thông tin sản phẩm của cửa hàng.
