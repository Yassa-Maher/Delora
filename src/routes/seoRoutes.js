import express from 'express';
import { getSeoDetails, saveSeoDetails } from '../controllers/seoController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:entity_type/:entity_id', getSeoDetails); // مسار عام للـ Frontend والـ SSR

// مسار الأدمن لحفظ وتعديل السيو 🔒
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), saveSeoDetails);

export default router;