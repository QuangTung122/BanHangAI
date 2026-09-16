# Prompt Thiết Kế: Module Đổi Trả Hàng & Bảo Hành Cho Staff

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Dự án BanHangAI cần thiết kế chức năng "Đổi trả hàng & Bảo hành" dành cho nhân viên bán hàng (Staff). Chức năng này phải hỗ trợ xử lý khi khách hàng đổi sản phẩm, trả hàng, yêu cầu bảo hành theo hóa đơn và theo chính sách cửa hàng.

**Yêu cầu đầu ra:**
Vui lòng tạo file Design Specs (Markdown) lưu tại `specs/design/return_warranty_spec.md` gồm 3 phần chính:

1. **Wireframe Giao Diện (Text/ASCII Art):**
   - Màn hình chính: gồm 2 panel. Trái: tìm kiếm hóa đơn / khách hàng / sản phẩm; Phải: thông tin xử lý.
   - Cho phép Staff nhập mã hóa đơn, nút Tìm hóa đơn, danh sách sản phẩm đã mua, các trạng thái: Đổi, Trả, Bảo hành.
   - Khi chọn sản phẩm, hiển thị lý do đổi/trả, điều kiện áp dụng, số tiền hoàn / chênh lệch, loại sản phẩm thay thế, thời gian bảo hành còn lại.
   - Có khối thông tin xác minh: có hóa đơn, tình trạng hàng hóa, nhân viên xử lý, ghi chú kỹ thuật.

2. **Database Schema:**
   - Cấu trúc bảng `returns`, `return_items`, `warranty_claims`, `warranty_claim_details` hoặc các bảng tương đương phù hợp với hệ thống hiện tại.
   - Bao gồm trạng thái và mối quan hệ với `orders`, `order_items`, `products`, `users`.

3. **API Specs:**
   - `POST /api/returns` tạo yêu cầu đổi/trả.
   - `GET /api/returns` danh sách yêu cầu theo trạng thái và khách hàng.
   - `PUT /api/returns/:id/approve` xử lý chính thức.
   - `POST /api/warranty-claims` tạo yêu cầu bảo hành.
   - `GET /api/warranty-claims` theo khách hàng / sản phẩm / thời gian.
   - `PUT /api/warranty-claims/:id/status` cập nhật trạng thái xử lý.

**Yêu cầu nghiệp vụ quan trọng:**
- Mỗi sản phẩm phải có khả năng xác định theo hóa đơn và thời gian mua.
- Hệ thống cần kiểm tra điều kiện đổi/trả theo chính sách: trong thời hạn, hàng nguyên vẹn, có hóa đơn, sản phẩm không hư hỏng do người dùng.
- Trường hợp đổi hàng: sản phẩm mới phải trừ/ cộng phần chênh lệch giá và cập nhật tồn kho.
- Trường hợp bảo hành: phải lưu thời gian bảo hành, loại lỗi, trạng thái xử lý (đang chờ, đang sửa, hoàn tất, từ chối).
- Tất cả thao tác phải ghi log kiểm toán và có thể được xem lại bởi quản lý.

**Định dạng:**
Trả về chuẩn Markdown.
