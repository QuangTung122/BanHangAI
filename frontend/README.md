# BanHangAI - Frontend

Đây là giao diện người dùng (Frontend) cho dự án **BanHangAI** - Trợ Lý Thông Minh Doanh Nghiệp. Giao diện được xây dựng đơn giản, nhẹ nhàng nhưng vẫn đảm bảo tính hiện đại, tương thích trên nhiều thiết bị và tích hợp liền mạch với tính năng AI cùng Chat nội bộ.

## 🚀 Công Nghệ Sử Dụng

- **HTML5/CSS3/JavaScript (Vanilla)**
- **Tailwind CSS**: Được tích hợp qua CDN giúp việc thiết kế giao diện nhanh chóng và nhất quán (Dark/Midnight Mode).
- **Chart.js**: Sử dụng qua CDN để vẽ biểu đồ thống kê cho Dashboard.
- **Font**: Inter (Google Fonts).

## 📁 Cấu Trúc Thư Mục

- `index.html`: Tệp entry point chính của toàn bộ giao diện frontend.
- `src/`: Chứa mã nguồn JavaScript, tuân thủ nghiêm ngặt mô hình thiết kế (MVC Vanilla JS).
  - `core/`: Chứa các module cốt lõi dùng chung toàn app (`ApiClient.js`, `EventEmitter.js`, `Formatters.js`).
  - `services/`: Lớp Giao tiếp Mạng, gọi fetch tới API Backend (VD: `AuthService.js`, `ChatService.js`, `ProductService.js`).
  - `models/`: Quản lý Trạng thái & Logic Nghiệp vụ nội bộ. Không gọi API trực tiếp và không đụng vào DOM (VD: `ChatModel.js`).
  - `views/`: Chuyên tạo HTML (Template Literals) & lắng nghe DOM Events. Gồm các thư mục con: 
    - `components/`: UI Components nhỏ lẻ.
    - `layouts/`: Các khung sườn chung (Sidebar, Navbar, `InternalChatModule.js`).
    - `pages/`: Các trang chính (Dashboard, POS, Manage...).
  - `controllers/`: Nhạc trưởng điều phối: Bắt sự kiện từ View, gọi Model/Service, và ra lệnh View cập nhật (VD: `InternalChatController.js`, `OwnerCashflowController.js`, `StaffPOSController.js`).
  - `app.js`: Tệp khởi tạo ứng dụng chính (Entry point & Router).
- `assets/`: Chứa các tài nguyên tĩnh.
  - `css/`: File stylesheet bổ sung (ghi đè Tailwind nếu cần).
  - `images/`: Hình ảnh, logo, banner, favicon.
  - `js/`: Các thư viện bên ngoài.

## ⚙️ Hướng Dẫn Cài Đặt và Chạy

Vì dự án frontend này không sử dụng bundler hay framework phức tạp (không có `package.json`), bạn không cần phải cài đặt dependencies qua `npm`.
Bạn có thể chạy dự án này bằng một trong các cách sau:

1. **Sử dụng VS Code Live Server**:
   - Mở thư mục `frontend` bằng VS Code.
   - Cài đặt extension **Live Server**.
   - Chuột phải vào file `index.html` và chọn **"Open with Live Server"**.

2. **Sử dụng http-server (Node.js)**:
   ```bash
   npx serve
   # hoặc
   npx http-server
   ```

3. **Sử dụng Python**:
   ```bash
   python -m http.server 8000
   ```

Sau khi chạy server, mở trình duyệt và truy cập vào đường dẫn tương ứng (ví dụ: `http://localhost:8000`).

## 🔗 Liên Kết Với Backend

Frontend sẽ gọi các API RESTful tới server Backend thông qua `ApiClient`. Đảm bảo rằng Backend đang hoạt động để có thể đăng nhập, sử dụng AI, Chat Nội Bộ và hiển thị dữ liệu chính xác (mặc định các API fetch thường gọi tới `http://localhost:5000/api/...`).
