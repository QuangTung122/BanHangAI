# Issues (Lưu vết & Quản lý Task)

Thư mục này được sử dụng để lưu trữ các tài liệu lưu vết lỗi (Bugs), ghi nhận các vấn đề (Issues) phát sinh và quản lý các tác vụ (Tasks) chưa giải quyết trong quá trình phát triển dự án **BanHangAI**.

## 📁 Mục đích

- Ghi nhận chi tiết các lỗi hoặc cảnh báo từ người dùng / hệ thống (Ví dụ: Lỗi hiển thị avatar người dùng trong chat nội bộ).
- Theo dõi các task hoặc tính năng mới (Feature requests) đang chờ phát triển.
- Đóng vai trò như một hệ thống Issue Tracker cục bộ (Local Issue Tracker) cho toàn dự án, giúp dễ dàng rà soát khi làm việc offline hoặc với các AI Agents.

## 📝 Quy cách tạo Issue

- Bất kỳ lỗi hoặc vấn đề phức tạp nào cần theo dõi nên được tạo thành một file markdown riêng biệt.
- **Quy tắc đặt tên file:** `issue-[số thứ tự]-[mô-tả-ngắn].md` (ví dụ: `issue-001-login-bug.md`, `issue-002-chat-avatar-fix.md`).
- **Nội dung file bắt buộc bao gồm:**
  - Mô tả lỗi (Description).
  - Cách tái hiện lỗi (Steps to reproduce).
  - Mức độ nghiêm trọng (Severity/Priority).
  - Trạng thái hiện tại: `Open`, `In Progress`, hoặc `Resolved`.
