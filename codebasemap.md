# Cấu trúc hệ thống (Codebase Map) - BanHangAI

Tài liệu này ánh xạ toàn bộ cấu trúc thư mục chuẩn mực của dự án BanHangAI, bao gồm cấu trúc Backend hiện tại và kiến trúc Frontend theo mô hình MVC tiêu chuẩn đã được phân tích.

## 1. Kiến trúc Tổng thể (Monorepo)

```text
BanHangAI/
├── backend/                # Mã nguồn Node.js/Express Server
├── frontend/               # Mã nguồn Giao diện Vanilla JS MVC
├── database/               # (Thường nằm trong backend) File SQLite và Script DB
└── (Các file tài liệu .md)
```

## 2. Cấu trúc Backend (Node.js & SQLite)

Hệ thống backend sử dụng kiến trúc phân tầng (Layered Architecture) theo chuẩn MVC để dễ dàng bảo trì và mở rộng:

```text
backend/
├── database/               # Thư mục chứa dữ liệu và cấu trúc DB
│   ├── ecom_ai.db          # File cơ sở dữ liệu SQLite
│   └── init.sql            # Script khởi tạo bảng
├── environments/           # Cấu hình môi trường
├── src/                    # Chứa toàn bộ mã nguồn chính của Backend
│   ├── controllers/        # Xử lý logic request/response cho từng nghiệp vụ
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── systemController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── routes/             # Định nghĩa endpoints API và map với controllers
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── systemRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/        # Chứa các middleware (auth, validate, error handler)
│   │   └── authMiddleware.js
│   └── services/           # (Tùy chọn) Chứa logic nghiệp vụ lõi, kết nối DB
├── node_modules/           # Thư viện tải từ npm
├── *.cjs / *.js            # Các script tiện ích/kiểm thử/migration (VD: migrate_transactions.cjs, seed.js...)
├── package.json            # Thông tin dependencies của backend
└── server.js               # ĐIỂM VÀO CHÍNH: Khởi tạo Express app, nạp middlewares và nạp Routes
```

*Lưu ý:* Mã nguồn API đã được tách thành các module riêng biệt trong `src/`. File `server.js` giờ đây chỉ đóng vai trò khởi tạo (Bootstrap), không chứa logic API trực tiếp.

## 3. Cấu trúc Frontend chuẩn MVC (Đích đến / Target Architecture)

Đây là cấu trúc Frontend Vanilla JS tiêu chuẩn được thiết kế riêng cho dự án BanHangAI, giúp chia tách rõ ràng giữa Dữ liệu, Giao diện và Đường truyền mạng:

```text
frontend/
├── assets/                 # Tài nguyên tĩnh
│   ├── css/                # CSS bổ sung, ghi đè Tailwind
│   ├── images/             # Hình ảnh (banner, avatar)
│   └── js/                 # Thư viện third-party tải tay (nếu có)
├── src/
│   ├── core/               # Lõi dùng chung toàn app
│   │   ├── ApiClient.js    # Lớp cơ sở xử lý fetch(), cấu hình headers (token), bắt lỗi toàn cục
│   │   ├── EventEmitter.js # Cơ chế pub/sub liên lạc lỏng lẻo giữa các Controllers
│   │   └── Formatters.js   # Tiện ích format tiền, ngày tháng, sanitize HTML
│   │
│   ├── services/           # Lớp Giao tiếp Mạng (Ánh xạ 1-1 với API Backend)
│   │   ├── AttendanceService.js
│   │   ├── AuthService.js     
│   │   ├── ChatService.js     
│   │   ├── DashboardService.js
│   │   ├── NotificationService.js
│   │   ├── OrderService.js    
│   │   ├── ProductService.js  
│   │   ├── SystemService.js   
│   │   ├── TransactionService.js
│   │   └── UserService.js     
│   │
│   ├── models/             # Quản lý Trạng thái & Logic Nghiệp vụ nội bộ (Không gọi thẳng API)
│   │   ├── AuthModel.js       
│   │   ├── CartModel.js       
│   │   ├── NotificationModel.js
│   │   ├── OrderModel.js
│   │   ├── ProductModel.js
│   │   ├── SystemModel.js
│   │   └── UserModel.js
│   │
│   ├── views/              # Chuyên tạo HTML (Template Literals) & Lắng nghe DOM Events
│   │   ├── components/     # UI Component tái sử dụng
│   │   ├── layouts/    
│   │   │   ├── ChatModule.js  
│   │   │   └── LayoutView.js  
│   │   └── pages/          # Giao diện chính của từng Role
│   │       ├── AdminSystemView.js
│   │       ├── AdminUserView.js
│   │       ├── AuthView.js  
│   │       ├── OwnerCashflowView.js
│   │       ├── OwnerDashboardView.js
│   │       ├── OwnerProductView.js
│   │       ├── OwnerStaffView.js
│   │       ├── StaffAttendanceView.js
│   │       ├── StaffInstallmentView.js
│   │       ├── StaffOrderHistoryView.js
│   │       ├── StaffPOSView.js
│   │       └── StaffProductView.js
│   │
│   ├── controllers/        # Nhạc trưởng: Bắt sự kiện View -> Ra lệnh Model -> Vẽ lại View
│   │   ├── AdminSystemController.js
│   │   ├── AdminUserController.js
│   │   ├── AuthController.js  
│   │   ├── ChatController.js  
│   │   ├── LayoutController.js
│   │   ├── OwnerCashflowController.js
│   │   ├── OwnerDashboardController.js
│   │   ├── OwnerProductController.js
│   │   ├── OwnerStaffController.js
│   │   ├── StaffAttendanceController.js
│   │   ├── StaffInstallmentController.js
│   │   ├── StaffOrderHistoryController.js
│   │   ├── StaffPOSController.js
│   │   └── StaffProductController.js
│   │
│   └── app.js              # Entry Point: Khởi động hệ thống, boot ApiClient, định tuyến ban đầu
└── index.html              # HTML Root file duy nhất
```

## 4. Các Quy tắc Thiết kế Cốt lõi (MVC Rules)

1. **Views:** Bị "mù" về logic nghiệp vụ. Chỉ tạo HTML và gửi tín hiệu (`Events`) cho Controllers. Không tự thao tác tính toán.
2. **Controllers:** Lắng nghe tín hiệu từ Views. Điều phối Models cập nhật dữ liệu. Cuối cùng ra lệnh Views vẽ lại thay đổi.
3. **Models:** Trái tim dữ liệu. Chứa logic tính toán phức tạp (như lãi suất, chiết khấu). Nơi gọi các hàm lấy data từ Services. Không được phép đụng vào `document.getElementById` (DOM).
4. **Services:** Đơn thuần là cánh tay vươn ra giao tiếp với Backend qua mạng. Trả về raw data (JSON), không lưu trữ trạng thái.
