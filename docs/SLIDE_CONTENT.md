# Cấu trúc Nội dung Slide Thuyết trình (Presentation Slides)

**Chủ đề:** Hệ thống Quản lý Bán hàng tích hợp AI (BanHangAI)
**Số lượng Slide:** 9 Slide

---

## Slide 1: Tiêu đề
- **Nội dung:** 
  - Tên Đồ Án: Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo (BanHangAI).
  - Thành viên nhóm: (Điền tên sinh viên)
  - Giảng viên hướng dẫn: (Điền tên giảng viên)
- **Notes:** (Chào hội đồng) Giới thiệu tên và mục đích đồ án tập trung vào việc áp dụng công nghệ AI tạo sinh để giải quyết bài toán quản trị bán lẻ thực tế cho các SMEs (Doanh nghiệp vừa và nhỏ).
- **Gợi ý hình ảnh:** Logo dự án BanHangAI, hình nền công nghệ nhẹ nhàng, phong cách chuyên nghiệp.

## Slide 2: Vấn đề thực trạng
- **Nội dung:** 
  - **Quản lý tồn kho thủ công:** Dễ xảy ra sai sót, thất thoát dữ liệu, lệch kho.
  - **Báo cáo kinh doanh:** Tốn nhiều giờ đồng hồ để tổng hợp doanh thu, biểu đồ từ Excel hay sổ sách.
  - **Chất lượng dịch vụ:** Quá trình tư vấn khách hàng phụ thuộc hoàn toàn vào trí nhớ nhân viên (về thông số, số lượng tồn kho), dẫn đến tư vấn chậm hoặc sai lệch.
- **Notes:** Giải thích rằng các phần mềm hiện nay chủ yếu giải quyết được khâu thanh toán POS cơ bản, nhưng vẫn thiếu sự "thông minh" trong việc hỗ trợ quyết định kinh doanh và tăng cường năng lực cho nhân viên bán hàng.
- **Gợi ý hình ảnh:** Biểu tượng sổ sách lộn xộn, nhân viên bối rối khi tìm thông tin sản phẩm, báo cáo Excel rườm rà.

## Slide 3: Tổng quan Giải pháp BanHangAI
- **Nội dung:**
  - **Hệ thống bán hàng lõi (11 Modules):** POS thu ngân, Bảng điều khiển (Dashboard), Quản lý kho, Trả góp, Bảo hành, Sổ quỹ thu chi, Chấm công, Chat nội bộ,...
  - **Ứng dụng AI đột phá:** Trợ lý Chatbot tư vấn sản phẩm (Context-aware), AI tự động phân tích và sinh báo cáo doanh thu.
  - **Kiến trúc công nghệ:** Hệ sinh thái Node.js (Express REST API), Vanilla JS MVC (Tailwind CSS), SQLite/PostgreSQL, Local LLM (Ollama) & Google Gemini.
- **Notes:** Điểm khác biệt lớn nhất của BanHangAI là sự kết hợp chặt chẽ giữa 1 hệ thống quản trị đầy đủ tính năng và module AI. Đặc biệt, dự án hỗ trợ tự chạy Local LLM (Ollama), giúp chi phí vận hành AI bằng $0.
- **Gợi ý hình ảnh:** Các icon biểu diễn tính năng (POS, Box, AI Brain, Database) được liên kết với nhau.

## Slide 4: Kiến trúc hệ thống & Thiết kế
- **Nội dung:** 
  - **Backend Layered Architecture:** Controllers, Routes, Services (Node.js).
  - **Frontend Vanilla MVC:** Models (Trạng thái/Logic), Views (Render UI bằng Template Literals & Tailwind), Controllers (Điều phối).
  - **Luồng dữ liệu (Data flow):** SPA Client <-> Express API <-> DB (Lưu trữ) / AI Engine (Xử lý ngôn ngữ tự nhiên).
- **Notes:** Trình bày luồng dữ liệu từ lúc User thao tác trên trình duyệt, gọi API, Backend xử lý logic và giao tiếp với CSDL hoặc LLM. Nhấn mạnh vào việc dự án không dùng framework JS phức tạp mà tự xây dựng kiến trúc MVC thuần túy để tối ưu hiệu năng.
- **Gợi ý hình ảnh:** Sơ đồ Kiến trúc hệ thống (System Architecture Diagram) trích từ `specs/design/system-architecture.md`, hiển thị rõ Client -> API -> Database & AI.

## Slide 5: Điểm nhấn 1 - AI Tư vấn Khách hàng (Chatbot)
- **Nội dung:**
  - **Trợ lý thông minh 24/7:** Giải đáp nhanh chóng cho nhân viên ngay tại màn hình POS.
  - **Context-Awareness (Hiểu ngữ cảnh):** Hệ thống tự động truy xuất & chèn danh sách sản phẩm, mức giá, số lượng tồn kho theo thời gian thực vào System Prompt của AI.
  - **Kết quả (Zero Hallucination):** AI luôn trả lời dựa trên kho hàng có sẵn, gợi ý chính xác, không bịa đặt thông tin.
- **Notes:** Giải thích kỹ thuật: Nhờ cơ chế RAG cơ bản (truy vấn Database trước rồi mới gửi Prompt cho LLM), AI đóng vai trò như một chuyên gia Sale thực thụ, am hiểu chính xác mặt hàng nào còn, mặt hàng nào hết.
- **Gợi ý hình ảnh:** Ảnh chụp màn hình Widget Chat AI (UI Demo) với câu hỏi: "Gợi ý tai nghe dưới 500k còn hàng".

## Slide 6: Điểm nhấn 2 - AI Phân tích Doanh thu (Insight)
- **Nội dung:**
  - **Từ Data đến Text (Data-to-Text):** Tổng hợp số liệu khô khan (Doanh số, Đơn hàng, Top SP bán chạy) thành lời khuyên quản trị chiến lược bằng ngôn ngữ tự nhiên.
  - **Hỏi đáp dữ liệu (Q&A):** Chủ cửa hàng có thể hỏi trực tiếp AI "Tháng này mặt hàng nào bán chậm?" để nhận câu trả lời phân tích.
  - **Tối ưu vận hành:** Giúp chủ cửa hàng ra quyết định nhập/xuất hàng nhanh chóng.
- **Notes:** Đây là tính năng thay thế cho chuyên viên phân tích nghiệp vụ, giúp SMEs tiết kiệm đáng kể chi phí nhân sự mà vẫn có cái nhìn sâu sắc về tình hình kinh doanh.
- **Gợi ý hình ảnh:** Ảnh chụp Dashboard với biểu đồ doanh thu kế bên một đoạn Text nhận xét, phân tích xu hướng do AI tự động sinh ra.

## Slide 7: Vấn đề Bảo mật & Quyền riêng tư
- **Nội dung:**
  - **Rủi ro API Public:** Gọi qua OpenAI/Claude dễ dẫn đến nguy cơ rò rỉ dữ liệu khách hàng.
  - **Giải pháp của BanHangAI:** Triển khai **Ollama (Local LLM)** chạy hoàn toàn trong mạng nội bộ.
  - **Cơ chế Sanitize Data:** Tự động ẩn thông tin định danh (PII: SĐT, Email, Tên khách hàng) trước khi đưa dữ liệu cho AI phân tích.
- **Notes:** Nhấn mạnh đây là điểm cộng cực lớn về tính khả thi, an toàn bảo mật khi áp dụng trong môi trường doanh nghiệp thực tế.
- **Gợi ý hình ảnh:** Sơ đồ minh họa bộ lọc "Sanitize Data" đứng giữa Hệ thống lõi và LLM Engine.

## Slide 8: Kết quả đạt được & Demo
- **Nội dung:** 
  - Hoàn thiện 100% tính năng quản trị cơ bản (CRUD) với hơn 11 module nghiệp vụ phức tạp.
  - Tích hợp thành công 2 tính năng AI (Chatbot tư vấn & Insight báo cáo).
  - Hệ thống chạy ổn định, giao diện (UI) thiết kế chuyên nghiệp, trực quan với TailwindCSS.
  - Phân quyền chặt chẽ (RBAC) 3 vai trò: Admin, Owner, Staff.
- **Notes:** (Chuyển sang phần chiếu màn hình thực tế) "Xin mời Thầy/Cô cùng xem phần Demo trực tiếp hệ thống để thấy rõ sự khác biệt của BanHangAI".
- **Gợi ý hình ảnh:** Video quay màn hình ngắn gọn hoặc các màn hình chính (Dashboard, POS, Installment).

## Slide 9: Q&A
- **Nội dung:** 
  - Lời Cảm Ơn.
  - Q&A (Hỏi Đáp cùng Hội đồng).
- **Notes:** Cảm ơn Thầy/Cô đã lắng nghe. Mời Thầy/Cô đặt câu hỏi.
- **Gợi ý hình ảnh:** Hình ảnh "Thank You" & "Q&A" với thông tin liên hệ của nhóm.
