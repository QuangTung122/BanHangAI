import fs from 'fs';

const path = 'D:/BanHangAI/backend/src/controllers/returnWarrantyController.js';
let text = fs.readFileSync(path, 'utf8');

const search = "['expense', refund_amount, 'Đổi trả', `Hoàn tiền cho đơn hàng đổi trả #${id}`, req.user.id, 'cash', 'manual', id]";
const replace = `['expense', refund_amount, 'Đổi trả', 'Hoàn tiền cho đơn hàng đổi trả #' + id, req.user.id, 'cash', 'manual', id]
            );
        } else if (action === 'collect' && refund_amount > 0) {
            await db.run(
                'INSERT INTO transactions (type, amount, category, description, user_id, payment_method, source, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                ['income', refund_amount, 'Đổi trả', 'Thu thêm tiền khách khi đổi trả #' + id, req.user.id, 'cash', 'manual', id]`;

text = text.replace(search, replace);
fs.writeFileSync(path, text, 'utf8');
console.log('Done');
