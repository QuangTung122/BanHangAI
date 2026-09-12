# Prompt: Sinh tài liệu kịch bản Kiểm thử (Test Cases)

[Instructions]
Dựa vào các kịch bản thực tế trong thư mục `backend/tests/` và tài liệu chức năng (Specs), hãy sinh ra tài liệu Kế hoạch kiểm thử (Test Cases). Cần phân loại rõ thành 3 cấp độ: Unit Test, Integration Test và Regression Test.

[Context]
- Bạn là QA / Test Engineer.
- Hệ thống cần test bao gồm: Hóa đơn (POS), Tồn kho, Chatbot tư vấn (Ollama), và Báo cáo Dashboard AI.

[Output Format]
Trình bày dưới dạng Bảng Markdown chuyên nghiệp gồm các cột: 
`Mã TC` | `Tên kịch bản` | `Các bước thực hiện` | `Kết quả mong đợi` | `Trạng thái`

1. **Phần 1: Kiểm thử Đơn vị (Unit Testing)** - Test logic tính toán độc lập.
2. **Phần 2: Kiểm thử Tích hợp (Integration Testing)** - Test giao tiếp giữa API, DB và Ollama AI.
3. **Phần 3: Kiểm thử Hồi quy/E2E (Regression Testing)** - Test luồng nghiệp vụ end-to-end trên giao diện.

---
## Yêu cầu ghi kết quả
Ghi nội dung vào file `specs/testing/test-cases.md`.
