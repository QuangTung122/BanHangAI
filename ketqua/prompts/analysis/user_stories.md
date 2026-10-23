# Prompt: Đặc tả User Stories (Chi tiết toàn diện)

**Vai trò AI:** Senior Business Analyst & Product Owner.

**Ngữ cảnh (Context):**
Chúng ta đang xây dựng hệ thống BanHangAI. Bạn hãy đọc file `de_tai_01.md` và các yêu cầu cốt lõi. Nhiệm vụ của bạn là phân rã toàn bộ hệ thống thành các User Stories thực chiến.

**Dữ liệu Đầu vào (Input):**
- Tài liệu mô tả đề tài gốc: `de_tai_01.md`.
- Gồm 3 vai trò: Admin, Owner, Staff.
- Tối thiểu 11 module nghiệp vụ: Auth, Chat, Dashboard, Cashflow, Products, Orders, Installment, Warranty, Attendance, Audit.

**Yêu cầu Xử lý (Instructions):**
1. Nhóm các Story thành ít nhất 4 Epic lớn (VD: Quản trị, Vận hành, Bán hàng, Giao tiếp nội bộ).
2. Viết theo chuẩn Agile: "Là [Actor], tôi muốn [Action] để [Benefit]".
3. MỖI User Story BẮT BUỘC phải có Acceptance Criteria (Tiêu chí nghiệm thu) thật khắt khe (ví dụ: performance < 300ms, chống lỗi đua lệnh, UI lock).

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: `specs/requirements/user_stories.md`.