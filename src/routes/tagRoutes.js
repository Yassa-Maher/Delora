import express from 'express';
import { getProductsByTag, assignTag } from '../controllers/tagController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:tagName', getProductsByTag); 
router.post('/assign', protect, authorizeRoles('super_admin', 'store_manager'), assignTag);

export default router;