import fs from 'fs';

const path = 'D:/BanHangAI/backend/src/controllers/returnWarrantyController.js';
let content = fs.readFileSync(path, 'utf8');

// Replace r.*, u.username as creator_name, o.invoice_code
content = content.replace(/SELECT r\.\*, u\.username as creator_name, o\.invoice_code[\s\S]*?LEFT JOIN orders o ON r\.order_id = o\.id/, 
    'SELECT r.*, u.username as creator_name\n            FROM returns r \n            LEFT JOIN users u ON r.created_by = u.id ');

// Replace w.*, u.username as creator_name, o.invoice_code
content = content.replace(/SELECT w\.\*, u\.username as creator_name, o\.invoice_code[\s\S]*?LEFT JOIN orders o ON w\.order_id = o\.id/, 
    'SELECT w.*, u.username as creator_name\n            FROM warranty_claims w \n            LEFT JOIN users u ON w.created_by = u.id ');

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced via regex!');
