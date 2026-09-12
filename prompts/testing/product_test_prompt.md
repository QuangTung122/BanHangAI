# Prompt Kiểm Thử (Testing): Module Quản lý Sản Phẩm

**Vai trò AI:** QA Engineer.

**Ngữ cảnh:** Hệ thống đã code xong phần quản lý Sản phẩm.

**Yêu cầu Kịch bản (`specs/testing/product_test_spec.md`):**
1. **Test Tạo Mới Sản Phẩm & Sinh Slug:** Nhập một tên SP chứa tiếng Việt có dấu (VD: "Áo Thun Nam"). Kiểm tra hệ thống lưu vào DB và sinh `slug` chuẩn ("ao-thun-nam").
2. **Test Trùng Slug (Unique Constraint):** Tạo tiếp 1 SP khác cũng tên "Áo Thun Nam". Hệ thống phải tự sinh slug "ao-thun-nam-1" thay vì báo lỗi crash database.
3. **Test Xóa Mềm (Soft Delete):** Xóa sản phẩm A. Cố gắng lấy danh sách SP bằng `GET /product` xem sản phẩm A còn hiện ra không (Yêu cầu phải ẩn đi do `is_active=0`).

Sử dụng định dạng Markdown Table để trình bày.
