
# Trích xuất dữ liệu CSDL (Database Schema)

Dưới đây là chi tiết các bảng trong cơ sở dữ liệu của hệ thống, cùng với mô tả cho từng biến (cột) lưu trữ dữ liệu.

## 1. Bảng `users` (Quản lý người dùng)

Bảng này lưu trữ thông tin của các tài khoản truy cập vào hệ thống (nhân viên, quản lý).

* `id`: Khóa chính, mã định danh duy nhất của người dùng.
* `username`: Tên đăng nhập của người dùng.
* `full_name`: Họ và tên đầy đủ của người dùng.
* `role`: Vai trò quyền hạn trong hệ thống (admin, owner, staff).
* `is_active`: Trạng thái hoạt động của tài khoản (1 = hoạt động, 0 = khóa).
* `created_at`: Thời gian tạo tài khoản.

## 2. Bảng `system_configs` (Cấu hình hệ thống)

Lưu trữ các cài đặt, cấu hình chung của hệ thống (như cấu hình AI, host).

* `key`: Khóa chính, tên của cấu hình (VD: `ollama_host`, `ai_model`).
* `value`: Giá trị tương ứng của cấu hình.

## 3. Bảng `categories` (Danh mục sản phẩm)

Phân loại các nhóm hàng hóa.

* `id`: Khóa chính, mã danh mục.
* `name`: Tên danh mục (VD: Điện thoại, Tai nghe).
* `slug`: Đường dẫn thân thiện SEO của danh mục (VD: dien-thoai).
* `description`: Đoạn mô tả chi tiết về danh mục.
* `is_active`: Trạng thái hiển thị (1 = hiển thị, 0 = ẩn).

## 4. Bảng `products` (Sản phẩm/Hàng hóa)

Lưu trữ thông tin chi tiết về từng mặt hàng mà cửa hàng đang bán.

* `id`: Khóa chính, mã sản phẩm.
* `category_id`: Mã danh mục mà sản phẩm này thuộc về (Khóa ngoại).
* `name`: Tên sản phẩm.
* `slug`: Đường dẫn thân thiện SEO.
* `description`: Mô tả chi tiết chức năng, cấu hình của sản phẩm.
* `price`: Giá bán ra.
* `stock_quantity`: Số lượng hàng còn lại trong kho.
* `image_url`: Đường dẫn tới hình ảnh sản phẩm.
* `is_active`: Trạng thái đang kinh doanh hay ngừng bán.
* `sku`: Mã vạch/Mã số quản lý nội bộ của sản phẩm.
* `unit`: Đơn vị tính (Chiếc, Bộ, Cái...).
* `import_price`: Giá nhập đầu vào (dùng để tính lợi nhuận).
* `discount_percent`: Phần trăm giảm giá hiện tại.
* `low_stock_threshold`: Mức tồn kho tối thiểu để hệ thống cảnh báo sắp hết hàng.
* `tags`: Các từ khóa để phân loại nhanh sản phẩm.
* `warranty_months`: Số tháng bảo hành.
* `created_at`: Thời điểm sản phẩm được tạo mới trên hệ thống.

## 5. Bảng `orders` (Đơn hàng)

Lưu trữ thông tin các giao dịch mua bán, đơn đặt hàng.

* `id`: Khóa chính, mã đơn hàng.
* `user_id`: Mã nhân viên lập đơn hàng (Khóa ngoại).
* `total_amount`: Tổng số tiền khách cần thanh toán.
* `customer_name`: Tên khách mua hàng.
* `status`: Trạng thái hiện tại của đơn (pending, processing, shipped, delivered, cancelled).
* `payment_type`: Hình thức trả tiền (full - trả thẳng, installment - trả góp).
* `installment_term`: Số kỳ hạn/tháng trả góp.
* `monthly_fee`: Số tiền phải đóng mỗi tháng nếu trả góp.
* `payment_method`: Phương thức thanh toán (cash, thẻ, chuyển khoản...).
* `created_at`: Thời gian tạo đơn.

## 6. Bảng `order_items` (Chi tiết đơn hàng)

Lưu trữ thông tin chi tiết mỗi đơn hàng đã mua những sản phẩm nào, số lượng bao nhiêu.

* `id`: Khóa chính.
* `order_id`: Mã đơn hàng (Khóa ngoại).
* `product_id`: Mã sản phẩm được mua (Khóa ngoại).
* `quantity`: Số lượng mua của sản phẩm đó.
* `unit_price`: Đơn giá tại thời điểm mua (để tránh thay đổi giá sau này làm sai hóa đơn).

## 7. Bảng `returns` (Phiếu đổi trả)

Lưu trữ thông tin các yêu cầu đổi trả hàng từ khách.

* `id`: Khóa chính, mã phiếu đổi trả.
* `order_id`: Mã đơn hàng gốc bị yêu cầu đổi trả.
* `customer_id`: Mã tài khoản khách hàng (nếu có).
* `customer_name`: Tên khách hàng đổi trả.
* `return_type`: Loại yêu cầu (exchange - đổi hàng, refund - hoàn tiền, store_credit - thẻ tín dụng ảo).
* `reason`: Lý do đổi trả.
* `requested_at`: Thời gian tạo yêu cầu.
* `processed_at`: Thời gian xử lý yêu cầu.
* `status`: Trạng thái giải quyết (pending, approved, rejected, completed, cancelled).
* `approved_by`: Mã nhân viên/quản lý duyệt yêu cầu.
* `refund_amount`: Tổng số tiền hoàn lại.
* `exchange_product_id`: Mã sản phẩm khách muốn đổi sang.
* `notes`: Ghi chú thêm.
* `created_by`: Mã nhân viên tạo phiếu.
* `is_active`: Phiếu này còn hiệu lực hay không.

## 8. Bảng `return_items` (Chi tiết hàng đổi trả)

Lưu các mặt hàng cụ thể nằm trong yêu cầu đổi/trả.

* `id`: Khóa chính.
* `return_id`: Mã phiếu đổi trả (Khóa ngoại).
* `order_item_id`: Chi tiết mặt hàng trong đơn hàng gốc.
* `product_id`: Mã sản phẩm muốn đổi/trả.
* `product_name`: Tên sản phẩm.
* `quantity`: Số lượng đổi/trả.
* `unit_price`: Giá trị món hàng lúc mua.
* `condition_status`: Tình trạng hàng khi thu hồi (new, used, damaged, defective...).
* `defect_type`: Phân loại lỗi hỏng.
* `warranty_remaining_days`: Số ngày bảo hành còn lại.
* `refund_amount`: Tiền hoàn lại cho riêng mặt hàng này.
* `exchange_to_product_id`: Mã sản phẩm đổi ngang.
* `exchange_delta_amount`: Số tiền bù trừ khi đổi hàng chênh giá.
* `status`: Trạng thái xử lý món hàng.

## 9. Bảng `warranty_claims` (Yêu cầu bảo hành)

Quản lý các yêu cầu bảo hành sản phẩm.

* `id`: Khóa chính.
* `order_id`: Mã đơn hàng lúc mua.
* `order_item_id`: Mã chi tiết đơn hàng tương ứng.
* `product_id`: Mã sản phẩm đem bảo hành.
* `customer_id`, `customer_name`: Thông tin khách hàng.
* `serial_number`: Số seri của sản phẩm.
* `warranty_start_date`: Ngày bắt đầu bảo hành.
* `warranty_end_date`: Ngày kết thúc bảo hành.
* `warranty_months`: Số tháng bảo hành theo chế độ.
* `claim_type`: Loại xử lý (repair - sửa chữa, replace - đổi mới, refund - hoàn tiền...).
* `issue_description`: Mô tả lỗi của khách.
* `issue_code`: Mã lỗi kỹ thuật.
* `claimed_at`: Thời gian nhận bảo hành.
* `status`: Tiến trình xử lý (pending, in_review, repairing, completed...).
* `approved_by`: Người duyệt bảo hành.
* `created_by`: Người tiếp nhận bảo hành.
* `notes`: Ghi chú quá trình.
* `resolution_notes`: Kết luận sau khi bảo hành xong.
* `is_active`: Trạng thái của phiếu bảo hành.

## 10. Bảng `audit_logs` (Nhật ký hệ thống)

Ghi nhận các hoạt động của nhân viên để truy vết.

* `id`: Khóa chính.
* `user_id`: Mã nhân viên thực hiện thao tác.
* `action_type`: Loại hành động (VD: DELETE_PRODUCT, LOGIN).
* `action_desc`: Mô tả hành động (VD: Xóa sản phẩm A).
* `details`: Chi tiết thông số (thường lưu dạng JSON).
* `created_at`: Thời gian thực hiện hành động.

## 11. Bảng `installment_payments` (Thanh toán trả góp)

Quản lý lịch sử các đợt đóng tiền trả góp.

* `id`: Khóa chính.
* `order_id`: Mã đơn hàng trả góp.
* `amount`: Số tiền đóng đợt này.
* `cashier_id`: Mã nhân viên thu tiền.
* `payment_method`: Hình thức nộp (tiền mặt, thẻ...).
* `created_at`: Ngày thu tiền.

## 12. Bảng `attendance` (Chấm công nhân viên)

Lưu trữ thông tin giờ giấc đi làm của nhân viên.

* `id`: Khóa chính.
* `user_id`: Mã nhân viên.
* `date`: Ngày làm việc.
* `check_in_time`: Giờ vào ca.
* `check_out_time`: Giờ ra ca.
* `total_hours`: Tổng số giờ làm việc trong ngày.

## 13. Bảng `transactions` (Thu/Chi tài chính)

Sổ quỹ quản lý luồng tiền ra vào của cửa hàng.

* `id`: Khóa chính.
* `type`: Phân loại (income - thu vào, expense - chi ra).
* `amount`: Số tiền giao dịch.
* `category`: Phân loại khoản thu/chi (VD: Nhập hàng, Trả lương, Bán hàng).
* `description`: Diễn giải giao dịch.
* `reference_id`: Mã chứng từ tham chiếu (mã đơn hàng, mã phiếu nhập...).
* `user_id`: Người tạo phiếu.
* `payment_method`: Tiền mặt, chuyển khoản.
* `source`: Nguồn tạo (tự động hay thủ công).
* `invoice_id`: Số hóa đơn.
* `attachment_url`: Đường dẫn hình ảnh biên lai.
* `created_at`: Thời gian tạo giao dịch.

## 14. Bảng `chat_sessions` (Phiên nhắn tin AI)

Lưu trữ thông tin cuộc hội thoại với chatbot AI.

* `id`: Khóa chính.
* `user_id`: Mã tài khoản nhắn tin.
* `session_id`: Mã phiên làm việc.
* `created_at`: Thời gian bắt đầu.

## 15. Bảng `chat_messages` (Chi tiết tin nhắn AI)

Lưu nội dung chi tiết trong mỗi phiên chat.

* `id`: Khóa chính.
* `session_id`: Mã phiên làm việc.
* `sender`: Người gửi (user hoặc assistant - AI).
* `message_content`: Nội dung chat.
* `timestamp`: Thời gian gửi.

## 16. Bảng `messages` (Nhắn tin nội bộ)

Lưu nội dung trao đổi giữa các nhân viên trong hệ thống.

* `id`: Khóa chính.
* `sender_id`: Mã người gửi.
* `receiver_id`: Mã người nhận.
* `content`: Nội dung tin nhắn.
* `is_read`: Trạng thái đã xem hay chưa (0/1).
* `created_at`: Thời gian gửi.

## 17. Bảng `notifications` (Thông báo)

Hệ thống thông báo đẩy tới người dùng.

* `id`: Khóa chính.
* `user_id`: Mã người nhận thông báo.
* `title`: Tiêu đề.
* `message`: Nội dung thông báo.
* `type`: Loại thông báo (Cảnh báo, Tin mới...).
* `related_id`: ID của đối tượng liên quan (VD: mã đơn hàng).
* `is_read`: Trạng thái đã xem hay chưa.
* `created_at`: Thời gian tạo thông báo.
