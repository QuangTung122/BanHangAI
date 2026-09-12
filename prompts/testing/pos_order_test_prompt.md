# Prompt Kiểm Thử (Testing): Module Bán Hàng (POS) & Đơn Hàng

**Vai trò AI:** QA Engineer / Software Tester.

**Ngữ cảnh:**
Chức năng Bán Hàng (POS) đã được lập trình xong dựa trên file `specs/design/pos_order_spec.md`. 

**Yêu cầu công việc:**
Hãy sinh ra danh sách các kịch bản kiểm thử (Test Cases / Test Specs) cho module này. Tài liệu phải bao gồm:
1. **Test Cases Giao diện (UI/UX) & Validate Form:** Các trường hợp nhập thiếu thông tin khách hàng, số điện thoại không hợp lệ, CCCD không đủ 12 số khi chọn trả góp.
2. **Test Cases Nghiệp vụ Trả thẳng (Full Payment):** Kiểm tra giỏ hàng, trừ tồn kho chính xác, ghi sổ quỹ đúng số tiền.
3. **Test Cases Nghiệp vụ Trả góp (Installment):** Kiểm tra tính toán Phí và Tiền mỗi tháng, đảm bảo sinh đúng lịch sử đóng họ kỳ 1 ngay sau khi mua.
4. **Test Cases Lỗi Hệ Thống (Edge Cases):** Bán quá số lượng tồn kho (Over-selling), Lỗi kết nối mạng khi đang bấm "Thanh toán".

**Định dạng:**
Trả về tài liệu Markdown dạng bảng (Table) hoặc danh sách, lưu vào file `specs/testing/pos_order_test_spec.md`. Mọi kịch bản phải có cột/phần: ID, Tên Kịch Bản, Các bước thực hiện (Steps), Kết quả mong đợi (Expected Result).
