import * as db from '../services/db.js';
import { logAction } from './auditController.js';
import * as aiService from '../services/aiService.js';

const normalizeText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const extractMaximumPrice = (text) => {
    const grouped = text.match(/(?:duoi|toi da|khong qua|ngan sach|tam|khoang)\s*(\d{1,3}(?:\.\d{3})+)(?:\s*(?:d|dong))?/i);
    if (grouped) return Number(grouped[1].replace(/\./g, ''));
    const simple = text.match(/(?:duoi|toi da|khong qua|ngan sach|tam|khoang)\s*(\d+(?:[,.]\d+)?)\s*(trieu|tr|k|nghin|ngan)?/i);
    if (!simple) return null;
    const amount = Number(simple[1].replace(',', '.'));
    const unit = normalizeText(simple[2]);
    if (unit === 'trieu' || unit === 'tr') return Math.round(amount * 1_000_000);
    if (unit === 'k' || unit === 'nghin' || unit === 'ngan') return Math.round(amount * 1_000);
    return Number.isInteger(amount) ? amount : null;
};

const getCategoryTerms = (text) => {
    const terms = [];
    const rules = [
        [['laptop', 'may tinh xach tay', 'notebook'], 'laptop'],
        [['dien thoai', 'smartphone', 'iphone', 'android'], 'dien thoai'],
        [['may tinh bang', 'tablet', 'ipad'], 'may tinh bang'],
        [['tai nghe', 'headphone', 'earbud'], 'tai nghe'],
        [['man hinh', 'monitor'], 'man hinh'],
        [['chuot', 'mouse'], 'chuot'],
        [['ban phim', 'keyboard'], 'ban phim'],
        [['sac', 'adapter', 'cap sac'], 'sac'],
        [['loa', 'speaker'], 'loa']
    ];
    for (const [needles, term] of rules) if (needles.some((needle) => text.includes(needle))) terms.push(term);
    return terms;
};

const explainWithSmallModel = async (system, user, fallback) => {
    try {
        const answer = await aiService.generateGroundedText(system, user);
        return answer || fallback;
    } catch (error) {
        console.warn('Grounded AI explanation unavailable:', error.message);
        return fallback;
    }
};

const PAID_ORDER_SQL = `EXISTS (
    SELECT 1 FROM transactions t WHERE t.reference_id = o.id AND t.type = 'income' AND t.source = 'auto'
      AND t.category IN ('Bán hàng', 'Thu tiền trả góp')
)`;

export const getPosRecommendations = async (req, res) => {
    try {
        const need = typeof req.body?.need === 'string' ? req.body.need.trim().slice(0, 300) : '';
        if (need.length < 3) return res.status(400).json({ success: false, message: 'Vui lòng mô tả nhu cầu ít nhất 3 ký tự', data: null });
        const normalized = normalizeText(need);
        const maxPrice = extractMaximumPrice(normalized);
        const categoryTerms = getCategoryTerms(normalized);
        const products = await db.query(`
            SELECT p.id, p.name, p.description, p.price, p.discount_percent, p.stock_quantity,
                   p.tags, c.name AS category_name
            FROM products p LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.is_active = 1 AND p.stock_quantity > 0 AND (? IS NULL OR p.price * (1 - COALESCE(p.discount_percent, 0) / 100.0) <= ?)
            ORDER BY p.stock_quantity DESC, p.name ASC LIMIT 100
        `, [maxPrice, maxPrice]);
        const tokens = normalized.split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !['duoi', 'trieu', 'ngan', 'nghin', 'toi', 'cho', 'mot', 'can', 'muon', 'dung'].includes(token));
        const ranked = products.map((product) => {
            const haystack = normalizeText(`${product.name} ${product.category_name || ''} ${product.description || ''} ${product.tags || ''}`);
            const categoryMatch = categoryTerms.some((term) => haystack.includes(normalizeText(term)));
            const matchedTerms = tokens.filter((token) => haystack.includes(token));
            return { ...product, score: (categoryMatch ? 4 : 0) + matchedTerms.length, matchedTerms, categoryMatch };
        }).filter((product) => categoryTerms.length ? product.categoryMatch : product.score > 0 || tokens.length === 0)
            .sort((a, b) => b.score - a.score || a.price - b.price).slice(0, 6);
        const candidates = ranked.map(({ score, matchedTerms, categoryMatch, ...product }) => ({
            ...product, match_reason: categoryMatch ? `Đúng nhóm ${product.category_name || 'sản phẩm'}` : `Khớp thông tin: ${matchedTerms.slice(0, 3).join(', ') || 'còn hàng'}`
        }));
        let explanation = candidates.length ? `Đã lọc ${candidates.length} sản phẩm đang còn hàng${maxPrice ? ` trong ngân sách ${maxPrice.toLocaleString('vi-VN')}đ` : ''}. Giá và tồn kho hiển thị được lấy trực tiếp từ hệ thống.` : 'Chưa tìm thấy sản phẩm còn hàng phù hợp với nhu cầu. Hãy thử mô tả cụ thể hơn hoặc nới ngân sách.';
        let aiUsed = false;
        if (candidates.length) {
            const generated = await explainWithSmallModel(
                'Bạn là trợ lý bán hàng. Chỉ được diễn giải danh sách JSON được cung cấp, không tạo giá, tồn kho, thông số hoặc sản phẩm khác. Trả lời tiếng Việt ngắn gọn, nêu tối đa 3 lựa chọn và nhắc nhân viên xác nhận nhu cầu khách.',
                `Nhu cầu: ${need}\nSản phẩm có sẵn: ${JSON.stringify(candidates.map(({ id, name, category_name, price, discount_percent, stock_quantity, tags, description }) => ({ id, name, category_name, price, discount_percent, stock_quantity, tags, description })))}`,
                explanation
            );
            if (generated !== explanation) { explanation = generated; aiUsed = true; }
        }
        res.json({ success: true, data: { products: candidates, filters: { max_price: maxPrice, category_terms: categoryTerms }, explanation, ai_used: aiUsed } });
    } catch (error) {
        console.error('POS recommendation error:', error);
        res.status(500).json({ success: false, message: 'Không thể tạo gợi ý sản phẩm lúc này', data: null });
    }
};

export const getBundleSuggestions = async (req, res) => {
    try {
        const productIds = [...new Set((Array.isArray(req.body?.product_ids) ? req.body.product_ids : []).map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))].slice(0, 6);
        if (!productIds.length) return res.json({ success: true, data: { products: [] } });
        const placeholders = productIds.map(() => '?').join(',');
        const rows = await db.query(`
            SELECT p.id, p.name, p.price, p.discount_percent, p.stock_quantity, p.tags, c.name AS category_name,
                   COUNT(DISTINCT oi.order_id) AS together_count
            FROM order_items cart_item
            JOIN orders cart_order ON cart_order.id = cart_item.order_id AND cart_order.status <> 'cancelled'
            JOIN order_items oi ON oi.order_id = cart_item.order_id AND oi.product_id NOT IN (${placeholders})
            JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
            JOIN products p ON p.id = oi.product_id AND p.is_active = 1 AND p.stock_quantity > 0
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE cart_item.product_id IN (${placeholders})
              AND ${PAID_ORDER_SQL.replaceAll('o.', 'o.')}
            GROUP BY p.id ORDER BY together_count DESC, p.stock_quantity DESC LIMIT 6
        `, [...productIds, ...productIds]);
        let products = rows;
        if (products.length < 4) {
            const cartRows = await db.query(`SELECT p.name, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id IN (${placeholders})`, productIds);
            const cartText = normalizeText(cartRows.map((row) => `${row.name} ${row.category_name || ''}`).join(' '));
            const accessoryPatterns = cartText.includes('dien thoai') || cartText.includes('iphone') || cartText.includes('smartphone')
                ? ['op lung', 'cuong luc', 'sac', 'cap', 'tai nghe']
                : cartText.includes('laptop') || cartText.includes('may tinh')
                    ? ['chuot', 'ban phim', 'tui', 'sac', 'tai nghe'] : ['sac', 'cap', 'tai nghe', 'chuot', 'op lung'];
            const existingIds = [...productIds, ...products.map((item) => item.id)];
            const excluded = existingIds.map(() => '?').join(',');
            const accessoryCandidates = await db.query(`SELECT p.id, p.name, p.price, p.discount_percent, p.stock_quantity, p.tags, c.name AS category_name, 0 AS together_count FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 AND p.stock_quantity>0 AND p.id NOT IN (${excluded}) ORDER BY p.stock_quantity DESC,p.name LIMIT 100`, existingIds);
            const remaining = accessoryCandidates.map((product) => ({ ...product, match_score: accessoryPatterns.reduce((score, term) => score + (normalizeText(`${product.name} ${product.category_name || ''} ${product.tags || ''}`).includes(term) ? 1 : 0), 0) }))
                .filter((product) => product.match_score > 0).sort((a, b) => b.match_score - a.match_score).slice(0, 4 - products.length);
            products = [...products, ...remaining];
        }
        res.json({ success: true, data: { products: products.map(({ match_score, ...item }) => ({ ...item, reason: item.together_count > 0 ? `Thường được mua cùng (${item.together_count} đơn)` : 'Phụ kiện phù hợp, hiện còn hàng' })) } });
    } catch (error) {
        console.error('Bundle suggestion error:', error);
        res.status(500).json({ success: false, message: 'Không thể tải gợi ý sản phẩm đi kèm', data: null });
    }
};

export const getReplenishmentSuggestions = async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT p.id, p.name, p.sku, p.stock_quantity, COALESCE(p.low_stock_threshold, 5) AS low_stock_threshold,
                   COALESCE(SUM(CASE WHEN date(o.created_at) >= date('now','-30 days') THEN oi.quantity ELSE 0 END), 0) AS sold_30_days
            FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id
            LEFT JOIN orders o ON o.id=oi.order_id AND o.status<>'cancelled' AND date(o.created_at)>=date('now','-30 days')
               AND ${PAID_ORDER_SQL}
            WHERE p.is_active=1 GROUP BY p.id
        `);
        const suggestions = rows.map((item) => {
            const average_daily_sales = Number(item.sold_30_days) / 30;
            const days_of_stock = average_daily_sales > 0 ? Math.floor(item.stock_quantity / average_daily_sales) : null;
            const suggested_quantity = Math.max(0, Math.ceil(average_daily_sales * 30 - item.stock_quantity), item.stock_quantity <= item.low_stock_threshold && average_daily_sales === 0 ? item.low_stock_threshold + 1 - item.stock_quantity : 0);
            const priority = item.stock_quantity === 0 ? 'critical' : (days_of_stock !== null && days_of_stock <= 7) ? 'critical' : item.stock_quantity <= item.low_stock_threshold || (days_of_stock !== null && days_of_stock <= 14) ? 'soon' : 'normal';
            return { ...item, average_daily_sales: Number(average_daily_sales.toFixed(2)), days_of_stock, suggested_quantity, priority };
        }).filter((item) => item.priority !== 'normal').sort((a, b) => (a.days_of_stock ?? 0) - (b.days_of_stock ?? 0) || a.stock_quantity - b.stock_quantity);
        res.json({ success: true, data: { suggestions, based_on_days: 30, note: 'Đề xuất tham khảo từ lượng bán và tồn kho 30 ngày gần nhất; owner cần kiểm tra trước khi tạo phiếu nhập.' } });
    } catch (error) {
        console.error('Replenishment suggestion error:', error);
        res.status(500).json({ success: false, message: 'Không thể tính gợi ý nhập hàng', data: null });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = `
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND p.name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY p.name ASC';

        const products = await db.query(query, params);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await db.query('SELECT id, name, slug FROM categories WHERE is_active = 1');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh mục' });
    }
};

export const createStockReceipt = async (req, res) => {
    try {
        const body = req.body || {};
        const supplierName = typeof body.supplier_name === 'string' ? body.supplier_name.trim() : '';
        const supplierPhone = typeof body.supplier_phone === 'string' ? body.supplier_phone.trim() : '';
        const supplierInvoice = typeof body.supplier_invoice === 'string' ? body.supplier_invoice.trim() : '';
        const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
        const inputItems = body.items;

        if (!supplierName || supplierName.length > 120 || supplierPhone.length > 20 || supplierInvoice.length > 80 || notes.length > 500) {
            return res.status(400).json({ success: false, message: 'Thông tin nhà cung cấp hoặc chứng từ không hợp lệ', data: null });
        }
        if (!Array.isArray(inputItems) || inputItems.length === 0 || inputItems.length > 100) {
            return res.status(400).json({ success: false, message: 'Phiếu nhập cần có từ 1 đến 100 dòng sản phẩm', data: null });
        }

        const itemsByProduct = new Map();
        for (const item of inputItems) {
            const productId = Number(item?.product_id);
            const quantity = Number(item?.quantity);
            const unitCost = Number(item?.unit_cost);
            if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1 ||
                !Number.isSafeInteger(unitCost) || unitCost < 0 || !Number.isSafeInteger(quantity * unitCost)) {
                return res.status(400).json({ success: false, message: 'Sản phẩm, số lượng hoặc giá nhập không hợp lệ', data: null });
            }
            const existing = itemsByProduct.get(productId);
            if (existing && existing.unitCost !== unitCost) {
                return res.status(400).json({ success: false, message: 'Mỗi sản phẩm chỉ được có một đơn giá trong cùng phiếu nhập', data: null });
            }
            itemsByProduct.set(productId, { productId, quantity: (existing?.quantity || 0) + quantity, unitCost });
        }

        const items = [...itemsByProduct.values()];
        if (items.some((item) => !Number.isSafeInteger(item.quantity) || !Number.isSafeInteger(item.quantity * item.unitCost))) {
            return res.status(400).json({ success: false, message: 'Tổng số lượng hoặc thành tiền phiếu nhập vượt giới hạn', data: null });
        }

        let receipt;
        await db.transaction(async () => {
            const productIds = items.map((item) => item.productId);
            const placeholders = productIds.map(() => '?').join(', ');
            const products = await db.query(
                `SELECT id, name, sku, stock_quantity, is_active FROM products WHERE id IN (${placeholders})`,
                productIds
            );
            const productsById = new Map(products.map((product) => [product.id, product]));
            if (productsById.size !== productIds.length) {
                const error = new Error('Một hoặc nhiều sản phẩm không còn tồn tại');
                error.statusCode = 404;
                throw error;
            }

            for (const item of items) {
                const product = productsById.get(item.productId);
                if (!product.is_active) {
                    const error = new Error(`Sản phẩm ${product.name} đã ngừng kinh doanh`);
                    error.statusCode = 409;
                    throw error;
                }
                if (!Number.isSafeInteger(Number(product.stock_quantity) + item.quantity)) {
                    const error = new Error(`Số tồn của ${product.name} vượt giới hạn`);
                    error.statusCode = 409;
                    throw error;
                }
            }

            let supplier = null;
            if (supplierPhone) {
                supplier = await db.get('SELECT id FROM suppliers WHERE phone = ?', [supplierPhone]);
            }
            if (!supplier) {
                supplier = await db.get('SELECT id FROM suppliers WHERE name = ? ORDER BY id LIMIT 1', [supplierName]);
            }
            let supplierId;
            if (supplier) {
                supplierId = supplier.id;
                await db.run(
                    `UPDATE suppliers SET name = ?, phone = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [supplierName, supplierPhone || null, supplierId]
                );
            } else {
                const createdSupplier = await db.run(
                    'INSERT INTO suppliers (name, phone) VALUES (?, ?)',
                    [supplierName, supplierPhone || null]
                );
                supplierId = createdSupplier.lastID;
            }

            const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
            if (!Number.isSafeInteger(totalCost)) {
                const error = new Error('Tổng tiền phiếu nhập vượt giới hạn');
                error.statusCode = 400;
                throw error;
            }

            const createdReceipt = await db.run(
                `INSERT INTO purchase_receipts (supplier_id, supplier_name, supplier_invoice, total_cost, notes, received_by)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [supplierId, supplierName, supplierInvoice || null, totalCost, notes || null, req.user.id]
            );
            const receiptId = createdReceipt.lastID;

            for (const item of items) {
                const product = productsById.get(item.productId);
                const lineTotal = item.quantity * item.unitCost;
                await db.run(
                    `INSERT INTO purchase_receipt_items (receipt_id, product_id, product_name, sku, quantity, unit_cost, line_total)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [receiptId, item.productId, product.name, product.sku || null, item.quantity, item.unitCost, lineTotal]
                );
                await db.run(
                    `UPDATE products SET stock_quantity = stock_quantity + ?, import_price = ? WHERE id = ? AND is_active = 1`,
                    [item.quantity, item.unitCost, item.productId]
                );
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'purchase', ?, ?, 'purchase_receipt', ?, ?, ?)`,
                    [item.productId, item.quantity, item.unitCost, receiptId, req.user.id, `Nhập theo phiếu #${receiptId}`]
                );
            }

            receipt = { id: receiptId, supplier_name: supplierName, total_cost: totalCost, item_count: items.length };
        });

        await logAction(req.user.id, 'stock_receipt_created', 'Ghi nhận phiếu nhập kho', receipt);

        res.status(201).json({ success: true, message: 'Đã ghi nhận phiếu nhập và cập nhật tồn kho', data: receipt });
    } catch (error) {
        console.error('Lỗi khi ghi nhận phiếu nhập:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Lỗi khi ghi nhận phiếu nhập kho', data: null });
    }
};

export const getStockReceipts = async (req, res) => {
    try {
        const receipts = await db.query(`
            SELECT pr.*, COALESCE(u.full_name, u.username, 'Tài khoản đã xóa') AS receiver_name
            FROM purchase_receipts pr
            LEFT JOIN users u ON u.id = pr.received_by
            ORDER BY pr.created_at DESC, pr.id DESC
            LIMIT 100
        `);
        for (const receipt of receipts) {
            receipt.items = await db.query(
                `SELECT product_name, sku, quantity, unit_cost, line_total
                 FROM purchase_receipt_items WHERE receipt_id = ? ORDER BY id`,
                [receipt.id]
            );
        }
        res.json({ success: true, data: receipts });
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử nhập kho:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử nhập kho', data: null });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { sku, name, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months } = req.body;
        const initialStock = Number(stock_quantity ?? 0);
        if (!name || !String(name).trim() || !Number.isSafeInteger(initialStock) || initialStock < 0) {
            return res.status(400).json({ success: false, message: 'Tên sản phẩm và số tồn kho hợp lệ là bắt buộc', data: null });
        }
        
        let baseSlug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
            
        if (!baseSlug || baseSlug === '-') baseSlug = 'product';
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            const existing = await db.get('SELECT id FROM products WHERE slug = ?', [slug]);
            if (!existing) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        let productId;
        await db.transaction(async () => {
            const product = await db.run(
                `INSERT INTO products (sku, name, slug, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [sku, String(name).trim(), slug, category_id, unit, import_price, price, discount_percent, image_url, initialStock, low_stock_threshold, description, is_active !== undefined ? is_active : 1, tags || '', warranty_months || 0]
            );
            productId = product.lastID;
            if (initialStock > 0) {
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'opening', ?, ?, 'product', ?, ?, 'Tồn kho ban đầu khi tạo sản phẩm')`,
                    [productId, initialStock, import_price || null, productId, req.user.id]
                );
            }
        });
        res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: { id: productId } });
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo sản phẩm: ' + error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, name, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months } = req.body;
        const targetStock = Number(stock_quantity);
        if (!name || !String(name).trim() || !Number.isSafeInteger(targetStock) || targetStock < 0) {
            return res.status(400).json({ success: false, message: 'Tên sản phẩm và số tồn kho hợp lệ là bắt buộc', data: null });
        }
        
        let baseSlug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
            
        if (!baseSlug || baseSlug === '-') baseSlug = 'product';
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            const existing = await db.get('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id]);
            if (!existing) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        await db.transaction(async () => {
            const currentProduct = await db.get('SELECT id, stock_quantity FROM products WHERE id = ?', [id]);
            if (!currentProduct) {
                const error = new Error('Không tìm thấy sản phẩm');
                error.statusCode = 404;
                throw error;
            }
            await db.run(
                `UPDATE products SET sku=?, name=?, slug=?, category_id=?, unit=?, import_price=?, price=?, discount_percent=?, image_url=?, stock_quantity=?, low_stock_threshold=?, description=?, is_active=?, tags=?, warranty_months=? WHERE id=?`,
                [sku, String(name).trim(), slug, category_id, unit, import_price, price, discount_percent, image_url, targetStock, low_stock_threshold, description, is_active, tags || '', warranty_months || 0, id]
            );

            const quantityChange = targetStock - currentProduct.stock_quantity;
            if (quantityChange !== 0) {
                await db.run(
                    `INSERT INTO inventory_movements (product_id, movement_type, quantity_change, unit_cost, reference_type, reference_id, user_id, note)
                     VALUES (?, 'adjustment', ?, ?, 'product', ?, ?, ?)`,
                    [id, quantityChange, import_price || null, id, req.user.id, `Điều chỉnh tồn kho từ ${currentProduct.stock_quantity} thành ${targetStock}`]
                );
            }
        });
        res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Lỗi khi cập nhật sản phẩm: ' + error.message, data: null });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.run(`UPDATE products SET is_active = 0 WHERE id = ?`, [id]);
        res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm' });
    }
};
