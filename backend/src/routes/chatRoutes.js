import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

// Bảo mật endpoint: Bắt buộc đăng nhập để xác định role
router.post('/stream', requireAuth, chatController.streamChat);

// --- API CHAT NỘI BỘ ---
router.get('/users', requireAuth, chatController.getChatUsers);
router.get('/history/:partnerId', requireAuth, chatController.getChatHistory);
router.post('/message', requireAuth, chatController.sendMessage);

export default router;
