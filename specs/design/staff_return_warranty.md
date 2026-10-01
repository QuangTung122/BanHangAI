# Thiết kế chức năng Đổi trả & Bảo hành

## 1. Phạm vi

- Cửa hàng tiếp nhận, kiểm tra điều kiện theo hóa đơn, lưu tình trạng hàng và theo dõi yêu cầu.
- Đổi/trả là quyết định theo chính sách của cửa hàng; owner/admin duyệt trước khi thực hiện nhập kho, xuất hàng đổi hoặc ghi nhận hoàn/thu tiền.
- Bảo hành hãng là hồ sơ dịch vụ: staff tiếp nhận và gửi hãng/TTBH, lưu mã biên nhận và cập nhật tiến độ; owner/admin duyệt kết quả thẩm định. Cửa hàng có thể bàn giao máy sau khi đã có kết quả sửa chữa.
- Hãng/đơn vị và mã biên nhận trong bản demo là dữ liệu giả lập; không kết nối hãng thật.

## 2. Luồng đổi trả

1. Staff tra cứu hóa đơn đã thanh toán, chọn mặt hàng và số lượng còn đủ điều kiện xử lý.
2. Staff ghi lý do, tình trạng sản phẩm và đề nghị đổi hàng hoặc hoàn tiền; hệ thống tạo phiếu `pending`.
3. Owner/admin duyệt hoặc từ chối phiếu. Phiếu đang chờ duyệt không được tác động tồn kho hoặc sổ quỹ.
4. Sau khi duyệt, staff thực hiện đổi/nhận hàng, nhập số tiền hoàn hoặc thu thêm và hoàn tất phiếu.
5. Khi hoàn tất, hệ thống mới ghi nhận biến động tồn kho, giao dịch thu/chi và khóa phiếu khỏi xử lý lặp.

## 3. Luồng bảo hành

1. Staff kiểm tra hóa đơn, sản phẩm, serial và thời hạn bảo hành; mô tả lỗi, hình thức yêu cầu, đơn vị dịch vụ demo và mã tiếp nhận nếu có.
2. Hệ thống tạo phiếu `pending`; staff gửi hãng/TTBH, chuyển trạng thái `in_review`.
3. Owner/admin duyệt hoặc từ chối kết quả thẩm định.
4. Với hồ sơ được duyệt, tiến độ lần lượt là `approved` → `repairing` → `repaired` → `completed`.
5. Phí chỉ được ghi nhận khi hoàn tất và phải là khoản phí dịch vụ thực tế được thống nhất; yêu cầu bảo hành hãng không mặc định là đổi trả/hoàn tiền.

## 4. Phân quyền

- Staff tạo phiếu, gửi hãng, cập nhật tiến độ xử lý và hoàn tất phiếu đã được duyệt.
- Owner/admin duyệt hoặc từ chối đổi trả và kết quả bảo hành.
- Phiếu được lưu làm lịch sử; giao diện không cung cấp thao tác xóa phiếu nghiệp vụ.
