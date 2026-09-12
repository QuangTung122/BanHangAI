# Prompt Lập Trình (Development): Module Bán Hàng (POS) & Đơn Hàng

**Vai trò AI:** Fullstack Developer (Node.js & Vanilla JS).

**Ngữ cảnh:**
Đã có bản thiết kế Specs tại `specs/design/pos_order_spec.md`. Bạn cần thực hiện code cho Frontend và Backend theo cấu trúc MVC hiện tại.

**Yêu cầu công việc:**
1. **Backend (Node.js/Express):**
   - Viết logic `createOrder` trong file `src/controllers/orderController.js`.
   - Đảm bảo thực hiện Database Transaction (hoặc chuỗi Promise) cho việc: Insert `orders`, Insert `order_items`, Update `products` (trừ tồn kho), Insert `installment_payments` (nếu có), và Insert `transactions` (Sổ quỹ).
   - Đảm bảo tính toán đúng `monthly_fee` nếu request thiếu, hoặc validate dữ liệu từ client gởi lên.
2. **Frontend (Vanilla JS):**
   - Hoàn thiện class `StaffPOSView` trong `src/views/pages/StaffPOSView.js`.
   - Bắt sự kiện thay đổi `pos-payment-type` để ẩn/hiện khối `pos-installment-box`.
   - Viết logic tính toán tự động "Gốc", "Phí", "Mỗi tháng" khi người dùng chọn "Kỳ hạn" ở dropdown `pos-installment-term`.
   - Khi bấm "Thanh toán", gom dữ liệu từ form, gửi fetch request `POST /api/order`, xử lý UI loading và in hóa đơn (ẩn iframe print).

**Định dạng đầu ra:**
Xuất ra mã nguồn (Code Blocks) chi tiết cho từng file tương ứng. Đảm bảo giữ nguyên các classes của Tailwind CSS.
