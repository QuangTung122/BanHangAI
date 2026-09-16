# Prompt: Phân tích Yêu cầu Hệ thống Tổng Quan (System Requirements)

**Vai trò AI:** Senior Business Analyst (BA) / Product Manager.

**Ngữ cảnh (Context):**
Dự án BanHangAI cần một tài liệu Phân tích Yêu cầu cốt lõi (Core Requirements Analysis) để làm cơ sở cho toàn bộ các tài liệu chuyên sâu khác (như User Stories, UML, Database).

**Dữ liệu Đầu vào (Input):**
- Thông tin dự án gốc: \`de_tai_01.md\`.
- Nắm bắt được quy mô hệ thống gồm 11 module: Auth, Chat, System, User, Cashflow, Dashboard, Product, Staff, Attendance, Installment, Return & Warranty.

**Yêu cầu Xử lý (Instructions):**
Bạn hãy đóng vai BA và viết tài liệu Đặc tả Yêu cầu Hệ thống (System Requirements Specification - SRS mức tổng quan). Tài liệu phải bao gồm các phần:
1. **Bối cảnh và Vấn đề (Business Context):** Nêu rõ nỗi đau (Pain points) của cửa hàng bán lẻ truyền thống và lý do ra đời hệ thống.
2. **Mục tiêu Hệ thống (System Objectives):** Giải quyết được gì? Tích hợp AI mang lại giá trị gì?
3. **Đối tượng Sử dụng (Actors):** Phân tích 3 vai trò: Admin, Owner, Staff. (Mục tiêu của họ là gì?)
4. **Phạm vi Chức năng (Functional Scope):** Tóm tắt 11 module nghiệp vụ lõi (Ai được làm gì trong từng module).
5. **Rủi ro và Giả định (Risks & Assumptions):** Đánh giá rủi ro khi AI trả lời sai, rủi ro sập mạng, rủi ro đua lệnh (Race condition) khi chốt đơn.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`specs/requirements/system_requirements.md\`.
