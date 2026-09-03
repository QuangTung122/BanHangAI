import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);

router.post('/', requireRole(['owner', 'admin']), productController.createProduct);
router.put('/:id', requireRole(['owner', 'admin']), productController.updateProduct);
router.delete('/:id', requireRole(['owner', 'admin']), productController.deleteProduct);

export default router;
