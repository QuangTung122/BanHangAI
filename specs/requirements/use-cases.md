# Danh sách Use Case và Yêu cầu hệ thống - Dựa trên Thực tế

## 1. Danh sách Actor và mô tả

- **Quản trị viên (Admin):** Người cao nhất, quản lý tài khoản, phân quyền và cấu hình hệ thống (kết nối AI Ollama).
- **Chủ cửa hàng (Owner):** Người theo dõi doanh thu (Dashboard), quản lý sản phẩm, nhân sự và sử dụng AI Insight.
- **Nhân viên bán hàng (Staff):** Thao tác bán hàng (POS), chấm công, xem lịch sử đơn hàng, xử lý trả góp.
- **Khách hàng (Customer):** Khách mua hàng, xem trang chủ, dùng thử Demo Chat.

## 2. Danh sách Use Case

**Nhóm Quản trị viên (Admin)**

- Đăng nhập/Đăng xuất
- Quản lý người dùng và phân quyền (AdminUser)
- Cấu hình hệ thống và AI (AdminSystem)

**Nhóm Chủ cửa hàng (Owner)**

- Xem Dashboard thống kê và phân tích AI (OwnerDashboard)
- Quản lý Dòng tiền / Doanh thu (OwnerCashflow)
- Quản lý Sản phẩm (Thêm/Sửa/Xóa/Giá) (OwnerProduct)
- Quản lý Nhân sự (OwnerStaff)

**Nhóm Nhân viên (Staff)**

- Chấm công (StaffAttendance)
- Tra cứu Sản phẩm (StaffProduct)
- Lập Đơn hàng - POS (StaffPOS)
- Xử lý Thanh toán Trả góp (StaffInstallment)
- Xem Lịch sử Đơn hàng (StaffOrderHistory)


## 3. Biểu đồ Use Case tổng quát (Mermaid)

```mermaid
usecaseDiagram
    actor "Admin" as Ad
    actor "Chủ cửa hàng" as Ow
    actor "Nhân viên" as St
    actor "Khách hàng" as Cu

    usecase "Cấu hình Hệ thống/AI" as CFG
    usecase "Quản lý Người dùng" as QLND
    Ad --> CFG
    Ad --> QLND

    usecase "Xem Dashboard & AI Insight" as DB
    usecase "Quản lý Sản phẩm" as QLSP
    Ow --> DB
    Ow --> QLSP

    usecase "Bán hàng POS" as POS
    usecase "Chấm công" as CC
    usecase "Xử lý Trả góp" as TG
    St --> POS
    St --> CC
    St --> TG

    usecase "Chat AI Tư vấn" as AI
    Cu --> AI
    St --> AI
```

## 4. Yêu cầu chức năng

- **Bán hàng & Trả góp:** Cho phép lập đơn hàng với nhiều sản phẩm, ghi nhận thông tin khách hàng, chọn hình thức thanh toán (Tiền mặt/CK) hoặc hồ sơ trả góp.
- **Quản lý AI:** Hệ thống kết nối được với Ollama để cung cấp dịch vụ Chatbot thông minh trên Landing Page và Phân tích Insight cho màn hình Chủ cửa hàng.
- **Bảo mật:** Phân quyền theo Role. Nhân viên không vào được màn hình của Owner/Admin và ngược lại.

## 5. Yêu cầu phi chức năng

- Ứng dụng Single Page Application (SPA) cho trải nghiệm mượt mà không load trang.
- Lưu trữ chat session để AI nhớ được câu chuyện.
