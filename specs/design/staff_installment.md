# Design Specs: Hồ sơ mua trả góp qua đối tác (Staff)

## 1. Tổng quan

- **Mục tiêu:** Nhân viên hỗ trợ khách đăng ký hồ sơ vay mua hàng; cửa hàng lập hóa đơn bán hàng như bình thường.
- **Phạm vi demo:** Đối tác, mã hồ sơ và giải ngân được mô phỏng. Không kết nối tổ chức tài chính thật.
- **Trách nhiệm:** Đối tác xét duyệt hợp đồng và thu các kỳ thanh toán. Cửa hàng không quản lý dư nợ, lịch đến hạn hoặc thu tiền các kỳ sau.

## 2. Luồng nghiệp vụ

1. Nhân viên chọn sản phẩm, nhập thông tin khách hàng và chọn trả góp qua đối tác.
2. Nhân viên ghi nhận đối tác demo, mã hồ sơ (nếu có), kỳ hạn khách đăng ký và khoản trả trước tại cửa hàng.
3. Demo mô phỏng hồ sơ được duyệt và đối tác giải ngân phần còn lại; POS tạo hóa đơn bán hàng, xuất kho và ghi nhận riêng khoản khách trả trước cùng khoản đối tác giải ngân.
4. Màn hồ sơ trả góp chỉ phục vụ tra cứu hóa đơn, đối tác, mã hồ sơ, kỳ hạn và số tiền được mô phỏng. Không có thao tác thu cước/tất toán.

## 3. Dữ liệu

- `orders.payment_type = 'installment'` phân biệt phương thức mua qua đối tác.
- `finance_partner`, `finance_application_code`, `financing_status`, `down_payment`, `financed_amount` lưu thông tin hồ sơ mô phỏng.
- `total_amount` luôn là tổng giá bán trên hóa đơn; phí/lãi và lịch thu nợ không do cửa hàng tự tính.

## 4. Quyền

- Staff tạo hóa đơn và tra cứu hồ sơ.
- Owner/admin có thể tra cứu hồ sơ từ dữ liệu đơn hàng; không có xử lý thu nợ.
