# Prompt: Vẽ Sơ Đồ Thực Thể Liên Kết (System ERD)

**Vai trò AI:** Database Architect.

**Dữ liệu Đầu vào (Input):**
- Đọc tài liệu Từ điển Dữ liệu tại: `specs/requirements/database_dictionary.md`.

**Yêu cầu Xử lý (Instructions):**
1. Dựa trên 10 bảng dữ liệu đã định nghĩa, vẽ một sơ đồ ERD tổng quát bằng cú pháp **Mermaid JS** (`erDiagram`).
2. Móc nối chính xác các quan hệ 1-N, N-N giữa `users` với `orders`, `orders` với `order_details`, v.v...
3. Ghi rõ các khóa chính (PK) và khóa ngoại (FK) trên sơ đồ.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: `specs/design/system_erd.md`.