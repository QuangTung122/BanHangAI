
# Giới thiệu hệ thống HTH Smart Sales

## Tổng quan

HTH Smart Sales (BanHangAI) là hệ thống quản lý bán hàng POS cho cửa hàng. Hệ thống có 4 nhóm người dùng: Admin, Chủ cửa hàng (owner), Nhân viên (staff) và Khách hàng (customer, dùng qua Bot).

## Chức năng của Admin

- Quản lý tài khoản: tạo, khóa, mở khóa, đổi vai trò, cấp lại mật khẩu.
- Thiết lập hệ thống: cấu hình AI, nhạc nền, sao lưu cơ sở dữ liệu.
- Nhật ký hoạt động (audit log) ghi lại đăng nhập và thao tác quan trọng.
- Duyệt đổi trả và bảo hành.

## Chức năng của Chủ cửa hàng

- Bảng thống kê: doanh thu, số đơn hoàn thành, cảnh báo tồn kho thấp, top sản phẩm bán chạy, biểu đồ tăng trưởng.
- Quản lý dòng tiền: sổ quỹ, phiếu thu, phiếu chi.
- Quản lý sản phẩm, danh mục, giá, giảm giá, tồn kho, nhập hàng từ nhà cung cấp.
- Quản lý nhân sự: hồ sơ nhân viên, mức lương theo giờ, bảng chấm công.
- Duyệt hoặc từ chối yêu cầu đổi trả và bảo hành.

## Chức năng của Nhân viên

- Lập hóa đơn bán hàng (POS), thanh toán tiền mặt, chuyển khoản hoặc thẻ.
- Bán trả góp qua đối tác tài chính liên kết (mô phỏng) và thu tiền trả góp theo kỳ.
- Tra cứu tồn kho và lịch sử hóa đơn.
- Tiếp nhận yêu cầu đổi trả và bảo hành của khách.
- Chấm công vào ca và ra ca.

## Chức năng của Khách hàng qua Bot

- Tạo tài khoản và đăng nhập ngay trong Bot bằng lệnh /dangky và /dangnhap.
- Xem sản phẩm, giá, khuyến mãi và còn hàng hay hết hàng.
- Đặt hàng qua Bot. Đơn ở trạng thái chờ xác nhận cho đến khi cửa hàng xác nhận thanh toán.
- Xem đơn hàng của mình và hủy đơn khi còn chờ xác nhận.
- Hỏi chính sách đổi trả, bảo hành, trả góp.

## Bot tự động hóa những gì

- Trả lời tức thì về sản phẩm, tồn kho, đơn hàng, chính sách.
- Chủ cửa hàng và Admin hỏi báo cáo doanh thu, sản phẩm sắp hết, bán chạy bằng ngôn ngữ tự nhiên.
- Nhân viên và Chủ cửa hàng tạo đơn, xác nhận thanh toán, tạo phiếu đổi trả bằng câu lệnh tự nhiên.
- Chủ cửa hàng và Admin duyệt hoặc từ chối đổi trả ngay trong khung chat.
- Mọi thao tác ghi dữ liệu đều cần người dùng gõ /xacnhan để xác nhận, hoặc /huy để hủy.
