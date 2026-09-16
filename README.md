# BanHangAI - Hệ thống Quản lý Bán hàng Tích hợp AI

Chào mừng đến với dự án **BanHangAI**. Đây là một nền tảng phần mềm bán lẻ toàn diện, ứng dụng kiến trúc chuẩn MVC và tích hợp sức mạnh của Trí tuệ Nhân tạo (OpenAI/Gemini) trực tiếp vào luồng nghiệp vụ. Hệ thống được thiết kế tối ưu cho 3 vai trò: **Quản Trị Viên (Admin), Chủ Cửa Hàng (Owner), và Nhân Viên (Staff)**.

## 🌟 Điểm nổi bật của BanHangAI
- **Quản trị toàn diện (11 Modules):** Bao gồm POS Bán hàng, Trả góp, Bảo hành, Sổ quỹ, Chấm công, Chat nội bộ và Nhật ký hệ thống.
- **Tích hợp Trợ lý AI (LLM):** 
  - Chatbot tư vấn sản phẩm trực tiếp cho nhân viên dựa trên tồn kho thực tế (Context-aware).
  - Trí tuệ nhân tạo tự động phân tích doanh thu và đưa ra Insight kinh doanh cho Chủ cửa hàng.
- **Kiến trúc rõ ràng:** Phân tách Frontend (Vanilla JS MVC) và Backend (Node.js REST API).
- **Tài liệu hoàn chỉnh:** Dự án này tự hào sở hữu một bộ đặc tả kỹ thuật (Specs) và phân tích nghiệp vụ (BA) chi tiết nhất, được hỗ trợ sinh ra bởi AI Agent.

## 📂 Cấu trúc thư mục cốt lõi
Vui lòng tham khảo các file `README.md` nằm bên trong từng thư mục để hiểu rõ cách thức hoạt động của chúng:
- 📁 **[backend/](./backend/README.md)**: Chứa mã nguồn Node.js API (Routes, Controllers, Services).
- 📁 **[frontend/](./frontend/README.md)**: Chứa mã nguồn Giao diện MVC Vanilla JS.
- 📁 **[docs/](./docs/README.md)**: Chứa Hướng dẫn sử dụng và Hướng dẫn triển khai DevOps.
- 📁 **[specs/](./specs/README.md)**: Trung tâm đặc tả kỹ thuật (Requirements, Design, Development, Testing).
- 📁 **[prompts/](./prompts/README.md)**: Nơi lưu trữ các câu lệnh Prompt xuất sắc dùng để điều khiển AI Agent tự động code và viết Specs.
- 📁 **[scratch/](./scratch/README.md)**: Thư mục chứa script tạm thời của AI.

## 🚀 Khởi động nhanh (Quick Start)
1. Đọc kỹ file `docs/operations/deployment-guide.md` để cấu hình biến môi trường `.env`.
2. Khởi tạo Database: `cd backend && npm run db:init`.
3. Chạy hệ thống qua Docker: `docker-compose up -d --build`.

*Lưu ý kỷ luật:* Mọi cấu trúc và thiết kế hệ thống phải bám sát tài liệu `codebasemap.md` và `ANTIGRAVITY.md`.
