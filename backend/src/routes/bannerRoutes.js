import express from 'express';
import { createBanner, getBanners, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getBanners);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('image'), createBanner);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('image'), updateBanner);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteBanner);

export default router;
