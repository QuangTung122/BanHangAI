# Phân tích Yêu cầu Hệ thống Quản lý Bán hàng Tích hợp AI

## 1. Bối cảnh và vấn đề
Các cửa hàng bán lẻ hiện đang gặp khó khăn trong việc quản lý quy trình nghiệp vụ bằng sổ sách hoặc bảng tính rời rạc. Điều này dẫn đến:
- Nhập sai dữ liệu, thất thoát thông tin.
- Khó kiểm soát tồn kho kịp thời, dẫn đến tình trạng hết hàng hoặc tồn kho quá mức.
- Mất nhiều thời gian để tổng hợp doanh thu.
- Thiếu công cụ hỗ trợ tư vấn sản phẩm thông minh dựa trên dữ liệu thực tế.

## 2. Mục tiêu hệ thống
- Xây dựng phần mềm quản lý bán hàng (sản phẩm, khách hàng, hóa đơn, tồn kho, doanh thu).
- Tích hợp AI tạo sinh để: hỗ trợ tư vấn sản phẩm, sinh nhận xét doanh thu tự động, hỏi đáp dữ liệu bán hàng.
- Nâng cao hiệu quả nghiệp vụ, hỗ trợ chủ cửa hàng ra quyết định nhanh chóng.

## 3. Actor và nhu cầu
- **Quản trị viên (Admin):** Cần quản lý cấu hình hệ thống, quản lý tài khoản và phân quyền.
- **Nhân viên bán hàng (Sales Staff):** Cần công cụ lập hóa đơn nhanh chóng, tra cứu tồn kho ngay lập tức, tư vấn sản phẩm dựa trên gợi ý của AI.
- **Chủ cửa hàng (Store Owner):** Cần xem báo cáo doanh thu, cảnh báo tồn kho, hỏi đáp với AI về tình hình kinh doanh.

## 4. Danh sách chức năng quản lý
1. Quản lý tài khoản (Đăng nhập, đăng xuất, phân quyền).
2. Quản lý sản phẩm (CRUD sản phẩm, giá bán, tồn kho).
3. Quản lý khách hàng (CRUD khách hàng, lịch sử mua hàng).
4. Lập hóa đơn (Tính tổng, giảm giá, thanh toán).
5. Quản lý nhập hàng (Phiếu nhập, tự động cộng tồn kho).
6. Báo cáo & Thống kê (Doanh thu, sản phẩm bán chạy, xuất file).

## 5. Danh sách chức năng AI
1. **Chatbot tư vấn sản phẩm:** Nhận nhu cầu khách hàng, tra cứu tồn kho và gợi ý tối đa 3 sản phẩm phù hợp.
2. **Sinh báo cáo tự động:** Đọc dữ liệu bán hàng và sinh nhận xét, khuyến nghị nhập hàng.
3. **Hỏi đáp dữ liệu quản trị:** Trả lời các câu hỏi bằng ngôn ngữ tự nhiên từ chủ cửa hàng (vd: "Tháng này mặt hàng nào bán chậm?").

## 6. Dữ liệu chính
- Thông tin người dùng hệ thống.
- Danh mục và thông tin chi tiết Sản phẩm (mã, tên, giá, số lượng tồn).
- Thông tin Khách hàng.
- Dữ liệu Hóa đơn & Chi tiết hóa đơn.
- Dữ liệu Phiếu nhập hàng.

## 7. Yêu cầu phi chức năng
- **Hiệu năng:** Tính toán hóa đơn và trừ tồn kho tức thì.
- **Bảo mật:** Không gửi dữ liệu nhạy cảm (số điện thoại đầy đủ, thẻ thanh toán) lên API của AI.
- **Khả năng mở rộng:** Kiến trúc API dễ dàng mở rộng sang Mobile App trong tương lai.

## 8. Rủi ro và giả định
- **Rủi ro API AI:** Phản hồi chậm (timeout), hoặc lỗi rate limit. Cần cơ chế fallback (báo lỗi thân thiện).
- **Rủi ro AI ảo giác (Hallucination):** AI có thể gợi ý sản phẩm không có thật hoặc đã hết hàng. *Giải pháp:* Cung cấp context dữ liệu `{{product_table}}` chính xác trong prompt.
