# Prompt Thiết Kế: Module Sổ Quỹ (Cashflow)

**Vai trò AI:** System Analyst & UI/UX Expert.

**Ngữ cảnh:**
Hệ thống BanHangAI cần thiết kế chi tiết chức năng "Sổ Quỹ Thu Chi (Cashflow)" dành cho Owner/Admin. Giao diện thực tế tham chiếu từ `OwnerCashflowView.js` và logic Backend từ `transactionController.js`.

**Yêu cầu đầu ra (Output):**
Tạo file Design Specs (Markdown) gồm:
1. **Wireframe Giao Diện (ASCII Art):** 
   - Phần Thống kê (Top): 3 khối Tổng Thu, Tổng Chi, Tổng Tồn Quỹ (chi tiết tiền mặt tại két, chuyển khoản, và tiền nhân viên đang cầm chờ thu).
   - Phần Bảng Lịch sử Giao dịch: Thanh công cụ (Bộ lọc, Tìm kiếm, Chọn tháng, Nút "Lập Phiếu Thu/Chi"). Bảng gồm các cột: Thời gian, Loại (Thu/Chi), Mã Hóa Đơn, Số Tiền, Phương thức, Người tạo, Nguồn (Auto/Manual).
2. **Database Schema:** Cấu trúc bảng `transactions` (type, amount, category, description, user_id, payment_method, source, invoice_id).
3. **API Specs:** 
   - `GET /api/transaction/summary`: Trả về số liệu cho 3 khối Thống kê trên UI.
   - `GET /api/transaction`: Trả về danh sách giao dịch, hỗ trợ filter theo type, source, payment_method.
   - `POST /api/transaction`: Lập phiếu thu/chi thủ công.
   - `POST /api/transaction/collect`: Chức năng Owner thu tiền mặt (cash) từ thu ngân (staff).

Lưu file vào `specs/design/cashflow_spec.md`.
