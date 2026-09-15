# Prompts (Mẫu chỉ thị AI)

Thư mục này chứa thư viện các mẫu prompt (chỉ thị cho AI) được phân loại và thiết kế bài bản theo từng giai đoạn trong vòng đời phát triển phần mềm (SDLC). Những prompt này giúp các AI Agents hoặc LLMs (như Gemini, ChatGPT, Ollama) hiểu đúng context và hỗ trợ tự động hóa các khâu xây dựng dự án **BanHangAI**.

## 📁 Cấu trúc thư mục

- **`analysis/`**: Các prompt phục vụ phân tích nghiệp vụ, gợi ý thiết kế (Lấy yêu cầu, thiết kế ERD, lên danh sách Use Cases).
- **`design/`**: Các prompt phục vụ thiết kế kiến trúc hệ thống, quy chuẩn API (RESTful Specs), cấu trúc UI/UX và thiết kế luồng nghiệp vụ (POS, Trả góp, Chat nội bộ).
- **`development/`**: Các prompt hỗ trợ sinh mã nguồn trực tiếp (Viết code Backend Express, CRUD APIs, cấu trúc thư mục Frontend MVC, logic kết nối AI).
- **`testing/`**: Các prompt dùng để sinh test case (ca kiểm thử) cho các API hoặc tự động hóa kiểm thử giao diện.
- **`documentation/`**: Các prompt dùng để tự động hóa việc viết tài liệu kỹ thuật (Tạo nội dung README, viết kịch bản Demo, Deployment Guide).

## 💡 Cách sử dụng

- Copy nội dung trong các file markdown tương ứng và dán vào cửa sổ chat với AI.
- Đảm bảo tùy chỉnh các [BIẾN] hoặc [DỮ LIỆU ĐẦU VÀO] trong các prompt để phù hợp với yêu cầu cụ thể của từng task.
