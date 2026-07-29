import express from 'express';
import { getStock, updateStock, addBatch, getBatches, deleteBatch } from '../controllers/inventoryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('super_admin', 'store_manager'));

router.get('/stock', getStock);
router.put('/stock', updateStock);
router.get('/batches', getBatches);
router.post('/batches', addBatch);
router.delete('/batches/:id', deleteBatch);

export default router;
