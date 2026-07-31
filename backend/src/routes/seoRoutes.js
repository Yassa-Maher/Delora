import express from 'express';
import { upsertSeo, getSeo, deleteSeo } from '../controllers/seoController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:entity_type/:entity_id', getSeo);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), upsertSeo);
router.delete('/:entity_type/:entity_id', protect, authorizeRoles('super_admin', 'store_manager'), deleteSeo);

export default router;
