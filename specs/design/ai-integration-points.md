# Đề xuất Vị trí Tích hợp AI - Dựa trên Thực tế

## 1. AI Insight (Sinh nhận xét báo cáo doanh thu)

**Vị trí:** Màn hình Dashboard Quản trị (`OwnerDashboardView`).
**Cơ chế:**

- Trên giao diện có nút **[Phân Tích Dữ Liệu Thực]**.
- Khi người dùng bấm nút, hệ thống gọi API backend lấy số liệu tổng quát (Doanh thu, Đơn hàng, Top Bán Chạy).
- Đưa dữ liệu này (chuỗi JSON) vào System Prompt gửi lên **Ollama** (với mô hình như cấu hình `qwen2.5-coder` hoặc `llama3`).
- AI sẽ đọc số liệu và trả về văn bản nhận xét chiến lược kinh doanh cho Chủ cửa hàng.

## 2. AI Chat Assistant (Hỗ trợ tư vấn đa năng)

**Vị trí:** Trợ lý ảo (Floating Chat) hoặc Demo Chat ở Landing Page, dùng được cho Nhân viên và Khách hàng.
**Cơ chế:**

- Backend đã định nghĩa các bảng `chat_sessions` và `chat_messages` để lưu lịch sử ngữ cảnh.
- Có chức năng ghim **System Prompt** chung lấy từ bảng `system_configs` (`ai_system_prompt`).
- Để giúp AI biết về kho hàng, định kỳ hoặc lúc khởi tạo session, Backend sẽ đưa danh sách sản phẩm (tên, giá, tồn kho) vào ngữ cảnh hệ thống.
- Khi người dùng nhắn tin, Backend lưu tin nhắn, gửi request đến Ollama API kèm lịch sử chat để lấy phản hồi, sau đó trả về và lưu phản hồi của AI.
