import express from 'express';
import { createReview, getProductReviews, deleteReview, moderateReview } from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/moderate', protect, authorizeRoles('super_admin', 'store_manager'), moderateReview);

export default router;
