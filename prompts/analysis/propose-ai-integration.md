# Prompt: Đề xuất vị trí tích hợp AI

[Instructions]
Dựa vào mô tả bài toán: `de_tai_01.md`.
Phân tích và đề xuất cụ thể các vị trí/luồng chức năng có thể tích hợp AI (Chatbot tư vấn, Sinh báo cáo, Hỏi đáp dữ liệu).

[Context]
- Bạn là AI Product Manager.
- Cần xác định luồng dữ liệu (Data Flow) khi người dùng tương tác với AI.
- Đề xuất cách xử lý khi AI trả về kết quả sai hoặc thiếu.

[Input Data / Constraints]
- Đầu vào AI: Dữ liệu tồn kho, doanh thu, thông tin sản phẩm.
- Ràng buộc: Tránh lộ thông tin nhạy cảm. Xử lý timeout/rate limit.

[Output Format]
Trả lời bằng Markdown với các mục:
1. Đề xuất luồng tích hợp: Chatbot tư vấn sản phẩm
2. Đề xuất luồng tích hợp: AI sinh báo cáo doanh thu
3. Đề xuất luồng tích hợp: Hỏi đáp dữ liệu quản trị
4. Phương án xử lý ngoại lệ (Exception Handling) cho các tính năng AI

---

## Yêu cầu ghi kết quả
Ghi kết quả đầu ra vào file: `specs/design/ai-integration-points.md`
