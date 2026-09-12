# Prompt: Gợi ý Use Case và Yêu cầu chức năng

[Instructions]
Dựa vào mô tả bài toán: `de_tai_01.md` và kết quả phân tích yêu cầu sơ bộ.
Hãy xác định các Actor, xây dựng danh sách Use Case (từng Actor) và mô tả chi tiết các yêu cầu chức năng, yêu cầu phi chức năng cho hệ thống.

[Context]
- Bạn là Kỹ sư yêu cầu phần mềm.
- Cần cung cấp cái nhìn tổng quan về tương tác của người dùng với hệ thống để team Dev bắt đầu thiết kế.

[Input Data / Constraints]
- Tôn trọng các actor đã nêu: Quản trị viên, Nhân viên bán hàng, Chủ cửa hàng.
- Phải bao gồm cả các Use case về AI: Tư vấn, Báo cáo, Hỏi đáp.

[Output Format]
Trả lời bằng Markdown với các mục:
1. Danh sách Actor và mô tả
2. Danh sách Use Case (phân nhóm theo Actor)
3. Biểu đồ Use Case tổng quát (sử dụng Mermaid)
4. Bảng yêu cầu chức năng (Mã YC, Tên chức năng, Mô tả, Mức độ ưu tiên)
5. Bảng yêu cầu phi chức năng

---

## Yêu cầu ghi kết quả
Ghi kết quả đầu ra vào file: `specs/requirements/use-cases.md`
