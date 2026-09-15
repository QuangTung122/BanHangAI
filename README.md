# Hệ Thống Quản Lý Bán Hàng Tích Hợp Trí Tuệ Nhân Tạo (E-Com AI) 🤖📦

Một giải pháp phần mềm quản trị bán hàng toàn diện, áp dụng sức mạnh của **Trí tuệ nhân tạo (Generative AI)** để tự động hóa việc tư vấn khách hàng, phân tích dữ liệu kinh doanh và nâng cao hiệu suất làm việc nhóm. Hệ thống được thiết kế theo hướng bảo mật dữ liệu tuyệt đối nhờ tích hợp local LLM.

## 🌟 Tính năng nổi bật

### Chức năng Quản lý (Lõi hệ thống)
* **Phân quyền linh hoạt:** Hỗ trợ nhiều vai trò (Admin, Owner, Staff, Customer).
* **Màn hình Bán hàng (POS):** Tìm kiếm siêu tốc, hỗ trợ phân loại. Chức năng lập hóa đơn thanh toán trả thẳng hoặc **Trả góp** (tính toán chi phí tự động).
* **Quản lý Tồn kho:** Tự động trừ tồn kho khi thanh toán thành công.
* **Dashboard Thống kê:** Báo cáo doanh thu, sản phẩm bán chạy, cảnh báo sản phẩm sắp hết hàng qua biểu đồ trực quan.
* **Chat Nội Bộ (Team Chat):** Hỗ trợ liên lạc theo thời gian thực giữa các nhân viên, chủ cửa hàng và quản trị viên ngay trên hệ thống.

### Điểm nhấn Trí tuệ Nhân tạo (AI)
* **Trợ lý Ảo (Chatbot Tư vấn):** Khách hàng/Nhân viên có thể chat bằng ngôn ngữ tự nhiên. AI nắm được kho hàng thực tế để đưa ra gợi ý sản phẩm phù hợp.
* **AI Insight (Phân tích Kinh doanh):** Chủ cửa hàng chỉ cần bấm 1 nút, AI sẽ tự động đọc số liệu biểu đồ doanh thu và đưa ra nhận xét chiến lược nhập/bán hàng thông minh.
* **Bảo mật dữ liệu tuyệt đối:** Sử dụng **Ollama** chạy mô hình cục bộ (`qwen2.5-coder` / `llama3`), không gửi dữ liệu khách hàng ra các dịch vụ API bên ngoài.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

* **Frontend:** Single Page Application (SPA), Vanilla JavaScript, HTML5, CSS3, **Tailwind CSS**. Tự động định tuyến (Hash Router) không cần reload trang.
* **Backend:** Node.js, Express.js.
* **Database:** SQLite3 (gọn nhẹ, không cần cài đặt SQL Server phức tạp).
* **AI Engine:** Ollama (tích hợp qua Local API).

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

### Yêu cầu tiên quyết
1. Cài đặt **Node.js** (v18 trở lên).
2. Cài đặt **Ollama** (từ [ollama.com](https://ollama.com)) và tải model bằng lệnh: `ollama run qwen2.5-coder:1.5b`.

### Các bước khởi chạy
1. **Clone mã nguồn:**
   ```bash
   git clone <repo_url>
   cd BanHangAI
   ```
2. **Cài đặt thư viện Backend:**
   ```bash
   cd backend
   npm install
   ```
3. **Khởi tạo Cơ sở dữ liệu (nếu cần):**
   ```bash
   sqlite3 database/ecom_ai.db < database/init.sql
   ```
4. **Khởi động Server:**
   ```bash
   npm start
   # Server sẽ chạy tại http://localhost:5000
   ```

---

## 🔑 Tài khoản Demo (Dữ liệu mẫu)

Hệ thống đã có sẵn dữ liệu test (sản phẩm, cấu hình AI, nhân sự). Bạn có thể đăng nhập bằng các tài khoản sau (Mật khẩu mặc định: `123456`):
* **Quản trị viên (Admin):** `admin`
* **Chủ cửa hàng (Owner):** `owner` (để trải nghiệm Dashboard & AI Insight)
* **Nhân viên bán hàng (Staff):** `staff` (để trải nghiệm POS, Trả góp & Chat Nội Bộ)
* **Khách hàng (Customer):** `customer1`
