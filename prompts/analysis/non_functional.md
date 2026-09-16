# Prompt: Phân tích Yêu cầu Phi Chức Năng (NFRs)

**Vai trò AI:** Security & Performance Architect.

**Dữ liệu Đầu vào (Input):**
- Thông tin dự án chung: `de_tai_01.md`.

**Yêu cầu Xử lý (Instructions):**
1. Viết tài liệu đặc tả NFR (Non-Functional Requirements) chú trọng vào 4 khía cạnh: Security, Performance, Scalability, Availability.
2. Nhấn mạnh vào rào cản bảo mật AI: Tuyệt đối không leak API Key, bảo vệ chống Prompt Injection.
3. Xác định ngưỡng SLA: Thời gian phản hồi API < 200ms, độ trễ API AI < 3s.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: `specs/requirements/non_functional.md`.