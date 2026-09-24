import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Yêu cầu quyền Admin hoặc Owner
router.use(requireAuth);
router.use(requireRole(['admin', 'owner']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/role', userController.changeRole);
router.put('/:id/status', userController.toggleStatus);
router.put('/:id/reset-password', userController.resetPassword);
router.put('/:id/wage', userController.updateWage);
router.delete('/:id', userController.deleteUser);

export default router;
