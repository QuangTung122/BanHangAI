# Phân tích Yêu cầu: Hệ thống Quản lý Bán hàng tích hợp AI

## 1. Bối cảnh và vấn đề

- **Bối cảnh:** Các cửa hàng bán lẻ cần quản lý hoạt động kinh doanh hằng ngày bao gồm sản phẩm, khách hàng, hóa đơn, doanh thu và tồn kho.
- **Vấn đề:** Việc quản lý thủ công qua sổ sách hoặc bảng tính rời rạc khiến nhân viên dễ nhập sai dữ liệu, khó theo dõi tình trạng tồn kho thực tế và mất nhiều thời gian tổng hợp báo cáo doanh thu.

## 2. Mục tiêu hệ thống

- Xây dựng một hệ thống phần mềm quản lý toàn diện (sản phẩm, khách hàng, hóa đơn, nhập xuất tồn, doanh thu) nhằm số hóa quy trình kinh doanh.
- Giúp nhân viên bán hàng thao tác nhanh chóng và chính xác.
- Hỗ trợ chủ cửa hàng theo dõi tình hình kinh doanh theo thời gian thực.
- Tích hợp trí tuệ nhân tạo (AI) để nâng cao trải nghiệm khách hàng và tối ưu hóa quản lý: hỗ trợ tư vấn sản phẩm, sinh nhận xét doanh thu và hỏi đáp dữ liệu bán hàng bằng ngôn ngữ tự nhiên.
- Đóng vai trò là tài liệu phân tích ban đầu cho sinh viên môn Ứng dụng AI.

## 3. Actor và nhu cầu

- **Actor: Quản trị viên**

  - **Mục tiêu:** Quản lý toàn bộ hệ thống, cấp quyền người dùng.
  - **Chức năng liên quan:** Đăng nhập/đăng xuất, phân quyền người dùng (chủ cửa hàng, nhân viên bán hàng), thiết lập hệ thống.
- **Actor: Nhân viên bán hàng**

  - **Mục tiêu:** Lập hóa đơn nhanh, tra cứu sản phẩm còn hàng, ghi nhận thanh toán, phục vụ khách hàng.
  - **Chức năng liên quan:** Tìm kiếm sản phẩm, tạo hóa đơn, áp dụng giảm giá, in/xuất hóa đơn, quản lý thông tin khách hàng, tư vấn sản phẩm qua Chatbot AI.
- **Actor: Chủ cửa hàng**

  - **Mục tiêu:** Theo dõi tình hình kinh doanh, quản lý nhập/xuất/tồn kho, đưa ra quyết định nhập hàng.
  - **Chức năng liên quan:** Thống kê doanh thu, xem báo cáo, quản lý nhập hàng, hỏi đáp dữ liệu bán hàng với AI, xem nhận xét doanh thu từ AI.

## 4. Yêu cầu chức năng quản lý

- **Quản lý người dùng:** Đăng nhập, đăng xuất, phân quyền quản trị viên, nhân viên bán hàng, chủ cửa hàng.
- **Quản lý sản phẩm:** Thêm, sửa, xóa thông tin sản phẩm (mã, tên, nhóm hàng, giá bán, giá nhập, tồn kho, trạng thái).
- **Quản lý khách hàng:** Lưu trữ thông tin liên hệ, lịch sử mua hàng, phân nhóm khách hàng.
- **Quản lý hóa đơn:** Lập hóa đơn bán hàng, tính tổng tiền, áp dụng giảm giá, ghi nhận phương thức thanh toán.
- **Quản lý kho hàng:** Quản lý nhập hàng và tự động cập nhật số lượng tồn kho.
- **Tìm kiếm và Lọc:** Tra cứu sản phẩm, khách hàng, hóa đơn theo thời gian và trạng thái.
- **Thống kê và Báo cáo:** Thống kê doanh thu theo ngày/tháng, nhóm hàng, sản phẩm bán chạy. Xuất báo cáo ra định dạng PDF/Excel/CSV.

## 5. Danh sách chức năng AI

- **Chatbot tư vấn sản phẩm:** Nhận nhu cầu từ khách hàng, tra cứu dữ liệu sản phẩm còn hàng và tự động đưa ra gợi ý sản phẩm phù hợp.
- **AI sinh báo cáo doanh thu:** Phân tích dữ liệu doanh thu, tồn kho, sản phẩm bán chạy để tự động sinh ra các nhận xét ngắn gọn và khuyến nghị nhập/xuất hàng.
- **Hỏi đáp dữ liệu bán hàng:** Cho phép chủ cửa hàng đặt câu hỏi bằng ngôn ngữ tự nhiên (ví dụ: "Tháng này mặt hàng nào bán chậm?") và AI trả lời dựa trên dữ liệu hệ thống hiện tại.

## 6. Dữ liệu chính

- **Người dùng/Phân quyền:** Thông tin tài khoản, vai trò (Admin, Nhân viên, Chủ cửa hàng).
- **Sản phẩm:** Mã, tên, danh mục (nhóm hàng), giá bán, giá nhập, tồn kho, trạng thái, mô tả.
- **Khách hàng:** Tên, thông tin liên hệ, lịch sử mua hàng, nhóm khách hàng.
- **Giao dịch (Hóa đơn/Phiếu nhập):** Hóa đơn bán hàng, chi tiết hóa đơn, phiếu nhập hàng, chi tiết phiếu nhập, thông tin thanh toán.

## 7. Yêu cầu phi chức năng

- **Bảo mật và Quyền riêng tư:** Không gửi dữ liệu nhạy cảm của khách hàng (như số điện thoại đầy đủ, thông tin thanh toán) sang các API AI nếu không thật sự cần thiết.
- **Hiệu suất:** Tốc độ phản hồi nhanh, đặc biệt là khi tra cứu tồn kho và lập hóa đơn.
- **Tính khả dụng:** Giao diện thân thiện, dễ sử dụng cho nhân viên không chuyên về CNTT.
- **Tính tích hợp:** Cấu hình API key của các dịch vụ AI phải được bảo mật (sử dụng file `.env`).
- **Khả năng triển khai:** Hệ thống có thể demo được trong môi trường local hoặc cloud.

## 8. Rủi ro và giả định cần kiểm chứng

- **Rủi ro API AI:** Phụ thuộc vào bên thứ 3 (OpenAI, Gemini, Claude, v.v.), có thể gặp vấn đề về timeout, rate limit hoặc phản hồi sai định dạng (hallucination). Cần cơ chế fallback hoặc kiểm tra kết quả trả về.
- **Rủi ro Dữ liệu:** Chatbot có thể gợi ý sản phẩm đã hết hàng nếu prompt không chặt chẽ hoặc dữ liệu đồng bộ bị chậm. Cần tối ưu và so sánh các phiên bản prompt để giảm thiểu tư vấn sai.
- **Rủi ro Bảo mật:** API key có thể bị lộ nếu đưa vào mã nguồn trực tiếp; rủi ro rò rỉ dữ liệu cá nhân khách hàng khi đưa context vào prompt cho AI.
- **Giả định:** Người dùng có kết nối mạng ổn định để sử dụng các chức năng gọi AI API.
