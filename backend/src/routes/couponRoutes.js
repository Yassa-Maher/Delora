import express from 'express';
import { createCoupon, getCoupons, validateCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorizeRoles('super_admin', 'store_manager'), getCoupons);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createCoupon);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updateCoupon);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteCoupon);

export default router;
