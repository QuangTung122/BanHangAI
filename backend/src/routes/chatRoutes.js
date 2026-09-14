import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

// Bảo mật endpoint: Bắt buộc đăng nhập để xác định role
router.post('/stream', requireAuth, chatController.streamChat);

export default router;
