import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.use(requireAuth);
// Chỉ cho phép Owner truy cập Sổ quỹ
router.use(requireRole(['owner', 'admin']));

router.get('/summary', transactionController.getSummary);
router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.post('/collect', transactionController.collectFromStaff);

export default router;
