import fs from 'fs';

const path = 'D:/BanHangAI/backend/src/controllers/returnWarrantyController.js';
let content = fs.readFileSync(path, 'utf8');

// Replace getReturnRequests
content = content.replace(/SELECT r\.\*, u\.username as creator_name[\s\S]*?FROM returns r [\s\S]*?LEFT JOIN users u ON r\.created_by = u\.id/, 
    'SELECT r.*, u.username as creator_name, o.created_at as order_created_at\n            FROM returns r \n            LEFT JOIN users u ON r.created_by = u.id \n            LEFT JOIN orders o ON r.order_id = o.id');

// Replace getWarrantyClaims
content = content.replace(/SELECT w\.\*, u\.username as creator_name[\s\S]*?FROM warranty_claims w [\s\S]*?LEFT JOIN users u ON w\.created_by = u\.id/, 
    'SELECT w.*, u.username as creator_name, o.created_at as order_created_at\n            FROM warranty_claims w \n            LEFT JOIN users u ON w.created_by = u.id \n            LEFT JOIN orders o ON w.order_id = o.id');

fs.writeFileSync(path, content, 'utf8');
console.log('Queries updated');
