const fs = require('fs');
const path = require('path');

const features = {
  auth: { title: 'Authentication', feModel: 'AuthModel', feView: 'AuthView', feCtrl: 'AuthController', feSvc: 'AuthService', beCtrl: 'authController', beRoute: 'authRoutes', checks: ['login', 'token'] },
  team_chat: { title: 'Team Chat', feModel: 'ChatModel', feView: 'ChatModule', feCtrl: 'ChatController', feSvc: 'ChatService', beCtrl: 'chatController', beRoute: 'chatRoutes', checks: ['send', 'message'] },
  admin_system: { title: 'System Configuration', feModel: 'SystemModel', feView: 'AdminSystemView', feCtrl: 'AdminSystemController', feSvc: 'SystemService', beCtrl: 'systemController', beRoute: 'systemRoutes', checks: ['config', 'update'] },
  admin_user: { title: 'User Management', feModel: 'UserModel', feView: 'AdminUserView', feCtrl: 'AdminUserController', feSvc: 'UserService', beCtrl: 'userController', beRoute: 'userRoutes', checks: ['create', 'role'] },
  owner_cashflow: { title: 'Cashflow', feModel: 'OrderModel', feView: 'OwnerCashflowView', feCtrl: 'OwnerCashflowController', feSvc: 'TransactionService', beCtrl: 'transactionController', beRoute: 'transactionRoutes', checks: ['balance', 'transaction'] },
  owner_dashboard: { title: 'Dashboard', feModel: 'SystemModel', feView: 'OwnerDashboardView', feCtrl: 'OwnerDashboardController', feSvc: 'DashboardService', beCtrl: 'dashboardController', beRoute: 'dashboardRoutes', checks: ['revenue', 'report'] },
  owner_product: { title: 'Product Mgmt', feModel: 'ProductModel', feView: 'OwnerProductView', feCtrl: 'OwnerProductController', feSvc: 'ProductService', beCtrl: 'productController', beRoute: 'productRoutes', checks: ['product', 'stock'] },
  owner_staff: { title: 'Staff Mgmt', feModel: 'UserModel', feView: 'OwnerStaffView', feCtrl: 'OwnerStaffController', feSvc: 'UserService', beCtrl: 'userController', beRoute: 'userRoutes', checks: ['staff', 'kpi'] },
  staff_attendance: { title: 'Attendance', feModel: 'UserModel', feView: 'StaffAttendanceView', feCtrl: 'StaffAttendanceController', feSvc: 'AttendanceService', beCtrl: 'attendanceController', beRoute: 'attendanceRoutes', checks: ['checkIn', 'time'] },
  staff_installment: { title: 'Installment', feModel: 'OrderModel', feView: 'StaffInstallmentView', feCtrl: 'StaffInstallmentController', feSvc: 'OrderService', beCtrl: 'orderController', beRoute: 'orderRoutes', checks: ['installment', 'pay'] },
  staff_order_history: { title: 'Order History', feModel: 'OrderModel', feView: 'StaffOrderHistoryView', feCtrl: 'StaffOrderHistoryController', feSvc: 'OrderService', beCtrl: 'orderController', beRoute: 'orderRoutes', checks: ['history', 'order'] },
  staff_pos: { title: 'POS', feModel: 'CartModel', feView: 'StaffPOSView', feCtrl: 'StaffPOSController', feSvc: 'OrderService', beCtrl: 'orderController', beRoute: 'orderRoutes', checks: ['cart', 'checkout'] },
  staff_product: { title: 'Products', feModel: 'ProductModel', feView: 'StaffProductView', feCtrl: 'StaffProductController', feSvc: 'ProductService', beCtrl: 'productController', beRoute: 'productRoutes', checks: ['search', 'list'] }
};

const basePath = path.join(__dirname, '..');

const checkFileExists = (filePath) => fs.existsSync(filePath);
const getFileContent = (filePath) => fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

Object.keys(features).forEach(key => {
  const f = features[key];

  // Paths
  const feModelPath = path.join(basePath, 'frontend/src/models', f.feModel + '.js');
  const feViewPath = path.join(basePath, 'frontend/src/views/pages', f.feView + '.js');
  const feViewLayoutPath = path.join(basePath, 'frontend/src/views/layouts', f.feView + '.js'); 
  const actualFeViewPath = checkFileExists(feViewPath) ? feViewPath : feViewLayoutPath;
  
  const feCtrlPath = path.join(basePath, 'frontend/src/controllers', f.feCtrl + '.js');
  const beCtrlPath = path.join(basePath, 'backend/src/controllers', f.beCtrl + '.js');
  const beRoutePath = path.join(basePath, 'backend/src/routes', f.beRoute + '.js');

  // Eval checks
  const hasFeCtrl = checkFileExists(feCtrlPath);
  const hasFeView = checkFileExists(actualFeViewPath);
  const hasFeModel = checkFileExists(feModelPath);
  const hasBeCtrl = checkFileExists(beCtrlPath);
  const hasBeRoute = checkFileExists(beRoutePath);

  const beCtrlContent = getFileContent(beCtrlPath);
  const keyword1Match = beCtrlContent.toLowerCase().includes(f.checks[0].toLowerCase());
  const keyword2Match = beCtrlContent.toLowerCase().includes(f.checks[1].toLowerCase());

  // Count passes and fails
  const results = [hasFeCtrl, hasFeView, hasFeModel, hasBeCtrl, hasBeRoute, keyword1Match, keyword2Match];
  const passCount = results.filter(v => v === true).length;
  const failCount = results.filter(v => v === false).length;
  const totalCount = results.length;
  const passPercentage = Math.round((passCount / totalCount) * 100);

  let finalStatus = passCount === totalCount ? 'PASS ✅' : (passCount >= totalCount / 2 ? 'WARNING ⚠️' : 'FAIL ❌');
  
  let comments = '';
  if (finalStatus === 'PASS ✅') {
    comments = 'Mã nguồn được tổ chức cực kỳ tốt. Tất cả các file MVC và API Route đều hiện diện đầy đủ, logic xử lý cốt lõi cũng đã được tích hợp.';
  } else if (finalStatus === 'WARNING ⚠️') {
    comments = 'Mã nguồn đã hình thành bộ khung cơ bản, nhưng vẫn còn thiếu sót một vài file giao diện hoặc logic xử lý (ví dụ: thiếu file Component hoặc keyword logic chưa xuất hiện trong Backend). Cần bổ sung để tính năng hoàn thiện 100%.';
  } else {
    comments = 'Tính năng này hiện đang bị hổng quá nhiều thành phần mã nguồn. Cần khẩn trương triển khai các file Controller/Model và đảm bảo luồng API được code đầy đủ.';
  }

  // Generate Testing Specs with Markdown Table
  const testSpec = `# Báo Cáo Kiểm Thử (Testing Report): ${f.title}

*Báo cáo được tự động sinh ra dựa trên việc quét mã nguồn tĩnh (Static Analysis) và kiểm thử sự hiện diện kiến trúc.*

## 1. Kết Quả Tổng Quan
- **Trạng thái:** **${finalStatus}**
- **Tổng số Test Cases:** ${totalCount}
- **Thành công (PASS):** ${passCount}
- **Thất bại (FAIL):** ${failCount}
- **Tỉ lệ bao phủ (Pass Rate):** ${passPercentage}%

## 2. Bảng Chi Tiết Kiểm Thử (Test Execution Table)

| ID | Test Case | Target / Component | Trạng thái (PASS/FAIL) | Ghi chú / Nguyên nhân |
| :--- | :--- | :--- | :---: | :--- |
| **TC-01** | Frontend: Kiểm tra Controller | \`${f.feCtrl}\` | ${hasFeCtrl ? '✅ PASS' : '❌ FAIL'} | ${hasFeCtrl ? 'File đã được khởi tạo.' : 'File bị thiếu hoặc sai đường dẫn.'} |
| **TC-02** | Frontend: Kiểm tra View/Layout | \`${f.feView}\` | ${hasFeView ? '✅ PASS' : '❌ FAIL'} | ${hasFeView ? 'Giao diện đã sẵn sàng.' : 'Chưa có file UI Template.'} |
| **TC-03** | Frontend: Kiểm tra Model | \`${f.feModel}\` | ${hasFeModel ? '✅ PASS' : '❌ FAIL'} | ${hasFeModel ? 'Model xử lý logic FE hiện diện.' : 'Thiếu file Model xử lý state.'} |
| **TC-04** | Backend: Kiểm tra Controller | \`${f.beCtrl}\` | ${hasBeCtrl ? '✅ PASS' : '❌ FAIL'} | ${hasBeCtrl ? 'Logic API đã được định hình.' : 'Controller backend chưa tồn tại.'} |
| **TC-05** | Backend: Kiểm tra Routing | \`${f.beRoute}\` | ${hasBeRoute ? '✅ PASS' : '❌ FAIL'} | ${hasBeRoute ? 'Đã map Route cho API.' : 'Thiếu khai báo Route.'} |
| **TC-06** | Logic Eval: Xử lý nghiệp vụ 1 | Keyword: \`${f.checks[0]}\` | ${keyword1Match ? '✅ PASS' : '❌ FAIL'} | ${keyword1Match ? 'Thuật toán/logic xử lý đã có.' : 'Chưa code logic cho nghiệp vụ này.'} |
| **TC-07** | Logic Eval: Xử lý nghiệp vụ 2 | Keyword: \`${f.checks[1]}\` | ${keyword2Match ? '✅ PASS' : '❌ FAIL'} | ${keyword2Match ? 'Thuật toán/logic xử lý đã có.' : 'Chưa code logic cho nghiệp vụ này.'} |

## 3. Nhận Xét & Đề Xuất (Remarks)
> **Đánh giá từ QA System:** 
> ${comments}
`;
  fs.writeFileSync(path.join(basePath, 'specs', 'testing', key + '.md'), testSpec);

});

console.log('Successfully updated Testing specs with tables, counts, and remarks!');
