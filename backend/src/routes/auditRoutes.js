import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as auditController from '../controllers/auditController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin']), auditController.getLogs);

export default router;
