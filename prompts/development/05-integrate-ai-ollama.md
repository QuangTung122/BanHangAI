# Prompt: Tích hợp AI (Ollama) vào Backend và Frontend

[Instructions]
Hệ thống hiện tại cần tích hợp Trí tuệ Nhân tạo thông qua công cụ Ollama. Hãy viết code Backend (Service) để kết nối Ollama và Frontend để tạo khung Chat.

[Context]
- Bạn là Fullstack AI Engineer.
- AI Model sử dụng: `qwen2.5-coder` (chạy qua API `http://localhost:11434` của Ollama).

[Input Data / Constraints]
1. **Backend (`src/services/aiService.js`):**
   - Viết hàm `chatWithAI(messages, context)` dùng hàm `fetch` gọi API của Ollama (`/api/chat`).
   - Có cơ chế lấy system prompt từ CSDL bảng `system_configs`.
2. **Backend Route (`src/routes/chatRoutes.js`):**
   - Nhận tin nhắn từ user.
   - Lấy lịch sử chat từ bảng `chat_messages` theo `session_id`.
   - Lọc danh sách sản phẩm hiện có gắn vào System Prompt để AI tư vấn chính xác.
   - Lưu tin nhắn phản hồi vào DB.
3. **Frontend (`src/views/ChatModule.js`):**
   - Giao diện khung chat nổi (Floating widget).
   - Gọi API `/api/chat` và hiển thị hiệu ứng typing (loading).

[Output Format]
Trình bày rõ ràng cấu trúc code theo từng file (Service, Controller, Route, Frontend Module). Chú ý bắt lỗi (try-catch) khi Ollama chưa được bật.
