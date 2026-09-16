const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

const replaceInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace specs/testing first
  content = content.replace(/specs\/testing/g, 'test/ket_qua_test');
  content = content.replace(/specs\\testing/g, 'test\\ket_qua_test');
  
  // Replace specs/test
  content = content.replace(/specs\/test/g, 'test/kich_ban_test');
  content = content.replace(/specs\\test/g, 'test\\kich_ban_test');
  
  fs.writeFileSync(filePath, content);
};

const walkSync = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.md')) {
      callback(filepath);
    }
  });
};

// Process all markdown files in these directories
['prompts', 'specs', 'test', 'docs'].forEach(dir => {
  walkSync(path.join(basePath, dir), replaceInFile);
});

// Also root README
replaceInFile(path.join(basePath, 'README.md'));
replaceInFile(path.join(basePath, 'codebasemap.md'));

// Create a README for the new test/ directory
const testReadme = `# Test (Kiểm Thử Hệ Thống)

Thư mục này chứa toàn bộ tài liệu và dữ liệu liên quan đến quá trình Đảm bảo Chất lượng (QA / Testing) của dự án BanHangAI.

## 📂 Cấu trúc
- **\`kich_ban_test/\`**: Nơi lưu trữ các Kịch bản Kiểm thử (Test Cases / Test Scenarios). Được sinh ra bởi AI QA dựa trên tài liệu Development Specs. Bao gồm Unit Test, Integration Test và E2E Test.
- **\`ket_qua_test/\`**: Nơi lưu trữ Báo cáo Kết quả (Test Execution Reports). Chứa các bảng đánh giá tĩnh/động với trạng thái PASS/FAIL cho từng tính năng sau khi chạy kịch bản test trên mã nguồn thực tế.
`;

fs.writeFileSync(path.join(basePath, 'test/README.md'), testReadme);

console.log('Successfully updated all path references and created test/README.md!');
