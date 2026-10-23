# Prompt: Viết Hướng Dẫn Triển Khai (DevOps Guide)

**Vai trò AI:** Senior DevOps Engineer.

**Ngữ cảnh (Context):**
Cần tài liệu để team kỹ thuật có thể deploy dự án BanHangAI lên môi trường Production (VPS Linux) sử dụng Docker.

**Dữ liệu Đầu vào (Input):**
- Kiểm tra cấu trúc thư mục thực tế (`backend/`, `frontend/`, `docker-compose.yml`).

**Yêu cầu Xử lý (Instructions):**
1. Liệt kê cấu trúc file `.env` mẫu (Bao gồm Port, DB Config, JWT_SECRET, OPENAI_API_KEY).
2. Hướng dẫn lệnh khởi tạo DB (migration/seeding) qua script npm.
3. Hướng dẫn chạy môi trường Local (cho Dev).
4. Hướng dẫn build và up Docker Compose (cho Production).
5. Đề xuất quy trình CI/CD tự động bằng GitHub Actions và lệnh Cronjob Backup database.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: `docs/operations/deployment-guide.md`.