import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { uploadChatImage } from '../middlewares/chatImageUpload.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

// --- API CHAT NỘI BỘ ---
router.get('/users', requireAuth, chatController.getChatUsers);
router.get('/history/:partnerId', requireAuth, chatController.getChatHistory);
router.post('/message', requireAuth, uploadChatImage, chatController.sendMessage);

export default router;
