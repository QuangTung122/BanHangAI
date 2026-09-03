import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

export default router;
