# Dự án BanHangAI - Hệ Thống Quản Lý Bán Hàng Ứng Dụng AI

Chào mừng đến với dự án **BanHangAI**, một hệ thống phần mềm bán hàng đa nền tảng được phát triển với kiến trúc MVC (Model-View-Controller) cho phía Frontend và kiến trúc phân tầng (Layered Architecture) trên nền tảng Node.js/Express.js cho phía Backend.

Hệ thống được thiết kế hướng tới khả năng bảo trì, mở rộng và đặc biệt có sự tích hợp các tính năng phân tích dữ liệu bán hàng.

## 🌟 Tính năng chính

Hệ thống hỗ trợ nhiều vai trò người dùng khác nhau với các chức năng tương ứng:

- **Nhân viên (Staff):** Xử lý bán hàng tại quầy (POS), quản lý sản phẩm, theo dõi lịch sử đơn hàng, hỗ trợ tính năng bán trả góp và điểm danh.
- **Quản lý / Chủ cửa hàng (Owner):** Theo dõi Dashboard tổng quan, quản lý nhân viên, quản lý sản phẩm, và xem báo cáo dòng tiền (Cashflow).
- **Quản trị viên hệ thống (Admin):** Cấu hình hệ thống (System) và quản lý toàn bộ người dùng (User).

## 🏗 Cấu trúc hệ thống

Dự án được cấu trúc theo dạng Monorepo, bao gồm:

- **`backend/`**: Mã nguồn Node.js/Express phục vụ API và các tác vụ background.
- **`frontend/`**: Mã nguồn giao diện người dùng sử dụng Vanilla JavaScript, hoạt động độc lập và gọi dữ liệu qua API.

Chi tiết hơn về kiến trúc thư mục, vui lòng xem tại tài liệu [Codebase Map](./codebasemap.md).

---

## 💻 1. Frontend (Giao diện người dùng)

Kiến trúc Frontend áp dụng triệt để mô hình **Vanilla JS MVC**, đảm bảo phân tách rõ ràng giữa phần Dữ liệu (Model), Giao diện (View) và Điều hướng/Logic (Controller).

- **`src/core/`**: Chứa các lớp tiện ích cơ sở như `ApiClient` (xử lý gọi API), `EventEmitter` (quản lý sự kiện) và `Formatters` (định dạng dữ liệu).
- **`src/models/`**: Xử lý logic nội bộ ở frontend, quản lý trạng thái của các thực thể như `Order`, `Product`, `Cart`, `User`, v.v.
- **`src/views/`**: Chuyên tạo HTML (bằng Template Literals) và lắng nghe các sự kiện DOM. Được chia làm các components, layouts và pages (màn hình) tương ứng cho các vai trò (VD: `StaffPOSView.js`, `OwnerDashboardView.js`).
- **`src/controllers/`**: Là trung tâm điều phối, nhận sự kiện từ View, gọi Model hoặc Service để lấy/cập nhật dữ liệu, sau đó yêu cầu View render lại.
- **`src/services/`**: Các file định nghĩa các hàm tương tác với Backend API tương ứng.

---

## ⚙️ 2. Backend (Máy chủ API)

Backend của hệ thống được xây dựng trên **Node.js** và **Express**, sử dụng cơ sở dữ liệu **SQLite**.

- **`src/routes/`**: Nơi định nghĩa các endpoint của API, phân luồng yêu cầu từ client tới đúng Controller (VD: `productRoutes.js`, `orderRoutes.js`).
- **`src/controllers/`**: Nhận yêu cầu từ Route, xử lý logic (xác thực, gọi cơ sở dữ liệu, v.v.), và trả về kết quả (thường ở định dạng JSON).
- **`src/middlewares/`**: Xử lý các logic trung gian như kiểm tra quyền truy cập (`authMiddleware.js`), xác thực dữ liệu đầu vào.
- **`database/`**: Chứa file cơ sở dữ liệu SQLite (`ecom_ai.db`) và các file khởi tạo, migration.

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu cài đặt

- **Node.js** (Phiên bản LTS được khuyến nghị)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari...)

### Cài đặt và Chạy Backend

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện (dependencies):
   ```bash
   npm install
   ```
3. Khởi động server (Mặc định chạy ở cổng 3000):
   ```bash
   node server.js
   ```

### Chạy Frontend

1. Frontend sử dụng hoàn toàn Vanilla JS nên không cần Node.js để build.
2. Tuy nhiên, để tránh lỗi CORS và các chính sách bảo mật của trình duyệt, bạn nên dùng một live server (VD: Live Server extension trên VS Code hoặc tiện ích `serve` của npm).
3. Mở từ thư mục gốc `frontend` bằng server:
   ```bash
   cd frontend
   npx serve .
   ```
4. Truy cập theo địa chỉ server cung cấp (Thường là `http://localhost:5000` hoặc một cổng khác).

---

## 📄 Tài liệu tham khảo thêm

- [codebasemap.md](./codebasemap.md): Bản đồ phân bổ thư mục và file chuẩn của dự án.
