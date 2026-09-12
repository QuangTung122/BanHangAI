# Prompt: Code Màn hình POS (Bán hàng)

[Instructions]
Dựa vào wireframe trong `specs/design/ui-wireframes.md`, hãy viết file `StaffPOSView.js` cho màn hình bán hàng.

[Context]
- Bạn là Frontend UI Developer.
- Viết bằng Vanilla JS, tạo HTML string sử dụng Tailwind CSS.

[Input Data / Constraints]
Màn hình chia làm 2 phần chính (Flexbox hoặc Grid):
1. **Bên trái (Sản phẩm):**
   - Ô input tìm kiếm (có placeholder: Tìm kiếm nhanh...).
   - Các nút lọc danh mục (Tất cả, Tai nghe, Điện thoại...).
   - Lưới (Grid) danh sách sản phẩm hiển thị ảnh, tên, giá, số lượng tồn kho. Có nút "Thêm vào đơn" (vô hiệu hóa nếu hết hàng).
2. **Bên phải (Giỏ hàng):**
   - Danh sách item đã chọn (có nút tăng/giảm số lượng).
   - Khối thông tin khách (Tên, SĐT).
   - Dropdown chọn "Loại thanh toán" (Trả thẳng / Trả góp). Nếu chọn trả góp, hiện thêm form nhập CCCD và kỳ hạn.
   - Nút "Thanh toán & In hóa đơn".

[Output Format]
Chỉ xuất ra nội dung file `src/views/pages/StaffPOSView.js`.
Code phải có class `StaffPOSView` với hàm `render()` trả về chuỗi HTML lớn (Template Literal). Sử dụng các icon SVG (Heroicons) cho đẹp mắt.
