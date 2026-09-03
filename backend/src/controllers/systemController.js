import * as db from '../services/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy toàn bộ cấu hình hệ thống
export const getConfigs = async (req, res) => {
    try {
        const rows = await db.query('SELECT key, value FROM system_configs');
        const config = {};
        rows.forEach(row => {
            config[row.key] = row.value;
        });
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi tải cấu hình' });
    }
};

// Cập nhật cấu hình hệ thống
export const updateConfigs = async (req, res) => {
    const configs = req.body;
    try {
        for (const [key, value] of Object.entries(configs)) {
            await db.run(
                'INSERT INTO system_configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                [key, value]
            );
        }
        res.status(200).json({ success: true, message: 'Đã lưu cấu hình hệ thống' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lưu cấu hình' });
    }
};

// Sao lưu Database
export const backupDatabase = async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../../database/ecom_ai.db');
        const fileName = `ecom_ai_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
        res.download(dbPath, fileName, (err) => {
            if (err) console.error('Lỗi tải file backup:', err);
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi sao lưu CSDL' });
    }
};

// Khôi phục CSDL (Reset Data)
export const resetData = async (req, res) => {
    try {
        const { confirmation } = req.body;
        if (confirmation !== 'XAC NHAN XOA') {
            return res.status(400).json({ success: false, message: 'Xác nhận không hợp lệ. Vui lòng nhập đúng chữ XAC NHAN XOA' });
        }

        await db.run('BEGIN TRANSACTION');
        
        // Xóa các bảng dữ liệu rác (Transaction, Order, v.v.)
        await db.run('DELETE FROM order_items');
        await db.run('DELETE FROM installment_payments');
        await db.run('DELETE FROM orders');
        await db.run('DELETE FROM transactions');
        await db.run('DELETE FROM attendance');
        
        // Xóa bảng sản phẩm theo yêu cầu của user
        await db.run('DELETE FROM products');

        await db.run('COMMIT');

        res.status(200).json({ success: true, message: 'Đã dọn sạch dữ liệu thành công!' });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Lỗi khi xóa dữ liệu:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};
