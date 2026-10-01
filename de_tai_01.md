Hệ thống quản lý bán hàng có tích hợp AI

1. Mô tả bài toán

Các cửa hàng bán lẻ cần quản lý sản phẩm, khách hàng, hóa đơn, doanh thu và tồn kho hằng ngày. Nếu quản lý bằng sổ sách hoặc bảng tính rời rạc, nhân viên dễ nhập sai dữ liệu, khó theo dõi tồn kho và mất nhiều thời gian tổng hợp doanh thu. Đề tài yêu cầu xây dựng hệ thống quản lý bán hàng giúp nhân viên bán hàng thao tác nhanh, chủ cửa hàng theo dõi tình hình kinh doanh và sử dụng AI để hỗ trợ tư vấn sản phẩm, sinh báo cáo hoặc hỏi đáp dữ liệu bán hàng.
2. Mục tiêu

- Xây dựng hệ thống quản lý sản phẩm, khách hàng, hóa đơn, nhập xuất tồn và doanh thu.
- Tích hợp AI tạo sinh để hỗ trợ tư vấn sản phẩm, sinh nhận xét doanh thu và trả lời câu hỏi quản trị bằng ngôn ngữ tự nhiên.
- Sử dụng AI trong SDLC để phân tích nghiệp vụ bán hàng, thiết kế CSDL, sinh giao diện CRUD, viết API, kiểm thử và viết tài liệu.
- Hoàn thiện sản phẩm có dữ liệu mẫu, phân quyền, báo cáo và demo được trong môi trường local hoặc cloud.

3. Yêu cầu chức năng
   3.1. Chức năng quản lý
4. Đăng nhập, đăng xuất và phân quyền quản trị viên, nhân viên bán hàng, chủ cửa hàng.
5. Quản lý sản phẩm: mã, tên, nhóm hàng, giá bán, giá nhập, tồn kho, trạng thái.
6. Quản lý khách hàng: thông tin liên hệ, lịch sử mua hàng, nhóm khách hàng.
7. Lập hóa đơn bán hàng, tính tổng tiền, giảm giá, ghi nhận phương thức thanh toán.
8. Quản lý nhập hàng và cập nhật tồn kho.
9. Tìm kiếm, lọc sản phẩm, khách hàng, hóa đơn theo thời gian và trạng thái.
10. Thống kê doanh thu theo ngày, tháng, nhóm hàng, sản phẩm bán chạy.
11. Xuất báo cáo doanh thu hoặc danh sách hóa đơn ra PDF/Excel/CSV.
    3.2. Chức năng AI
12. Chatbot tư vấn sản phẩm: nhận nhu cầu khách hàng, tra dữ liệu sản phẩm còn hàng và gợi ý sản phẩm phù hợp.
13. AI sinh báo cáo doanh thu: từ dữ liệu doanh thu, tồn kho, sản phẩm bán chạy, sinh nhận xét ngắn gọn và khuyến nghị nhập hàng.
14. Hỏi đáp dữ liệu bán hàng: chủ cửa hàng đặt câu hỏi như "Tháng này mặt hàng nào bán chậm?" và AI trả lời dựa trên dữ liệu hệ thống.
15. Yêu cầu kỹ thuật

- Backend: Python FastAPI, Flask hoặc Django.
- Frontend: React, Vue, HTML/CSS/JavaScript hoặc template engine.
- CSDL: SQLite cho bản demo; khuyến khích MySQL/PostgreSQL nếu nhóm có năng lực.
- AI Engine: OpenAI API, Gemini API, Claude API, Hugging Face hoặc Ollama.
- Prompt template tách riêng trong thư mục `prompts/`.
- API key đặt trong `.env`, cung cấp `.env.example`.
- Có test case cho hóa đơn, tồn kho, báo cáo và chức năng AI.

5. Dữ liệu đầu vào, đầu ra và dữ liệu hệ thống

- Dữ liệu chính: người dùng, vai trò, sản phẩm, danh mục, khách hàng, hóa đơn, chi tiết hóa đơn, phiếu nhập, tồn kho.
- Đầu vào quản lý: form sản phẩm, khách hàng, hóa đơn, phiếu nhập, bộ lọc thời gian.
- Đầu vào AI: câu hỏi người dùng, danh sách sản phẩm, dữ liệu doanh thu, dữ liệu tồn kho.
- Đầu ra quản lý: bảng dữ liệu, hóa đơn, dashboard, file xuất.
- Đầu ra AI: câu tư vấn, báo cáo doanh thu dạng Markdown, gợi ý hành động.

Ví dụ dữ liệu mẫu: `Sản phẩm: Tai nghe Bluetooth A1, nhóm Phụ kiện, giá 350000, tồn kho 12, mô tả Pin 20 giờ`.

Prompt mẫu:

System: Bạn là trợ lý AI cho hệ thống quản lý bán hàng. Chỉ tư vấn dựa trên dữ liệu sản phẩm và tồn kho được cung cấp. Nếu thiếu dữ liệu, hãy nói rõ.
User: Khách hàng cần tai nghe dưới 500000 đồng, pin lâu, còn hàng. Dữ liệu sản phẩm: {{product_table}}. Hãy gợi ý tối đa 3 sản phẩm và giải thích ngắn gọn.

Khi gọi AI, không gửi thông tin nhạy cảm như số điện thoại đầy đủ hoặc dữ liệu thanh toán của khách hàng nếu không cần thiết.
6. Hướng dẫn sử dụng AI trong từng giai đoạn SDLC

 Giai đoạn 1: Phân tích yêu cầu và thiết kế hệ thống (Bài KT1)

- Dùng AI để phân tích quy trình bán hàng, nhập hàng, lập hóa đơn và quản lý tồn kho.
- Dùng AI gợi ý actor, use case, yêu cầu chức năng, yêu cầu phi chức năng.
- Dùng AI thiết kế ERD cho sản phẩm, hóa đơn, khách hàng, phiếu nhập.
- Dùng AI đề xuất vị trí tích hợp AI: tư vấn sản phẩm, sinh báo cáo, hỏi đáp doanh thu.
- Dùng AI sinh wireframe màn hình bán hàng, quản lý sản phẩm và dashboard.

 Giai đoạn 2: Xây dựng chức năng quản lý (Bài KT2)

- Dùng AI sinh cấu trúc dự án, model, schema, API CRUD và form nhập liệu.
- Dùng AI sinh truy vấn tính doanh thu, tồn kho, sản phẩm bán chạy.
- Dùng AI debug lỗi cập nhật tồn kho khi hủy hoặc sửa hóa đơn.
- Lưu minh chứng prompt và phản hồi AI trong thư mục tài liệu dự án.

 Giai đoạn 3: Tích hợp AI, tối ưu prompt và kiểm thử (Bài KT3)

- Dùng AI thiết kế prompt tư vấn sản phẩm và prompt sinh báo cáo doanh thu.
- Dùng AI sinh code gọi API AI, xử lý timeout, rate limit và response sai định dạng.
- Dùng AI sinh test case cho hóa đơn, tồn kho, chatbot tư vấn và báo cáo AI.
- So sánh ít nhất 3 phiên bản prompt để giảm tư vấn sai sản phẩm hết hàng.

 Giai đoạn 4: Hoàn thiện, triển khai và báo cáo (Bài thi cuối kỳ)

- Dùng AI sinh README, hướng dẫn nhập dữ liệu mẫu và kịch bản demo bán hàng.
- Dùng AI review code, kiểm tra bảo mật API key và phân quyền dữ liệu.
- Dùng AI tạo slide trình bày hai vai trò của AI trong dự án.
- Dùng AI hỗ trợ đóng gói Docker hoặc hướng dẫn triển khai.

7. Mức độ khó

Trung bình: Hệ thống có nhiều thực thể nghiệp vụ phổ biến, yêu cầu xử lý tồn kho và báo cáo. Chức năng AI ở mức hỏi đáp/sinh báo cáo dựa trên dữ liệu hệ thống, chưa bắt buộc RAG phức tạp nhưng cần kiểm soát dữ liệu đầu vào và lỗi phản hồi.
