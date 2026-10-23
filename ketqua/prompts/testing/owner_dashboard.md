# Prompt Kịch Bản Kiểm Thử (Test Cases): Module `owner_dashboard`

**Vai trò AI:** Senior QA Automation Engineer.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả phát triển tại: `specs/development/owner_dashboard.md`.

**Yêu cầu Xử lý (Instructions):**
1. Phân tích tài liệu Dev và thiết kế bộ Kịch bản Test (Test Cases) thực chiến, bao trùm các góc khuất (Edge Cases).
2. Viết **Unit Test Cases**: Xác định các hàm tính toán, validation cần mock data và kỳ vọng Output (Expected Output) rõ ràng.
3. Viết **Integration Test Cases**: Mô tả kịch bản gọi API, verify thay đổi trong Database. Nhấn mạnh việc test rủi ro "Race Condition" (Truy cập đồng thời).
4. Viết **E2E / UI Test Cases**: Liệt kê kịch bản cho Cypress/Selenium. Chú ý test các trạng thái loading, lỗi HTTP 400/500 hiển thị Toast đỏ trên giao diện.
5. Mỗi Test Case phải có cấu trúc: [Mô tả] - [Precondition] - [Input] - [Expected Output].

**Dữ liệu Đầu ra (Output):**
- Lưu kết quả vào: `test/ket_qua_test/owner_dashboard.md`.