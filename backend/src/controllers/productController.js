import * as db from '../services/db.js';

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

export const createProduct = async (req, res) => {
    try {
        const { sku, name, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months } = req.body;
        
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
        
        await db.run(
            `INSERT INTO products (sku, name, slug, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sku, name, slug, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active !== undefined ? is_active : 1, tags || '', warranty_months || 0]
        );
        res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo sản phẩm: ' + error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, name, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags, warranty_months } = req.body;
        
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

        await db.run(
            `UPDATE products SET sku=?, name=?, slug=?, category_id=?, unit=?, import_price=?, price=?, discount_percent=?, image_url=?, stock_quantity=?, low_stock_threshold=?, description=?, is_active=?, tags=?, warranty_months=? WHERE id=?`,
            [sku, name, slug, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags || '', warranty_months || 0, id]
        );
        res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sản phẩm: ' + error.message });
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
