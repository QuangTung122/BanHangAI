# Specs (Đặc tả hệ thống)

Thư mục này là trái tim tài liệu kỹ thuật của dự án **BanHangAI**, chứa các tài liệu đặc tả (Specifications) chi tiết về toàn bộ hệ thống. Các tài liệu ở đây là nền tảng để phát triển Frontend, Backend và kiểm thử phần mềm.

## 📁 Cấu trúc thư mục

- **`requirements/`**: Đặc tả yêu cầu hệ thống.
  - Phân tích nghiệp vụ, định nghĩa các tác nhân (Actors: Admin, Owner, Staff, Customer).
  - Chi tiết Use Cases và User Stories.
- **`design/`**: Đặc tả thiết kế hệ thống.
  - **Kiến trúc (Architecture):** System Architecture, API Specs.
  - **Cơ sở dữ liệu (Database):** Lược đồ thực thể - liên kết (ERD), Data Dictionary.
  - **AI Integration:** Các luồng tích hợp Trợ lý AI, Prompt Engineering cho AI Insight, cơ chế Chat Streaming.
  - **UI/UX:** Wireframes, sơ đồ luồng điều hướng giao diện.
  - **Modules:** Đặc tả nghiệp vụ lõi (POS, Trả góp, Dòng tiền, Kho hàng, Chat nội bộ).
- **`testing/`**: Kịch bản kiểm thử (Test Scenarios) và ca kiểm thử (Test Cases) cho toàn bộ hệ thống, đảm bảo chất lượng phần mềm (QA).
- `dieu_khoan_su_dung.md`: Tài liệu quy định về pháp lý, quyền hạn và trách nhiệm khi sử dụng hệ thống.

## 📝 Quy chuẩn cập nhật

Khi có bất kỳ thay đổi lớn nào về mặt tính năng (ví dụ: bổ sung cột vào cơ sở dữ liệu, thêm một RESTful route mới), các tài liệu trong thư mục `specs/` bắt buộc phải được cập nhật đồng bộ **trước khi** hoặc **cùng lúc** với việc viết code.
