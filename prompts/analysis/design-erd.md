# Prompt: Thiết kế ERD

[Instructions]
Dựa vào mô tả bài toán: `de_tai_01.md`.
Thiết kế sơ đồ thực thể liên kết (ERD) cho hệ thống, tập trung vào các thực thể: Sản phẩm, Khách hàng, Hóa đơn, Chi tiết hóa đơn, Phiếu nhập, Tồn kho.

[Context]

- Bạn là Kỹ sư Dữ liệu / Kiến trúc sư phần mềm.
- CSDL dự kiến: SQLite/u
- Hệ thống cần hỗ trợ tính toán tồn kho và doanh thu hiệu quả.

[Input Data / Constraints]

- Không dư thừa dữ liệu (chuẩn hóa 3NF).
- Mỗi hóa đơn có thể có nhiều sản phẩm.
- Tồn kho có thể theo dõi theo sản phẩm.

[Output Format]
Trả lời bằng Markdown với các mục:

1. Danh sách các thực thể và thuộc tính
2. Quan hệ giữa các thực thể
3. Mã giả SQL tạo bảng (nếu cần minh họa)
4. Sơ đồ ERD (sử dụng Mermaid Diagram)

---

## Yêu cầu ghi kết quả

Ghi kết quả đầu ra vào file: `specs/design/erd-design.md`
