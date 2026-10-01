const fs = require('fs');
const file = 'D:/BanHangAI/backend/src/controllers/chatController.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = \
        if (commandData) {
            let outputInstruction = commandData.promptObj || "1. B?N PH?I d?a tuy?t d?i vào D? li?u thô (JSON) bên trên d? t?ng h?p thành m?t câu tr? l?i ngôn ng? t? nhiên, ng?n g?n, d? hi?u và l?ch s? cho ngu?i dùng.";
            roleInstruction += \\\\\\\n\\\\n[D? LI?U ÐU?C TRÍCH XU?T T? H? TH?NG DO L?NH B?N YÊU C?U]:\\\\nLo?i l?nh: \\\\\nT? khóa: "\"\\\\nD? li?u thô (JSON):\\\\n\\\\\n\\\\nYÊU C?U B?T BU?C DÀNH CHO AI:\\\\n\\\\\n2. KHÔNG ÐU?C b?a d?t s? li?u ho?c thông tin không có trong JSON.\\\\n3. N?u d? li?u tr? v? r?ng (nhu [], null, ho?c total_orders = 0), B?T BU?C ph?i tr? l?i th?ng th?n là: 'Hi?n t?i h? th?ng không có d? li?u/s?n ph?m nào phù h?p v?i yêu c?u c?a b?n'. KHÔNG ÐU?C h?i ngu?c l?i khách hàng. KHÔNG ÐU?C h?a h?n vòng vo.\\\
        }
\;

content = content.replace(/if \\(commandData\\) \\{[\\s\\S]*?\\}\\s*else if \\(preFetchContext\\)/, replacement.trim() + '\\n        else if (preFetchContext)');
fs.writeFileSync(file, content, 'utf8');
