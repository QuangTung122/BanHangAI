# Frontend - BanHangAI UI

Giao diện người dùng của BanHangAI được xây dựng thuần túy dựa trên **Vanilla JS** tuân thủ nghiêm ngặt mô hình **MVC (Model - View - Controller)**. Hệ thống không sử dụng framework nặng (như React/Vue) để đảm bảo tốc độ phản hồi cực nhanh trên máy POS.

## 📂 Cấu trúc MVC
- **`src/views/`**: Chịu trách nhiệm render HTML, hoàn toàn "mù" về logic. Bắt sự kiện người dùng (Click, Input) và gửi tín hiệu (Emit) tới Controller.
- **`src/controllers/`**: Đóng vai trò "Nhạc trưởng". Nhận tín hiệu từ View, điều phối Model để tính toán và cập nhật lại giao diện.
- **`src/models/`**: Nơi lưu giữ trạng thái (State) tạm thời (như Giỏ hàng, Danh sách chat).
- **`src/services/`**: Tầng giao tiếp mạng (Fetch API), gọi lên Backend.

## 💡 Điểm lưu ý
- Toàn bộ các View và Controller được tách biệt theo từng Vai trò và Tính năng (VD: `OwnerCashflowView`, `StaffPOSController`).
- Sử dụng CSS nội bộ hoặc Tailwind (nếu config) cho giao diện Responsive.
