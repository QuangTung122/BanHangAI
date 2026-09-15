# Scratch (Nháp & Thử nghiệm)

Thư mục này được sử dụng như một "hộp cát" (Sandbox) để chứa các đoạn mã nháp (scratch scripts), các tệp dữ liệu tạm thời, hoặc các bài kiểm tra ý tưởng nhanh (PoC - Proof of Concept) trong quá trình phát triển **BanHangAI**.

## 📁 Mục đích sử dụng

Các tệp trong thư mục này thường **không** được tích hợp trực tiếp vào môi trường sản xuất (Production), nhưng lại đóng vai trò cực kỳ quan trọng cho các lập trình viên khi cần:
- Trích xuất dữ liệu, kiểm tra API độc lập mà không cần khởi chạy toàn bộ server (ví dụ: `extract_chat.js`, `test_db.js`).
- Debug một đoạn logic phức tạp hoặc kết nối tới một Local LLM (Ollama) để xem response trả về.
- Tạo dữ liệu giả (Mock data/Seeders) trong lúc phát triển.
- Lưu trữ các truy vấn SQL thô (Raw SQL) phục vụ việc phân tích bảng.

## ⚠️ Lưu ý

- Code trong này không cần tuân thủ chuẩn Clean Code hay kiến trúc MVC của toàn hệ thống.
- Nên dọn dẹp các tệp nháp định kỳ để tránh làm phình to kích thước kho lưu trữ.
- Các script hữu ích và được sử dụng lâu dài nên được quy hoạch lại và chuyển vào thư mục `backend/database/scripts/` hoặc `backend/src/utils/`.
