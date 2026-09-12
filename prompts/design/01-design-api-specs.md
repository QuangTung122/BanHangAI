# Prompt: Thiết kế Đặc tả API (RESTful API Specifications)

[Instructions]
Dựa vào sơ đồ cơ sở dữ liệu (ERD) trong `specs/design/erd-design.md`, hãy thiết kế danh sách các API Endpoint (RESTful API) cần thiết cho hệ thống Quản lý Bán hàng tích hợp AI.

[Context]
- Bạn là System Designer / Backend Lead.
- Việc thiết kế API này dùng làm bản lề cho Dev code backend (Node.js/Express) và tích hợp frontend.
- Backend trả về chuẩn JSON: `{ success: boolean, message: string, data: any }`.

[Input Data / Constraints]
Thiết kế API cho các nhóm chức năng sau:
1. **System & Auth:** Đăng nhập, thiết lập hệ thống.
2. **Users / Staff:** Quản lý tài khoản.
3. **Products & Categories:** Lấy danh sách, thêm/sửa/xóa sản phẩm.
4. **Orders:** Lập đơn hàng (POS), xem lịch sử đơn.
5. **Chat AI:** Gọi API giao tiếp với Ollama.
6. **Dashboard:** Thống kê doanh thu, số liệu.

[Output Format]
Viết bằng Markdown, sử dụng bảng để liệt kê API gồm các cột:
`Method` | `Endpoint` | `Role (Quyền)` | `Mô tả chức năng`

Ví dụ:
| Method | Endpoint | Role | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Đăng nhập hệ thống |
| GET | `/api/products` | All | Lấy danh sách SP (hỗ trợ search, filter) |
| POST | `/api/orders` | Staff, Owner | Lập đơn hàng (cập nhật tồn kho) |

---
## Yêu cầu ghi kết quả
Chỉ sinh tài liệu thiết kế (không viết code). Ghi kết quả vào: `specs/design/api-specifications.md`
