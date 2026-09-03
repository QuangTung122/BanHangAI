# Báo cáo Đối chiếu và Thẩm định Dữ liệu (Cross-Document Verification Report)

**Vai trò thực hiện:** Lead QA / System Auditor
**Mục tiêu:** Rà soát tính nhất quán và phát hiện mâu thuẫn giữa Phân tích yêu cầu, Thiết kế hệ thống (OOD) và Thiết kế Cơ sở dữ liệu (DB).

---

## 1. Tổng quan Kiểm thử (Audit Executive Summary)

- **Tổng số file được quét:** 07 file (bao gồm Quy chuẩn, Đề tài, User Stories, System Design, Database Design).
- **Tổng số lỗi/xung đột phát hiện:** 05 lỗi.
  - **Nghiêm trọng (Critical):** 01 lỗi (Rủi ro mất dữ liệu hóa đơn).
  - **Cao (High):** 01 lỗi (Lệch pha nghiêm trọng giữa Class và Database Model).
  - **Trung bình (Medium):** 02 lỗi (Thiếu sót API và phân quyền).
  - **Cảnh báo (Low):** 01 lỗi (Nguy cơ quá tải token AI).
- **Đánh giá mức độ sẵn sàng triển khai:** **NOT READY** (Không sẵn sàng). Cần khắc phục các lỗi nghiêm trọng về cấu trúc dữ liệu trước khi chuyển giao cho bộ phận Development.

---

## 2. Bảng Tổng hợp Xung đột & Mâu thuẫn (Conflict Matrix)

| Mã lỗi    | Phân loại rủi ro       | Các file liên quan (Source vs Target)                           | Mô tả xung đột                                                                                            | Mức độ |
| ----------- | ------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- |
| `ERR-001` | Ràng buộc dữ liệu     | `06_database.md` vs Quy tắc kinh doanh                         | Lỗi`ON DELETE CASCADE` ở bảng `orders` gây mất lịch sử doanh thu nếu xóa User.                   | Critical  |
| `ERR-002` | Mismatch OOD & DB         | `thiet-ke-he-thong_ket_qua.md` vs `06_database.md`            | Lệch pha thuộc tính, kiểu dữ liệu và thiếu Class (`Category`, `ChatSession`) trong Class Diagram. | High      |
| `ERR-003` | Traceability              | `sinh-userstory_ket_qua.md` vs `thiet-ke-he-thong_ket_qua.md` | Thiếu API Endpoints cho yêu cầu`REQ-F-006` (Cấu hình hệ thống).                                      | Medium    |
| `ERR-004` | Phân quyền (Security)   | `thiet-ke-he-thong_ket_qua.md` (Bảng API)                      | Thiếu ghi chú yêu cầu phân quyền (`Admin`) cho các API thêm/sửa sản phẩm.                        | Medium    |
| `ERR-005` | Ngữ cảnh AI (AI Limits) | `06_database.md` vs Yêu cầu AI                                | Cột`description` dạng TEXT nếu chứa HTML sẽ gây tràn token context của Ollama.                      | Low       |

---

## 3. Chi tiết Từng Xung đột & Hướng dẫn Khắc phục

### [ERR-001] Xung đột Toàn vẹn Dữ liệu (Mất lịch sử đơn hàng)

- **Hiện trạng mâu thuẫn:** Trong file `06_database.md`, script SQL định nghĩa bảng `orders` có ràng buộc: `FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE`.
- **Nguy cơ tiềm ẩn:** Lỗi nghiệp vụ đặc biệt nghiêm trọng. Trong e-commerce, hóa đơn không bao giờ được xóa để đảm bảo báo cáo doanh thu. Ràng buộc CASCADE sẽ khiến việc xóa 1 tài khoản khách hàng kéo theo xóa toàn bộ đơn hàng người đó từng mua, làm sai lệch doanh thu của Chủ cửa hàng.
- **Hướng dẫn khắc phục chuẩn:**
  Cập nhật script SQL trong `06_database.md`:
  Đổi từ `ON DELETE CASCADE` thành `ON DELETE SET NULL` đối với `orders.user_id`. (Hoặc chỉ thiết kế logic xóa mềm `is_active` cho bảng `users`).
  ```sql
  -- Thay thế dòng này trong bảng orders:
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  ```

### [ERR-002] Lệch pha Thuộc tính giữa Class Model và Database Schema

- **Hiện trạng mâu thuẫn:**
  - Class `Product` trong `thiet-ke-he-thong_ket_qua.md` ghi thuộc tính `category` là `String`. Nhưng trong `06_database.md` nó là `category_id` (INTEGER) là khóa ngoại.
  - Class `User` thiếu hoàn toàn các thuộc tính `full_name`, `email`, `phone` đã được định nghĩa trong `06_database.md`.
  - Class `ChatMessage` dùng trường `role`, nhưng bảng `chat_messages` trong DB lại dùng `sender`.
  - Thiếu hẳn Class `Category` và `ChatSession` trên sơ đồ OOD dù DB đã có.
- **Nguy cơ tiềm ẩn:** Backend Developer khi viết Pydantic Schema hoặc SQLAlchemy Model dựa trên Class Diagram sẽ bị thiếu trường dữ liệu, dẫn tới lỗi API crash khi truy vấn hoặc parse dữ liệu vào/ra DB.
- **Hướng dẫn khắc phục chuẩn:**
  Cập nhật PlantUML Class Diagram trong `thiet-ke-he-thong_ket_qua.md` để khớp 1-1 với DB:
  ```plantuml
  class User {
      +Integer id
      +String username
      +String password_hash
      +String full_name
      +String email
      +String phone
      +String role
  }
  class Product {
      +Integer id
      +Integer category_id
      +String name
      +String slug
      +String description
      +Float price
      +Integer stock_quantity
      +String image_url
  }
  class ChatMessage {
      +Integer id
      +Integer session_id
      +String sender
      +String message_content
      +DateTime timestamp
  }
  ```

  Và bổ sung class `Category`, `ChatSession` vào sơ đồ.

### [ERR-003] Thiếu sót API cho Use Case "Cấu hình hệ thống"

- **Hiện trạng mâu thuẫn:** `REQ-F-006` yêu cầu Admin có thể lưu các cấu hình hệ thống (như API key). Tuy nhiên, bảng API trong `thiet-ke-he-thong_ket_qua.md` không có endpoint nào phục vụ việc này.
- **Nguy cơ tiềm ẩn:** FE không có API để gọi, tính năng lưu cấu hình sẽ không thể hoạt động.
- **Hướng dẫn khắc phục chuẩn:**
  Bổ sung vào Bảng Đặc tả API (`thiet-ke-he-thong_ket_qua.md`):
  - `PUT | /api/config | Cập nhật cấu hình hệ thống (API keys, settings) | {settings} | 200 | REQ-F-006`

### [ERR-004] Thiếu ràng buộc Bảo mật trên API Spec

- **Hiện trạng mâu thuẫn:** API `POST /api/products` và `PUT /api/products/{id}` không chỉ định yêu cầu quyền Admin, dù Use Case định nghĩa chỉ Quản trị viên mới được thao tác.
- **Nguy cơ tiềm ẩn:** Lỗ hổng bảo mật (Broken Access Control) - khách hàng bình thường cũng có thể gọi API sửa giá sản phẩm nếu Dev code y hệt theo tài liệu.
- **Hướng dẫn khắc phục chuẩn:**
  Chỉnh sửa bảng API trong `thiet-ke-he-thong_ket_qua.md`, ghi chú rõ ràng vào cột Mô tả: `Thêm mới một sản phẩm (Require: Admin Role)`.

### [ERR-005] Nguy cơ tràn Token Ngữ cảnh AI

- **Hiện trạng mâu thuẫn:** Dữ liệu context cấp cho Ollama RAG lấy từ `products.description` (`06_database.md`).
- **Nguy cơ tiềm ẩn:** Nếu Admin nhập mô tả sản phẩm quá dài chứa mã HTML trang trí, AI prompt sẽ phình to không cần thiết, gây Timeout hoặc lỗi vượt quá Token limit của local LLM (8B params).
- **Hướng dẫn khắc phục chuẩn:**
  Bổ sung một cột mới vào bảng `products` trong `06_database.md`:
  `ai_context_summary TEXT` (Chứa tóm tắt ngắn gọn tính năng chính chỉ dành riêng cho AI đọc). Hoặc thêm quy tắc nghiệp vụ lọc mã HTML trước khi nạp vào Prompt ở Backend.

---

## 4. Kế hoạch Điều chỉnh Tài liệu (Remediation Checklist)

Để đạt trạng thái 100% Data Integrity, nhóm phân tích/thiết kế cần thực hiện ngay các công việc sau:

- [X] **Mở file `06_database.md`:**
  - Đổi `ON DELETE CASCADE` thành `ON DELETE SET NULL` cho trường `user_id` trong bảng `orders`.
- [X] **Mở file `thiet-ke-he-thong_ket_qua.md`:**
  - Cập nhật sơ đồ PlantUML Class Diagram: Thêm thuộc tính cho `User`, `Product`, `ChatMessage` để khớp kiểu dữ liệu DB. Thêm class `Category` và `ChatSession`.
  - Cập nhật bảng Danh sách API: Thêm endpoint `/api/config` (`REQ-F-006`).
  - Cập nhật bảng Danh sách API: Đánh dấu `(Require: Admin Role)` cho các endpoint quản trị sản phẩm.
- [ ] **Họp nhóm:** Đưa ra phương án chốt xử lý làm sạch mã HTML hoặc thêm cột `ai_context_summary` để nạp context cho chatbot AI mà không làm tràn memory.
