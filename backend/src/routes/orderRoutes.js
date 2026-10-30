import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.use(requireAuth);
router.get('/my-stats', orderController.getMyStats);
router.get('/bot-pending', requireRole(['staff', 'owner', 'admin']), (req, res) => orderController.getOrders(req, res, { type: 'full', botPendingOnly: true }));
router.post('/:id/confirm-bot', requireRole(['staff']), orderController.confirmBotOrder);
router.post('/:id/confirm-payment', requireRole(['staff']), orderController.confirmOrderPayment);
router.post('/', requireRole(['staff']), orderController.createOrder);
router.get('/', orderController.getOrders);

export default router;
