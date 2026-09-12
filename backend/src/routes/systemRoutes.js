import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as systemController from '../controllers/systemController.js';

const router = express.Router();

// Lấy cấu hình thì cần auth chung (vì Layout cần lấy link nhạc nền)
router.get('/config', requireAuth, systemController.getConfigs);

// Cập nhật cấu hình & Sao lưu DB thì bắt buộc Admin
router.put('/config', requireAuth, requireRole(['admin']), systemController.updateConfigs);
router.get('/backup', requireAuth, requireRole(['admin']), systemController.backupDatabase);
router.post('/reset-data', requireAuth, requireRole(['admin']), systemController.resetData);
router.post('/check-ollama', requireAuth, requireRole(['admin']), systemController.checkOllama);

export default router;
