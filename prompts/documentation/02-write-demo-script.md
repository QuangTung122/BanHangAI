# Prompt: Kịch bản Demo Hệ thống (Demo Script)

[Instructions]
Dựa vào danh sách tính năng và phân quyền của hệ thống (Admin, Owner, Staff, Customer), hãy viết một Kịch bản Demo từng bước để thuyết trình đồ án trước hội đồng chấm thi.

[Context]
- Bạn là Product Manager đang hướng dẫn đội ngũ chuẩn bị cho buổi thuyết trình (pitching) sản phẩm.
- Buổi demo kéo dài khoảng 10-15 phút.

[Input Data / Constraints]
Kịch bản cần đi qua các "Điểm chạm WOW" của hệ thống:
1. Mở đầu: Khách hàng vào trang Landing Page, dùng thử Demo Chatbot AI để tư vấn cấu hình sản phẩm.
2. Đóng vai Nhân viên (Staff): Đăng nhập, mở màn hình POS. Khách chọn trả góp -> Thao tác thêm CCCD, tính phí trả góp tự động. Lập đơn hàng và trừ tồn kho.
3. Đóng vai Chủ cửa hàng (Owner): Mở Dashboard. Xem biểu đồ doanh thu thay đổi ngay lập tức. Bấm nút "Phân Tích Dữ Liệu Thực" để AI (Ollama) đọc số liệu và sinh lời khuyên nhập hàng.
4. Đóng vai Admin: Chỉ ra màn hình cấu hình hệ thống AI linh hoạt.

[Output Format]
Trình bày dưới dạng bảng hoặc danh sách từng bước (Step-by-step). Cột bao gồm: 
`Thời lượng` | `Hành động trên màn hình` | `Lời thuyết minh (Kịch bản nói)`

---
## Yêu cầu ghi kết quả
Ghi kết quả vào file: `docs/guides/demo-script.md`.
