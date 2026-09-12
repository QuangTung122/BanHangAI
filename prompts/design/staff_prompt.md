# Prompt Thiết Kế: Module Quản lý Nhân sự & Chấm công

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Hệ thống BanHangAI cần thiết kế chức năng "Quản lý Nhân sự & Chấm công" dành cho Owner/Admin. File giao diện là `OwnerStaffView.js`.

**Yêu cầu đầu ra (Output):**
1. **Wireframe Giao Diện (ASCII Art):**
   - Chức năng có 2 Tab: "Hồ sơ & Mức lương" và "Bảng công & Trả lương".
   - Tab 1 (Nhân viên): Lưới hiển thị Tên, Vai trò (Role), Trạng thái, Ô nhập Lương/Giờ (hourly_wage) và nút "Lưu Mức Lương".
   - Tab 2 (Bảng công): Lưới hiển thị Nhân viên, Ngày làm việc, Giờ Chuẩn, Giờ OT, và Tính lương tạm tính (Lương = Giờ chuẩn * Mức lương + Giờ OT * Mức lương * 1.5).
2. **Database Schema:** 
   - Bảng `users`: Thêm trường `hourly_wage`.
   - Bảng `attendance`: Chứa `user_id`, `date`, `standard_hours`, `ot_hours`.
3. **API Specs:**
   - `GET /api/user`: Lấy danh sách nhân viên.
   - `PUT /api/user/:id/wage`: Cập nhật mức lương.
   - Các API chấm công (get attendance) tương ứng.

Lưu kết quả vào `specs/design/staff_spec.md`.
