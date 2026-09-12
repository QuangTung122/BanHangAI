
# BanHangAI - Frontend

Đây là giao diện người dùng (Frontend) cho dự án **BanHangAI** - Trợ Lý Thông Minh Doanh Nghiệp. Giao diện được xây dựng đơn giản, nhẹ nhàng nhưng vẫn đảm bảo tính hiện đại và tương thích trên nhiều thiết bị.

## 🚀 Công Nghệ Sử Dụng

- **HTML5/CSS3/JavaScript (Vanilla)**
- **Tailwind CSS**: Được tích hợp qua CDN giúp việc thiết kế giao diện nhanh chóng và nhất quán.
- **Chart.js**: Sử dụng qua CDN để vẽ biểu đồ thống kê cho Dashboard.
- **Font**: Inter (Google Fonts).

## 📁 Cấu Trúc Thư Mục

- `index.html`: Tệp entry point chính của toàn bộ giao diện frontend.
- `src/`: Chứa mã nguồn JavaScript, tuân thủ mô hình thiết kế (MVC/Services).
  - `app.js`: Tệp khởi tạo ứng dụng chính.
  - `controllers/`: Chứa logic điều khiển cho các trang (Dashboard, POS, Products, v.v.).
  - `core/`: Các module cốt lõi (Router, Utils,...).
  - `models/`: Chứa các định nghĩa dữ liệu nếu có.
  - `services/`: Các dịch vụ giao tiếp với Backend API (Auth API, AI API, Product API,...).
  - `views/`: Chứa các file render giao diện (HTML templates trong JS).
- `assets/`: Chứa các tài nguyên tĩnh.
  - `css/`: File stylesheet bổ sung (nếu có).
  - `images/`: Hình ảnh, logo, favicon.
  - `js/`: Các thư viện bên ngoài (nếu không dùng CDN).

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

Frontend sẽ gọi các API RESTful tới server Backend. Đảm bảo rằng Backend đang hoạt động để có thể đăng nhập và hiển thị dữ liệu chính xác (mặc định các API fetch thường gọi tới `http://localhost:5000/api/...`).
