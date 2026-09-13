# BanHangAI - Backend API

Đây là hệ thống Backend cho dự án **BanHangAI**, cung cấp các API RESTful để quản lý doanh nghiệp và tích hợp Trợ lý AI. Backend được phát triển dựa trên môi trường Node.js.

## 🛠 Công Nghệ Sử Dụng

- **Node.js** & **Express.js**: Xây dựng web server và xử lý các route RESTful API.
- **Cơ sở dữ liệu (Database)**: SQLite (`sqlite3`) - Cơ sở dữ liệu nhẹ, quản lý tập trung tại `database/ecom_ai.db`.
- **Bảo mật**: `bcrypt` (Mã hóa mật khẩu) và `jsonwebtoken` (Xác thực JWT Auth). Xử lý phân quyền qua Middleware.
- **Upload File**: Xử lý multipart/form-data thông qua `multer` (Lưu file tại thư mục `uploads/`).
- **Tích hợp AI**: Hỗ trợ gọi API Gemini hoặc Local LLM (Ollama) để xử lý tính năng Trợ lý thông minh.
- **CORS**: Hỗ trợ gọi API từ Frontend (Cross-Origin Resource Sharing).
- **Môi trường**: Quản lý biến môi trường qua `dotenv`.

## 📁 Cấu Trúc Thư Mục (Kiến trúc phân tầng)

- `server.js`: ĐIỂM VÀO CHÍNH (Bootstrap). Khởi chạy Express app, phục vụ file tĩnh và đăng ký các Routes. Tuyệt đối không chứa logic xử lý API trực tiếp.
- `package.json`: Quản lý các dependencies và scripts.
- `database/`: Chứa file cơ sở dữ liệu SQLite (`ecom_ai.db`), script khởi tạo (`init.sql`) và thư mục `scripts/` (migration, seed data).
- `uploads/`: Chứa các tệp đính kèm người dùng tải lên (ví dụ: chứng từ, bill).
- `src/`: Thư mục mã nguồn chính, phân chia theo chuẩn MVC/Layered.
  - `routes/`: Định nghĩa các API endpoints và ánh xạ (map) tới các controllers.
  - `middlewares/`: Chứa các hàm middleware kiểm tra, bảo vệ (auth, phân quyền role, error handler).
  - `controllers/`: Nơi chứa logic xử lý request/response chính yếu cho từng nghiệp vụ (order, transaction, user...).
  - `services/`: Xử lý logic nghiệp vụ lõi hoặc giao tiếp bên ngoài (VD: AI Service, DB Service).
- `environments/`: Cấu hình cho các môi trường khác nhau.
- `tests/`: Chứa các bài test (kiểm thử) cho hệ thống (Unit test, API test).

## ⚙️ Hướng Dẫn Cài Đặt và Khởi Chạy

### 1. Yêu Cầu Hệ Thống
- Node.js (Phiên bản khuyến nghị: v18+ hoặc v20+)

### 2. Cài Đặt Dependencies

Di chuyển vào thư mục `backend` và chạy lệnh sau:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường

Tạo file `.env` ở thư mục gốc của `backend` (cùng cấp với `server.js`):

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Khởi Chạy Server

- **Chạy môi trường phát triển (tự động reload khi code thay đổi):**
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
- **`/api/users`**: Quản lý người dùng, nhân viên.
- **`/api/products`**: Quản lý kho hàng, sản phẩm.
- **`/api/orders`**: Quản lý đơn hàng.
- **`/api/transactions`**: Quản lý sổ quỹ, thu chi.
- **`/api/attendance`**: Chấm công.
- **`/api/dashboard`**: Dữ liệu thống kê.
- **`/api/chat`**: Tương tác với Trợ lý AI.
- **`/api/system` / `/api/notifications`**: Quản lý hệ thống và thông báo.

