import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { uploadChatImage } from '../middlewares/chatImageUpload.js';
import * as controller from '../controllers/botSupportController.js';

const router = express.Router();
const supportStaff = requireRole(['staff', 'owner']);

router.use(requireAuth);
router.get('/insights', requireRole(['owner', 'admin']), controller.getDemandInsights);
router.use(supportStaff);
router.get('/notifications/summary', controller.getNotificationSummary);
router.get('/requests', controller.listRequests);
router.get('/requests/:id/messages', controller.getStaffMessages);
router.post('/requests/:id/accept', controller.acceptRequest);
router.post('/requests/:id/decline', controller.declineRequest);
router.post('/requests/:id/messages', uploadChatImage, controller.sendStaffMessage);
router.post('/requests/:id/close', controller.closeRequest);

export default router;
