# BanHangAI - Backend API

Đây là hệ thống Backend cho dự án **BanHangAI**, cung cấp các API RESTful để quản lý doanh nghiệp và tích hợp Trợ lý AI. Backend được phát triển dựa trên môi trường Node.js.

## 🛠 Công Nghệ Sử Dụng

- **Node.js** & **Express.js**: Xây dựng web server và xử lý các route RESTful API.
- **Cơ sở dữ liệu (Database)**: SQLite (`sqlite3`) - Cơ sở dữ liệu nhẹ, phù hợp cho dự án vừa và nhỏ, được lưu trữ trong thư mục `database/`.
- **Bảo mật**: `bcrypt` (Mã hóa mật khẩu) và `jsonwebtoken` (Xác thực JWT Auth).
- **Tích hợp AI**: Hỗ trợ cả `@google/generative-ai` (Gemini API) và Local LLM (Ollama) để xử lý các tính năng Trợ lý thông minh.
- **CORS**: Hỗ trợ gọi API từ Frontend (Cross-Origin Resource Sharing).
- **Môi trường**: Quản lý biến môi trường qua `dotenv`.

## 📁 Cấu Trúc Thư Mục

- `server.js`: File khởi chạy ứng dụng chính (Entry point).
- `package.json`: Quản lý các dependencies và scripts.
- `.env`: (Tự tạo) Cấu hình các biến môi trường (PORT, JWT_SECRET, GEMINI_API_KEY,...).
- `database/`: Chứa file cơ sở dữ liệu SQLite (`.db`, `.sqlite`).
- `src/`: Thư mục mã nguồn chính.
  - `routes/`: Định nghĩa các API endpoints (system, auth, user, product, order, chat,...).
  - `services/`: Xử lý logic nghiệp vụ, giao tiếp với Database hoặc AI.
- `tests/`: Chứa các bài test (kiểm thử) cho hệ thống.
- `environments/`: Cấu hình cho các môi trường khác nhau.

## ⚙️ Hướng Dẫn Cài Đặt và Khởi Chạy

### 1. Yêu Cầu Hệ Thống
- Node.js (Phiên bản khuyến nghị: v18+ hoặc v20+)
- npm hoặc yarn

### 2. Cài Đặt Dependencies

Di chuyển vào thư mục `backend` và chạy lệnh sau để cài đặt các thư viện cần thiết:
```bash
cd backend
npm install
```

### 3. Cấu Hình Biến Môi Trường

Bạn cần tạo một file `.env` ở thư mục gốc của `backend` (cùng cấp với `server.js`). Có thể tham khảo nội dung dưới đây:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
# Thêm API key cho Google Generative AI
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Khởi Chạy Server

- **Chạy môi trường phát triển (Development mode - tự động reload khi code thay đổi bằng nodemon):**
  ```bash
  npm run dev
  ```
- **Chạy môi trường sản phẩm (Production mode):**
  ```bash
  npm start
  ```

Mặc định server sẽ khởi chạy tại: `http://localhost:5000`

## 📡 Danh Sách Các Module API Chính

- **`/api/auth`**: Đăng nhập, đăng ký, xác thực.
- **`/api/user`**: Quản lý người dùng, nhân viên.
- **`/api/product`**: Quản lý kho hàng, sản phẩm.
- **`/api/order`**: Quản lý đơn hàng.
- **`/api/transaction`**: Giao dịch, thu chi.
- **`/api/attendance`**: Chấm công.
- **`/api/dashboard`**: Dữ liệu thống kê tổng quan.
- **`/api/chat`**: Tương tác với Trợ lý AI.
- **`/api/system` / `/api/notification`**: Quản lý hệ thống và thông báo.
