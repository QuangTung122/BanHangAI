import fs from 'fs';

const path = 'D:/BanHangAI/backend/src/controllers/returnWarrantyController.js';
let content = fs.readFileSync(path, 'utf8');

const generateCodeStr = `
        const generateInvoiceCode = (orderId, createdAtStr) => {
            if (!createdAtStr) return 'INV-' + orderId;
            const dateStr = createdAtStr.includes('Z') ? createdAtStr : createdAtStr.replace(' ', 'T') + 'Z';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'INV-' + orderId;
            const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
            return \`INV-\${yymmdd}-\${String(orderId).padStart(4, '0')}\`;
        };
`;

content = content.replace(
    '        for (const item of returns) {',
    generateCodeStr + '        for (const item of returns) {\n            item.invoice_code = generateInvoiceCode(item.order_id, item.order_created_at);'
);

content = content.replace(
    /res\.json\(\{\s*success: true,\s*data: claims\s*\}\);/,
    'for (const item of claims) {\n            item.invoice_code = generateInvoiceCode(item.order_id, item.order_created_at);\n        }\n        res.json({ success: true, data: claims });'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
