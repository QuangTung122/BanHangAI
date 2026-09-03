# Danh sách User Story: Hệ thống Quản lý Bán hàng tích hợp AI

- Mã: REQ-F-001
- User story: Là một [Nhân viên bán hàng], tôi muốn [tìm kiếm sản phẩm] để [tư vấn cho khách hàng và chuẩn bị lập hóa đơn nhanh chóng] các [Tra cứu sản phẩm, Tạo Hóa đơn/Đặt hàng].
- Tiêu chí chấp nhận:
  - Trả về kết quả tìm kiếm chính xác dựa trên tên, mã sản phẩm hoặc danh mục.
  - Thông tin hiển thị trong kết quả phải bao gồm giá bán và số lượng tồn kho.

- Mã: REQ-F-002
- User story: Là một [Nhân viên bán hàng], tôi muốn [lập hóa đơn bán hàng, áp dụng giảm giá và ghi nhận thanh toán] để [hoàn tất giao dịch mua bán với khách hàng] các [Tạo Hóa đơn/Đặt hàng].
- Tiêu chí chấp nhận:
  - Hệ thống tự động tính tổng tiền hóa đơn dựa trên các sản phẩm và số lượng tương ứng.
  - Có chức năng áp dụng giảm giá hợp lệ vào tổng tiền hóa đơn.
  - Lưu lại trạng thái thanh toán và phương thức thanh toán đã sử dụng.

- Mã: REQ-F-003
- User story: Là một [Chủ cửa hàng], tôi muốn [xem báo cáo doanh thu theo ngày/tháng, nhóm hàng và danh sách sản phẩm bán chạy] để [đánh giá hiệu quả kinh doanh của cửa hàng] các [Thống kê Doanh thu].
- Tiêu chí chấp nhận:
  - Hiển thị số liệu doanh thu rõ ràng theo khoảng thời gian tùy chọn.
  - Cung cấp danh sách hoặc biểu đồ các sản phẩm bán chạy nhất.
  - Có thể phân chia dữ liệu thống kê theo các nhóm hàng khác nhau.

- Mã: REQ-AI-001
- User story: Là một [Chủ cửa hàng], tôi muốn [nhận được nhận xét doanh thu tự động từ hệ thống AI] để [có góc nhìn chuyên sâu và đề xuất hữu ích về tình hình kinh doanh] các [Nhận xét Doanh thu AI].
- Tiêu chí chấp nhận:
  - AI phân tích dựa trên dữ liệu thống kê doanh thu thực tế, không bịa đặt dữ liệu (ảo giác/hallucination).
  - Nội dung sinh ra ngắn gọn, dễ hiểu và sát với tình hình hiển thị trên báo cáo.
  - Giao diện có thông báo "Đang xử lý..." trong lúc chờ AI phân tích.

- Mã: REQ-AI-002
- User story: Là một [Nhân viên bán hàng], tôi muốn [dùng Chatbot AI tư vấn thông tin sản phẩm] để [nhanh chóng tìm ra sản phẩm đúng nhu cầu hiện tại của khách] các [Tư vấn Sản phẩm].
- Tiêu chí chấp nhận:
  - Chatbot chỉ truy xuất và tư vấn các sản phẩm hiện có và còn hàng.
  - Khi khách hỏi sản phẩm hết hàng hoặc không kinh doanh, chatbot phải từ chối rõ ràng và không tự ý bịa thêm thông tin.

- Mã: REQ-F-004
- User story: Là một [Quản trị viên], tôi muốn [quản lý tài khoản người dùng] để [kiểm soát những ai được phép truy cập vào hệ thống] các [Quản lý Người dùng].
- Tiêu chí chấp nhận:
  - Có danh sách hiển thị toàn bộ người dùng trong hệ thống.
  - Có thể tạo mới, chỉnh sửa thông tin hoặc vô hiệu hóa (khóa) tài khoản.

- Mã: REQ-F-005
- User story: Là một [Quản trị viên], tôi muốn [phân quyền vai trò cho các tài khoản] để [đảm bảo dữ liệu và chức năng được bảo vệ theo đúng vị trí công việc] các [Phân quyền vai trò, Quản lý Người dùng].
- Tiêu chí chấp nhận:
  - Có chức năng gán các vai trò (Quản trị viên, Chủ cửa hàng, Nhân viên bán hàng) cho mỗi người dùng.
  - Hệ thống tự động giới hạn quyền truy cập menu và tính năng dựa trên vai trò khi người dùng đăng nhập.

- Mã: REQ-F-006
- User story: Là một [Quản trị viên], tôi muốn [cấu hình các thông số hệ thống] để [duy trì hoạt động và tùy biến hệ thống linh hoạt] các [Cấu hình hệ thống].
- Tiêu chí chấp nhận:
  - Cung cấp giao diện cập nhật thông số chung của cửa hàng và các cấu hình dịch vụ ngoài (như API key cho AI).
  - Thông tin nhạy cảm (API key) phải được lưu trữ an toàn và có tùy chọn ẩn/hiện khi nhập.
