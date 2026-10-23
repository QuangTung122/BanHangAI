# Hướng Dẫn Triển Khai & Vận Hành (Deployment & DevOps Guide)

Tài liệu này cung cấp hướng dẫn chi tiết để đội ngũ Kỹ thuật (DevOps/Admin) có thể cài đặt, cấu hình và triển khai hệ thống **BanHangAI** lên môi trường máy chủ (Local, Staging, Production).

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)
Trước khi cài đặt, đảm bảo máy chủ hoặc máy phát triển đã được cài đặt các phần mềm sau:
- **Node.js** (Phiên bản >= 18.x LTS)
- **NPM** hoặc **Yarn**
- **Docker** và **Docker Compose** (Dành cho môi trường Production)
- **Git**

---

## 2. Thiết Lập Biến Môi Trường (Environment Variables)
Toàn bộ thông tin nhạy cảm của hệ thống không được phép push lên mã nguồn mở (Git). Cần tạo một file `.env` tại thư mục gốc của project (nằm cùng cấp với thư mục `backend/` và `frontend/`). 

Tham khảo định dạng file chuẩn:
\`\`\`env
# --- SERVER SETTINGS ---
PORT=3000
NODE_ENV=production

# --- DATABASE SETTINGS (SQLite/MySQL) ---
# Nếu dùng SQLite:
DB_DIALECT=sqlite
DB_STORAGE=./database/ecom_ai.db
# Nếu dùng MySQL/PostgreSQL:
DB_HOST=localhost
DB_USER=root
DB_PASS=S3cr3tP@ssword
DB_NAME=banhangai_db

# --- SECURITY ---
# Chuỗi bí mật để băm token đăng nhập (Đổi thành chuỗi ngẫu nhiên phức tạp)
JWT_SECRET=b4nh4ngA1_s3cr3t_key_2026_xyz
JWT_EXPIRES_IN=8h

# --- AI INTEGRATION (LLM Engine) ---
# Điền API Key của OpenAI hoặc Gemini để kích hoạt Chatbot và AI Báo cáo
AI_PROVIDER=openai # hoặc 'gemini', 'claude'
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
# GEMINI_API_KEY=AIzaSyB-xxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

---

## 3. Khởi Tạo Cơ Sở Dữ Liệu (Database Initialization)
Trước khi chạy ứng dụng lần đầu, bạn cần khởi tạo cấu trúc bảng (10 bảng) và bơm dữ liệu mẫu (Seed Data) để test.
Từ thư mục gốc, mở Terminal và chạy:

\`\`\`bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện cần thiết
npm install

# 3. Chạy Script khởi tạo Database (Tạo bảng từ init.sql)
npm run db:init

# 4. Chạy Script bơm dữ liệu mẫu (Sản phẩm demo, Tài khoản Admin mặc định)
npm run db:seed
\`\`\`
*(Tài khoản mặc định thường là: admin@banhangai.local / 123456)*

---

## 4. Hướng Dẫn Chạy Môi Trường Cục Bộ (Local Development)
Dùng để Dev code hoặc Test tính năng trực tiếp trên máy cá nhân mà không cần Docker.

**Bước 1: Chạy Backend API**
\`\`\`bash
cd backend
npm run dev
# Server Backend sẽ khởi chạy tại: http://localhost:3000
\`\`\`

**Bước 2: Chạy Frontend (Static Server)**
Mở một cửa sổ Terminal mới:
\`\`\`bash
cd frontend
# Bạn có thể dùng live-server hoặc serve để host thư mục frontend
npx serve src/
# Mở trình duyệt tại: http://localhost:5000
\`\`\`

---

## 5. Triển Khai Lên Máy Chủ (Production via Docker)
Đối với môi trường chạy thực tế (Production), **Docker** là giải pháp bắt buộc để đảm bảo sự ổn định và dễ dàng quản lý. Dự án đã có sẵn `Dockerfile` và `docker-compose.yml`.

**Bước 1: Clone mã nguồn về VPS (Ubuntu/CentOS)**
\`\`\`bash
git clone https://github.com/your-org/banhangai.git
cd banhangai
\`\`\`

**Bước 2: Chuẩn bị file `.env`**
\`\`\`bash
cp .env.example .env
nano .env # (Chỉnh sửa các biến môi trường cho đúng)
\`\`\`

**Bước 3: Build và Chạy Docker Compose**
\`\`\`bash
# Lệnh này sẽ tự động build image và khởi chạy container chạy nền (detached mode)
docker-compose up -d --build
\`\`\`

**Bước 4: Kiểm tra trạng thái**
\`\`\`bash
docker-compose ps
docker-compose logs -f app
\`\`\`
*Hệ thống hiện đã live tại địa chỉ IP của VPS (hoặc domain nếu đã config Reverse Proxy bằng Nginx).*

---

## 6. Đề Xuất Kiến Trúc CI/CD (DevOps Pipeline)
Để team làm việc chuyên nghiệp hơn, nên áp dụng **GitHub Actions** hoặc **GitLab CI** theo luồng sau:
1. Coder tạo **Pull Request (PR)**.
2. CI tự động chạy lệnh `npm test` (Unit Test) để đảm bảo không gãy (break) code cũ.
3. Nếu PASS toàn bộ Test, PM duyệt PR gộp vào nhánh `main`.
4. CD (Continuous Deployment) tự động trigger Webhook gửi tới VPS. VPS chạy script `git pull` và `docker-compose up -d --build` để release tính năng mới (Zero-downtime deployment).

---

## 7. Sao Lưu Dữ Liệu (Backup Strategy)
- Vì hệ thống đang lưu DB tại `backend/database/ecom_ai.db` (Nếu dùng SQLite).
- Cần thiết lập **Cronjob** trên Linux để backup file `ecom_ai.db` mỗi đêm vào lúc 02:00 AM, nén thành file `.zip` và tự động đẩy lên Google Drive hoặc AWS S3.
- *Lệnh Cronjob tham khảo:*
  \`\`\`bash
  0 2 * * * cp /path/to/backend/database/ecom_ai.db /backup/banhangai_$(date +\%F).db
  \`\`\`
