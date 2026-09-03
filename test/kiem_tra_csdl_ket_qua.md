# Báo cáo Kiểm tra và Đánh giá Thiết kế Cơ sở dữ liệu

Dưới đây là báo cáo đánh giá và thẩm định thiết kế Cơ sở dữ liệu (dựa trên tệp `06_database.md`). Hãy đánh dấu `[x]` vào ô vuông trước mỗi mục nếu bạn muốn tôi tự động chỉnh sửa vấn đề đó trong tài liệu thiết kế giúp bạn:

---

### [ ] 1. Sai kiểu dữ liệu cho tiền tệ (Mức độ: Nghiêm trọng)

* **Vị trí:** Bảng `products` (`price`), `orders` (`total_amount`), `order_items` (`unit_price`)
* **Hậu quả:** Việc sử dụng kiểu `REAL` (số thực dấu phẩy động - floating point) cho các giá trị tài chính, tiền tệ là một lỗi tối kỵ. Kiến trúc floating point không thể biểu diễn chính xác hoàn toàn các số thập phân, dẫn đến hiện tượng sai số làm tròn trong các phép toán (ví dụ `0.1 + 0.2 = 0.30000000000000004`). Điều này sẽ gây ra sai lệch về báo cáo doanh thu, tính toán thanh toán cho khách hàng.

```sql
-- Cập nhật lại trong mã DDL tạo bảng của bạn:
-- Bảng products:
price INTEGER NOT NULL,
-- Bảng orders:
total_amount INTEGER NOT NULL,
-- Bảng order_items:
unit_price INTEGER NOT NULL,
```

**👉 Đề xuất hướng giải quyết:** Tôi sẽ thay thế toàn bộ kiểu dữ liệu `REAL` ở các cột tiền tệ thành `INTEGER` (lưu giá trị đồng/cent chẵn). Trong tầng ứng dụng (App/Backend), bạn sẽ xử lý việc định dạng hiển thị.

---

### [ ] 2. Vi phạm chuẩn hóa 3NF - Dư thừa dữ liệu (Mức độ: Khuyến nghị)

* **Vị trí:** Bảng `order_items` / Cột `subtotal`
* **Hậu quả:** Cột `subtotal` sinh ra sự phụ thuộc bắc cầu (Transitive Dependency) vì nó luôn được tính bằng `quantity * unit_price`. Việc lưu cứng (hardcode) giá trị này tiềm ẩn rủi ro Dị thường cập nhật (Update Anomaly): Nếu một ngày nào đó `quantity` hoặc `unit_price` được cập nhật mà ứng dụng quên cập nhật `subtotal`, dữ liệu sẽ bị sai lệch vĩnh viễn.

```sql
-- Xóa cột dư thừa (Lưu ý: SQLite chỉ hỗ trợ DROP COLUMN từ bản 3.35.0 trở đi)
ALTER TABLE order_items DROP COLUMN subtotal;

-- HOẶC sửa lại lúc tạo bảng bằng Generated Column:
subtotal REAL GENERATED ALWAYS AS (quantity * unit_price) VIRTUAL,
```

**👉 Đề xuất hướng giải quyết:** Tôi sẽ xóa hẳn trường `subtotal` khỏi bảng `order_items` trong file thiết kế, hoặc đổi nó thành dạng Generated Column (tính toán tự động) để tránh rủi ro sai sót dữ liệu.

---

### [ ] 3. Thiếu Chỉ mục (Index) trên Khóa ngoại (Mức độ: Khuyến nghị)

* **Vị trí:** Bảng `order_items` / Cột `order_id` và `product_id`
* **Hậu quả:** Bạn đã thiết lập `ON DELETE CASCADE` cho cả 2 khóa ngoại này, tuy nhiên SQLite **không tự động tạo Index cho Khóa ngoại**. Mỗi khi bạn xóa một đơn hàng (`orders`) hoặc một sản phẩm (`products`), CSDL sẽ phải quét toàn bộ (Full Table Scan) bảng `order_items` để tìm và xóa các dòng liên quan. Khi bảng này có hàng triệu dòng, nó sẽ tạo ra hiện tượng nghẽn cổ chai (bottleneck) nghiêm trọng. Đồng thời, việc truy vấn lịch sử đơn hàng cũng bị chậm do thiếu `idx_order_items_order`.

```sql
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

**👉 Đề xuất hướng giải quyết:** Tôi sẽ bổ sung thêm 2 câu lệnh `CREATE INDEX` vào mục *Chiến lược Đánh chỉ mục* và *Script DDL* trong file thiết kế để đảm bảo hiệu suất truy vấn.

---

### [ ] 4. Thiếu Ràng buộc toàn vẹn CHECK (Mức độ: Tối ưu)

* **Vị trí:** Bảng `users` (`role`), `orders` (`status`), `chat_messages` (`sender`)
* **Hậu quả:** Hiện tại các cột mang tính phân loại này có kiểu `TEXT` tự do. Việc thiếu ràng buộc miền giá trị (Domain Constraint) cho phép ứng dụng chèn bất kỳ văn bản nào vào (Ví dụ: `status` vô tình lưu thành `'đang giao'` thay vì chuẩn là `'shipping'`, hay `sender` bị lưu thành `'hacker'`). Điều này làm hỏng logic của Application.

```sql
-- Điều chỉnh trong script CREATE TABLE của bạn:
-- Bảng users:
role TEXT DEFAULT 'customer' CHECK(role IN ('admin', 'customer')),
-- Bảng orders:
status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
-- Bảng chat_messages:
sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
```

**👉 Đề xuất hướng giải quyết:** Tôi sẽ thêm thẳng các ràng buộc `CHECK (tên_trường IN (...))` vào mã DDL cũng như cập nhật ở bảng *Từ điển dữ liệu* để chặn các dữ liệu rác không hợp lệ.

---

### [ ] 5. Thiếu Ràng buộc NOT NULL cho các số lượng (Mức độ: Tối ưu)

* **Vị trí:** Bảng `products` (`stock_quantity`)
* **Hậu quả:** Bạn đã sử dụng `DEFAULT 0` cho `stock_quantity`, nhưng lại quên ràng buộc `NOT NULL`. Điều này dẫn đến việc ai đó hoặc ứng dụng vẫn có thể chèn tường minh một giá trị `NULL` vào (thay vì để trống cho nó nhận default). Giá trị `NULL` trong các phép tính toán (`stock_quantity - 1`) sẽ tiếp tục trả về `NULL`, gây hỏng chức năng kho hàng.

```sql
-- Cập nhật lúc tạo bảng products:
stock_quantity INTEGER NOT NULL DEFAULT 0,
```

**👉 Đề xuất hướng giải quyết:** Tôi sẽ thêm thuộc tính `NOT NULL` cho cột `stock_quantity` trong cả *Từ điển Dữ liệu* và mã lệnh `CREATE TABLE products`.

---

*Vui lòng tích vào các ô vuông `[ ]` dưới đây để chọn các mục bạn muốn tôi tự động sửa trong file thiết kế gốc (`06_database.md`):*

- [X] Thực hiện Mục 1: Đổi kiểu dữ liệu tiền tệ từ REAL sang INTEGER.
- [X] Thực hiện Mục 2: Xóa cột `subtotal` thừa (hoặc dùng Generated Column).
- [X] Thực hiện Mục 3: Thêm Chỉ mục (Index) cho các Khóa ngoại.
- [X] Thực hiện Mục 4: Bổ sung ràng buộc `CHECK` cho `role`, `status`, `sender`.
- [X] Thực hiện Mục 5: Thêm ràng buộc `NOT NULL` cho `stock_quantity`.
- [X] **Thực hiện TẤT CẢ các mục trên.**

*(Bạn có thể đánh dấu bằng cách đổi `[ ]` thành `[x]` rồi lưu file, hoặc nhắn tin báo tôi biết bạn chọn mục nào!)*
