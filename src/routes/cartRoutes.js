import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// جميع مسارات السلة محمية وتتطلب تسجيل دخولCustomer أو أي دور آخر
router.use(protect); 

router.post('/', addToCart);          // إضافة أو تحديث كمية
router.get('/', getCart);             // عرض السلة للعميل الحالي
router.delete('/:productId', removeFromCart); // حذف منتج من السلة

export default router;