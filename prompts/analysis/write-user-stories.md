# Prompt: Viết User Story và Tiêu chí nghiệm thu (Acceptance Criteria)

[Instructions]
Dựa vào mô tả bài toán: `de_tai_01.md` và các Use Case đã phân tích.
Hãy viết các User Story theo chuẩn Agile cho các chức năng quản lý và chức năng AI của hệ thống.

[Context]
- Bạn là Product Owner (PO) / Chuyên viên phân tích nghiệp vụ.
- Team phát triển sử dụng mô hình Agile/Scrum.
- User Story cần giúp lập trình viên hiểu rõ nhu cầu của người dùng cuối.

[Input Data / Constraints]
- Viết User Story theo cấu trúc: "Là một [Actor], tôi muốn [Hành động] để [Mục đích/Lợi ích]".
- Mỗi User Story phải kèm theo 2-3 Tiêu chí nghiệm thu (Acceptance Criteria) để phục vụ việc kiểm thử sau này.

[Examples]
Ví dụ:
**US01: Tìm kiếm sản phẩm**
- **User Story:** Là một nhân viên bán hàng, tôi muốn tìm kiếm sản phẩm theo tên hoặc mã sản phẩm để thao tác thêm vào hóa đơn nhanh chóng.
- **Tiêu chí nghiệm thu:**
  1. Giao diện có thanh tìm kiếm ở màn hình POS.
  2. Gõ từ khóa thì kết quả trả về ngay lập tức (dưới 1s).
  3. Nếu không tìm thấy, hiển thị thông báo "Không tìm thấy sản phẩm".

[Output Format]
Trả lời bằng Markdown. Chia các User Story thành các nhóm (Epic):
1. Nhóm quản lý Sản phẩm và Tồn kho
2. Nhóm quản lý Bán hàng và Hóa đơn
3. Nhóm quản lý Khách hàng
4. Nhóm chức năng AI (Chatbot, Báo cáo, Hỏi đáp)

---

## Yêu cầu ghi kết quả
Ghi kết quả đầu ra vào file: `specs/requirements/user-stories.md`
