# Prompt: Tạo nội dung Slide Thuyết trình

[Instructions]
Hãy tạo nội dung text cho một bài thuyết trình (Slide PowerPoint/Google Slides) với chủ đề tập trung vào "Vai trò của Trí tuệ Nhân tạo (AI) trong Hệ thống Quản lý Bán hàng".

[Context]
- Bạn là Sinh viên thực hiện đồ án, cần chuẩn bị slide báo cáo cuối kỳ.
- Số lượng slide: khoảng 8 - 10 slide.

[Input Data / Constraints]
Nội dung slide phải làm nổi bật 2 vai trò chính của AI trong dự án (theo yêu cầu đề tài):
1. **AI tư vấn khách hàng (Chatbot):** Tích hợp ở Landing Page và POS, giúp nhân viên và khách tra cứu nhanh, dựa trên Context (thông tin kho hàng).
2. **AI phân tích kinh doanh (Insight):** Đọc số liệu thô từ Dashboard (Doanh thu, Top bán chạy) để sinh ra nhận xét dưới dạng ngôn ngữ tự nhiên.

Nhấn mạnh việc hệ thống không dùng API trả phí bên ngoài mà tự triển khai mô hình LLM nội bộ (Ollama + Qwen/Llama) để bảo mật dữ liệu khách hàng tuyệt đối.

[Output Format]
Mỗi slide trình bày theo cấu trúc:
- **Slide [Số thứ tự]: [Tiêu đề Slide]**
- Nội dung chính (Bullet points)
- Ghi chú thuyết trình (Speaker Notes)

---
## Yêu cầu ghi kết quả
Ghi kết quả vào file: `docs/guides/presentation-slides.md`.
