import express from 'express';
import { attachBotUser } from '../middlewares/authMiddleware.js';
import * as botController from '../controllers/botController.js';
import * as botSupportController from '../controllers/botSupportController.js';
import multer from 'multer';
import { uploadChatImage } from '../middlewares/chatImageUpload.js';

const router = express.Router();
const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            return callback(new Error('Chỉ nhận ảnh JPG, PNG hoặc WEBP.'));
        }
        callback(null, true);
    }
});
const receiveBotImage = (req, res, next) => uploadImage.single('image')(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh không được vượt quá 5 MB.' : error.message, data: null });
    next();
});

// Công khai: tạo tài khoản khách hàng & đăng nhập Bot
router.post('/register', botController.registerCustomer);
router.post('/register/verify', botController.verifyCustomerRegistration);
router.post('/login', botController.loginBot);
router.post('/logout', attachBotUser, botController.logoutBot);
router.post('/actions/:id/confirm', attachBotUser, botController.confirmCustomerAction);
router.post('/actions/:id/cancel', attachBotUser, botController.cancelCustomerAction);
router.post('/handoff', attachBotUser, botController.requestHumanHelp);
router.get('/handoff/:id/messages', botSupportController.getCustomerMessages);
router.post('/handoff/:id/messages', uploadChatImage, botSupportController.sendCustomerMessage);
router.post('/handoff/:id/close', botSupportController.closeCustomerSession);

// Khách vãng lai được hỏi sản phẩm/chính sách; hội thoại nhạy cảm cần đăng nhập hoặc gặp nhân viên.
router.get('/profile', attachBotUser, botController.getBotProfile);
router.get('/updates', attachBotUser, botController.getCustomerUpdates);
router.get('/orders/:id/invoice.svg', attachBotUser, botController.getCustomerInvoiceImage);
router.post('/stream', attachBotUser, receiveBotImage, botController.streamBot);

export default router;
