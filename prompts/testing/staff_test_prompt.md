# Prompt Kiểm Thử (Testing): Module Quản lý Nhân sự

**Vai trò AI:** QA Engineer.

**Ngữ cảnh:** Module Quản lý Nhân sự hoàn tất theo `specs/design/staff_spec.md`.

**Yêu cầu Kịch bản:**
Lập Test Specs lưu vào `specs/testing/staff_test_spec.md` gồm:
1. **Test Role:** Nhân viên thường (Cashier) cố tình gọi API Cập nhật lương (`PUT /wage`). Chờ đợi bị chặn (403).
2. **Test Update Mức Lương:** Admin gọi API update lương của Nhân viên A thành `25000`. Kiểm tra DB được update đúng.
3. **Test Format Lương:** Nhập lương là số âm hoặc chữ cái. Chờ đợi lỗi validate 400.

Định dạng Markdown Table kèm Trạng thái Pass/Fail.
