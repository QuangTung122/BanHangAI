# Cấu trúc Nội dung Slide Thuyết trình (Presentation Slides)

**Chủ đề:** Hệ thống Quản lý Bán hàng tích hợp AI (E-Com AI)
**Số lượng Slide:** 9 Slide

---

## Slide 1: Tiêu đề
- **Nội dung:** Tên Đồ Án: Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo. Thành viên nhóm. Giảng viên hướng dẫn.
- **Notes:** (Chào hội đồng) Giới thiệu tên và mục đích đồ án tập trung vào việc áp dụng AI để giải quyết bài toán quản trị bán lẻ.

## Slide 2: Vấn đề thực trạng
- **Nội dung:** 
  - Khó khăn trong quản lý tồn kho thủ công (thất thoát).
  - Tốn thời gian làm báo cáo doanh thu.
  - Quá trình tư vấn bán hàng phụ thuộc hoàn toàn vào trí nhớ nhân viên.
- **Notes:** Giải thích rằng các phần mềm hiện nay giải quyết được khâu thanh toán nhưng vẫn thiếu sự "thông minh" trong hỗ trợ quyết định kinh doanh.

## Slide 3: Tổng quan Giải pháp E-Com AI
- **Nội dung:**
  - Hệ thống bán hàng lõi: POS, Dashboard, Quản lý kho, Trả góp.
  - Ứng dụng AI đột phá: Tư vấn khách hàng, Báo cáo tự động thông minh.
  - Kiến trúc công nghệ: Node.js, Vanilla SPA (Tailwind), SQLite, Ollama LLM.
- **Notes:** Điểm khác biệt lớn nhất là dự án tự chạy Local LLM, giúp chi phí vận hành AI bằng $0.

## Slide 4: Kiến trúc hệ thống
- **Nội dung:** (Chèn ảnh Sơ đồ Kiến trúc từ `specs/design/system-architecture.md`)
- **Notes:** Trình bày luồng dữ liệu từ SPA Client -> Express API -> SQLite (Lưu trữ) và Ollama (Xử lý ngôn ngữ tự nhiên).

## Slide 5: Điểm nhấn 1 - AI Tư vấn Khách hàng (Chatbot)
- **Nội dung:**
  - Trợ lý thông minh hoạt động 24/7.
  - Context-Awareness (Hiểu ngữ cảnh): Hệ thống tự động chèn danh sách sản phẩm & tồn kho vào System Prompt của AI.
  - Kết quả: AI luôn trả lời đúng sản phẩm có sẵn, không bị hiện tượng ảo giác (Hallucination).
- **Notes:** Giải thích kỹ thuật: Nhờ truy vấn DB trước rồi mới gửi prompt cho LLM, AI đóng vai trò như một nhân viên Sale am hiểu mọi mặt hàng.

## Slide 6: Điểm nhấn 2 - AI Phân tích Doanh thu (Insight)
- **Nội dung:**
  - Tổng hợp số liệu khô khan (Doanh số, Đơn hàng, Top SP).
  - Data-to-Text: Biến bảng biểu thành lời khuyên quản trị chiến lược.
  - Giúp chủ cửa hàng ra quyết định nhập hàng nhanh chóng.
- **Notes:** Đây là tính năng thay thế cho chuyên viên phân tích nghiệp vụ, giúp SMEs tiết kiệm chi phí.

## Slide 7: Vấn đề Bảo mật & Quyền riêng tư
- **Nội dung:**
  - Đa số hệ thống AI gọi qua OpenAI/Claude (nguy cơ lộ data).
  - E-Com AI dùng **Ollama (Local LLM)**.
  - Cơ chế Sanitize: Ẩn thông tin định danh (SĐT, Email) khách hàng trước khi đưa dữ liệu cho AI phân tích.
- **Notes:** Nhấn mạnh đây là điểm cộng cực lớn về tính khả thi khi áp dụng trong môi trường doanh nghiệp thực tế.

## Slide 8: Kết quả đạt được & Demo
- **Nội dung:** Hoàn thiện 100% tính năng quản trị cơ bản (CRUD) và 2 tính năng AI. Hệ thống chạy ổn định, UI đẹp mắt với TailwindCSS.
- **Notes:** Chuyển sang phần chiếu màn hình thực tế (Run Demo).

## Slide 9: Q&A
- **Nội dung:** Cảm ơn Thầy/Cô. Q&A.
