# Prompt Lập Trình (Development): Module Quản lý Nhân sự

**Vai trò AI:** Backend & Frontend Developer.

**Ngữ cảnh:**
Dựa theo `specs/design/staff_spec.md`.

**Yêu cầu Backend:**
- Viết API `updateWage` trong `userController.js` nhận param `id` và body `hourly_wage`, validate giá trị `> 0` và update vào SQLite.
- Đảm bảo có Middleware `requireRole(['owner', 'admin'])` chặn quyền.

**Yêu cầu Frontend:**
- Trong `OwnerStaffView.js`, bắt sự kiện click nút "Lưu Mức Lương". Lấy giá trị từ thẻ input tương ứng với `data-id` của hàng, gọi API `PUT /api/user/:id/wage`.
- Logic tính lương tạm tính Tab 2: Code chuẩn công thức `Giờ chuẩn * Lương + OT * Lương * 1.5` hiển thị ra giao diện.
