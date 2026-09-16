const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

// 1. User Stories
const usPrompt = `# Prompt: Đặc tả User Stories

**Vai trò AI:** Business Analyst (BA) / Product Owner.
**Yêu cầu:** Viết danh sách User Stories cho hệ thống BanHangAI dựa trên các vai trò Admin, Owner, Staff. Bao gồm Epic, User Story và Acceptance Criteria.
**Đầu ra:** Lưu vào \`specs/requirements/user_stories.md\`.`;

const usSpec = `# User Stories (Đặc tả câu chuyện người dùng)

## Epic 1: Bán hàng và Lập hóa đơn (Staff)
**User Story 1.1:** Là Nhân viên bán hàng, tôi muốn quét mã vạch hoặc tìm kiếm sản phẩm nhanh chóng, để đưa vào giỏ hàng mà không mất nhiều thời gian.
- *Acceptance Criteria:* 
  - Ô tìm kiếm trả về kết quả dưới 300ms.
  - Hỗ trợ thiết bị máy quét mã vạch (tự động enter).
  - Không cho phép thêm sản phẩm có tồn kho = 0.

**User Story 1.2:** Là Nhân viên bán hàng, tôi muốn hỏi AI tư vấn khi khách yêu cầu, để gợi ý đúng sản phẩm đang có sẵn trong kho.
- *Acceptance Criteria:*
  - Cửa sổ chat AI tích hợp ngay màn hình POS.
  - AI chỉ tư vấn các mặt hàng đang có trạng thái "ACTIVE" và Tồn > 0.

## Epic 2: Quản trị và Thống kê (Owner)
**User Story 2.1:** Là Chủ cửa hàng, tôi muốn xem báo cáo doanh thu do AI tổng hợp mỗi ngày, để nắm bắt tình hình kinh doanh ngay lập tức.
- *Acceptance Criteria:*
  - Báo cáo phải cập nhật realtime.
  - Đưa ra ít nhất 1 lời khuyên nhập/xuất hàng dựa vào top sản phẩm bán chạy.
`;

// 2. UML Diagrams
const umlPrompt = `# Prompt: Phân tích và Vẽ UML Diagrams

**Vai trò AI:** Systems Analyst.
**Yêu cầu:** Vẽ Use Case Diagram tổng quan và Sequence Diagram cho quy trình Bán hàng & Trừ tồn kho bằng Mermaid JS.
**Đầu ra:** Lưu vào \`specs/requirements/uml_diagrams.md\`.`;

const umlSpec = `# UML Diagrams (Sơ đồ nghiệp vụ hệ thống)

## 1. Use Case Diagram (Tổng quan)
\`\`\`mermaid
flowchart LR
    Staff((Staff))
    Owner((Owner))
    Admin((Admin))
    
    Staff --> (Lập Hóa Đơn)
    Staff --> (Tra cứu Sản Phẩm)
    Staff --> (Dùng AI Tư Vấn)
    
    Owner --> (Xem Báo Cáo AI)
    Owner --> (Quản lý Sổ Quỹ)
    Owner --> (Quản lý Hàng Hóa)
    
    Admin --> (Quản lý User)
    Admin --> (Cấu hình Hệ Thống)
\`\`\`

## 2. Sequence Diagram (Luồng Thanh toán & Trừ tồn kho)
\`\`\`mermaid
sequenceDiagram
    actor Staff
    participant POS as View (POS)
    participant Ctrl as OrderController
    participant DB as Database (Transaction)

    Staff->>POS: Nhấn "Thanh toán"
    POS->>Ctrl: POST /api/orders (cart_items)
    activate Ctrl
    Ctrl->>DB: Bắt đầu Transaction (BEGIN)
    activate DB
    DB-->>Ctrl: OK
    Ctrl->>DB: INSERT hóa đơn
    Ctrl->>DB: UPDATE trừ tồn kho (từng sản phẩm)
    alt Tồn kho < 0
        DB-->>Ctrl: Lỗi (Out of stock)
        Ctrl->>DB: ROLLBACK
        Ctrl-->>POS: Lỗi HTTP 400
    else Tồn kho hợp lệ
        DB-->>Ctrl: Thành công
        Ctrl->>DB: COMMIT
        Ctrl-->>POS: Thành công HTTP 201
    end
    deactivate DB
    deactivate Ctrl
    POS->>Staff: Hiển thị thông báo & In Bill
\`\`\`
`;

// 3. Database Dictionary
const dbDictPrompt = `# Prompt: Từ điển Dữ liệu (Database Dictionary)

**Vai trò AI:** Database Architect / BA.
**Yêu cầu:** Viết từ điển dữ liệu (Data Dictionary) định nghĩa chi tiết các trường, kiểu dữ liệu, ràng buộc của các bảng cốt lõi (Users, Products, Orders, Order_Details).
**Đầu ra:** Lưu vào \`specs/requirements/database_dictionary.md\`.`;

const dbDictSpec = `# Database Dictionary (Từ điển dữ liệu)

## 1. Bảng \`Users\` (Người dùng hệ thống)
Lưu trữ thông tin đăng nhập và phân quyền của nhân viên/quản lý.

| Tên trường (Column) | Kiểu dữ liệu | Primary Key | Foreign Key | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :---: | :---: | :--- | :--- |
| \`id\` | INT | Yes | No | AUTO_INCREMENT | Mã định danh User |
| \`username\` | VARCHAR(50) | No | No | UNIQUE, NOT NULL | Tên đăng nhập |
| \`password_hash\`| VARCHAR(255)| No | No | NOT NULL | Mật khẩu đã băm (bcrypt) |
| \`role\` | ENUM | No | No | DEFAULT 'STAFF' | Quyền: 'ADMIN', 'OWNER', 'STAFF'|
| \`status\` | BOOLEAN | No | No | DEFAULT 1 | 1: Hoạt động, 0: Vô hiệu hóa |

## 2. Bảng \`Products\` (Danh mục Sản phẩm)

| Tên trường (Column) | Kiểu dữ liệu | Primary Key | Foreign Key | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :---: | :---: | :--- | :--- |
| \`id\` | INT | Yes | No | AUTO_INCREMENT | Mã sản phẩm nội bộ |
| \`sku\` | VARCHAR(50) | No | No | UNIQUE, NOT NULL | Mã vạch / Mã tra cứu (SKU) |
| \`name\` | VARCHAR(255)| No | No | NOT NULL | Tên sản phẩm hiển thị |
| \`price\` | DECIMAL(10,2)|No | No | >= 0 | Giá bán tới tay khách hàng |
| \`stock\` | INT | No | No | DEFAULT 0 | Số lượng tồn kho thực tế |

## 3. Bảng \`Orders\` (Hóa đơn)

| Tên trường (Column) | Kiểu dữ liệu | Primary Key | Foreign Key | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :---: | :---: | :--- | :--- |
| \`id\` | INT | Yes | No | AUTO_INCREMENT | Mã hóa đơn |
| \`user_id\` | INT | No | \`Users.id\`| NOT NULL | Nhân viên tạo hóa đơn |
| \`total_amount\`| DECIMAL(12,2)|No | No | >= 0 | Tổng số tiền khách phải trả |
| \`created_at\` | DATETIME | No | No | DEFAULT NOW() | Thời gian lập hóa đơn |
`;

fs.writeFileSync(path.join(basePath, 'prompts/analysis/user_stories.md'), usPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/analysis/uml_diagrams.md'), umlPrompt);
fs.writeFileSync(path.join(basePath, 'prompts/analysis/database_dictionary.md'), dbDictPrompt);

fs.writeFileSync(path.join(basePath, 'specs/requirements/user_stories.md'), usSpec);
fs.writeFileSync(path.join(basePath, 'specs/requirements/uml_diagrams.md'), umlSpec);
fs.writeFileSync(path.join(basePath, 'specs/requirements/database_dictionary.md'), dbDictSpec);

console.log('Successfully generated BA analysis docs in prompts/analysis and specs/requirements!');
