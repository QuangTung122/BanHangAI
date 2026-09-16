# Prompt: Thiết lập Từ Điển Dữ Liệu (Database Dictionary)

**Vai trò AI:** Database Administrator (DBA).

**Ngữ cảnh (Context):**
Chúng ta cần một tài liệu mô tả chính xác 100% cấu trúc của Database để các Developer có thể dựa vào đó viết Entity/Model.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả User Stories tại: `specs/requirements/user_stories.md`.

**Yêu cầu Xử lý (Instructions):**
1. Phân tích và liệt kê chi tiết TẤT CẢ 10 bảng dữ liệu cốt lõi của hệ thống: `users`, `products`, `orders`, `order_details`, `transactions`, `attendances`, `installments`, `audit_logs`, `chat_messages`, `return_warranties`.
2. Biểu diễn dưới dạng Bảng (Table) cho mỗi Database Table.
3. Mỗi bảng bắt buộc có các cột: Tên Field, Type (Varchar/Int/Enum...), Primary/Foreign Key, Ràng buộc (NOT NULL, UNIQUE, DEFAULT), và Mô tả (Description).
4. Phải mô tả rõ logic xóa (ON DELETE CASCADE) cho các quan hệ cha-con (VD: Orders -> Order_Details).

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: `specs/requirements/database_dictionary.md`.