# Chính sách đổi trả

## Điều kiện đổi trả
- Chỉ đổi trả cho đơn hàng đã thanh toán và chưa bị hủy.
- Chỉ đổi trả số lượng sản phẩm đã mua. Không thể gửi vượt số lượng còn lại có thể đổi trả.
- Mỗi sản phẩm trong một hóa đơn chỉ được nằm một lần trong cùng một yêu cầu.

## Hình thức xử lý
- Đổi sản phẩm khác (exchange): đổi sang sản phẩm khác, có thể phát sinh chênh lệch tiền.
- Hoàn tiền (refund): hoàn lại tiền cho khách.
- Tích điểm cửa hàng (store_credit): quy đổi thành số dư tại cửa hàng.

## Tình trạng sản phẩm khi trả
- new: còn mới nguyên.
- used: đã qua sử dụng.
- damaged: hư hỏng.
- defective: lỗi kỹ thuật.
- wrong_item: giao nhầm sản phẩm.
Sản phẩm mới nguyên được nhập lại kho khi phiếu hoàn tất.

## Quy trình xử lý
1. Nhân viên tiếp nhận và tạo phiếu đổi trả, trạng thái chờ duyệt (pending).
2. Chủ cửa hàng duyệt (approved) hoặc từ chối (rejected). Nhân viên không được tự duyệt; Admin không tham gia nghiệp vụ đổi trả.
3. Sau khi duyệt, nhân viên hoàn tất phiếu (completed) và ghi nhận thu hoặc hoàn tiền.
4. Phiếu đã hoàn tất, bị từ chối hoặc đã hủy không thể mở lại.
