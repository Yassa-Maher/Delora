import express from 'express';
import { getActiveBanners, getAllBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveBanners); // عام للجمهور





// مسارات الأدمن المحمية 🔒
router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.get('/', getAllBanners);
router.post('/', createBanner);
router.delete('/:id', deleteBanner);

export default router;