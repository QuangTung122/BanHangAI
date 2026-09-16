const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

const dirs = [
  'prompts/analysis', 'specs/requirements',
  'prompts/design', 'specs/design',
  'prompts/development', 'specs/development',
  'prompts/documentation', 'specs/documentation'
];
dirs.forEach(d => {
  const p = path.join(basePath, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 1. ERD (Design)
const erdPrompt = "# Prompt: System Architecture & ERD\n" +
"**Vai trò AI:** Database Architect.\n" +
"**Yêu cầu:** Vẽ Sơ đồ quan hệ thực thể (ERD) bằng cú pháp Mermaid JS cho hệ thống BanHangAI.\n" +
"**Đầu ra:** Lưu vào `specs/design/system_erd.md`.";

const erdSpec = "# System Architecture & Database ERD\n\n" +
"## 1. Sơ đồ Quan hệ Thực thể (ERD)\n" +
"```mermaid\n" +
"erDiagram\n" +
"    USERS ||--o{ ORDERS : \"places\"\n" +
"    PRODUCTS ||--o{ ORDER_DETAILS : \"included in\"\n" +
"    ORDERS ||--|{ ORDER_DETAILS : \"contains\"\n" +
"```\n\n" +
"## 2. Giải thích kiến trúc\n" +
"- Database cốt lõi thiết kế theo chuẩn chuẩn hóa (3NF).\n";

// 2. API Swagger (Development)
const apiPrompt = "# Prompt: Tổng hợp API Swagger (OpenAPI)\n" +
"**Vai trò AI:** Backend Tech Lead.\n" +
"**Yêu cầu:** Viết file đặc tả OpenAPI 3.0.\n" +
"**Đầu ra:** Lưu vào `specs/development/api_swagger.md`.";

const apiSpec = "# API Documentation (OpenAPI / Swagger)\n\n" +
"```yaml\n" +
"openapi: 3.0.0\n" +
"info:\n" +
"  title: BanHangAI Core API\n" +
"  version: 1.0.0\n" +
"paths:\n" +
"  /api/auth/login:\n" +
"    post:\n" +
"      summary: Đăng nhập hệ thống\n" +
"```\n";

// 3. Deployment Guide (Development)
const deployPrompt = "# Prompt: Deployment & DevOps Guide\n" +
"**Vai trò AI:** DevOps Engineer.\n" +
"**Yêu cầu:** Viết hướng dẫn cấu hình và triển khai hệ thống.\n" +
"**Đầu ra:** Lưu vào `specs/development/deployment_guide.md`.";

const deploySpec = "# Deployment & DevOps Guide\n\n" +
"## 1. Yêu cầu Môi trường (Environment Variables)\n" +
"Tạo file `.env` tại thư mục gốc.\n\n" +
"## 2. Khởi chạy bằng Docker Compose\n" +
"```bash\n" +
"docker-compose up -d --build\n" +
"```\n";

// 4. Non-Functional (Analysis)
const nfrPrompt = "# Prompt: Đặc tả Yêu cầu Phi Chức Năng (Non-Functional Requirements)\n" +
"**Vai trò AI:** System Analyst.\n" +
"**Yêu cầu:** Viết tài liệu đặc tả NFR.\n" +
"**Đầu ra:** Lưu vào `specs/requirements/non_functional.md`.";

const nfrSpec = "# Yêu cầu Phi chức năng (NFRs)\n\n" +
"## 1. Bảo mật (Security)\n" +
"- API Key không được lưu ở Frontend.\n\n" +
"## 2. Hiệu năng (Performance)\n" +
"- API thông thường phải phản hồi dưới 200ms.\n";

// 5. User Manual (Documentation)
const manualPrompt = "# Prompt: Hướng Dẫn Sử Dụng (User Manual)\n" +
"**Vai trò AI:** Technical Writer.\n" +
"**Yêu cầu:** Viết tài liệu hướng dẫn sử dụng nhanh.\n" +
"**Đầu ra:** Lưu vào `specs/documentation/user_manual.md`.";

const manualSpec = "# Sổ tay Hướng dẫn Sử dụng (User Manual)\n\n" +
"Chào mừng bạn đến với Hệ thống Quản lý Bán hàng BanHangAI!\n\n" +
"## 1. Hướng dẫn cho Nhân viên (Staff)\n" +
"- Sử dụng AI Tư Vấn để hỏi thông tin sản phẩm.\n\n" +
"## 2. Hướng dẫn cho Chủ Cửa Hàng (Owner)\n" +
"- Xem báo cáo sinh tự động hàng ngày.\n";

fs.writeFileSync(path.join(basePath, 'prompts/design/system_erd.md'), erdPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/development/api_swagger.md'), apiPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/development/deployment_guide.md'), deployPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/analysis/non_functional.md'), nfrPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/documentation/user_manual.md'), manualPrompt);

fs.writeFileSync(path.join(basePath, 'specs/design/system_erd.md'), erdSpec);
fs.writeFileSync(path.join(basePath, 'specs/development/api_swagger.md'), apiSpec);
fs.writeFileSync(path.join(basePath, 'specs/development/deployment_guide.md'), deploySpec);
fs.writeFileSync(path.join(basePath, 'specs/requirements/non_functional.md'), nfrSpec);
fs.writeFileSync(path.join(basePath, 'specs/documentation/user_manual.md'), manualSpec);

console.log('Successfully generated global prompts and specs!');
