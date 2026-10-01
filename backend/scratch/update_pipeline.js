import fs from 'fs';
import path from 'path';

const aiToolFile = 'D:/BanHangAI/backend/src/services/aiTool.js';
let aiToolContent = fs.readFileSync(aiToolFile, 'utf8');

const replacementLogic = `
export const processSlashCommand = async (message, userRole) => {
    const lowerMsg = message.toLowerCase().trim();
    let commandData = null;
    let preFetchContext = null;

    // --- PIPELINE MỚI: TÁCH 2 NHÓM THEO THIẾT KẾ CỦA BẠN ---
    const isPipeline = /(tư vấn|báo cáo|thống kê).*?(sản phẩm|danh mục|doanh mục|giá|tồn kho)/i.test(lowerMsg) 
                    || lowerMsg.startsWith('tư vấn,')
                    || lowerMsg.includes('có giá');

    if (isPipeline) {
        // Nhóm 1: Xác định hành vi đầu ra (Generation Intent)
        let outputIntent = 'trả lời';
        let outputPrompt = 'Hãy tổng hợp thành một câu trả lời ngôn ngữ tự nhiên, ngắn gọn, dễ hiểu.';
        
        if (lowerMsg.includes('tư vấn')) {
            outputIntent = 'Tư Vấn';
            outputPrompt = 'BẠN PHẢI đóng vai trò là một chuyên gia bán hàng. Dựa vào Dữ liệu, hãy sinh lời tư vấn nhiệt tình, gợi ý sản phẩm phù hợp nhất cho nhu cầu của khách.';
        } else if (lowerMsg.includes('báo cáo')) {
            outputIntent = 'Báo Cáo';
            outputPrompt = 'BẠN PHẢI đóng vai trò là một quản lý. Dựa vào Dữ liệu, hãy sinh lời báo cáo chuyên nghiệp, đi thẳng vào số liệu.';
        } else if (lowerMsg.includes('thống kê') || lowerMsg.includes('liệt kê')) {
            outputIntent = 'Thống Kê';
            outputPrompt = 'BẠN PHẢI liệt kê các kết quả từ Dữ liệu dưới dạng danh sách gạch đầu dòng rõ ràng, dễ nhìn.';
        }

        // Nhóm 2: Lọc Dữ Liệu & Đối chiếu
        const priceLogic = parsePriceCondition(lowerMsg);
        let sql = "";
        let sqlParams = [];

        if (lowerMsg.includes('danh mục') || lowerMsg.includes('doanh mục')) {
            sql = \`SELECT name, description FROM categories WHERE is_active = 1\`;
            const categories = await db.query(sql);
            commandData = { type: 'Truy vấn Danh Mục', keyword: 'Toàn bộ', data: categories, promptObj: outputPrompt, intent: outputIntent };
        }
        else if (lowerMsg.includes('sản phẩm') || lowerMsg.includes('giá') || lowerMsg.includes('tồn kho') || lowerMsg.includes('điện thoại') || lowerMsg.includes('laptop')) {
            let selectFields = "name, price, stock_quantity";
            if (lowerMsg.includes('tư vấn')) selectFields += ", SUBSTR(description, 1, 150) as description, tags";
            
            // Xóa các keyword điều hướng để lấy keyword tìm kiếm
            const cleanKw = lowerMsg
                .replace(/(dưới|trên|hơn|từ|đến|rẻ hơn|<|>|\\d+\\s*(triệu|tr|k|nghìn)).*/gi, '')
                .replace(/(tư vấn|báo cáo|thống kê|liệt kê|sản phẩm|điện thoại|laptop|có giá|trong cửa hàng)/gi, '')
                .replace(/\\//g, '')
                .replace(/,/g, '')
                .trim();
                
            let conditions = ["is_active = 1"];
            
            if (priceLogic.params.length > 0) {
                conditions.push(priceLogic.sqlCondition);
                sqlParams.push(...priceLogic.params);
            }
            
            const searchKw = cleanKw.split(' ')[0];
            if (searchKw && searchKw.length > 1) {
                conditions.push("(name LIKE ? OR tags LIKE ?)");
                sqlParams.push(\`%\${searchKw}%\`, \`%\${searchKw}%\`);
            }
            
            sql = \`SELECT \${selectFields} FROM products WHERE \${conditions.join(' AND ')} ORDER BY price DESC LIMIT 5\`;
            const products = await db.query(sql, sqlParams);
            commandData = { type: 'Truy vấn Sản Phẩm (Pipeline)', keyword: cleanKw || 'Theo giá', data: products, promptObj: outputPrompt, intent: outputIntent };
        }
    }
    // --- KẾT THÚC PIPELINE MỚI ---
    else if (lowerMsg.startsWith('/giá') || lowerMsg.startsWith('/gia')) {`;

const endOfFunc = `        const products = await db.query(\`SELECT name, price, stock_quantity FROM products WHERE is_active = 1 LIMIT 20\`);
        preFetchContext = products.map(p => \`- \${p.name}: Giá \${p.price}đ (Tồn kho: \${p.stock_quantity})\`).join('\\n');
    }

    return { commandData, preFetchContext };
};`;

// Regex to replace the function entirely safely
const regexToReplace = /export const processSlashCommand = async \(message, userRole\) => \{[\s\S]*?return \{ commandData, preFetchContext \};\r?\n\};\r?\n?/s;

if (regexToReplace.test(aiToolContent)) {
    // Perform replacement
    const exactMatch = aiToolContent.match(regexToReplace)[0];
    
    // We will rebuild the entire function manually to ensure no syntax errors
    const rebuiltFunction = exactMatch
        .replace(/export const processSlashCommand = async \(message, userRole\) => \{[\s\S]*?else if \(lowerMsg.startsWith\('\/giá'\) \|\| lowerMsg.startsWith\('\/gia'\)\) \{/s, replacementLogic.trim());
    
    aiToolContent = aiToolContent.replace(exactMatch, rebuiltFunction);
    fs.writeFileSync(aiToolFile, aiToolContent, 'utf8');
    console.log('Successfully injected AST Pipeline into aiTool.js');
} else {
    console.log('Failed to find processSlashCommand block for replacement');
}
