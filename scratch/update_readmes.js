const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

const rootReadme = `# BanHangAI - Hệ thống Quản lý Bán hàng Tích hợp AI

Chào mừng đến với dự án **BanHangAI**. Đây là một nền tảng phần mềm bán lẻ toàn diện, ứng dụng kiến trúc chuẩn MVC và tích hợp sức mạnh của Trí tuệ Nhân tạo (OpenAI/Gemini) trực tiếp vào luồng nghiệp vụ. Hệ thống được thiết kế tối ưu cho 3 vai trò: **Quản Trị Viên (Admin), Chủ Cửa Hàng (Owner), và Nhân Viên (Staff)**.

## 🌟 Điểm nổi bật của BanHangAI
- **Quản trị toàn diện (11 Modules):** Bao gồm POS Bán hàng, Trả góp, Bảo hành, Sổ quỹ, Chấm công, Chat nội bộ và Nhật ký hệ thống.
- **Tích hợp Trợ lý AI (LLM):** 
  - Chatbot tư vấn sản phẩm trực tiếp cho nhân viên dựa trên tồn kho thực tế (Context-aware).
  - Trí tuệ nhân tạo tự động phân tích doanh thu và đưa ra Insight kinh doanh cho Chủ cửa hàng.
- **Kiến trúc rõ ràng:** Phân tách Frontend (Vanilla JS MVC) và Backend (Node.js REST API).
- **Tài liệu hoàn chỉnh:** Dự án này tự hào sở hữu một bộ đặc tả kỹ thuật (Specs) và phân tích nghiệp vụ (BA) chi tiết nhất, được hỗ trợ sinh ra bởi AI Agent.

## 📂 Cấu trúc thư mục cốt lõi
Vui lòng tham khảo các file \`README.md\` nằm bên trong từng thư mục để hiểu rõ cách thức hoạt động của chúng:
- 📁 **[backend/](./backend/README.md)**: Chứa mã nguồn Node.js API (Routes, Controllers, Services).
- 📁 **[frontend/](./frontend/README.md)**: Chứa mã nguồn Giao diện MVC Vanilla JS.
- 📁 **[docs/](./docs/README.md)**: Chứa Hướng dẫn sử dụng và Hướng dẫn triển khai DevOps.
- 📁 **[specs/](./specs/README.md)**: Trung tâm đặc tả kỹ thuật (Requirements, Design, Development, Testing).
- 📁 **[prompts/](./prompts/README.md)**: Nơi lưu trữ các câu lệnh Prompt xuất sắc dùng để điều khiển AI Agent tự động code và viết Specs.
- 📁 **[scratch/](./scratch/README.md)**: Thư mục chứa script tạm thời của AI.

## 🚀 Khởi động nhanh (Quick Start)
1. Đọc kỹ file \`docs/operations/deployment-guide.md\` để cấu hình biến môi trường \`.env\`.
2. Khởi tạo Database: \`cd backend && npm run db:init\`.
3. Chạy hệ thống qua Docker: \`docker-compose up -d --build\`.

*Lưu ý kỷ luật:* Mọi cấu trúc và thiết kế hệ thống phải bám sát tài liệu \`codebasemap.md\` và \`ANTIGRAVITY.md\`.
`;

const backendReadme = `# Backend - BanHangAI API

Đây là trái tim của hệ thống BanHangAI, cung cấp các RESTful API phục vụ Frontend và giao tiếp với nền tảng Trí tuệ Nhân tạo (LLM).

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Database:** SQLite (Mặc định) / MySQL
- **Bảo mật:** JWT (JSON Web Token), bcrypt (Mã hóa mật khẩu).
- **AI Integration:** OpenAI API SDK / Google Generative AI SDK.

## 📂 Cấu trúc
- **\`src/routes/\`**: Định nghĩa các Endpoint giao tiếp với ngoài.
- **\`src/controllers/\`**: Xử lý logic nghiệp vụ, gọi Transaction tới Database.
- **\`src/services/\`**: Chứa logic gọi API AI (Tạo System Prompt, Inject context) và các logic phức tạp.
- **\`src/middlewares/\`**: \`authMiddleware.js\` (chặn request không có JWT), phân quyền Admin/Owner/Staff.

## 🔒 Quy tắc Code
- **Không bao giờ** commit file \`.env\` chứa khóa bí mật lên Git.
- **Transaction:** Mọi giao dịch thay đổi dòng tiền (Cashflow) và Tồn kho (Stock) phải sử dụng DB Transaction (BEGIN -> COMMIT / ROLLBACK) để chống đua lệnh (Race Condition).
`;

const frontendReadme = `# Frontend - BanHangAI UI

Giao diện người dùng của BanHangAI được xây dựng thuần túy dựa trên **Vanilla JS** tuân thủ nghiêm ngặt mô hình **MVC (Model - View - Controller)**. Hệ thống không sử dụng framework nặng (như React/Vue) để đảm bảo tốc độ phản hồi cực nhanh trên máy POS.

## 📂 Cấu trúc MVC
- **\`src/views/\`**: Chịu trách nhiệm render HTML, hoàn toàn "mù" về logic. Bắt sự kiện người dùng (Click, Input) và gửi tín hiệu (Emit) tới Controller.
- **\`src/controllers/\`**: Đóng vai trò "Nhạc trưởng". Nhận tín hiệu từ View, điều phối Model để tính toán và cập nhật lại giao diện.
- **\`src/models/\`**: Nơi lưu giữ trạng thái (State) tạm thời (như Giỏ hàng, Danh sách chat).
- **\`src/services/\`**: Tầng giao tiếp mạng (Fetch API), gọi lên Backend.

## 💡 Điểm lưu ý
- Toàn bộ các View và Controller được tách biệt theo từng Vai trò và Tính năng (VD: \`OwnerCashflowView\`, \`StaffPOSController\`).
- Sử dụng CSS nội bộ hoặc Tailwind (nếu config) cho giao diện Responsive.
`;

const docsReadme = `# Docs (Tài liệu Hướng Dẫn & Vận Hành)

Thư mục này là Trung tâm Tri thức (Knowledge Base) dành cho Người dùng cuối và Kỹ sư DevOps. 

## 📂 Cấu trúc
- **\`guides/user_manual.md\`**: Sổ tay hướng dẫn thao tác trên phần mềm cực kỳ chi tiết cho 3 vai trò: Staff (cách dùng POS, tạo Trả góp), Owner (Xem biểu đồ AI, chốt ca), Admin (Quản lý User).
- **\`operations/deployment-guide.md\`**: Tài liệu chuẩn DevOps hướng dẫn cách thiết lập biến môi trường, Docker Compose, CI/CD Github Actions và cách Backup database.

*Quy định:* Bất kỳ tính năng nghiệp vụ nào mới ra mắt, Lập trình viên bắt buộc phải cập nhật thêm cách sử dụng vào \`user_manual.md\`.
`;

const specsReadme = `# Specs (Tài Liệu Đặc Tả Hệ Thống)

Thư mục này chứa "Bản thiết kế tòa nhà" BanHangAI. Đây là bộ hồ sơ đồ sộ được viết cực kỳ chi tiết (mức độ Code-level) dành cho lập trình viên và QA.

## 📂 Các giai đoạn tài liệu (SDLC)
- **\`requirements/\`**: Giai đoạn phân tích (Business Analysis). Chứa User Stories (chia theo Epic), Sơ đồ luồng nghiệp vụ UML (Mermaid), Từ điển dữ liệu (Database Dictionary) với 10 bảng DB thực tế, và Các yêu cầu Phi chức năng.
- **\`design/\`**: Giai đoạn thiết kế. Chứa bản vẽ giao diện (Wireframe ASCII), và Sơ đồ kiến trúc thực thể (System ERD).
- **\`development/\`**: Giai đoạn đánh giá code. File tài liệu ánh xạ chính xác những dòng code, Controller, Model đang tồn tại thật trong thư mục ` + "`backend` và `frontend`" + `. Chứa cả đặc tả API Swagger.
- **\`testing/\`**: Báo cáo kiểm thử tự động. Quét code thực tế để chấm điểm PASS/FAIL cho từng tính năng. Có kèm lời nhận xét đánh giá từ AI QA.
`;

const promptsReadme = `# Prompts (Thư Viện Câu Lệnh AI)

Đây là kho lưu trữ các kỹ thuật **Prompt Engineering** đã được dùng để ra lệnh cho AI sinh ra toàn bộ tài liệu và mã nguồn cho hệ thống BanHangAI.

## 📂 Ý nghĩa các thư mục
- **\`analysis/\`**: Câu lệnh đóng vai trò BA/Architect (Yêu cầu vẽ UML, phân tích bảng Data Dictionary).
- **\`design/\`**: Câu lệnh đóng vai trò UX/UI (Yêu cầu vẽ Wireframe ASCII).
- **\`development/\`**: Câu lệnh đóng vai trò Senior Developer (Yêu cầu thiết kế MVC, đánh giá luồng dữ liệu).
- **\`testing/\`**: Câu lệnh đóng vai trò Senior QA Automation (Yêu cầu viết Unit Test, chống Race Condition, đánh giá chấm điểm PASS/FAIL).

*Mẹo:* Nếu bạn muốn nhờ AI viết thêm tài liệu cho một chức năng mới (VD: Tích điểm Loyalty), hãy tham khảo (hoặc copy) mẫu Prompt từ thư mục này.
`;

const scratchReadme = `# Scratch (Thư Mục Nháp)

Thư mục này chỉ được dùng trong quá trình AI Agent hoạt động. Nó chứa các file kịch bản (Script) Node.js/Python tạm thời để hỗ trợ AI duyệt file, quét mã nguồn tĩnh (Static Analysis) và tự động hóa việc sinh tài liệu hàng loạt.

*Lưu ý:* Những file trong này không thuộc về mã nguồn chính của ứng dụng và có thể bị xóa/ghi đè bất cứ lúc nào.
`;

// Write them to disk
fs.writeFileSync(path.join(basePath, 'README.md'), rootReadme);
fs.writeFileSync(path.join(basePath, 'backend/README.md'), backendReadme);
fs.writeFileSync(path.join(basePath, 'frontend/README.md'), frontendReadme);
fs.writeFileSync(path.join(basePath, 'docs/README.md'), docsReadme);
fs.writeFileSync(path.join(basePath, 'specs/README.md'), specsReadme);
fs.writeFileSync(path.join(basePath, 'prompts/README.md'), promptsReadme);

const scratchPath = path.join(basePath, 'scratch');
if (!fs.existsSync(scratchPath)) fs.mkdirSync(scratchPath);
fs.writeFileSync(path.join(scratchPath, 'README.md'), scratchReadme);

console.log('Successfully generated all detailed README files!');
