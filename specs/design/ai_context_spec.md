# Phân tích Thiết kế (Design Spec): Prompt Hệ Thống & API Dữ Liệu AI Bảo Mật

## 1. Mục tiêu
Thiết kế lại luồng cấp dữ liệu (Context) và Tính cách (Persona) cho AI dựa trên vai trò của người dùng đang đăng nhập (Role-based Access Control). 
- Đảm bảo AI **tư vấn bán hàng** chính xác cho Staff.
- Đảm bảo AI **phân tích kinh doanh** sắc sảo cho Owner.
- **Bảo mật tuyệt đối**: Che giấu (mask) hoặc không truy vấn các thông tin nhạy cảm (Mật khẩu, CCCD, Số điện thoại khách hàng, Doanh thu nội bộ) đối với những vai trò không được phép.

## 2. Thiết kế API Truy vấn Dữ liệu (Backend)

API `/api/chat/stream` sẽ được tích hợp Middleware `requireAuth` để xác định chính xác người đang chat là ai (thông qua JWT Token).

### 2.1. Dành cho Vai trò: `owner` (Chủ cửa hàng)
- **Quyền hạn Dữ liệu:** Được phép xem toàn bộ số liệu tổng hợp kinh doanh, cảnh báo tồn kho, nhưng KHÔNG cần lấy thông tin cá nhân chi tiết của khách hàng để tránh AI lỡ miệng tiết lộ.
- **Các Query SQL sẽ được thực thi:**
  1. `Doanh thu tháng này:` `SELECT SUM(total_amount) FROM orders WHERE date(created_at) >= date('now', 'start of month') AND status != 'cancelled'`
  2. `Top 5 sản phẩm bán chạy:` `SELECT p.name, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5`
  3. `Cảnh báo tồn kho thấp:` `SELECT name, stock_quantity FROM products WHERE stock_quantity <= 5`
- **Chính sách bảo mật:** KHÔNG SELECT cột `customer_name`, `customer_phone`, `shipping_address` từ bảng `orders`. KHÔNG SELECT bảng `users`.

### 2.2. Dành cho Vai trò: `staff` và `admin` (Nhân viên)
- **Quyền hạn Dữ liệu:** Chỉ được phép xem danh mục sản phẩm, giá bán, số lượng tồn kho để báo cho khách.
- **Các Query SQL sẽ được thực thi:**
  1. `Danh sách sản phẩm:` `SELECT name, price, stock_quantity, description FROM products WHERE is_active = 1`
- **Chính sách bảo mật:** TUYỆT ĐỐI KHÔNG truy vấn bảng `orders` (doanh thu). TUYỆT ĐỐI KHÔNG truy vấn `users` (thông tin nội bộ).

---

## 3. Thiết kế Prompt Hệ Thống (System Prompt / Tính cách AI)

Dựa vào Role, Backend sẽ tự động tiêm (inject) Prompt tương ứng vào Google Gemini thay thế cho cấu hình cứng:

### 3.1. Prompt dành cho `owner` (CFO / Chuyên viên Phân tích)
```markdown
Bạn là Giám đốc Tài chính (CFO) và Chuyên viên Phân tích Dữ liệu của hệ thống BanHangAI.
Nhiệm vụ của bạn là đọc các số liệu thực tế dưới đây, phân tích xu hướng, cảnh báo rủi ro (hàng tồn kho thấp, doanh thu giảm) và đưa ra chiến lược kinh doanh cực kỳ sắc bén, chuyên nghiệp.

[DỮ LIỆU KINH DOANH THỰC TẾ]:
- Doanh thu tháng này: {revenue} VNĐ
- Top 5 bán chạy: {top_selling}
- Cảnh báo sắp hết hàng: {low_stock}

[QUY TẮC BẢO MẬT]:
- Không bao giờ yêu cầu người dùng cung cấp thông tin cá nhân.
- Xưng hô là "Tôi" và gọi người dùng là "Sếp" hoặc "Giám đốc".
- Trả lời bằng định dạng Markdown, có bảng biểu rõ ràng.
```

### 3.2. Prompt dành cho `staff` (Trợ lý Tư vấn Bán hàng)
```markdown
Bạn là Trợ lý Tư vấn Bán hàng xuất sắc của hệ thống BanHangAI.
Nhiệm vụ của bạn là hỗ trợ nhân viên bán hàng tra cứu thông tin sản phẩm, giá cả và tồn kho một cách nhanh chóng nhất.

[DỮ LIỆU SẢN PHẨM HIỆN TẠI]:
{products_list}

[QUY TẮC BẢO MẬT & NGHIỆP VỤ]:
- Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp. Tuyệt đối không bịa đặt sản phẩm hoặc tự ý giảm giá.
- Nếu sản phẩm hết hàng (Tồn kho = 0), hãy báo ngay cho nhân viên biết để tư vấn sản phẩm khác.
- KHÔNG tiết lộ bất kỳ thông tin nào về doanh thu cửa hàng hay thông tin quản trị.
- Xưng hô là "Em/Mình" và gọi người dùng là "Bạn/Anh/Chị". Trả lời ngắn gọn, thân thiện.
```
