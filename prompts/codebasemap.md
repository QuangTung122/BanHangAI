# Bản đồ cấu trúc mã nguồn BanHangAI

Bản đồ này phản ánh cấu trúc hiện tại của repository. Cập nhật cùng tài liệu này khi thêm, chuyển, đổi tên hoặc xóa thành phần được duy trì. Quy tắc cho agent nằm tại `prompts/ANTIGRAVITY.md`.

```text
BanHangAI/
├── backend/
│   ├── database/
│   │   ├── ecom_ai.db
│   │   ├── init.sql
│   │   └── scripts/
│   │       ├── clean_db.cjs
│   │       ├── migrate.js
│   │       ├── migrate_transactions.cjs
│   │       ├── seed.js
│   │       ├── seed_products.js
│   │       └── seed_transactions.cjs
│   ├── knowledge/
│   │   ├── chinh-sach-bao-hanh.md
│   │   ├── chinh-sach-doi-tra.md
│   │   ├── gioi-thieu-he-thong.md
│   │   └── thanh-toan-tra-gop.md
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── attendanceController.js
│   │   │   ├── auditController.js
│   │   │   ├── authController.js
│   │   │   ├── botController.js
│   │   │   ├── chatController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── notificationController.js
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   ├── profileController.js
│   │   │   ├── returnWarrantyController.js
│   │   │   ├── systemController.js
│   │   │   ├── transactionController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── activityNotificationMiddleware.js
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── auditRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── botRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   ├── returnRoutes.js
│   │   │   ├── systemRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   └── userRoutes.js
│   │   └── services/
│   │       ├── aiService.js
│   │       ├── botActionService.js
│   │       ├── botAgentService.js
│   │       ├── botCommandService.js
│   │       ├── botKnowledgeService.js
│   │       ├── botQuickService.js
│   │       ├── botToolService.js
│   │       ├── notificationService.js
│   │       └── db.js
│   ├── tests/
│   │   ├── run_cashflow_tests.js
│   │   ├── run_installment_tests.js
│   │   ├── run_pos_tests.js
│   │   ├── run_product_tests.js
│   │   ├── run_staff_tests.js
│   │   ├── test_chat.js
│   │   └── test_dashboard.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── server.js
├── frontend/
│   ├── assets/images/
│   │   ├── logo-ai.png
│   │   └── logo-system.png
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── AdminAuditController.js
│   │   │   ├── AdminSystemController.js
│   │   │   ├── AdminUserController.js
│   │   │   ├── AuthController.js
│   │   │   ├── BotSupportController.js
│   │   │   ├── ChatController.js
│   │   │   ├── InternalChatController.js
│   │   │   ├── LayoutController.js
│   │   │   ├── OwnerCashflowController.js
│   │   │   ├── OwnerDashboardController.js
│   │   │   ├── OwnerProductController.js
│   │   │   ├── OwnerStaffController.js
│   │   │   ├── StaffAttendanceController.js
│   │   │   ├── StaffInstallmentController.js
│   │   │   ├── StaffOrderHistoryController.js
│   │   │   ├── StaffPOSController.js
│   │   │   ├── StaffProductController.js
│   │   │   ├── StaffReturnWarrantyController.js
│   │   │   └── UserSettingsController.js
│   │   ├── core/ApiClient.js
│   │   ├── models/
│   │   │   ├── AuditModel.js
│   │   │   ├── AuthModel.js
│   │   │   ├── CartModel.js
│   │   │   ├── ChatModel.js
│   │   │   ├── NotificationModel.js
│   │   │   ├── OrderModel.js
│   │   │   ├── ProductModel.js
│   │   │   ├── SystemModel.js
│   │   │   └── UserModel.js
│   │   ├── services/
│   │   │   ├── AttendanceService.js
│   │   │   ├── AuthService.js
│   │   │   ├── ChatService.js
│   │   │   ├── DashboardService.js
│   │   │   ├── NotificationService.js
│   │   │   ├── OrderService.js
│   │   │   ├── ProductService.js
│   │   │   ├── ReturnWarrantyService.js
│   │   │   ├── SystemService.js
│   │   │   ├── TransactionService.js
│   │   │   └── UserService.js
│   │   ├── views/
│   │   │   ├── layouts/
│   │   │   │   ├── ChatModule.js
│   │   │   │   ├── InternalChatModule.js
│   │   │   │   └── LayoutView.js
│   │   │   └── pages/                 # View trang Admin, Owner, Staff và Auth
│   │   └── app.js
│   ├── bot.html
│   ├── index.html
│   └── README.md
├── issues/
│   ├── README.md
│   ├── New Bitmap Image.bmp
│   ├── chuc.png
│   └── lỗi.bmp
├── ketqua/
│   ├── docs/
│   │   ├── guides/
│   │   │   ├── demo-script.md
│   │   │   ├── presentation-slides.md
│   │   │   └── user_manual.md
│   │   ├── operations/deployment-guide.md
│   │   ├── README.md
│   │   └── SLIDE_CONTENT.md
│   ├── prompts/
│   │   ├── analysis/
│   │   ├── design/
│   │   ├── development/
│   │   ├── documentation/
│   │   ├── testing/
│   │   └── README.md
│   ├── specs/
│   │   ├── design/
│   │   ├── development/
│   │   ├── requirements/
│   │   └── README.md
│   └── test/
│       ├── ket_qua_test/
│       ├── kich_ban_test/
│       └── README.md
├── prompts/
│   ├── ANTIGRAVITY.md
│   └── codebasemap.md                # Bản đồ này
├── .gitignore
├── de_tai_01.md
├── docker-compose.yml
├── Dockerfile
├── huongdan.md
├── informember.md
├── nhom2.docx
├── README.md
└── trich_xuat.md
```

## Ghi chú

- `ketqua/` là vị trí hiện tại của tài liệu hướng dẫn, prompts theo SDLC, specs và kịch bản/báo cáo kiểm thử.
- `prompts/` ở repository root chứa quy chuẩn agent và bản đồ cấu trúc này; prompt nghiệp vụ theo SDLC nằm trong `ketqua/prompts/`.
- `backend/knowledge/`, các file `bot*` và `frontend/bot.html` là thành phần tính năng bot được ứng dụng tham chiếu.
- `backend/node_modules/`, `.env` cục bộ, cache và đầu ra build là môi trường/đầu ra sinh tự động, không liệt kê như mã nguồn duy trì.
- Không có thư mục `scratch/` thường trực. Tệp tạm phải được dọn trước khi kết thúc tác vụ theo `prompts/ANTIGRAVITY.md`.
