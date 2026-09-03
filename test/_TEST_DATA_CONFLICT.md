## 1. Vai trò

Bạn là **Lead QA / Quality Assurance Engineer**, **System Auditor** và **Enterprise Solutions Architect** có chuyên môn cao về kiểm thử tài liệu phần mềm, thẩm định tính nhất quán dữ liệu hai chiều (Cross-Document Verification) và phát hiện mâu thuẫn hệ thống trong chu trình SDLC.

## 2. Mục tiêu

Thực hiện một kịch bản kiểm thử toàn diện để rà soát, đối chiếu chéo (Cross-check) toàn bộ dữ liệu, logic nghiệp vụ, sơ đồ thiết kế và cấu trúc cơ sở dữ liệu giữa tất cả các file tài liệu hiện có trong thư mục `specs/` và thư mục gốc:

- Phát hiện 100% các điểm mâu thuẫn, lệch pha (Mismatch), thừa/thiếu thông tin hoặc sai lệch kiểu dữ liệu giữa các giai đoạn.
- Đưa ra phân tích nguyên nhân gốc rễ và **hướng dẫn khắc phục chi tiết (Actionable Fixes)** cho từng điểm lỗi.
- Xuất toàn bộ báo cáo thẩm định vào file: `test/data-conflict-test-report.md`.

## 3. Danh sách tài liệu đầu vào cần đối chiếu

Đọc và quét toàn bộ nội dung của các file sau:

1. `ANTIGRAVITY.md` (Quy chuẩn tech stack, quy ước đặt tên và kiến trúc dự án)
2. `de_tai_01.md` (Đề tài & phạm vi yêu cầu bài toán gốc)
3. `informember.md` (Phân công vai trò & thành viên)
4. `specs/01_project-plan.docx`
5. `specs/phan-tich-yeu-cau_ket_qua.md`
6. `specs/thiet-ke-he-thong_ket_qua.md`
7. `specs/thiet-ke-database.md`

---

## 4. Kịch bản & Ma trận kiểm tra chi tiết (Conflict Check Scenarios)

Bạn phải tiến hành kiểm tra lần lượt 7 nhóm rủi ro/xung đột cốt lõi sau:

### 4.1. Xung đột Ma trận Truy vết & Mã định danh (Traceability & ID Mismatch)

* **Check-list:**
  - Kiểm tra xem các mã `REQ-F-xxx`, `REQ-AI-xxx`, `UC-xxx` trong tài liệu Phân tích yêu cầu có được ánh xạ đầy đủ sang Class Model (`CLS-xxx`), Endpoint (`API-xxx`) trong `04_object-oriented-design.md` không.
  - Có Use Case nào được mô tả trong SRS nhưng bị "bỏ quên" không có API hoặc Class tương ứng trong OOD không?
  - Có bảng Database nào trong `06_database.md` không liên kết với bất kỳ Data Requirement (`DR-xxx`) hay Class Model nào không?

### 4.2. Xung đột Kiểu dữ liệu giữa Database, Class Model và Pydantic Schema

* **Check-list:**
  - So sánh tên trường, kiểu dữ liệu giữa: Cột SQL trong `06_database.md` $\leftrightarrow$ Thuộc tính Class trong `04_object-oriented-design.md` $\leftrightarrow$ Schema Pydantic.
  - *Ví dụ kiểm tra:* Cột `orders.total_amount` trong DB là `INTEGER` hay `REAL/DECIMAL`, nhưng trong Class OOD lại khai báo `float` hay `int`? Có bị lệch đơn vị tính tiền (VNĐ vs USD) không?
  - Kiểm tra tên khóa ngoại: Trong OOD ghi `user_id` nhưng trong DB lại viết thành `userId` hoặc `id_user` (vi phạm quy chuẩn `snake_case` trong `ANTIGRAVITY.md`).

### 4.3. Xung đột Toàn vẹn Dữ liệu & Ràng buộc Quan hệ (Database Integrity & Constraints)

* **Check-list:**
  - Quan hệ giữa các thực thể trong Mermaid ERD (`06_database.md`) có khớp với quan hệ trong Class Diagram (`04_object-oriented-design.md`) không? (Ví dụ: ERD là 1-N nhưng Class Diagram vẽ N-N).
  - Hành vi khóa ngoại (`ON DELETE CASCADE` / `RESTRICT` / `SET NULL`) trong script SQL có gây nguy cơ mất dữ liệu đơn hàng khi xóa tài khoản người dùng không?
  - Kiểm tra xem bảng `order_items` có lưu `unit_price` tại thời điểm mua không (nếu chỉ lấy `products.price` thì khi sản phẩm đổi giá sẽ làm sai lệch lịch sử đơn hàng cũ).

### 4.4. Xung đột Luồng nghiệp vụ & Sơ đồ Tuần tự (Business Flow vs Sequence Diagram)

* **Check-list:**
  - Luồng tuần tự (Sequence Diagram) tạo đơn hàng trong `04_object-oriented-design.md` có bước kiểm tra tồn kho (`stock_quantity`) trước khi trừ tiền/tạo Order không?
  - Luồng chat AI có bước lấy Context danh mục sản phẩm từ Database trước khi gửi Prompt sang Ollama không?
  - Trạng thái đơn hàng (`status` enum/text) giữa Use Case, API Spec và bảng `orders` trong CSDL có đồng nhất danh sách giá trị không (ví dụ: `pending`, `processing`, `completed`, `cancelled`)?

### 4.5. Xung đột Phân quyền & Bảo mật (Security & Authorization Mismatch)

* **Check-list:**
  - Các API quản trị (`POST /api/products`, `PUT /api/orders/{id}`) trong OOD có ghi chú yêu cầu quyền `Admin` khớp với Actor `ACT-Admin` trong SRS không?
  - Cột mật khẩu trong bảng `users` (`06_database.md`) có bắt buộc dùng `password_hash` thay vì `password` plain text không?
  - Dữ liệu giỏ hàng: Có xung đột giữa việc lưu ở Client (`localStorage`) với việc gửi API lưu giỏ hàng lên Server không?

### 4.6. Xung đột Module AI & Ngữ cảnh Local LLM (AI Guardrails & Context Limitations)

* **Check-list:**
  - Định dạng bảng `chat_messages` trong DB có hỗ trợ các vai trò `role` (system, user, assistant) phù hợp với chuẩn API của Ollama/Gemini không?
  - Dung lượng trường dữ liệu ngữ cảnh: Bảng `products.description` có chứa các định dạng phức tạp/HTML làm tràn ngữ cảnh (Token limit) của Ollama `qwen2.5:7b` / `llama3.1:8b` không?
  - Phương án xử lý khi AI bị Timeout hoặc Model Offline (Fallback Response) đã được đồng bộ trong cả OOD và Backend Service chưa?

### 4.7. Xung đột Phạm vi Dự án (Scope Creep & Golden Rule Violation)

* **Check-list:**
  - Có tính năng nào xuất hiện trong OOD/Database (như tích hợp VNPAY, tích điểm VIP, thanh toán thẻ quốc tế) nhưng trong `de_tai_01.md` hoặc SRS lại được đánh dấu là `Out-of-scope` hoặc `Chưa xác nhận (OQ-xxx)` không?

---

## 5. Cấu trúc Báo cáo Đầu ra bắt buộc (`specs/07_data-conflict-test-report.md`)

Báo cáo kết quả phải được cấu trúc rõ ràng theo các phần sau:

1. **Tổng quan Kiểm thử (Audit Executive Summary):**

   - Tổng số file được quét.
   - Tổng số lỗi/xung đột phát hiện (Phân loại: Nghiêm trọng - Critical, Trung bình - Medium, Cảnh báo - Low).
   - Đánh giá mức độ sẵn sàng triển khai mã nguồn (Ready / Not Ready).
2. **Bảng Tổng hợp Xung đột & Mâu thuẫn (Conflict Matrix):**

   - Trình bày dạng bảng gồm các cột: `Mã lỗi (ERR-xxx)`, `Phân loại rủi ro`, `Các file liên quan (Source vs Target)`, `Mô tả xung đột`, `Mức độ nghiêm trọng (High/Medium/Low)`.
3. **Chi tiết Từng Xung đột & Hướng dẫn Khắc phục (Detailed Findings & Actionable Fixes):**

   - Với mỗi mã `ERR-xxx`, trình bày chi tiết:
     - **Hiện trạng mâu thuẫn:** Trích dẫn chính xác đoạn nội dung bị lệch giữa file A và file B.
     - **Nguy cơ tiềm ẩn:** Lỗi runtime, sai logic nghiệp vụ, hỏng CSDL hoặc nghẽn API sẽ xảy ra nếu giữ nguyên.
     - **Hướng dẫn khắc phục chuẩn:** Cung cấp đoạn mã/nội dung sửa lại chính xác để copy-paste cập nhật vào file tương ứng.
4. **Kế hoạch Điều chỉnh Tài liệu (Remediation Checklist):**

   - Danh sách gạch đầu dòng các bước cụ thể nhóm phát triển cần cập nhật lại cho từng file (`specs/04_object-oriented-design.md`, `specs/06_database.md`,...) để đạt trạng thái hoàn toàn nhất quán (100% Data Integrity).

---

## 6. Lệnh thực thi

Hãy quét kỹ lưỡng từng file theo danh sách đầu vào, thực hiện toàn bộ 7 nhóm kiểm tra ở Mục 4, lập luận logic khách quan, không bỏ sót bất kỳ chi tiết nhỏ nào và ghi toàn bộ nội dung hoàn chỉnh vào file:

```text
test/data-conflict-test-report.md
```
