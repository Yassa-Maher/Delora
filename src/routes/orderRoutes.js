// src/routes/orderRoutes.js
import express from 'express';
import { checkoutOrder, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // جميع مسارات الطلبات تحتاج توكن

router.post('/checkout', checkoutOrder); // تحويل السلة لطلب
router.get('/my-orders', getMyOrders);   // رؤية الطلبات السابقة للعميل

export default router;