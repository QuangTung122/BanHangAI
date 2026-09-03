import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

// Tạm thời cho phép public hoặc requireAuth. Tốt nhất cứ dùng requireAuth để bảo mật.
router.post('/stream', chatController.streamChat);

export default router;
