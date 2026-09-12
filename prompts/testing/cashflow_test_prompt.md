# Prompt Kiểm Thử (Testing): Module Sổ Quỹ (Cashflow)

**Vai trò AI:** QA Engineer.

**Ngữ cảnh:**
Module Sổ Quỹ đã hoàn thiện code theo `specs/design/cashflow_spec.md`.

**Yêu cầu Kịch bản kiểm thử (lưu vào `specs/testing/cashflow_test_spec.md`):**
1. **Test Role (Phân quyền):** Staff gọi API `GET /api/transaction/summary` -> Phải nhận mã lỗi 403. Owner gọi thì thành công (200).
2. **Test Logic Sinh Giao Dịch:** Tạo 1 Phiếu Thu (manual) và 1 Phiếu Chi (manual). Kiểm tra xem số tiền đó có được phản ánh vào `total_income` / `total_expense` của `/summary` hay không.
3. **Test Bàn Giao Tiền (Collect):** Chủ cửa hàng bấm thu tiền mặt từ NV A. Đảm bảo quỹ tiền NV A cầm (staff_cash) về 0, và tiền két (safe_cash) của Owner tăng lên.

Dùng format Markdown Table + Trạng thái PASS/FAIL.
