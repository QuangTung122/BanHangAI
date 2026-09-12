# Đặc Tả Thiết Kế (Design Specs): Module Quản lý Nhân sự & Chấm công

## 1. Wireframe Giao Diện (Owner Staff View)

**Tab 1: Hồ sơ & Mức lương**
```text
[ Hồ sơ & Mức lương (Tab 1) ]  [ Bảng công & Trả lương (Tab 2) ]
-------------------------------------------------------------------------
 TÊN NHÂN VIÊN      VAI TRÒ       TRẠNG THÁI     LƯƠNG / GIỜ    THAO TÁC
-------------------------------------------------------------------------
 Nguyen Van A       [CASHIER]     [Hoạt động]    [  25,000 ]đ/h [Lưu]
 @nva
-------------------------------------------------------------------------
 Tran Thi B         [ADMIN]       [Khóa]         [  35,000 ]đ/h [Lưu]
 @ttb
-------------------------------------------------------------------------
```

**Tab 2: Bảng công & Trả lương**
```text
[ Hồ sơ & Mức lương (Tab 1) ]  [ Bảng công & Trả lương (Tab 2) ]
------------------------------------------------------------------------------------
 NHÂN VIÊN         NGÀY           CA LÀM          GIỜ CHUẨN   OT       LƯƠNG TẠM TÍNH
------------------------------------------------------------------------------------
 Nguyen Van A      10/09/2026     08:00 - 17:00   8.0h        2.0h     275,000 đ
 Mức: 25k/h
------------------------------------------------------------------------------------
```
*Lưu ý công thức lương: `Lương = (Giờ chuẩn * Lương/h) + (Giờ OT * Lương/h * 1.5)`*

## 2. Database Schema

- **Bảng `users`**: Bổ sung cột `hourly_wage` (REAL, default 0) lưu mức lương theo giờ của từng nhân sự. `role` (owner, admin, cashier), `is_active` (boolean).
- **Bảng `attendance`**: `user_id` (INTEGER), `check_in_time`, `check_out_time`, `date`, `standard_hours`, `ot_hours`.

## 3. API Specs

**`PUT /api/user/:id/wage`**
- **Quyền:** Owner hoặc Admin.
- **Body:** `{ "hourly_wage": 30000 }`
- **Xử lý:** Cập nhật trường `hourly_wage` cho `user_id` tương ứng.

**`GET /api/user`**
- Lấy toàn bộ danh sách user (ngoại trừ mật khẩu).

**`GET /api/attendance`** (Tương đối)
- Lấy danh sách chấm công kết hợp (JOIN) với bảng `users` để tính ra `standard_hours`, `ot_hours` và `hourly_wage`.
