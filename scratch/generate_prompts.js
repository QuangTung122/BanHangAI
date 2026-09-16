const fs = require('fs');
const path = require('path');

const features = [
  { name: 'auth', title: 'Authentication', role: 'Common', desc: 'Đăng nhập, đăng xuất và phân quyền' },
  { name: 'team_chat', title: 'Team Chat', role: 'Common', desc: 'Chat nội bộ' },
  { name: 'admin_system', title: 'System Configuration', role: 'Admin', desc: 'Cấu hình tham số hệ thống' },
  { name: 'admin_user', title: 'User Management', role: 'Admin', desc: 'Quản lý tài khoản' },
  { name: 'owner_cashflow', title: 'Cashflow', role: 'Owner', desc: 'Quản lý dòng tiền, sổ quỹ' },
  { name: 'owner_dashboard', title: 'Dashboard', role: 'Owner', desc: 'Báo cáo doanh thu, phân tích AI' },
  { name: 'owner_product', title: 'Product Mgmt', role: 'Owner', desc: 'Quản lý hàng hóa, nhập xuất kho' },
  { name: 'owner_staff', title: 'Staff Mgmt', role: 'Owner', desc: 'Theo dõi năng suất nhân viên' },
  { name: 'staff_attendance', title: 'Attendance', role: 'Staff', desc: 'Chấm công nhân viên' },
  { name: 'staff_installment', title: 'Installment', role: 'Staff', desc: 'Theo dõi khách hàng trả góp' },
  { name: 'staff_order_history', title: 'Order History', role: 'Staff', desc: 'Xem lại hóa đơn, in lại bill' },
  { name: 'staff_pos', title: 'POS', role: 'Staff', desc: 'Màn hình bán hàng nhanh (POS)' },
  { name: 'staff_product', title: 'Products', role: 'Staff', desc: 'Tra cứu thông tin hàng hóa, tồn kho' }
];

const basePath = path.join(__dirname, '..');

const getDesignPrompt = (f) => {
  return "# Prompt Thiết Kế: " + f.title + " (" + f.role + ")\n\n" +
"**Vai trò AI:** System Analyst & UI/UX Expert.\n\n" +
"**Ngữ cảnh:**\n" +
"Hệ thống BanHangAI cần thiết kế chi tiết chức năng `" + f.desc + "` dành cho vai trò `" + f.role + "`.\n\n" +
"**Yêu cầu đầu ra (Output):**\n" +
"Tạo file Design Specs (Markdown) gồm:\n" +
"1. **Wireframe Giao Diện (ASCII Art):** Phải vẽ wireframe chi tiết cho màn hình " + f.title + ".\n" +
"2. **Database Schema:** Chỉ ra các bảng và các trường dữ liệu cần thiết phục vụ cho tính năng này.\n" +
"3. **API Specs:** Định nghĩa các RESTful API endpoints, request body và response.\n\n" +
"**Yêu cầu thực thi:**\n" +
"Lưu kết quả phân tích thiết kế vào file `specs/design/" + f.name + ".md`.\n";
};

const getDevPrompt = (f) => {
    return "# Prompt Phát Triển: " + f.title + " (" + f.role + ")\n\n" +
"**Vai trò AI:** Full-stack Developer (Node.js & Vanilla JS MVC).\n\n" +
"**Ngữ cảnh:**\n" +
"Dựa vào tài liệu thiết kế: `specs/design/" + f.name + ".md`.\n" +
"Hãy phân tích và viết đặc tả phát triển (Development Specs) chi tiết để lập trình viên có thể code tính năng `" + f.desc + "`.\n\n" +
"**Yêu cầu đầu ra (Output):**\n" +
"Tạo file Development Specs (Markdown) gồm:\n" +
"1. **Cấu trúc MVC Frontend:** Chỉ rõ các file View, Controller, Model, Service tương ứng với vai trò " + f.role + ".\n" +
"2. **Backend Mapping:** Khai báo file Backend Controller, Route tương ứng.\n" +
"3. **Luồng dữ liệu (Data Flow):** Mô tả từng bước từ khi View nhận click -> Controller -> Model -> Service (gọi API).\n" +
"4. **State Management:** Mô tả trạng thái dữ liệu trên giao diện.\n\n" +
"**Yêu cầu thực thi:**\n" +
"Lưu kết quả phân tích phát triển vào file `specs/development/" + f.name + ".md`.\n";
}

const getTestPrompt = (f) => {
    return "# Prompt Kiểm Thử: " + f.title + " (" + f.role + ")\n\n" +
"**Vai trò AI:** QA Automation Engineer.\n\n" +
"**Ngữ cảnh:**\n" +
"Dựa vào đặc tả phát triển: `specs/development/" + f.name + ".md`.\n" +
"Hãy phân tích và viết kịch bản kiểm thử (Test Specs) cho chức năng `" + f.desc + "`.\n\n" +
"**Yêu cầu đầu ra (Output):**\n" +
"Tạo file Test Specs (Markdown) gồm:\n" +
"1. **Unit Test:** Kịch bản kiểm tra các hàm xử lý logic nội bộ ở frontend Model hoặc backend Controller.\n" +
"2. **Integration Test:** Kịch bản kiểm tra kết nối API.\n" +
"3. **Regression Test:** Kịch bản test luồng thao tác tự động, đảm bảo không hỏng giao diện " + f.role + ".\n\n" +
"**Yêu cầu thực thi:**\n" +
"Lưu kết quả phân tích kiểm thử vào file `specs/test/" + f.name + ".md`.\n";
}

const dirs = [
  path.join(basePath, 'prompts', 'design'),
  path.join(basePath, 'prompts', 'development'),
  path.join(basePath, 'prompts', 'testing')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

features.forEach(f => {
  fs.writeFileSync(path.join(basePath, 'prompts', 'design', f.name + '.md'), getDesignPrompt(f));
  fs.writeFileSync(path.join(basePath, 'prompts', 'development', f.name + '.md'), getDevPrompt(f));
  fs.writeFileSync(path.join(basePath, 'prompts', 'testing', f.name + '.md'), getTestPrompt(f));
});

console.log('Successfully generated all prompt files!');
