const fs = require('fs');
const path = require('path');

const features = [
  { name: 'auth', title: 'Authentication', role: 'Common', desc: 'Đăng nhập, đăng xuất' },
  { name: 'team_chat', title: 'Team Chat', role: 'Common', desc: 'Chat nội bộ' },
  { name: 'admin_system', title: 'System Configuration', role: 'Admin', desc: 'Cấu hình hệ thống' },
  { name: 'admin_user', title: 'User Management', role: 'Admin', desc: 'Quản lý tài khoản' },
  { name: 'owner_cashflow', title: 'Cashflow', role: 'Owner', desc: 'Sổ quỹ, dòng tiền' },
  { name: 'owner_dashboard', title: 'Dashboard', role: 'Owner', desc: 'Biểu đồ, báo cáo AI' },
  { name: 'owner_product', title: 'Product Mgmt', role: 'Owner', desc: 'Quản lý hàng hóa' },
  { name: 'owner_staff', title: 'Staff Mgmt', role: 'Owner', desc: 'Quản lý nhân viên' },
  { name: 'staff_attendance', title: 'Attendance', role: 'Staff', desc: 'Chấm công' },
  { name: 'staff_installment', title: 'Installment', role: 'Staff', desc: 'Mua trả góp' },
  { name: 'staff_order_history', title: 'Order History', role: 'Staff', desc: 'Lịch sử hóa đơn' },
  { name: 'staff_pos', title: 'POS', role: 'Staff', desc: 'Bán hàng nhanh' },
  { name: 'staff_product', title: 'Products', role: 'Staff', desc: 'Xem tồn kho' }
];

const basePath = path.join(__dirname, '..');

const getDesignContent = (f) => {
  return "# Design Specs: " + f.title + " (" + f.role + ")\n\n" +
"## 1. Tổng quan\n" +
"- **Chức năng:** " + f.desc + "\n" +
"- **Vai trò:** " + f.role + "\n\n" +
"## 2. Wireframe Giao Diện (ASCII Art)\n" +
"```text\n" +
"+-----------------------------------------------------------------------------+\n" +
"|  [BanHangAI]   |   Menu chức năng: " + f.title.toUpperCase() + "                             |\n" +
"+-----------------------------------------------------------------------------+\n" +
"|                                                                             |\n" +
"|  [Khu vực chức năng chính " + f.title + "]                                           |\n" +
"|  - Danh sách / Bảng dữ liệu / Form nhập liệu                                |\n" +
"|  - Các nút thao tác (Thêm, Sửa, Xóa, Lọc, Tìm kiếm)                         |\n" +
"|                                                                             |\n" +
"+-----------------------------------------------------------------------------+\n" +
"```\n\n" +
"## 3. Database Schema (Backend)\n" +
"- Cần ánh xạ với bảng nghiệp vụ liên quan đến " + f.title + ".\n\n" +
"## 4. API Endpoints\n" +
"- `GET /api/" + f.name.replace('_', '/') + "` - Lấy danh sách\n" +
"- `POST /api/" + f.name.replace('_', '/') + "` - Thêm mới/Xử lý\n" +
"- `PUT /api/" + f.name.replace('_', '/') + "/:id` - Cập nhật\n" +
"- `DELETE /api/" + f.name.replace('_', '/') + "/:id` - Xóa\n";
};

const getDevContent = (f) => {
    let prefix = f.role === 'Common' ? '' : f.role;
    let camelName = f.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    let viewName = prefix + camelName + "View";
    let ctrlName = prefix + camelName + "Controller";
    let modelName = camelName + "Model";
    let serviceName = camelName + "Service";

    return "# Development Specs: " + f.title + " (" + f.role + ")\n\n" +
"## 1. Cấu trúc MVC Frontend\n" +
"Đảm bảo tuân thủ kiến trúc Vanilla JS MVC:\n" +
"- **View:** `src/views/pages/" + viewName + ".js` (Chỉ sinh HTML và phát sự kiện)\n" +
"- **Controller:** `src/controllers/" + ctrlName + ".js` (Bắt sự kiện, gọi Model)\n" +
"- **Model:** `src/models/" + modelName + ".js` (Chứa logic nghiệp vụ nội bộ)\n" +
"- **Service:** `src/services/" + serviceName + ".js` (Gọi API Backend)\n\n" +
"## 2. Luồng dữ liệu (Data Flow)\n" +
"1. `" + viewName + "` lắng nghe hành động từ người dùng (click, submit form).\n" +
"2. Phát sự kiện (emit) cho `" + ctrlName + "`.\n" +
"3. `" + ctrlName + "` gọi `" + modelName + "` để xử lý logic.\n" +
"4. `" + modelName + "` gọi `" + serviceName + "` để fetch API từ backend.\n" +
"5. Cập nhật DOM bằng tín hiệu từ Controller.\n";
}

const getTestContent = (f) => {
    return "# Test Specs: " + f.title + " (" + f.role + ")\n\n" +
"## 1. Unit Test (Kiểm thử đơn vị)\n" +
"- Kiểm thử các module MVC riêng rẽ.\n" +
"- Backend: Test Controller độc lập.\n\n" +
"## 2. Integration Test\n" +
"- Đảm bảo luồng gọi API từ Service lên Backend kết nối chuẩn JSON.\n\n" +
"## 3. Regression Test\n" +
"- Không làm lỗi các tính năng khác của role " + f.role + " khi cập nhật chức năng " + f.name + ".\n";
}

features.forEach(f => {
  fs.writeFileSync(path.join(basePath, 'specs', 'design', f.name + '.md'), getDesignContent(f));
  fs.writeFileSync(path.join(basePath, 'specs', 'development', f.name + '.md'), getDevContent(f));
  fs.writeFileSync(path.join(basePath, 'specs', 'test', f.name + '.md'), getTestContent(f));
});

console.log('Successfully generated all specs!');
