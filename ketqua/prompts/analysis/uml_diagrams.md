# Prompt: Phân tích và Vẽ UML Diagrams Chuyên Sâu

**Vai trò AI:** Senior Systems Architect.

**Ngữ cảnh (Context):**
Hệ thống cần sơ đồ trực quan để Developer và QA có thể hiểu rõ luồng đi của dữ liệu, đặc biệt là các luồng phức tạp như Transaction Database và Giao tiếp AI LLM.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả User Stories tại: `specs/requirements/user_stories.md`.

**Yêu cầu Xử lý (Instructions):**
1. Sử dụng cú pháp **Mermaid JS** để vẽ sơ đồ.
2. Vẽ 1 sơ đồ **Use Case Diagram** tổng quát bao trùm tất cả chức năng của 3 role (Admin, Owner, Staff).
3. Vẽ 1 sơ đồ **Sequence Diagram** cực kỳ chi tiết cho luồng **Thanh toán POS & Trừ tồn kho**: Bắt đầu từ lúc quét mã vạch -> Backend mở DB Transaction -> Check tồn kho (FOR UPDATE) -> Rollback (nếu thiếu) hoặc Commit (nếu đủ) -> Trả về Client in Bill.
4. Vẽ 1 sơ đồ **Sequence Diagram** cho luồng **Chatbot AI**: Client -> API -> Lấy context từ DB (Tồn kho/Giá) -> Build System Prompt -> LLM (OpenAI/Gemini) -> Trả về Client.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown (chứa code block `mermaid`).
- Lưu kết quả vào: `specs/requirements/uml_diagrams.md`.