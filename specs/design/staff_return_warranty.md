# Thiết kế Chức năng Đổi trả & Bảo hành (Staff)

## 1. Giới thiệu
Chức năng cho phép nhân viên bán hàng (Staff) tiếp nhận và xử lý các yêu cầu đổi trả hàng hóa, hoàn tiền và bảo hành sản phẩm từ khách hàng. Cung cấp lịch sử chi tiết các yêu cầu đã tạo.

## 2. Bố cục Giao diện (Wireframe Layout)

Giao diện chia làm 2 tab chính: **Xử lý yêu cầu** và **Lịch sử yêu cầu**.

### Tab 1: Xử lý yêu cầu (Tạo mới)
- **Bên trái**: Form tìm kiếm hóa đơn gốc (theo mã, sđt, tên) và danh sách các hóa đơn kết quả.
- **Bên phải**: 
  - Hiển thị chi tiết hóa đơn được chọn (thông tin khách hàng, danh sách sản phẩm).
  - Từng sản phẩm có 3 nút thao tác: `Đổi hàng`, `Trả hàng hoàn tiền`, `Nhận bảo hành`.
  - Khi click vào 1 thao tác, vùng này chuyển sang form điền thông tin xử lý (Lý do, tình trạng, sản phẩm thay thế/cách thức bảo hành).
  - Nút **Xác nhận tạo phiếu** để gọi API.

### Tab 2: Lịch sử yêu cầu
- Bộ lọc: Loại yêu cầu (Đổi trả / Bảo hành), Trạng thái, Tìm kiếm.
- Bảng danh sách: Mã phiếu, Mã hóa đơn gốc, Loại, Sản phẩm, Tình trạng xử lý, Ngày tạo.
- Hỗ trợ phân trang và xem chi tiết phiếu.

## 3. Quy trình Xử lý
1. **Tìm kiếm hóa đơn**: Nhân viên nhập thông tin để tìm hóa đơn khách hàng mang đến.
2. **Chọn sản phẩm**: Trong chi tiết hóa đơn, chọn sản phẩm khách muốn xử lý.
3. **Nhập thông tin**: 
   - Đổi trả: Chọn lý do, tình trạng hàng, (sản phẩm đổi nếu có).
   - Bảo hành: Chọn lỗi, hình thức tiếp nhận (sửa chữa, thay mới, giữ thẩm định).
4. **Xác nhận**: Hệ thống ghi nhận yêu cầu vào CSDL (bảng `returns` hoặc `warranty_claims`), hiển thị thông báo thành công và ghi nhật ký hoạt động.
5. **Theo dõi**: Nhân viên hoặc Quản lý có thể theo dõi trạng thái phê duyệt trong tab "Lịch sử yêu cầu".
