# Thiết kế Hệ thống và Thiết kế Hướng đối tượng (System & OOD)

Tài liệu này đặc tả kiến trúc phần mềm, mô hình dữ liệu, sơ đồ tuần tự và danh sách các API cho dự án **Hệ thống Quản lý Bán hàng Tích hợp AI**. Tài liệu bám sát yêu cầu nghiệp vụ từ SRS/Phân tích yêu cầu và tuân thủ các quy chuẩn trong `ANTIGRAVITY.md`.

---

## 1. Kiến trúc tổng thể hệ thống (Architecture Overview)

Hệ thống được thiết kế theo mô hình **3 Tầng (3-Tier Architecture)** phân tách rõ ràng trách nhiệm của giao diện, xử lý logic và lưu trữ dữ liệu/mô hình AI:

- **Client Tier (Presentation Layer):** Được xây dựng bằng HTML5, Tailwind CSS và Vanilla JS, đảm nhiệm hiển thị giao diện và tương tác người dùng, gọi API thông qua Fetch/AJAX.
- **Application/API Tier (Business Logic Layer):** Xây dựng trên nền tảng **FastAPI** (Python), cung cấp các API RESTful bất đồng bộ (async). Bao gồm Routers, Middleware (Xác thực, phân quyền) và Business Services.
- **Data & AI Tier:** Sử dụng **SQLite** cho việc lưu trữ dữ liệu quan hệ (Người dùng, Sản phẩm, Hóa đơn). Tích hợp module AI gọi đến local LLM (**Ollama**) xử lý các tác vụ RAG và sinh văn bản tự nhiên.

### Sơ đồ Khối Kiến trúc (COMP-001)

```plantuml
@startuml
package "Client Tier - Frontend" {
  [Web UI (HTML/Tailwind)] as UI
  [Vanilla JS / Fetch API] as JS
}

package "Application Tier - FastAPI" {
  [FastAPI Routers] as Router
  [Auth & Middleware] as Middleware
  [Business Services] as Service
}

package "Data & AI Tier" {
  database "SQLite Database" as DB
  node "Local LLM - Ollama" as Ollama
}

UI --> JS : DOM Events
JS --> Router : HTTP REST/SSE
Router --> Middleware
Router --> Service
Service --> DB : CRUD / SQLAlchemy
Service --> Ollama : Prompt/Query (API)
@enduml
```

---

## 2. Mô hình hóa Use Case (Use Case Diagrams)

Phân rã chức năng theo các Actor chính tương tác với hệ thống.

```plantuml
@startuml
left to right direction
actor "Khách hàng" as Cust
actor "Nhân viên bán hàng" as NV
actor "Quản trị viên" as Admin
actor "Trợ lý AI" as AI

package "Hệ thống Bán hàng AI" {
  usecase "Tạo Hóa đơn/Đặt hàng" as UC1
  usecase "Tư vấn Sản phẩm" as UC2
  usecase "Quản lý Sản phẩm" as UC3
  usecase "Thống kê Doanh thu" as UC4
  usecase "Nhận xét Doanh thu AI" as UC5
  usecase "Kiểm tra Tồn kho" as UC6
}

Cust --> UC1
Cust --> UC2
NV --> UC1
NV --> UC2
NV --> UC4
Admin --> UC3
Admin --> UC4

UC2 .> AI : <<include>>
UC5 .> AI : <<include>>
UC5 .> UC4 : <<extend>>
UC1 .> UC6 : <<include>>
@enduml
```

### Chi tiết các Use Case chính

1. **UC1 - Tạo Hóa đơn/Đặt hàng:** Khách hàng (hoặc nhân viên bán hàng làm thay khách) thao tác chọn sản phẩm vào giỏ hàng, tính tổng tiền, áp dụng các mã giảm giá và hoàn tất thanh toán. Quá trình này bắt buộc phải gọi hệ thống con để kiểm tra số lượng tồn kho (`<<include>> UC6`).
2. **UC2 - Tư vấn Sản phẩm:** Người dùng (Khách hàng, Nhân viên) sử dụng chatbot để tra cứu thông tin hàng hóa, hỏi đáp cấu hình. Use Case này gọi hệ thống AI (`<<include>> Trợ lý AI`) để tiếp nhận tin nhắn, truy xuất CSDL và sinh ra câu trả lời bằng ngôn ngữ tự nhiên.
3. **UC3 - Quản lý Sản phẩm:** Cho phép Quản trị viên (Admin) thực hiện thao tác CRUD (thêm, sửa, xóa, cập nhật tồn kho, thay đổi trạng thái) đối với danh sách sản phẩm.
4. **UC4 - Thống kê Doanh thu:** Admin hoặc Chủ cửa hàng/Nhân viên (có quyền) xem được báo cáo số liệu, biểu đồ doanh thu theo khoảng thời gian và danh sách các sản phẩm bán chạy nhất.
5. **UC5 - Nhận xét Doanh thu AI:** Là chức năng mở rộng (`<<extend>>`) từ UC4. Khi đang xem báo cáo, người dùng có thể kích hoạt tính năng nhờ AI tóm tắt, phân tích và đưa ra đánh giá, nhận xét tình hình kinh doanh dựa vào số liệu hiện có.
6. **UC6 - Kiểm tra Tồn kho:** Use Case hệ thống, chạy ngầm, đối chiếu số lượng đặt hàng với số lượng thực tế trong CSDL để quyết định cho phép thanh toán hay không.

---

## 3. Thiết kế Sơ đồ Lớp (Class Diagram)

Thiết kế này (`CLS-001`) phản ánh cấu trúc Models (SQLAlchemy entities), Schemas (Pydantic DTOs) và Services xử lý logic.

```plantuml
@startuml
class User {
  +Integer id
  +String username
  +String password_hash
  +String full_name
  +String email
  +String phone
  +String role
  +DateTime created_at
}

class Category {
  +Integer id
  +String name
  +String slug
  +String description
  +Boolean is_active
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
  +Boolean is_active
  +DateTime created_at
}

class Order {
  +Integer id
  +Integer user_id
  +Float total_amount
  +String customer_name
  +String customer_phone
  +String shipping_address
  +String status
  +DateTime created_at
}

class OrderItem {
  +Integer id
  +Integer order_id
  +Integer product_id
  +Integer quantity
  +Float unit_price
  +Float subtotal
}

class ChatSession {
  +Integer id
  +Integer user_id
  +String session_id
  +DateTime created_at
}

class ChatMessage {
  +Integer id
  +Integer session_id
  +String sender
  +String message_content
  +DateTime timestamp
}

User "1" -- "0..*" Order : places >
Order "1" *-- "1..*" OrderItem : contains >
Product "1" -- "0..*" OrderItem : included in >
Category "1" -- "0..*" Product : has >
User "1" -- "0..*" ChatSession : has >
ChatSession "1" *-- "0..*" ChatMessage : contains >

class AuthService {
  +authenticate_user(username, password)
  +create_token(user_id)
}

class ProductService {
  +get_all_products()
  +create_product(product_data)
  +update_stock(product_id, qty)
}

class OrderService {
  +create_order(cart_items)
  +calculate_total()
}

class AIService {
  +generate_chat_response(prompt, context)
  +analyze_revenue(revenue_data)
}
@enduml
```

---

## 4. Thiết kế Sơ đồ Tuần tự (Sequence Diagrams)

### 4.1. Luồng Tư vấn AI & Gợi ý sản phẩm (SEQ-001)

Mô tả kịch bản khi người dùng đặt câu hỏi tìm kiếm sản phẩm với AI.

```plantuml
@startuml
actor "Khách hàng/Nhân viên" as User
participant "Frontend JS" as UI
participant "FastAPI Router" as API
participant "AIService" as Svc
database "SQLite DB" as DB
participant "Ollama Local" as LLM

User -> UI: Gửi tin nhắn (VD: "Tìm tai nghe dưới 500k")
UI -> API: POST /api/ai/chat {message}
API -> Svc: process_chat(message)
Svc -> DB: Query sản phẩm liên quan (Theo keyword/giá)
DB --> Svc: Trả về context (Danh sách sản phẩm)
Svc -> LLM: Gửi Prompt (System Prompt + Context + Message)
LLM --> Svc: Streaming / JSON Response (Gợi ý)
Svc --> API: Response Result
API --> UI: Trả về kết quả
UI --> User: Hiển thị phản hồi của AI
@enduml
```

### 4.2. Luồng Thêm vào giỏ hàng & Đặt hàng (SEQ-002)

Mô tả kịch bản lập hóa đơn/thanh toán có tính toán tồn kho.

```plantuml
@startuml
actor "Khách/Nhân viên" as User
participant "Cart JS" as Cart
participant "FastAPI Router" as API
participant "OrderService" as Svc
database "SQLite DB" as DB

User -> Cart: Bấm "Thanh toán"
Cart -> API: POST /api/orders {cart_items}
API -> Svc: create_order(cart_items)

loop Từng mặt hàng trong đơn
    Svc -> DB: Check tồn kho (Product.stock)
    alt Hết hàng hoặc không đủ
        DB --> Svc: Báo lỗi số lượng
        Svc --> API: Raise 400 Bad Request
        API --> Cart: Lỗi (Out of stock)
    else Đủ hàng
        DB --> Svc: Hợp lệ
    end
end

Svc -> DB: Lưu Order, OrderItems & Trừ tồn kho Product
DB --> Svc: Lưu thành công
Svc --> API: 201 Created (Order ID)
API --> Cart: Thanh toán thành công
Cart --> User: Thông báo hoàn tất
@enduml
```

### 4.3. Luồng Quản trị thêm mới sản phẩm (SEQ-003)

```plantuml
@startuml
actor "Quản trị viên" as Admin
participant "Admin UI" as UI
participant "FastAPI Router" as API
participant "ProductService" as Svc
database "SQLite DB" as DB

Admin -> UI: Điền thông tin sản phẩm và Lưu
UI -> API: POST /api/products {ProductCreate}
API -> Svc: validate_and_create(ProductCreate)
Svc -> DB: Kiểm tra tính hợp lệ (vd trùng tên/mã)
alt Lỗi validate (Đã tồn tại)
    DB --> Svc: Đã tồn tại
    Svc --> API: Raise 400 Bad Request
    API --> UI: Cảnh báo lỗi
else Hợp lệ
    Svc -> DB: Insert Product mới
    DB --> Svc: Success, trả về Product Info
    Svc --> API: Trả về ProductResponse
    API --> UI: 201 Created
    UI --> Admin: Hiển thị sản phẩm trên danh sách
end
@enduml
```

---

## 5. Đặc tả Giao diện API (RESTful API Specifications)

Dưới đây là danh sách đặc tả các REST API (`API-001` đến `API-009`) giao tiếp giữa Client và Server.

| ID          | Method | Endpoint                    | Mô tả chức năng                         | Request Body / Params              | Response Code | Yêu cầu (Trace) |
| ----------- | ------ | --------------------------- | ------------------------------------------- | ---------------------------------- | ------------- | ----------------- |
| `API-001` | POST   | `/api/auth/login`         | Xác thực đăng nhập, cấp JWT Token     | `{username, password}`           | 200, 401      | REQ-F-004         |
| `API-002` | GET    | `/api/products`           | Lấy danh sách sản phẩm, tồn kho        | `?category=`, `?search=`       | 200           | REQ-F-001         |
| `API-003` | GET    | `/api/products/{id}`      | Lấy chi tiết thông tin 1 sản phẩm      | `{id}` (Path)                    | 200, 404      | REQ-F-001         |
| `API-004` | POST   | `/api/products`           | Thêm mới một sản phẩm (Require: Admin Role)| `{name, price, stock, category}` | 201, 400      | REQ-F-001         |
| `API-005` | PUT    | `/api/products/{id}`      | Cập nhật sản phẩm (Require: Admin Role) | `{price, stock, status}`         | 200, 404      | REQ-F-001         |
| `API-006` | POST   | `/api/orders`             | Tạo hóa đơn bán hàng (Thanh toán)    | `[{product_id, qty}]`            | 201, 400      | REQ-F-002         |
| `API-007` | GET    | `/api/reports/revenue`    | Thống kê doanh thu, bán chạy            | `?start_date=`, `?end_date=`   | 200           | REQ-F-003         |
| `API-008` | POST   | `/api/ai/chat`            | Trợ lý Chatbot tư vấn sản phẩm        | `{message, session_id}`          | 200, 500      | REQ-AI-002        |
| `API-009` | POST   | `/api/ai/analyze-revenue` | AI đọc và nhận xét dữ liệu doanh thu | `{revenue_data}`                 | 200, 500      | REQ-AI-001        |
| `API-010` | PUT    | `/api/config`             | Cập nhật cấu hình hệ thống (Require: Admin Role) | `{settings}`                  | 200, 403      | REQ-F-006         |
