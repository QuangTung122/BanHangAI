import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/password', profileController.changePassword);

export default router;
