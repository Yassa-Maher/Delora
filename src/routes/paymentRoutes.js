// src/routes/paymentRoutes.js
import express from 'express';
import { initiatePaymobPayment, paymobWebhook } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مسار توليد رابط الدفع (يجب أن يكون المستخدم مسجلاً)
router.post('/checkout', protect, initiatePaymobPayment);

// الـ Webhook الخاص بـ Paymob (يجب أن يظل عاماً بدون حماية Token لأن السيرفر الخارجي هو من يستدعيه)
router.post('/webhook', paymobWebhook);

export default router;