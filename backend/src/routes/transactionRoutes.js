import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

// Cấu hình Multer để upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.use(requireAuth);
// Chỉ cho phép Owner truy cập Sổ quỹ
router.use(requireRole(['owner', 'admin']));

router.get('/summary', transactionController.getSummary);
router.get('/', transactionController.getTransactions);
router.post('/', upload.single('attachment'), transactionController.createTransaction);
router.post('/collect', transactionController.collectFromStaff);

export default router;
