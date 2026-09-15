# Design Prompt: Admin Audit Logs

**Role:** System Analyst & UX/UI Designer

**Task:**
Phân tích yêu cầu và thiết kế đặc tả (Specification) & Wireframe cho chức năng "Nhật ký hoạt động (Audit Logs)" dành cho Admin.

**Context:**
- Hệ thống: BanHangAI (Backend Node.js/SQLite, Frontend Vanilla JS MVC + Tailwind).
- Mục đích: Lưu vết thao tác của người dùng trong hệ thống để phục vụ tra cứu, kiểm tra bảo mật (ví dụ: ai đã đổi cấu hình, ai xóa DB, ai đăng nhập sai...).

**Yêu cầu đầu ra:**
1. **Use Cases & Business Rules:** Quy định loại hành động nào cần lưu (Login, Cập nhật, Xóa) và ai có quyền xem.
2. **Database Schema:** Cấu trúc bảng `audit_logs` trong SQLite.
3. **API Specification:** Các API endpoint cần thiết (lọc theo ngày, user, action).
4. **Wireframe/UI Layout:** Mô tả giao diện bằng Text hoặc Markdown table (Bộ lọc, Bảng hiển thị, Phân trang).
