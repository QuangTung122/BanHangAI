const fs = require('fs');
const path = require('path');
const basePath = path.join(__dirname, '..');

// 1. MASSIVE USER STORIES
const usSpec = `# User Stories (Đặc tả câu chuyện người dùng toàn diện)

Tài liệu này bao quát toàn bộ các luồng nghiệp vụ trong hệ thống BanHangAI dựa trên 3 vai trò: **Admin, Owner, Staff**.

## EPIC 1: Quản Trị Hệ Thống (Admin)
**US 1.1: Quản lý Tài khoản (User Management)**
- *Story:* Là Quản trị viên, tôi muốn Thêm/Sửa/Xóa/Khóa tài khoản và phân quyền (Role) để kiểm soát truy cập hệ thống.
- *Acceptance Criteria (AC):*
  - Form tạo tài khoản bắt buộc nhập Email hợp lệ, SDT.
  - Role chỉ được chọn: ADMIN, OWNER, STAFF.
  - Khi vô hiệu hóa (Deactivate), user đó lập tức bị đá (logout) khỏi mọi phiên đăng nhập (thu hồi JWT).
  - Không cho phép tự xóa tài khoản của chính mình.

**US 1.2: Cấu hình Hệ thống (System Configuration)**
- *Story:* Là Quản trị viên, tôi muốn thiết lập các tham số toàn cục (VAT, Ngôn ngữ, Thuế) để đồng bộ mọi giao dịch.
- *AC:*
  - Có màn hình danh sách tham số (Key-Value).
  - Update cấu hình phải lưu vào Audit Log (Ai sửa, lúc nào, từ giá trị A sang B).

**US 1.3: Xem Nhật ký hệ thống (Audit Logs)**
- *Story:* Là Quản trị viên, tôi muốn xem lịch sử các hành động quan trọng để truy vết khi có lỗi hoặc phá hoại.
- *AC:* 
  - Ghi nhận mọi HTTP Method (POST, PUT, DELETE) với IP và UserID tương ứng.
  - Cung cấp bộ lọc theo Date Range và User.

## EPIC 2: Phân tích & Vận hành (Owner)
**US 2.1: Xem Báo cáo Doanh thu & AI Insight (Dashboard)**
- *Story:* Là Chủ cửa hàng, tôi muốn xem Dashboard và nhận phân tích kinh doanh từ AI để ra quyết định.
- *AC:*
  - Biểu đồ đường (Line chart) cho doanh thu 7 ngày/30 ngày.
  - Danh sách Top 5 sản phẩm bán chạy/bán ế.
  - Trợ lý AI tự động sinh nhận xét dạng text (Ví dụ: "Hôm nay doanh thu giảm 10%, đề xuất đẩy mạnh quảng cáo sản phẩm X").

**US 2.2: Quản lý Dòng tiền (Cashflow)**
- *Story:* Là Chủ cửa hàng, tôi muốn theo dõi toàn bộ giao dịch Thu/Chi tự động và thủ công để chốt sổ quỹ.
- *AC:*
  - Bảng thống kê dòng tiền với 3 tab: Thu, Chi, Tiền mặt thực tế.
  - Khi Staff bán hàng bằng Cash, hệ thống tự động ghi nhận 1 phiếu "Thu".
  - Tính năng "Chốt ca": In báo cáo cuối ngày và chốt số dư đầu kỳ cho ngày mai.

**US 2.3: Quản lý Nhân sự & KPI (Staff Management)**
- *Story:* Là Chủ cửa hàng, tôi muốn xem lịch sử chấm công và doanh số của từng nhân viên.
- *AC:*
  - Xem được bảng chấm công (Check-in/out).
  - Cột tính toán tổng doanh số (Sum Total Orders) của từng nhân viên trong tháng.

**US 2.4: Quản lý Sản phẩm & Tồn kho (Product Management)**
- *Story:* Là Chủ cửa hàng, tôi muốn nhập kho và thay đổi giá bán sản phẩm.
- *AC:*
  - Form nhập hàng hỗ trợ nhập nhiều mặt hàng cùng lúc.
  - Cập nhật tồn kho (Cộng dồn vào Stock cũ). Giá vốn (MAC) tự động điều chỉnh.

## EPIC 3: Bán hàng & Dịch vụ (Staff)
**US 3.1: Màn hình Bán hàng nhanh (POS)**
- *Story:* Là Nhân viên, tôi muốn quét mã vạch và lập hóa đơn thật nhanh.
- *AC:*
  - Có thể chọn sản phẩm từ lưới (Grid) hoặc dùng máy quét mã vạch.
  - Tính tổng tiền = (Đơn giá * Số lượng) - Giảm giá.
  - Không cho phép chọn quá số lượng tồn kho hiện tại (Nếu Tồn = 2, thêm 3 sẽ báo lỗi).
  - Thanh toán xong tự in Bill và reset giỏ hàng.

**US 3.2: Tư vấn AI (Chatbot)**
- *Story:* Là Nhân viên, tôi muốn AI trả lời các câu hỏi về sản phẩm để dễ tư vấn khách.
- *AC:*
  - Nhập câu hỏi tự nhiên.
  - AI chỉ sử dụng dữ liệu tồn kho thực tế (Context) để gợi ý, nếu hết hàng phải báo hết.

**US 3.3: Chấm công (Attendance)**
- *Story:* Là Nhân viên, tôi muốn nhấn Check-in/Check-out khi tới cửa hàng.
- *AC:*
  - Hệ thống lấy thời gian thực từ server (không dùng time của máy cá nhân).
  - Giới hạn: Chỉ check-in 1 lần mỗi ca.

**US 3.4: Bán Trả góp (Installment)**
- *Story:* Là Nhân viên, tôi muốn lập hồ sơ trả góp cho khách hàng mua món đồ giá trị cao.
- *AC:*
  - Lưu hồ sơ Khách hàng (Tên, CCCD).
  - Tự động chia lịch trả nợ (Ví dụ 6 tháng, lãi suất X%). Cảnh báo nếu khách sắp tới hạn.

**US 3.5: Trả hàng / Bảo hành (Return & Warranty)**
- *Story:* Là Nhân viên, tôi muốn xử lý khách mang hàng tới đổi/trả.
- *AC:*
  - Phải nhập đúng số Hóa đơn (Bill ID) cũ.
  - Khi hoàn trả, tự động cộng lại Tồn kho và tạo Phiếu "Chi" trả lại tiền khách.

## EPIC 4: Giao tiếp Nội bộ (Common)
**US 4.1: Team Chat**
- *Story:* Là Người dùng hệ thống, tôi muốn nhắn tin trực tiếp với quản lý hoặc đồng nghiệp.
- *AC:*
  - Giao tiếp Real-time (Websocket).
  - Phân tách theo Kênh (Channel) hoặc Nhắn tin riêng (Direct Message).
  - Có tính năng thông báo (Push Notification) khi có tin nhắn mới.
`;

// 2. MASSIVE UML DIAGRAMS
const umlSpec = `# UML Diagrams Toàn Diện Hệ Thống BanHangAI

## 1. Sơ đồ Use Case Đầy Đủ
\`\`\`mermaid
flowchart TD
    %% Actors
    Admin((Quản Trị Viên\nADMIN))
    Owner((Chủ Cửa Hàng\nOWNER))
    Staff((Nhân Viên\nSTAFF))

    %% Admin Use Cases
    Admin --> UC_A1(Quản lý Tài Khoản)
    Admin --> UC_A2(Cấu hình Hệ thống)
    Admin --> UC_A3(Xem Audit Log)

    %% Owner Use Cases
    Owner --> UC_O1(Xem Báo Cáo AI & Dashboard)
    Owner --> UC_O2(Quản lý Dòng Tiền & Thu Chi)
    Owner --> UC_O3(Nhập Hàng & Tồn Kho)
    Owner --> UC_O4(Quản lý KPI Nhân viên)

    %% Staff Use Cases
    Staff --> UC_S1(Lập Hóa Đơn Bán Hàng - POS)
    Staff --> UC_S2(AI Chatbot Tư Vấn)
    Staff --> UC_S3(Lập Hồ Sơ Trả Góp)
    Staff --> UC_S4(Xử lý Đổi Trả/Bảo Hành)
    Staff --> UC_S5(Chấm Công)

    %% Common
    Admin -.-> UC_C1(Team Chat)
    Owner -.-> UC_C1
    Staff -.-> UC_C1
\`\`\`

## 2. Sequence Diagram: Luồng POS & Transaction Trừ Tồn Kho Phức Tạp
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Staff
    participant View as POSView
    participant Ctrl as StaffPOSController
    participant Model as CartModel
    participant API as orderRoutes (Backend)
    participant DB as SQLite/MySQL

    Staff->>View: Quét mã vạch SP_1
    View->>Ctrl: Emit 'ADD_TO_CART'
    Ctrl->>Model: updateCart(SP_1)
    Model-->>View: Render Lưới Giỏ hàng
    Staff->>View: Nhấn Thanh Toán
    View->>Ctrl: Emit 'CHECKOUT' (Payload)
    Ctrl->>API: POST /api/orders
    activate API
    
    API->>DB: Bắt đầu DB Transaction (BEGIN)
    
    API->>DB: INSERT INTO orders (total, user_id)
    API->>DB: SELECT stock FROM products WHERE id=SP_1 FOR UPDATE
    
    alt Tồn kho < Số lượng mua
        DB-->>API: Lỗi (Không đủ tồn)
        API->>DB: ROLLBACK Transaction
        API-->>Ctrl: HTTP 400 Bad Request
        Ctrl-->>View: Hiển thị lỗi đỏ "Hết hàng"
    else Tồn kho >= Số lượng mua
        API->>DB: INSERT INTO order_details
        API->>DB: UPDATE products SET stock = stock - qty
        API->>DB: INSERT INTO transactions (Loại: THU)
        API->>DB: COMMIT Transaction
        API-->>Ctrl: HTTP 201 Created (Kèm Mã Hóa Đơn)
        Ctrl->>Model: clearCart()
        Model-->>View: Xóa giỏ hàng
        View-->>Staff: Hiện thông báo Xanh & Lệnh In Bill
    end
    deactivate API
\`\`\`

## 3. Sequence Diagram: Luồng Hỏi Đáp Trợ Lý AI
\`\`\`mermaid
sequenceDiagram
    actor User
    participant View as ChatWidget
    participant API as aiRoutes
    participant AI as LLM (OpenAI/Gemini)
    participant DB as Database

    User->>View: "Gợi ý loa bluetooth dưới 500k"
    View->>API: POST /api/chat
    activate API
    API->>DB: SELECT * FROM products WHERE category='Loa' AND price<500k AND stock>0
    DB-->>API: Data (Danh sách sản phẩm)
    API->>API: Xây dựng System Prompt (Inject context data)
    API->>AI: Gửi Request tới OpenAI API
    AI-->>API: Trả về câu văn tư vấn (Markdown)
    API-->>View: HTTP 200 (Nội dung)
    deactivate API
    View->>User: Hiển thị câu tư vấn kèm hình ảnh
\`\`\`
`;

// 3. MASSIVE DATABASE DICTIONARY
const dbDictSpec = `# Từ Điển Dữ Liệu Chi Tiết (Database Dictionary)

Bộ tài liệu này liệt kê TOÀN BỘ cấu trúc Database đang phục vụ cho 11 Controller hiện tại của BanHangAI (Bao gồm Audit, Attendance, Installments, Warranty, Chat...).

## 1. Bảng \`users\` (Quản lý Nhân sự & Phân quyền)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã User |
| email | VARCHAR(100)| | UNIQUE, NOT NULL | Dùng để Login |
| password_hash | VARCHAR(255)| | NOT NULL | Băm bằng bcrypt |
| full_name | VARCHAR(100)| | NOT NULL | Tên hiển thị |
| role | ENUM | | 'ADMIN', 'OWNER', 'STAFF' | Phân quyền truy cập |
| is_active | BOOLEAN | | DEFAULT 1 | 0 = Khóa tài khoản |

## 2. Bảng \`products\` (Danh mục Hàng hóa)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã SP nội bộ |
| sku | VARCHAR(50)| | UNIQUE, NOT NULL | Mã vạch (Barcode) |
| name | VARCHAR(255)| | NOT NULL | Tên sản phẩm |
| import_price | DECIMAL(12,2)| | >= 0 | Giá nhập kho (Giá vốn) |
| retail_price | DECIMAL(12,2)| | >= 0 | Giá bán lẻ |
| stock_qty | INT | | DEFAULT 0 | Số lượng tồn kho thực tế |
| status | ENUM | | 'ACTIVE', 'OUT_OF_STOCK' | Trạng thái hiển thị |

## 3. Bảng \`orders\` (Hóa Đơn Tổng)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã HĐ |
| staff_id | INT | FK | -> users.id | Người lập HĐ |
| customer_name| VARCHAR(100)| | Có thể NULL | Tên khách lẻ |
| total_amount | DECIMAL(15,2)| | NOT NULL | Tổng cộng (Sau giảm giá)|
| payment_type | ENUM | | 'CASH', 'CARD', 'TRANSFER'| Hình thức thanh toán |
| created_at | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Ngày giờ bán |

## 4. Bảng \`order_details\` (Chi Tiết Hóa Đơn)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| order_id | INT | FK | -> orders.id (ON DELETE CASCADE) | Trỏ về Hóa Đơn |
| product_id | INT | FK | -> products.id | Trỏ về Sản Phẩm |
| quantity | INT | | > 0 | Số lượng mua |
| unit_price | DECIMAL(12,2)| | NOT NULL | Giá tại thời điểm chốt Bill|

## 5. Bảng \`transactions\` (Sổ Quỹ / Dòng Tiền)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã Phiếu |
| user_id | INT | FK | -> users.id | Người tạo phiếu |
| amount | DECIMAL(15,2)| | NOT NULL | Số tiền |
| trans_type | ENUM | | 'INCOME', 'EXPENSE' | Thu (INCOME) / Chi (EXPENSE) |
| reference_id | INT | | Tùy chọn | Trỏ về OrderID hoặc WarrantyID |

## 6. Bảng \`attendances\` (Chấm Công)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | Mã ca làm |
| staff_id | INT | FK | -> users.id | Người chấm công |
| check_in_time| TIMESTAMP | | NOT NULL | Giờ bắt đầu |
| check_out_time| TIMESTAMP | | NULL | Giờ kết thúc |

## 7. Bảng \`installments\` (Trả Góp)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| order_id | INT | PK, FK | -> orders.id | Áp dụng cho đơn nào |
| customer_cccd| VARCHAR(20)| | NOT NULL | Căn cước công dân |
| total_months | INT | | > 0 | Kì hạn trả góp |
| interest_rate| DECIMAL(5,2)| | Tỉ lệ % | Lãi suất |

## 8. Bảng \`audit_logs\` (Nhật ký Hệ Thống)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| user_id | INT | FK | -> users.id | Ai thao tác |
| action | VARCHAR(50)| | 'CREATE', 'UPDATE', 'DELETE' | Loại thao tác |
| table_name | VARCHAR(50)| | | Bảng bị ảnh hưởng |
| payload | JSON | | | Dữ liệu cũ/mới (Diff) |
| timestamp | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Thời gian thực hiện |

## 9. Bảng \`chat_messages\` (Team Chat)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| sender_id | INT | FK | -> users.id | Người gửi |
| receiver_id | INT | FK | -> users.id (Có thể NULL) | Người nhận (Nếu DM) |
| content | TEXT | | NOT NULL | Nội dung chat |
| created_at | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP| Thời gian gửi |

## 10. Bảng \`return_warranties\` (Bảo Hành/Đổi Trả)
| Field | Type | PK/FK | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :---: | :--- | :--- |
| id | INT | PK | AUTO_INCREMENT | |
| order_id | INT | FK | -> orders.id | Hóa đơn gốc |
| product_id | INT | FK | -> products.id | SP bị lỗi |
| return_type | ENUM | | 'WARRANTY', 'REFUND' | Bảo hành hoặc Đổi trả tiền |
| status | ENUM | | 'PENDING', 'RESOLVED' | Trạng thái xử lý |
`;

fs.writeFileSync(path.join(basePath, 'specs/requirements/user_stories.md'), usSpec);
fs.writeFileSync(path.join(basePath, 'specs/requirements/uml_diagrams.md'), umlSpec);
fs.writeFileSync(path.join(basePath, 'specs/requirements/database_dictionary.md'), dbDictSpec);

console.log('Successfully generated EXHAUSTIVE Analysis docs covering all 11 modules!');
