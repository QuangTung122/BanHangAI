# Prompt: Khởi tạo Backend (Node.js & Express)

[Instructions]
Dựa vào tài liệu đặc tả CSDL (`specs/design/erd-design.md`), hãy viết code để khởi tạo cấu trúc dự án Backend bằng Node.js và Express.

[Context]
- Bạn là Senior Backend Developer (Node.js).
- Hệ thống sử dụng cơ sở dữ liệu SQLite, truy vấn bằng raw SQL hoặc query builder nhẹ.
- Code phải tuân theo cấu trúc module ES6 (`import`/`export`).

[Input Data / Constraints]
- Cấu trúc thư mục yêu cầu:
  - `server.js` (entry point)
  - `database/init.sql` (chứa schema)
  - `src/controllers/`
  - `src/routes/`
  - `src/services/`
  - `src/middlewares/`
- Cấu hình server: Chạy trên port 5000, có middleware `cors` và `express.json()`.
- Route catch-all `app.get('*')` để phục vụ Frontend SPA (trỏ về `index.html` nếu không bắt đầu bằng `/api`).

[Output Format]
Trả lời bằng Markdown chứa các khối code:
1. `package.json` (chứa các thư viện cần thiết như express, sqlite3, cors, dotenv).
2. `server.js` (thiết lập server cơ bản và phục vụ thư mục tĩnh).
3. Hướng dẫn các lệnh terminal để chạy dự án.
