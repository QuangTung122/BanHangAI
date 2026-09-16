const fs = require('fs');
const path = require('path');
const basePath = path.join(__dirname, '..');

// --- 1. GLOBAL PROMPTS REWRITE ---
const globals = [
  {
    path: 'prompts/analysis/user_stories.md',
    content: `# Prompt: Đặc tả User Stories (Chi tiết toàn diện)

**Vai trò AI:** Senior Business Analyst & Product Owner.

**Ngữ cảnh (Context):**
Chúng ta đang xây dựng hệ thống BanHangAI. Bạn hãy đọc file \`de_tai_01.md\` và các yêu cầu cốt lõi. Nhiệm vụ của bạn là phân rã toàn bộ hệ thống thành các User Stories thực chiến.

**Dữ liệu Đầu vào (Input):**
- Tài liệu mô tả đề tài gốc: \`de_tai_01.md\`.
- Gồm 3 vai trò: Admin, Owner, Staff.
- Tối thiểu 11 module nghiệp vụ: Auth, Chat, Dashboard, Cashflow, Products, Orders, Installment, Warranty, Attendance, Audit.

**Yêu cầu Xử lý (Instructions):**
1. Nhóm các Story thành ít nhất 4 Epic lớn (VD: Quản trị, Vận hành, Bán hàng, Giao tiếp nội bộ).
2. Viết theo chuẩn Agile: "Là [Actor], tôi muốn [Action] để [Benefit]".
3. MỖI User Story BẮT BUỘC phải có Acceptance Criteria (Tiêu chí nghiệm thu) thật khắt khe (ví dụ: performance < 300ms, chống lỗi đua lệnh, UI lock).

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`specs/requirements/user_stories.md\`.`
  },
  {
    path: 'prompts/analysis/uml_diagrams.md',
    content: `# Prompt: Phân tích và Vẽ UML Diagrams Chuyên Sâu

**Vai trò AI:** Senior Systems Architect.

**Ngữ cảnh (Context):**
Hệ thống cần sơ đồ trực quan để Developer và QA có thể hiểu rõ luồng đi của dữ liệu, đặc biệt là các luồng phức tạp như Transaction Database và Giao tiếp AI LLM.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả User Stories tại: \`specs/requirements/user_stories.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Sử dụng cú pháp **Mermaid JS** để vẽ sơ đồ.
2. Vẽ 1 sơ đồ **Use Case Diagram** tổng quát bao trùm tất cả chức năng của 3 role (Admin, Owner, Staff).
3. Vẽ 1 sơ đồ **Sequence Diagram** cực kỳ chi tiết cho luồng **Thanh toán POS & Trừ tồn kho**: Bắt đầu từ lúc quét mã vạch -> Backend mở DB Transaction -> Check tồn kho (FOR UPDATE) -> Rollback (nếu thiếu) hoặc Commit (nếu đủ) -> Trả về Client in Bill.
4. Vẽ 1 sơ đồ **Sequence Diagram** cho luồng **Chatbot AI**: Client -> API -> Lấy context từ DB (Tồn kho/Giá) -> Build System Prompt -> LLM (OpenAI/Gemini) -> Trả về Client.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown (chứa code block \`mermaid\`).
- Lưu kết quả vào: \`specs/requirements/uml_diagrams.md\`.`
  },
  {
    path: 'prompts/analysis/database_dictionary.md',
    content: `# Prompt: Thiết lập Từ Điển Dữ Liệu (Database Dictionary)

**Vai trò AI:** Database Administrator (DBA).

**Ngữ cảnh (Context):**
Chúng ta cần một tài liệu mô tả chính xác 100% cấu trúc của Database để các Developer có thể dựa vào đó viết Entity/Model.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả User Stories tại: \`specs/requirements/user_stories.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Phân tích và liệt kê chi tiết TẤT CẢ 10 bảng dữ liệu cốt lõi của hệ thống: \`users\`, \`products\`, \`orders\`, \`order_details\`, \`transactions\`, \`attendances\`, \`installments\`, \`audit_logs\`, \`chat_messages\`, \`return_warranties\`.
2. Biểu diễn dưới dạng Bảng (Table) cho mỗi Database Table.
3. Mỗi bảng bắt buộc có các cột: Tên Field, Type (Varchar/Int/Enum...), Primary/Foreign Key, Ràng buộc (NOT NULL, UNIQUE, DEFAULT), và Mô tả (Description).
4. Phải mô tả rõ logic xóa (ON DELETE CASCADE) cho các quan hệ cha-con (VD: Orders -> Order_Details).

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`specs/requirements/database_dictionary.md\`.`
  },
  {
    path: 'prompts/design/system_erd.md',
    content: `# Prompt: Vẽ Sơ Đồ Thực Thể Liên Kết (System ERD)

**Vai trò AI:** Database Architect.

**Dữ liệu Đầu vào (Input):**
- Đọc tài liệu Từ điển Dữ liệu tại: \`specs/requirements/database_dictionary.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Dựa trên 10 bảng dữ liệu đã định nghĩa, vẽ một sơ đồ ERD tổng quát bằng cú pháp **Mermaid JS** (\`erDiagram\`).
2. Móc nối chính xác các quan hệ 1-N, N-N giữa \`users\` với \`orders\`, \`orders\` với \`order_details\`, v.v...
3. Ghi rõ các khóa chính (PK) và khóa ngoại (FK) trên sơ đồ.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`specs/design/system_erd.md\`.`
  },
  {
    path: 'prompts/development/api_swagger.md',
    content: `# Prompt: Đặc tả OpenAPI / Swagger

**Vai trò AI:** Backend Tech Lead.

**Dữ liệu Đầu vào (Input):**
- Đọc toàn bộ các file đặc tả trong \`specs/development/*.md\` để tổng hợp các API Routes hiện có.

**Yêu cầu Xử lý (Instructions):**
1. Viết mã nguồn đặc tả API theo chuẩn **OpenAPI 3.0** (Định dạng YAML).
2. Phải bao gồm các nhóm API cốt lõi: Auth (\`/login\`), Products (CRUD), Orders (Checkout), và AI (\`/api/chat\`, \`/api/report\`).
3. Khai báo rõ Request Body schema, HTTP Status Responses (200, 201, 400, 401) và Security Bearer Token.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown chứa YAML block.
- Lưu kết quả vào: \`specs/development/api_swagger.md\`.`
  },
  {
    path: 'prompts/documentation/deployment_guide.md',
    content: `# Prompt: Viết Hướng Dẫn Triển Khai (DevOps Guide)

**Vai trò AI:** Senior DevOps Engineer.

**Ngữ cảnh (Context):**
Cần tài liệu để team kỹ thuật có thể deploy dự án BanHangAI lên môi trường Production (VPS Linux) sử dụng Docker.

**Dữ liệu Đầu vào (Input):**
- Kiểm tra cấu trúc thư mục thực tế (\`backend/\`, \`frontend/\`, \`docker-compose.yml\`).

**Yêu cầu Xử lý (Instructions):**
1. Liệt kê cấu trúc file \`.env\` mẫu (Bao gồm Port, DB Config, JWT_SECRET, OPENAI_API_KEY).
2. Hướng dẫn lệnh khởi tạo DB (migration/seeding) qua script npm.
3. Hướng dẫn chạy môi trường Local (cho Dev).
4. Hướng dẫn build và up Docker Compose (cho Production).
5. Đề xuất quy trình CI/CD tự động bằng GitHub Actions và lệnh Cronjob Backup database.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`docs/operations/deployment-guide.md\`.`
  },
  {
    path: 'prompts/documentation/user_manual.md',
    content: `# Prompt: Viết Sổ Tay Hướng Dẫn Sử Dụng (User Manual)

**Vai trò AI:** Technical Writer & Product Expert.

**Dữ liệu Đầu vào (Input):**
- Đọc các luồng nghiệp vụ từ: \`specs/requirements/user_stories.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Viết sổ tay hướng dẫn dành cho người dùng cuối (End-users) với ngôn từ thân thiện, dễ hiểu, không mang nặng kỹ thuật.
2. Phân chia rõ ràng thành 3 phần cho 3 đối tượng: Staff (cách dùng POS, tạo Trả góp, Chatbot), Owner (Cách đọc báo cáo AI, Sổ quỹ, Chấm công), Admin (Khóa tài khoản, Audit log).
3. Hướng dẫn chi tiết cách viết "câu lệnh" (Prompt) để hỏi Trợ lý AI trong phần mềm.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`docs/guides/user_manual.md\`.`
  },
  {
    path: 'prompts/analysis/non_functional.md',
    content: `# Prompt: Phân tích Yêu cầu Phi Chức Năng (NFRs)

**Vai trò AI:** Security & Performance Architect.

**Dữ liệu Đầu vào (Input):**
- Thông tin dự án chung: \`de_tai_01.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Viết tài liệu đặc tả NFR (Non-Functional Requirements) chú trọng vào 4 khía cạnh: Security, Performance, Scalability, Availability.
2. Nhấn mạnh vào rào cản bảo mật AI: Tuyệt đối không leak API Key, bảo vệ chống Prompt Injection.
3. Xác định ngưỡng SLA: Thời gian phản hồi API < 200ms, độ trễ API AI < 3s.

**Dữ liệu Đầu ra (Output):**
- Định dạng: Markdown.
- Lưu kết quả vào: \`specs/requirements/non_functional.md\`.`
  }
];

// --- 2. FEATURE PROMPTS REWRITE (39 Files) ---
const features = [
  'auth', 'team_chat', 'admin_system', 'admin_user', 'owner_cashflow',
  'owner_dashboard', 'owner_product', 'owner_staff', 'staff_attendance',
  'staff_installment', 'staff_order_history', 'staff_pos', 'staff_product'
];

features.forEach(f => {
  // Design Prompt
  const designPrompt = `# Prompt Thiết Kế Chi Tiết: Module \`${f}\`

**Vai trò AI:** UI/UX Expert & System Analyst.

**Dữ liệu Đầu vào (Input):**
- Đọc luồng nghiệp vụ liên quan trong: \`specs/requirements/user_stories.md\`.
- Đọc cấu trúc Database tại: \`specs/requirements/database_dictionary.md\`.

**Yêu cầu Xử lý (Instructions):**
1. **Wireframe (BẮT BUỘC):** Vẽ giao diện chi tiết bằng ASCII Art. Thể hiện rõ các khu vực lưới dữ liệu, bộ lọc, nút bấm và form nhập liệu.
2. **UI Components:** Phân tích giao diện thành các Component nhỏ (Ví dụ: Header, TableGrid, ModalForm).
3. **Data Binding:** Liệt kê rõ component nào gọi dữ liệu từ trường (Field) nào trong Database.
4. **API Endpoints:** Lên danh sách các API cần thiết để View này hoạt động (VD: GET list, POST create).

**Dữ liệu Đầu ra (Output):**
- Lưu kết quả vào: \`specs/design/${f}.md\`.`;

  // Dev Prompt
  const devPrompt = `# Prompt Hướng Dẫn Phát Triển: Module \`${f}\`

**Vai trò AI:** Senior Full-Stack Engineer (Vanilla JS MVC & Node.js).

**Dữ liệu Đầu vào (Input):**
- Bản thiết kế giao diện tại: \`specs/design/${f}.md\`.
- Từ điển dữ liệu DB tại: \`specs/requirements/database_dictionary.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Viết tài liệu Development Specs định hướng code cho Lập trình viên.
2. Ánh xạ chính xác Tên File theo kiến trúc dự án:
   - Frontend: View Class (\`src/views/pages/...\`), Controller Class, Model Class, Service Class.
   - Backend: Controller File (\`backend/src/controllers/...\`), Route File.
3. Trình bày Luồng Dữ Liệu (Data Flow) từng bước: (VD: 1. User click nút -> 2. View emit event -> 3. Controller catch event -> 4. Model call API -> 5. View DOM Update).
4. Phân tích các thuật toán hoặc logic phức tạp cần chú ý (Ví dụ: Debounce input, DB Transaction, Locking).

**Dữ liệu Đầu ra (Output):**
- Lưu kết quả vào: \`specs/development/${f}.md\`.`;

  // Testing Prompt
  const testPrompt = `# Prompt Kịch Bản Kiểm Thử (Test Cases): Module \`${f}\`

**Vai trò AI:** Senior QA Automation Engineer.

**Dữ liệu Đầu vào (Input):**
- Đọc đặc tả phát triển tại: \`specs/development/${f}.md\`.

**Yêu cầu Xử lý (Instructions):**
1. Phân tích tài liệu Dev và thiết kế bộ Kịch bản Test (Test Cases) thực chiến, bao trùm các góc khuất (Edge Cases).
2. Viết **Unit Test Cases**: Xác định các hàm tính toán, validation cần mock data và kỳ vọng Output (Expected Output) rõ ràng.
3. Viết **Integration Test Cases**: Mô tả kịch bản gọi API, verify thay đổi trong Database. Nhấn mạnh việc test rủi ro "Race Condition" (Truy cập đồng thời).
4. Viết **E2E / UI Test Cases**: Liệt kê kịch bản cho Cypress/Selenium. Chú ý test các trạng thái loading, lỗi HTTP 400/500 hiển thị Toast đỏ trên giao diện.
5. Mỗi Test Case phải có cấu trúc: [Mô tả] - [Precondition] - [Input] - [Expected Output].

**Dữ liệu Đầu ra (Output):**
- Lưu kết quả vào: \`specs/testing/${f}.md\`.`;

  fs.writeFileSync(path.join(basePath, 'prompts', 'design', f + '.md'), designPrompt);
  fs.writeFileSync(path.join(basePath, 'prompts', 'development', f + '.md'), devPrompt);
  fs.writeFileSync(path.join(basePath, 'prompts', 'testing', f + '.md'), testPrompt);
});

globals.forEach(g => {
  fs.writeFileSync(path.join(basePath, g.path), g.content);
});

console.log('Successfully completely overhauled ALL PROMPTS to be highly detailed and with accurate INPUT/OUTPUT paths!');
