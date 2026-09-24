# Cấu trúc hệ thống (Codebase Map) - BanHangAI

Tài liệu này ánh xạ toàn bộ cấu trúc thư mục chuẩn mực của dự án **BanHangAI**, bao gồm kiến trúc Backend Node.js/Express phân tầng và kiến trúc Frontend theo mô hình MVC tiêu chuẩn.

---

## 1. Kiến trúc Tổng thể (Monorepo)

**CẢNH BÁO KỶ LUẬT:** Mọi thành viên TUYỆT ĐỐI KHÔNG tự ý tạo thêm thư mục hoặc file lung tung ở thư mục gốc hoặc các thư mục mã nguồn. Mọi thay đổi cấu trúc phải tuân thủ nghiêm ngặt bản đồ dưới đây. Bất kỳ file nháp, script chạy thử nghiệm nào đều phải được tạo và lưu trữ trong thư mục `scratch/`.

```text
BanHangAI/
├── backend/                # Mã nguồn Node.js/Express Server (theo chuẩn phân tầng)
├── frontend/               # Mã nguồn Giao diện Vanilla JS MVC (SPA không dùng bundler)
├── docs/                   # Chứa các tài liệu hướng dẫn, tài liệu kỹ thuật
├── issues/                 # Thư mục lưu vết và quản lý lỗi, bug, task
├── prompts/                # Thư mục chứa các file prompt mẫu cho AI
├── scratch/                # Thư mục chứa file nháp, script chạy thử nghiệm, data tạm thời
├── specs/                  # Thư mục chứa tài liệu đặc tả yêu cầu, thiết kế hệ thống
├── test/                   # Thư mục test tích hợp ngoài
├── ANTIGRAVITY.md          # Các quy chuẩn kỹ thuật BẮT BUỘC tuân thủ của dự án
├── codebasemap.md          # (File này) Bản đồ ánh xạ cấu trúc toàn bộ dự án
├── de_tai_01.md            # Tài liệu mô tả đề tài
├── informember.md          # File chứa thông tin thành viên nhóm
├── Dockerfile              # File cấu hình build Docker image
├── docker-compose.yml      # Cấu hình triển khai toàn bộ hệ thống bằng Docker
└── README.md               # Tài liệu giới thiệu tổng quan dự án
```

---

## 2. Cấu trúc Backend (Node.js & SQLite)

Hệ thống backend sử dụng kiến trúc phân tầng (Layered Architecture) theo chuẩn MVC để dễ dàng bảo trì và mở rộng:

```text
backend/
├── database/               # Thư mục chứa dữ liệu và cấu trúc DB
│   ├── ecom_ai.db          # File cơ sở dữ liệu SQLite chính của hệ thống
│   ├── init.sql            # Script DDL khởi tạo schema và seed user/danh mục mặc định
│   └── scripts/            # Các script bảo trì, migration và seed dữ liệu chuẩn
│       ├── clean_db.cjs             # Chuẩn hóa bảng users
│       ├── migrate.js               # Migration bảng messages & notifications
│       ├── migrate_transactions.cjs # Migration bảng sổ quỹ transactions
│       ├── seed.js                  # Seed tài khoản người dùng mẫu (admin/owner/staff)
│       ├── seed_products.js         # Seed 11 sản phẩm thực tế có ảnh, giá và tồn kho
│       └── seed_transactions.cjs   # Seed giao dịch dòng tiền mẫu
├── tests/                  # Bộ kiểm thử tự động hệ thống
│   ├── run_cashflow_tests.js        # Test nghiệp vụ sổ quỹ & bàn giao tiền
│   ├── run_installment_tests.js     # Test hợp đồng trả góp & kỳ hạn
│   ├── run_pos_tests.js             # Test bán hàng POS (bán đứt, giỏ hàng, trả góp)
│   ├── run_product_tests.js         # Test CRUD sản phẩm, slug trùng & soft delete
│   ├── run_staff_tests.js           # Test chấm công & nhân sự
│   ├── test_chat.js                 # Test luồng AI Chat
│   └── test_dashboard.js            # Test API thống kê doanh thu & KPI
├── src/                    # Chứa toàn bộ mã nguồn chính của Backend
│   ├── controllers/        # Xử lý logic request/response cho từng nghiệp vụ
│   │   ├── attendanceController.js      # Chấm công, ca làm, tính lương
│   │   ├── auditController.js           # Ghi và truy vấn nhật ký kiểm toán hệ thống
│   │   ├── authController.js            # Đăng nhập, phân quyền, token
│   │   ├── chatController.js            # Điều phối AI Assistant & Stream chat
│   │   ├── dashboardController.js       # Thống kê doanh thu, biểu đồ, top bán chạy
│   │   ├── notificationController.js   # Thông báo người dùng & hệ thống
│   │   ├── orderController.js           # Tạo đơn, tính tiền, bán đứt/trả góp
│   │   ├── productController.js         # Quản lý kho, giá, danh mục, SKU
│   │   ├── returnWarrantyController.js  # Nghiệp vụ đổi trả hàng & yêu cầu bảo hành
│   │   ├── systemController.js          # Cấu hình AI Provider (Ollama/Gemini), backup DB
│   │   ├── transactionController.js     # Thu/chi sổ quỹ, bàn giao tiền
│   │   └── userController.js            # Quản lý tài khoản, cấp lại mật khẩu, phân quyền
│   ├── routes/             # Định nghĩa endpoints API và ánh xạ controller
│   │   ├── attendanceRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── returnRoutes.js
│   │   ├── systemRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/        # Middleware xác thực & kiểm soát quyền hạn
│   │   └── authMiddleware.js            # Xác thực JWT & phân quyền RBAC
│   └── services/           # Nghiệp vụ lõi và kết nối bên ngoài
│       ├── aiService.js                 # Kết nối Ollama nội bộ & Google Gemini Cloud
│       └── db.js                        # Kết nối SQLite & Promisify (query, get, run)
├── .env                    # Biến môi trường (PORT, JWT_SECRET, GEMINI_API_KEY...)
├── .env.example            # File mẫu cấu hình môi trường
├── package.json            # Khai báo dependencies & scripts
├── package-lock.json
├── README.md
└── server.js               # ĐIỂM VÀO CHÍNH: Bootstrap Express app, nạp middlewares và nạp Routes
```

---

## 3. Cấu trúc Frontend chuẩn MVC (Vanilla JS)

Frontend được kiến trúc theo mô hình **Model - View - Controller (MVC)** thuần, không qua bundler, nạp qua trình duyệt với ES Modules (`import/export`) và Tailwind CSS CDN:

```text
frontend/
├── assets/                 # Tài nguyên tĩnh
│   └── images/             # Hình ảnh nhận diện hệ thống
│       ├── logo-ai.png                  # Logo đại diện trợ lý AI
│       └── logo-system.png              # Logo nhận diện thương hiệu hệ thống
├── src/
│   ├── core/               # Lõi dùng chung toàn app
│   │   └── ApiClient.js                 # Lớp cơ sở xử lý fetch(), nạp JWT token, bắt lỗi toàn cục
│   │
│   ├── services/           # Lớp Giao tiếp Mạng (Ánh xạ 1-1 với API Backend)
│   │   ├── AttendanceService.js         # API chấm công, ca làm
│   │   ├── AuthService.js               # API đăng nhập, kiểm tra phiên
│   │   ├── ChatService.js               # API chat trợ lý AI (SSE / Streaming)
│   │   ├── DashboardService.js          # API số liệu Dashboard
│   │   ├── NotificationService.js       # API danh sách thông báo
│   │   ├── OrderService.js              # API đơn hàng, thanh toán POS
│   │   ├── ProductService.js            # API danh mục, sản phẩm, SKU
│   │   ├── ReturnWarrantyService.js     # API đổi trả hàng, bảo hành
│   │   ├── SystemService.js             # API thiết lập hệ thống, Ollama/Gemini
│   │   ├── TransactionService.js        # API sổ quỹ thu chi, bàn giao
│   │   └── UserService.js               # API người dùng, nhân sự
│   │
│   ├── models/             # Quản lý Trạng thái & Logic Nghiệp vụ nội bộ (Không đụng DOM)
│   │   ├── AuditModel.js                # State nhật ký kiểm toán & phân trang
│   │   ├── AuthModel.js                 # Lưu trữ user hiện tại & phân quyền
│   │   ├── CartModel.js                 # Giỏ hàng POS, chiết khấu, tính thuế/tổng tiền
│   │   ├── ChatModel.js                 # Quản lý tin nhắn chat trợ lý AI
│   │   ├── NotificationModel.js         # Quản lý danh sách thông báo
│   │   ├── OrderModel.js                # Xử lý đơn hàng, điều khoản trả góp
│   │   ├── ProductModel.js              # Danh sách sản phẩm, bộ lọc, tìm kiếm
│   │   ├── SystemModel.js               # Cấu hình AI Provider & thông số prompt
│   │   └── UserModel.js                 # State tài khoản người dùng, đổi role, mật khẩu
│   │
│   ├── views/              # Chuyên render giao diện (Template Literals) & Bắt sự kiện DOM
│   │   ├── layouts/                     # Khung giao diện dùng chung
│   │   │   ├── ChatModule.js            # Widget Chatbot AI góc phải màn hình
│   │   │   ├── InternalChatModule.js    # Widget nhắn tin nội bộ giữa nhân sự
│   │   │   └── LayoutView.js            # Layout khung: Sidebar điều hướng, Topbar, Player nhạc
│   │   └── pages/                       # Màn hình làm việc chính theo vai trò
│   │       ├── AdminAuditView.js        # Nhật ký hoạt động hệ thống (Audit Logs)
│   │       ├── AdminSystemView.js       # Thiết lập hệ thống AI (Ollama/Gemini), backup DB
│   │       ├── AdminUserView.js         # Quản trị tài khoản, phân quyền, cấp mật khẩu
│   │       ├── AuthView.js              # Modal đăng nhập, đăng ký, điều khoản
│   │       ├── OwnerCashflowView.js     # Sổ quỹ tiền mặt, lập phiếu thu/chi
│   │       ├── OwnerDashboardView.js    # Bảng điều khiển doanh thu, biểu đồ KPI
│   │       ├── OwnerProductView.js      # Quản lý danh mục & kho sản phẩm
│   │       ├── OwnerStaffView.js        # Quản lý hồ sơ nhân viên, mức lương, bảng công
│   │       ├── StaffAttendanceView.js   # Điểm danh ca làm (Check-in / Check-out)
│   │       ├── StaffInstallmentView.js  # Hợp đồng mua trả góp & lịch thu nợ
│   │       ├── StaffOrderHistoryView.js # Lịch sử bán hàng & in lại hóa đơn
│   │       ├── StaffPOSView.js          # Màn hình thu ngân POS, quét/chọn SP, thanh toán
│   │       ├── StaffProductView.js      # Tra cứu nhanh sản phẩm, cấu hình, tồn kho
│   │       └── StaffReturnWarrantyView.js # Tiếp nhận đổi trả & gửi bảo hành
│   │
│   ├── controllers/        # Nhạc trưởng điều phối: Lắng nghe View -> Cập nhật Model -> Ra lệnh View vẽ lại
│   │   ├── AdminAuditController.js
│   │   ├── AdminSystemController.js
│   │   ├── AdminUserController.js
│   │   ├── AuthController.js
│   │   ├── ChatController.js
│   │   ├── InternalChatController.js
│   │   ├── LayoutController.js
│   │   ├── OwnerCashflowController.js
│   │   ├── OwnerDashboardController.js
│   │   ├── OwnerProductController.js
│   │   ├── OwnerStaffController.js
│   │   ├── StaffAttendanceController.js
│   │   ├── StaffInstallmentController.js
│   │   ├── StaffOrderHistoryController.js
│   │   ├── StaffPOSController.js
│   │   ├── StaffProductController.js
│   │   └── StaffReturnWarrantyController.js
│   │
│   ├── app.js              # Điểm bắt đầu (Bootstrap): Khởi tạo Router, nạp view theo quyền người dùng
│   └── README.md
└── index.html              # Single Page Application HTML root
```

---

## 4. Các Quy tắc Thiết kế Cốt lõi (MVC Rules)

1. **Views:** Tuyệt đối không chứa logic nghiệp vụ hay gọi API trực tiếp. Chỉ nhận data từ Controller để vẽ HTML và gán sự kiện DOM gọi callback về Controller.
2. **Controllers:** Đóng vai trò nhạc trưởng. Tiếp nhận sự kiện từ View, gọi Model/Service để xử lý logic và ra lệnh View cập nhật lại DOM.
3. **Models:** Nơi lưu trữ trạng thái (State) và tính toán logic nghiệp vụ phía client (giỏ hàng, chiết khấu, trả góp). Không can thiệp trực tiếp vào DOM (`document.getElementById`).
4. **Services:** Đơn thuần là lớp trung gian giao tiếp HTTP với Backend qua `ApiClient`. Trả về raw data (JSON), không duy trì state ứng dụng.
5. **Giao diện chuẩn hóa:** Bắt buộc tuân thủ nguyên tắc tương phản cao (High Contrast): Nền sáng làm việc rõ nét (`bg-slate-100` / `bg-white`), chữ đen/xám đậm rõ nét (`text-slate-900`, `text-slate-800`), badge sắc nét, không dùng chữ xám nhạt mờ trên nền sáng.
