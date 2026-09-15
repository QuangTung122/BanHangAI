# Yêu cầu lập trình (Development Prompt): Code logic bảo mật ngữ cảnh AI và Persona động

**Tham chiếu:** Dựa trên bản thiết kế `specs/design/ai_context_spec.md`.

**Công việc cần làm:**
1. Mở file `backend/src/routes/chatRoutes.js`: Thêm middleware `requireAuth` vào endpoint `/api/chat/stream` để bảo mật và lấy `req.user`.
2. Mở file `backend/src/controllers/chatController.js`:
   - Lấy vai trò người dùng từ `req.user.role`.
   - Nếu `role === 'owner'`: 
     - Truy vấn doanh thu từ bảng `orders` (bỏ qua các cột thông tin cá nhân).
     - Truy vấn top 5 sản phẩm từ `order_items` và `products`.
     - Truy vấn các sản phẩm có `stock_quantity <= 5`.
     - Lắp dữ liệu vào `systemPrompt` của CFO (Tham khảo nội dung prompt trong bản spec).
   - Nếu `role === 'staff'` hoặc `admin`:
     - Giữ nguyên luồng truy vấn danh sách sản phẩm.
     - Sửa lại nội dung `systemPrompt` chuyên nghiệp hơn theo bản spec (nhấn mạnh quy tắc không lộ thông tin nội bộ).
3. Cập nhật Frontend `frontend/src/services/ChatService.js`: Đảm bảo `token` luôn được truyền lên chính xác (code hiện tại có vẻ đã truyền).

**Yêu cầu kỹ thuật:** Sử dụng `db.query` đã có sẵn. Đảm bảo luồng mã rõ ràng, dễ bảo trì, bám sát kiến trúc MVC.
