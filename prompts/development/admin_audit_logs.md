# Development Prompt: Admin Audit Logs

**Role:** Fullstack Developer (Node.js & Vanilla JS MVC)

**Task:**
Phát triển hoàn chỉnh chức năng "Nhật ký hoạt động (Audit Logs)" theo đặc tả trong file `specs/design/admin_audit_logs_spec.md`.

**Các bước thực hiện (Checklist):**

1. **Backend Database:**
   - Tạo script `backend/database/scripts/create_audit_logs_table.cjs` để tạo bảng `audit_logs`.
   - Chạy script để khởi tạo bảng trong CSDL.

2. **Backend API:**
   - Tạo file `backend/src/controllers/auditController.js` với hàm `getLogs(req, res)` xử lý filter và pagination.
   - Hàm `logAction(user_id, action_type, action_desc, details)` để ghi log. Export hàm này để các Controller khác (như `authController`, `systemController`) có thể gọi khi cần.
   - Tạo file `backend/src/routes/auditRoutes.js` khai báo endpoint `GET /api/audit-logs` với middleware bảo vệ cho Admin.
   - Gắn route vào `server.js`.
   - Update `authController.js` và `systemController.js` để nhúng hàm `logAction` vào thao tác Đăng nhập, Lưu cấu hình, Reset DB.

3. **Frontend MVC:**
   - Update `LayoutView.js` và `LayoutController.js` để thêm Menu "Nhật ký hoạt động" cho Admin (icon tùy chọn).
   - `models/AuditModel.js`: Hàm `fetchLogs(filters, page)`.
   - `views/pages/AdminAuditView.js`: Render UI, bộ lọc, bảng dữ liệu, và Modal xem chi tiết JSON.
   - `controllers/AdminAuditController.js`: Gắn sự kiện Lọc, Chuyển trang, Mở Modal.

**Yêu cầu kỹ thuật:**
- Code Backend dùng `async/await`, trả về chuẩn JSON `{ success, data, meta: { total, page, totalPages } }`.
- Code Frontend dùng TailwindCSS cho giao diện, tuân thủ chặt chẽ luồng MVC (Không gọi API ở View, không vẽ DOM ở Model).
- Xử lý mượt mà sự kiện click vào nút xem JSON (Tạo một modal nổi hiển thị `<pre>`).
