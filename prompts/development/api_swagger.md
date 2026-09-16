# Prompt: Đặc tả OpenAPI / Swagger

**Vai trò AI:** Backend Tech Lead.

**Dữ liệu Đầu vào (Input):**
- Đọc toàn bộ các file đặc tả trong `specs/development/*.md` để tổng hợp các API Routes hiện có.

**Yêu cầu Xử lý (Instructions):**
1. Viết mã nguồn đặc tả API theo chuẩn **OpenAPI 3.0** (Định dạng YAML).
2. Phải bao gồm các nhóm API cốt lõi: Auth (`/login`), Products (CRUD), Orders (Checkout), và AI (`/api/chat`, `/api/report`).
3. Khai báo rõ Request Body schema, HTTP Status Responses (200, 201, 400, 401) và Security Bearer Token.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown chứa YAML block.
- Lưu kết quả vào: `specs/development/api_swagger.md`.