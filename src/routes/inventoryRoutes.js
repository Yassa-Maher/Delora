import express from 'express';
import { receiveInventoryBatch, getInventoryBatches } from '../controllers/inventoryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// جميع مسارات المخازن والباتشات محمية وتخص الإدارة فقط 🔒
router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.post('/receive', receiveInventoryBatch); // توريد شحنة جديدة
router.get('/', getInventoryBatches);           // مراجعة كل الباتشات والتواريخ

export default router;