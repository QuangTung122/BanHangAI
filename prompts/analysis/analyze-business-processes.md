# Prompt: Phân tích quy trình nghiệp vụ

[Instructions]
Dựa vào mô tả bài toán: `de_tai_01.md`
Phân tích chi tiết các quy trình nghiệp vụ chính của hệ thống quản lý bán hàng: quy trình bán hàng, nhập hàng, lập hóa đơn và quản lý tồn kho.

[Context]
- Bạn là chuyên viên phân tích nghiệp vụ (Business Analyst).
- Hệ thống dùng cho cửa hàng bán lẻ cần thao tác nhanh chóng và chính xác.
- Cần làm rõ các bước thực hiện, người tham gia (actor) và dữ liệu thay đổi trong mỗi bước.

[Input Data / Constraints]
- Dữ liệu đầu vào: thông tin khách hàng, sản phẩm, giỏ hàng, thông tin thanh toán, thông tin nhà cung cấp.
- Đầu ra: hóa đơn, phiếu nhập, số lượng tồn kho được cập nhật.
- Ràng buộc: cập nhật tồn kho phải chính xác, hỗ trợ khi hủy/sửa hóa đơn.

[Examples]
Ví dụ quy trình bán hàng:
1. Nhân viên tìm kiếm và thêm sản phẩm vào giỏ.
2. Hệ thống kiểm tra số lượng tồn kho.
3. Nhân viên áp dụng giảm giá (nếu có).
4. Khách hàng thanh toán.
5. Hệ thống lưu hóa đơn và trừ tồn kho.

[Output Format]
Trả lời bằng Markdown với các mục:
1. Quy trình bán hàng và lập hóa đơn
2. Quy trình nhập hàng
3. Quy trình quản lý tồn kho
4. Sơ đồ luồng (sử dụng Mermaid) cho quy trình bán hàng.

---

## Yêu cầu ghi kết quả
Ghi kết quả đầu ra vào file: `specs/requirements/business-processes.md`
