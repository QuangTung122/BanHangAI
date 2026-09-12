# Prompt: Thiết kế Kiến trúc Hệ thống (System Architecture)

[Instructions]
Hãy thiết kế kiến trúc tổng thể cho hệ thống Quản lý bán hàng có tích hợp AI. Xác định rõ các thành phần công nghệ và cấu trúc thư mục (Folder Structure) dự kiến.

[Context]
- Bạn là Software Architect.
- Hệ thống thực tế đang sử dụng Node.js (Express), SQLite và Frontend dạng SPA thuần (Vanilla JS).
- AI Engine sử dụng là Ollama chạy local.

[Input Data / Constraints]
- **Client (Frontend):** Không dùng React/Vue. Dùng HTML/JS/TailwindCSS, render UI bằng Class (Router tự build).
- **Server (Backend):** Express JS. Có middleware kiểm tra Token/Role.
- **Database:** SQLite (lưu file trực tiếp).
- **AI Server:** Ollama (`qwen2.5-coder` hoặc mô hình tương tự).

[Output Format]
Trả lời bằng Markdown:
1. **Sơ đồ Kiến trúc:** Dùng Mermaid Diagram (C4 Model hoặc Flowchart) để vẽ luồng tương tác giữa Trình duyệt (Browser) -> Express Server -> SQLite DB & Ollama AI.
2. **Thiết kế cấu trúc thư mục (Folder Structure):** Phác thảo cây thư mục chuẩn cho cả `frontend/` và `backend/` theo mô hình MVC thu gọn (Controllers, Routes, Services).

---
## Yêu cầu ghi kết quả
Chỉ sinh tài liệu thiết kế (không viết code). Ghi kết quả vào: `specs/design/system-architecture.md`
