# Backend - BanHangAI API

Đây là trái tim của hệ thống BanHangAI, cung cấp các RESTful API phục vụ Frontend và giao tiếp với nền tảng Trí tuệ Nhân tạo (LLM).

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Database:** SQLite (Mặc định) / MySQL
- **Bảo mật:** JWT (JSON Web Token), bcrypt (Mã hóa mật khẩu).
- **AI Integration:** OpenAI API SDK / Google Generative AI SDK.

## 📂 Cấu trúc
- **`src/routes/`**: Định nghĩa các Endpoint giao tiếp với ngoài.
- **`src/controllers/`**: Xử lý logic nghiệp vụ, gọi Transaction tới Database.
- **`src/services/`**: Chứa logic gọi API AI (Tạo System Prompt, Inject context) và các logic phức tạp.
- **`src/middlewares/`**: `authMiddleware.js` (chặn request không có JWT), phân quyền Admin/Owner/Staff.

## 🔒 Quy tắc Code
- **Không bao giờ** commit file `.env` chứa khóa bí mật lên Git.
- **Transaction:** Mọi giao dịch thay đổi dòng tiền (Cashflow) và Tồn kho (Stock) phải sử dụng DB Transaction (BEGIN -> COMMIT / ROLLBACK) để chống đua lệnh (Race Condition).

## Xác minh số điện thoại Bot

Đăng ký Bot dùng OTP SMS trước khi liên kết số điện thoại với hồ sơ khách. Cấu hình `SMS_GATEWAY_URL`, `SMS_GATEWAY_TOKEN` và `BOT_OTP_SECRET` trong `.env`; gateway cần nhận `POST` JSON gồm `{ "to": "09xxxxxxxx", "message": "..." }`, xác thực bằng Bearer token và trả HTTP 2xx khi nhận gửi. Dùng HTTPS ở môi trường triển khai. Khi thiếu cấu hình, đăng ký bị từ chối an toàn.

Không gửi CCCD qua chat. Bot chỉ hướng dẫn khách hoàn tất hồ sơ trả góp qua kênh chính thức của đối tác tài chính. Đơn bot giữ tồn tối đa 30 phút, giới hạn hai đơn chờ trên mỗi khách và tự giải phóng tồn khi hết hạn.
