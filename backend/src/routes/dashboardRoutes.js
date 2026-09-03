import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'admin']));

router.get('/', dashboardController.getOwnerDashboard);
router.post('/insight', dashboardController.getDashboardInsight);

export default router;
