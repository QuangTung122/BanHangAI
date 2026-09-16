# Specs (Tài Liệu Đặc Tả Hệ Thống)

Thư mục này chứa "Bản thiết kế tòa nhà" BanHangAI. Đây là bộ hồ sơ đồ sộ được viết cực kỳ chi tiết (mức độ Code-level) dành cho lập trình viên và QA.

## 📂 Các giai đoạn tài liệu (SDLC)
- **`requirements/`**: Giai đoạn phân tích (Business Analysis). Chứa User Stories (chia theo Epic), Sơ đồ luồng nghiệp vụ UML (Mermaid), Từ điển dữ liệu (Database Dictionary) với 10 bảng DB thực tế, và Các yêu cầu Phi chức năng.
- **`design/`**: Giai đoạn thiết kế. Chứa bản vẽ giao diện (Wireframe ASCII), và Sơ đồ kiến trúc thực thể (System ERD).
- **`development/`**: Giai đoạn đánh giá code. File tài liệu ánh xạ chính xác những dòng code, Controller, Model đang tồn tại thật trong thư mục `backend` và `frontend`. Chứa cả đặc tả API Swagger.
- **`testing/`**: Báo cáo kiểm thử tự động. Quét code thực tế để chấm điểm PASS/FAIL cho từng tính năng. Có kèm lời nhận xét đánh giá từ AI QA.
