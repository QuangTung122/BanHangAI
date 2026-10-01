import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.use(requireAuth);
router.get('/my-stats', orderController.getMyStats);
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);

export default router;
