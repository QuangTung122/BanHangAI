import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/receipts', requireRole(['owner', 'admin']), productController.getStockReceipts);
router.get('/replenishment-suggestions', requireRole(['owner', 'admin']), productController.getReplenishmentSuggestions);

router.post('/assist', requireRole(['staff', 'owner', 'admin']), productController.getPosRecommendations);
router.post('/bundle-suggestions', requireRole(['staff', 'owner', 'admin']), productController.getBundleSuggestions);

router.post('/', requireRole(['owner', 'admin']), productController.createProduct);
router.post('/receipts', requireRole(['owner', 'admin']), productController.createStockReceipt);
router.put('/:id', requireRole(['owner', 'admin']), productController.updateProduct);
router.delete('/:id', requireRole(['owner', 'admin']), productController.deleteProduct);

export default router;
