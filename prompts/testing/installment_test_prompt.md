# Prompt Kiểm Thử (Testing): Module Quản Lý Trả Góp

**Vai trò AI:** QA Engineer.

**Ngữ cảnh:**
Module Trả góp đã được code xong theo `specs/design/installment_spec.md`.

**Yêu cầu:**
Tạo kịch bản kiểm thử (Test Cases) lưu vào `specs/testing/installment_test_spec.md`.
1. **Test Thu 1 Kỳ:** Trừ đúng số kỳ, ghi sổ quỹ đúng số tiền 1 kỳ.
2. **Test Tất toán (Pay All):** Đóng toàn bộ các kỳ còn lại cùng lúc, trạng thái chuyển sang Tất toán.
3. **Test Lỗi (Edge Cases):** Gọi API thu cước vào một đơn hàng đã tất toán (Đóng full kỳ), mong đợi Backend chặn và báo lỗi 400.

Định dạng Markdown Table kèm kết quả Pass/Fail.
