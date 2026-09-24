import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import {
    createReturnRequest,
    getReturnRequests,
    approveReturnRequest,
    createWarrantyClaim,
    getWarrantyClaims,
    updateWarrantyClaimStatus,
    deleteReturnRequest,
    deleteWarrantyClaim
} from '../controllers/returnWarrantyController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['staff', 'admin', 'owner']));

router.post('/returns', createReturnRequest);
router.get('/returns', getReturnRequests);
router.put('/returns/:id/approve', approveReturnRequest);

router.post('/warranty-claims', createWarrantyClaim);
router.get('/warranty-claims', getWarrantyClaims);
router.put('/warranty-claims/:id/status', updateWarrantyClaimStatus);

router.delete('/returns/:id', deleteReturnRequest);
router.delete('/warranty-claims/:id', deleteWarrantyClaim);

export default router;
