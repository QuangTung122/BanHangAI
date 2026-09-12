# Prompt: Hướng dẫn triển khai & Đóng gói (Deployment Guide)

[Instructions]
Hãy viết hướng dẫn triển khai (Deployment) và đóng gói dự án Hệ thống bán hàng AI (Node.js, SQLite, Ollama).

[Context]
- Bạn là DevOps Engineer.
- Đối tượng đọc là các thành viên trong nhóm và giảng viên chấm bài muốn tự cài đặt hệ thống trên máy cá nhân hoặc VPS.

[Input Data / Constraints]
Cần có 2 phương án triển khai:
1. **Chạy trực tiếp (Local/Bare Metal):** Yêu cầu cài Node.js, cài Ollama, pull model `qwen2.5-coder`. Các lệnh khởi chạy server.
2. **Đóng gói Docker (Tùy chọn):** Viết mã `Dockerfile` cho ứng dụng Node.js và `docker-compose.yml` để chạy đồng thời 2 container: 
   - `web-app`: (Node.js backend + frontend static)
   - `ollama`: (Image chính thức của Ollama, tự động pull model khi khởi động)

[Output Format]
Trả lời bằng Markdown. Chia làm 2 phần rõ rệt (Local và Docker). Cung cấp các lệnh bash chính xác.

---
## Yêu cầu ghi kết quả
Ghi kết quả vào file: `docs/operations/deployment-guide.md`.
