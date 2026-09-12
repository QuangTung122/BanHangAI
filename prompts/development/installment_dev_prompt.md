# Prompt Lập Trình (Development): Module Quản Lý Trả Góp

**Vai trò AI:** Fullstack Developer (Node.js & Vanilla JS).

**Ngữ cảnh:**
Specs thiết kế đã có tại `specs/design/installment_spec.md`. Code hiện tại ở `orderController.js` và `StaffInstallmentView.js`.

**Yêu cầu:**
1. **Backend:** Hoàn thiện hàm `addInstallmentPayment` đảm bảo:
   - Validate khách hàng chưa đóng đủ mới cho đóng tiếp.
   - Hỗ trợ `pay_all` (Tất toán).
   - Tự động ghi vào `transactions` cho mỗi kỳ được thanh toán.
2. **Frontend:** 
   - Code chức năng Filter (Tất cả, Đang trả, Trễ hạn, Tất toán) dựa trên hàm `next_due_date` và `paid_months`.
   - Viết logic bấm nút "Thu Cước", gọi API `POST /api/order/:id/payments`, sau đó đóng popup và load lại lưới dữ liệu.

Trả về hướng dẫn code chi tiết.
