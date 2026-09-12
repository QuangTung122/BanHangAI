# Prompt Thiết Kế: Module Quản Lý Trả Góp & Thu Cước

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Hệ thống BanHangAI cần thiết kế chi tiết chức năng "Quản Lý Trả Góp & Thu Cước". File UI thực tế là `StaffInstallmentView.js` và logic Backend là `orderController.js` (hàm `getOrders` lọc type='installment' và `addInstallmentPayment`).

**Yêu cầu đầu ra (Output):**
Tạo file Design Specs (định dạng Markdown) gồm:
1. **Wireframe Giao Diện (Text/ASCII Art):** 
   - Màn hình chính: Lưới danh sách hồ sơ trả góp (Khách hàng, Mã Hóa Đơn, Dư nợ/Mỗi tháng, Đến Hạn, Tiến độ đóng họ thanh progress bar, Nút Lịch sử, Nút Thu cước). Có thanh Filter (Tất cả, Đang trả, Trễ hạn, Tất toán) và Ô tìm kiếm.
   - Popup Thu Cước: Form hiển thị Dư nợ hiện tại, Dropdown chọn "Thu 1 kỳ" hoặc "Tất toán", Hình thức thanh toán (Tiền mặt/Chuyển khoản), Nút Xác nhận.
2. **Database Schema:** Nhắc lại cấu trúc bảng liên quan: `orders` (payment_type='installment'), `installment_payments`, và `transactions`.
3. **API Specs:** 
   - `GET /api/order?type=installment`: Lấy danh sách, tính toán `paid_months`, `next_due_date`.
   - `POST /api/order/:id/payments`: Thu cước, hỗ trợ cờ `pay_all`. Ghi nhận lịch sử và Sổ quỹ.

Vui lòng lưu kết quả vào thư mục `specs/design/installment_spec.md`.
