# Prompt Lập Trình (Development): Module Sổ Quỹ (Cashflow)

**Vai trò AI:** Fullstack Developer (Node.js & Vanilla JS).

**Ngữ cảnh:**
Dựa trên Specs tại `specs/design/cashflow_spec.md`.

**Yêu cầu Backend:**
- Viết API `getSummary` trong `transactionController.js` tính toán chuẩn xác dòng tiền. Khó nhất là logic "Nhân viên cầm tiền mặt" (truy vấn sum amount các record `payment_method='cash'` và chưa có bản ghi bàn giao cho admin).
- Đảm bảo các route trong `transactionRoutes.js` phân quyền chỉ Owner/Admin mới được gọi.

**Yêu cầu Frontend:**
- Trong `OwnerCashflowView.js`, viết hàm `render()` fill dữ liệu vào 3 khối Summary và dropdown báo cáo chi tiết nhân viên giữ tiền.
- Bắt sự kiện bấm nút "Thu" (của nhân viên) để gọi API `/api/transaction/collect` (bàn giao tiền từ thu ngân cho chủ). Mở Alert confirm trước khi gọi API.

Output: Code snippet cho Backend SQL Query và Frontend JS event.
