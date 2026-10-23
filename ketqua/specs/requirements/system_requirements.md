# Tài Liệu Phân Tích Yêu Cầu Hệ Thống (System Requirements)

*Tài liệu này cung cấp cái nhìn tổng quan về định hướng kinh doanh, phạm vi tính năng và các rủi ro cốt lõi của dự án BanHangAI.*

## 1. Bối cảnh và Vấn đề (Business Context)
Các cửa hàng bán lẻ hiện tại đang gặp phải các vấn đề nghiêm trọng khi vận hành thủ công hoặc dùng các phần mềm cũ:
- **Chậm trễ trong bán hàng:** Khó tra cứu tồn kho tức thời khi khách hỏi.
- **Gian lận và Thất thoát:** Khó quản lý dòng tiền (Cashflow) và chấm công nhân viên chính xác.
- **Ra quyết định chậm:** Chủ cửa hàng tốn nhiều giờ để cộng sổ và không biết mặt hàng nào đang bán chạy/bán chậm để điều chỉnh nhập hàng.
- **Thiếu nhân sự tư vấn:** Nhân viên mới không thuộc tính năng sản phẩm, dễ tư vấn sai cho khách.

## 2. Mục tiêu Hệ thống (System Objectives)
Hệ thống **BanHangAI** ra đời nhằm số hóa toàn diện quy trình bán lẻ, với các mục tiêu:
1. **Tự động hóa 100%** các khâu: Tính tiền (POS), Trừ tồn kho, Ghi nhận thu chi, Chấm công.
2. **Quản trị thông minh:** Cung cấp báo cáo real-time cho Chủ cửa hàng.
3. **Ứng dụng AI tạo sinh (Generative AI):** 
   - Đóng vai trò là "Nhân viên hỗ trợ" (Tư vấn sản phẩm cho khách).
   - Đóng vai trò là "Giám đốc dữ liệu" (Đọc biểu đồ và sinh nhận xét kinh doanh cho Chủ cửa hàng).

## 3. Phân Tích Đối Tượng Sử Dụng (Actors)

| Vai trò (Actor) | Mục tiêu chính | Tính năng sử dụng chủ đạo |
| :--- | :--- | :--- |
| **Admin** (Quản Trị Viên) | Đảm bảo hệ thống hoạt động ổn định, bảo mật. | Quản lý User (Cấp quyền/Khóa), Cấu hình hệ thống, Xem Audit Logs. |
| **Owner** (Chủ Cửa Hàng) | Tối đa hóa lợi nhuận, chống thất thoát. | Xem Dashboard (AI Insight), Quản lý Sổ Quỹ (Chốt ca), Quản lý Hàng hóa/Nhân sự. |
| **Staff** (Nhân Viên) | Bán hàng nhanh, phục vụ khách hàng tốt nhất. | Bán hàng POS, Dùng AI Chatbot tư vấn, Xử lý Trả góp/Bảo hành, Chấm công. |

## 4. Phạm Vi Chức Năng (Functional Scope)
Hệ thống được chia thành 11 module nghiệp vụ liên kết chặt chẽ với nhau:

1. **Authentication (Xác thực):** Đăng nhập an toàn bằng JWT.
2. **System/Audit (Hệ thống):** Cấu hình toàn cục, lưu vết mọi hành động thay đổi DB.
3. **User/Staff Mgmt (Nhân sự):** Quản lý tài khoản, theo dõi KPI doanh số.
4. **Attendance (Chấm công):** Ghi nhận giờ làm (Check-in / Check-out).
5. **Product Mgmt (Sản phẩm):** Quản lý danh mục, giá bán, giá nhập, tồn kho.
6. **POS & Orders (Bán hàng):** Giao diện quét mã vạch, lập hóa đơn, trừ tồn kho tự động.
7. **Installment (Trả góp):** Tạo hồ sơ trả góp, chia kỳ hạn thanh toán.
8. **Return & Warranty (Bảo hành):** Xử lý hàng lỗi, đổi trả và hoàn tiền.
9. **Cashflow (Sổ quỹ):** Ghi nhận phiếu Thu/Chi tự động từ hóa đơn, hỗ trợ chốt ca.
10. **Dashboard & AI (Báo cáo):** Biểu đồ doanh thu, AI phân tích dữ liệu, Hỏi đáp Q&A.
11. **Team Chat (Giao tiếp):** Chat nội bộ Real-time giữa các nhân viên.

## 5. Rủi Ro & Giả Định (Risks & Assumptions)

### 5.1. Rủi ro Hệ thống & Dữ liệu
- **Race Condition (Đua lệnh):** Nếu 2 nhân viên cùng bán món hàng cuối cùng, kho có thể bị âm.
  -> *Khắc phục:* Bắt buộc dùng DB Transaction (FOR UPDATE) để khóa dòng dữ liệu khi thanh toán.
- **Xóa nhầm dữ liệu:** Xóa một hóa đơn có thể làm sai lệch sổ quỹ và tồn kho.
  -> *Khắc phục:* Hệ thống dùng cơ chế Soft Delete hoặc chỉ cho phép tạo phiếu "Hoàn trả" thay vì xóa cứng.

### 5.2. Rủi ro Tích hợp AI
- **Ảo giác AI (Hallucination):** AI có thể khuyên khách mua sản phẩm A (đã hết hàng) hoặc tự bịa ra sản phẩm B.
  -> *Khắc phục:* Sử dụng kỹ thuật Prompt Engineering nghiêm ngặt. Inject trực tiếp danh sách "Sản phẩm còn hàng" vào System Prompt và cấm AI sáng tạo ngoài danh sách này.
- **Độ trễ AI (Latency):** API của OpenAI/Gemini đôi khi bị phản hồi chậm (> 5s).
  -> *Khắc phục:* Áp dụng cơ chế Timeout, thiết kế UI có hiệu ứng Typing Skeleton để khách hàng không nghĩ phần mềm bị treo.
