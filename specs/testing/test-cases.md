# Tài liệu Kế hoạch Kiểm thử Hệ thống (Test Cases)

Tài liệu này mô tả các kịch bản kiểm thử (Test Cases) cho hệ thống **E-Com AI**, được phân loại theo 3 cấp độ chuẩn của Kỹ thuật phần mềm: Unit Testing, Integration Testing và Regression Testing.

---

## 1. Kiểm thử Đơn vị (Unit Testing)
*Mục đích: Đảm bảo các hàm logic nghiệp vụ cốt lõi (tính toán, xử lý chuỗi) hoạt động đúng.*

| Mã TC | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| **UT_01** | Tính tổng tiền giỏ hàng | 1. Đưa mảng 2 SP: A (giá 100k, SL 2), B (giá 50k, SL 1).<br>2. Gọi hàm `calculateTotal()`. | Hàm trả về đúng số tiền `250000`. | ✅ Pass |
| **UT_02** | Xử lý format tiền tệ | 1. Truyền số `1500000` vào hàm `formatMoney()`. | Chuỗi trả về là `1.500.000 ₫`. | ✅ Pass |
| **UT_03** | Tính phí trả góp (Kỳ hạn 6 tháng) | 1. Tổng tiền `10.000.000đ`.<br>2. Chọn kỳ hạn 6 tháng (phí 4%).<br>3. Gọi hàm `calcInstallment()`. | Hàm trả về: Tổng phải trả `10.400.000đ`, mỗi tháng `1.733.333đ`. | ✅ Pass |
| **UT_04** | Trích xuất context sản phẩm | 1. Truyền array JSON sản phẩm.<br>2. Gọi hàm format cho prompt. | Chuỗi trả về là văn bản thuần không chứa mã lỗi `undefined`. | ✅ Pass |

---

## 2. Kiểm thử Tích hợp (Integration Testing)
*Mục đích: Đảm bảo các module (Backend, Database, Ollama AI) giao tiếp thành công với nhau (đã được chứng minh qua các file trong `backend/tests/`).*

| Mã TC | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| **IT_01** | API Đơn hàng trừ Tồn kho (Database) | 1. Kiểm tra tồn kho SP_A (đang có 10).<br>2. Bắn `POST /api/orders` mua 2 SP_A.<br>3. Kiểm tra lại DB. | DB lưu đơn hàng thành công, tồn kho SP_A giảm chính xác còn 8. | ✅ Pass |
| **IT_02** | API Thống kê Dashboard (Database) | 1. Chạy file `test_dashboard.js`.<br>2. Đối chiếu số liệu log với dữ liệu thực tế trong DB SQLite. | Câu lệnh SQL SUM() và GROUP BY chạy đúng, trả về Top 5 SP chính xác. | ✅ Pass |
| **IT_03** | Kết nối Ollama AI Chatbot (AI Engine) | 1. Chạy file `test_chat.js`.<br>2. Truyền câu hỏi "Cửa hàng có tai nghe không?". | Node.js nhận luồng Stream từ Ollama và in ra màn hình các gợi ý về tai nghe có trong kho. | ✅ Pass |
| **IT_04** | Xử lý lỗi khi AI Server sập | 1. Tắt hoàn toàn Ollama.<br>2. Bắn API chat từ Backend. | Backend không bị crash (sập), bắt được `try-catch` và trả về mã lỗi 503 HTTP. | ✅ Pass |

---

## 3. Kiểm thử Hồi quy / E2E (Regression Testing)
*Mục đích: Đóng vai người dùng, thao tác trên giao diện trình duyệt để đảm bảo luồng nghiệp vụ tổng thể (End-to-End) không bị gãy khi thêm tính năng.*

| Mã TC | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| **RT_01** | Luồng Tư vấn Khách hàng (Landing Page) | 1. Mở trang chủ, mở Chat widget.<br>2. Nhập "Điện thoại dưới 30 triệu".<br>3. Chờ AI phản hồi. | Trình duyệt hiện hiệu ứng loading. AI trả lời nhắc đến iPhone 15 Pro Max hoặc Samsung S24 Ultra (dựa theo DB). | ✅ Pass |
| **RT_02** | Luồng Bán hàng POS và Hóa đơn | 1. Đăng nhập Staff, vào `#pos`.<br>2. Thêm SP vào giỏ.<br>3. Nhập tên khách "Anh A", SĐT "090...".<br>4. Nhấn Thanh toán. | Giao diện báo thành công, giỏ hàng trống. Hóa đơn mới xuất hiện trong `#order-history`. | ✅ Pass |
| **RT_03** | Khởi tạo form Trả góp (UI logic) | 1. Ở màn hình POS, đổi loại thanh toán sang "Trả góp". | Giao diện ngay lập tức hiện form nhập số CCCD (giới hạn 12 số) và dropdown chọn kỳ hạn. | ✅ Pass |
| **RT_04** | Luồng phân tích AI Insight (Dashboard) | 1. Đăng nhập Owner, vào `#dashboard`.<br>2. Bấm nút "Phân Tích Dữ Liệu Thực". | Thông báo chờ xuất hiện. Sau 5-10s, AI sinh ra đoạn phân tích màu tím nhắc nhở về các SP "sắp hết hàng". | ✅ Pass |
