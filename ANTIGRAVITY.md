# CÁC QUY CHUẨN DỰ ÁN (PROJECT CONVENTIONS & STANDARDS)

---

## 1. Quy chuẩn Quản lý & Xử lý Tài liệu SDLC (Documentation Standards)

* **Nguyên tắc đọc ngữ cảnh:**

  - Luôn kiểm tra và đọc file `de_tai_01.md`, `informember.md` tại thư mục gốc và các tài liệu trước đó trong `specs/` trước khi thực hiện bất kỳ nhiệm vụ nào.
  - Không tự suy diễn hay bịa đặt yêu cầu nghiệp vụ chưa có trong tài liệu đầu vào.
* **Trạng thái làm rõ yêu cầu:**

  - `Đã xác nhận` / `Đã trả lời`: Dữ liệu có cơ sở trong đầu vào, được phép đưa vào SRS/thiết kế.
  - `Chưa trả lời` / `Cần xác nhận`: Dữ liệu chưa rõ ràng, phải gắn tag cảnh báo và đề xuất người xác nhận, không biến thành yêu cầu chính thức.
* **Bảng quy chuẩn mã định danh (Traceability ID Matrix):**

  - `OBJ-xxx`: Project Objectives (Mục tiêu dự án)
  - `STK-xxx`: Stakeholders (Các bên liên quan)
  - `MOD-xxx`: System Modules (Khối module hệ thống)
  - `QA-xxx`: Clarification Questions (Câu hỏi làm rõ yêu cầu)
  - `UC-xxx` (hoặc `UCxxx`): Use Cases
  - `REQ-F-xxx`: Functional Requirements (Yêu cầu chức năng)
  - `REQ-NF-xxx`: Non-functional Requirements (Yêu cầu phi chức năng)
  - `REQ-AI-xxx`: AI Specific Requirements (Yêu cầu module AI)
  - `BR-xxx`: Business Rules (Quy tắc nghiệp vụ)
  - `DR-xxx`: Data Requirements (Yêu cầu dữ liệu mức khái niệm)
  - `RISK-xxx`: Project Risks (Rủi ro dự án)
  - `ASM-xxx`: Assumptions (Giả định cần kiểm chứng)
* **Quy chuẩn cập nhật Template:**

  - Giữ nguyên cấu trúc phân cấp (Heading 1 -> Heading 2 -> Heading 3), không tự ý chèn heading ngoài template.
  - Giữ nguyên bảng và tên cột mặc định trong file template Word/Markdown.

---

## 2. Quy chuẩn Kỹ thuật Backend (Node.js & Express)

* **Kiến trúc phân tầng (Layered Architecture):**

  - Áp dụng triệt để mô hình MVC/Phân tầng. Logic API phải được tách biệt rõ ràng vào các thư mục: `routes` (Định tuyến) -> `middlewares` (Bảo vệ/Kiểm tra) -> `controllers` (Xử lý nghiệp vụ chính).
  - File `server.js` chỉ dùng để cấu hình Express, kết nối CSDL và đăng ký Routes. **Tuyệt đối không** viết logic xử lý request trực tiếp trong `server.js`.
* **Cấu trúc & Phong cách viết mã (Code Style):**

  - Tuân thủ tiêu chuẩn mã hóa JavaScript/Node.js hiện đại (ES6+).
  - Đặt tên file, hàm, biến: `camelCase` (ví dụ: `getUserById`, `authController.js`, `productRoutes.js`).
  - Đặt tên Class/Model: `PascalCase` (ví dụ: `UserModel`, `AuthService`).
  - Tên hằng số: `UPPER_SNAKE_CASE` (ví dụ: `PORT`, `MAX_CHAT_TOKENS`).
* **Quản lý Database (SQLite):**

  - Cơ sở dữ liệu chính là SQLite (`sqlite3`), lưu trữ tại `backend/database/ecom_ai.db`.
  - Cấu trúc bảng được định nghĩa tĩnh trong `backend/database/init.sql` và phải được khởi tạo tự động khi chạy server.
  - Ưu tiên sử dụng Raw SQL Query với tham số hóa (Parameterized Queries `?`) để chống SQL Injection.
* **Bảo mật & Middleware (Security & Auth):**

  - Mật khẩu người dùng bắt buộc phải được băm (hash) bằng thư viện `bcrypt` trước khi lưu vào CSDL.
  - Sử dụng middleware `cors` để cấp quyền truy cập chéo (Cross-Origin) cho Frontend.
  - Định dạng chuẩn giao tiếp API luôn là JSON (`express.json()`).
* **Bất đồng bộ & Xử lý lỗi (Async & Error Handling):**

  - Luôn sử dụng `async/await` (hoặc bọc Promise) khi thực thi truy vấn Database hoặc gọi API bên ngoài để tránh Callback Hell.
  - Response trả về luôn phải tuân theo cấu trúc JSON chuẩn: `{ "success": boolean, "message": string, "data": ... }`.
  - Quản lý mã HTTP Status chặt chẽ:
    - `400 Bad Request`: Thiếu dữ liệu hoặc vi phạm ràng buộc (ví dụ: trùng username/email).
    - `401 Unauthorized`: Đăng nhập thất bại.
    - `403 Forbidden`: Không có quyền thao tác (Ví dụ: quyền 'staff' không được sửa hệ thống).
    - `404 Not Found`: Không tìm thấy tài nguyên.
    - `500 Internal Server Error`: Lỗi hệ thống server hoặc CSDL.
  - Chức năng AI bắt buộc dùng khối `try...catch` để có cơ chế trả về thông báo lỗi thân thiện khi API AI (Ollama/Gemini) bị lỗi.

---

## 3. Quy chuẩn Giao diện Frontend (HTML5 / Tailwind CSS / Vanilla JS)

* **Quy chuẩn Giao diện (UI/UX):**

  - Sử dụng Tailwind CSS qua CDN, tuân thủ nguyên tắc Mobile-first và thiết kế tương thích (Responsive: `sm:`, `md:`, `lg:`).
  - Màu sắc: Đồng bộ bảng màu chủ đạo (Primary: Blue/Indigo; Success: Emerald; Danger: Rose; Neutral: Slate).
* **Quy chuẩn JavaScript (Client-side):**

  - Tổ chức code theo mô hình MVC (ES6 Module) hoàn toàn nằm trong thư mục `frontend/src/` (`models/`, `views/`, `controllers/` và file điểm neo `app.js`).
  - Không viết logic script inline hoặc code thao tác DOM nằm ngoài cấu trúc MVC.
  - Sử dụng chuẩn `const` / `let`, tuyệt đối không dùng `var`.
  - Toàn bộ lời gọi API phải dùng `async/await` kết hợp `fetch()` và bọc trong khối `try...catch` (chỉ đặt trong tầng Model).
* **Trải nghiệm Module AI (AI UX Standards):**

  - Khi gửi câu hỏi cho AI, giao diện phải lập tức hiển thị trạng thái "Đang suy nghĩ..." (Skeleton loader hoặc hiệu ứng Typing dots).
  - Vô hiệu hóa nút gửi (Disable button) trong lúc AI đang sinh dữ liệu để chống spam request.
  - Xử lý mượt mà việc render Markdown đơn giản (bold, bullet points) từ câu trả lời của AI.
* **Quản lý trạng thái Giỏ hàng (Cart State):**

  - Giỏ hàng lưu trữ ở `localStorage` dưới định dạng JSON:
    ```json
    [
      {"product_id": 1, "name": "Sản phẩm A", "price": 100000, "quantity": 2}
    ]
    ```

---

## 4. Quy chuẩn Module AI (Ollama & Prompt Engineering)

* **Giới hạn & Phạm vi của AI (AI Guardrails):**

  - Bot AI đóng vai trò **Trợ lý tư vấn bán hàng**, không được tự ý sinh mã giảm giá ngoài chính sách hoặc hứa hẹn điều khoản không có trong CSDL.
  - Khi người dùng hỏi sản phẩm không có trong cửa hàng, AI phải phản hồi lịch sự là cửa hàng chưa kinh doanh mặt hàng đó, không được tự bịa ra thông tin.
* **Cấu trúc System Prompt chuẩn:**

  ```text
  Bạn là Trợ lý tư vấn bán hàng của cửa hàng.
  Dữ liệu sản phẩm hiện có: {product_context}
  Quy tắc:
  - Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp ở trên.
  - Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
  - Nếu sản phẩm hết hàng hoặc không có trong danh sách, hãy thông báo rõ ràng.
  ```

---

## 5. Quy chuẩn Tổ chức Thư mục & Tạo File (Folder & File Conventions)

### 5.1. Quy chuẩn chung

* **Ngôn ngữ đặt tên:** Sử dụng 100% Tiếng Anh cho tên thư mục và tên file code để đảm bảo tính chuyên nghiệp và đồng bộ. (Ngoại trừ các file tài liệu Markdown).
* **Không sử dụng dấu cách:** Tuyệt đối không dùng khoảng trắng (space) hoặc ký tự đặc biệt (tiếng Việt có dấu) trong tên file/thư mục. Dùng dấu gạch ngang `-` (kebab-case) hoặc viết liền camelCase/PascalCase tùy quy định.

### 5.2. Frontend (Vanilla JS MVC)

* **Thư mục:** Đặt tên chữ thường, số nhiều (plural) nếu chứa nhiều đối tượng cùng loại (vd: `models`, `views`, `controllers`, `services`, `components`).
* **File MVC (`models/`, `views/`, `controllers/`, `services/`):**
  * Tên file: Sử dụng `PascalCase` (viết hoa chữ cái đầu) cho các file Class, Component, Service hoặc Model (ví dụ: `AuthModel.js`, `StaffController.js`, `ProductService.js`, `ProductCard.js`).
  * Quy tắc 1 file - 1 trách nhiệm: Mỗi file `.js` chỉ chứa logic của đúng 1 Entity hoặc 1 UI Component.
* **File cấu hình / Helper (`core/`, `environments/`):** Sử dụng chữ thường hoặc `camelCase` (ví dụ: `env.dev.js`, `helpers.js`, `apiClient.js`).
* **File Asset (`assets/`):** Chữ thường, phân tách bằng dấu gạch ngang `kebab-case` (ví dụ: `bg-login.png`, `main-style.css`).

### 5.3. Backend (Node.js/Express)

* **Tên file chính:** Các file cấu hình và điểm neo ở root backend dùng chữ thường (ví dụ: `server.js`, `package.json`).
* **Thư mục mã nguồn (`src/`):**
  * Chia rõ thành các thư mục con: `routes`, `controllers`, `middlewares`, `services`.
  * **Tên file MVC:** Bắt buộc dùng `camelCase` và có hậu tố rõ ràng tương ứng (ví dụ: `userRoutes.js`, `orderController.js`, `authMiddleware.js`).
* **Cơ sở dữ liệu (`database/`):** Chữ thường, dùng dấu gạch dưới `snake_case` (ví dụ: `ecom_ai.db`, `init.sql`). File script thao tác DB (migration, seed) phải đặt trong `database/scripts/`.
* **Kiểm thử (`tests/`):** Chứa các file kiểm thử, tên file thường bắt đầu bằng `test_` (ví dụ: `test_db.js`).
