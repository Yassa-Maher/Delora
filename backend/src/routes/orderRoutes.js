import express from 'express';
import {
    checkoutOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    uploadPaymentProof,
    reviewWalletPayment,
    getOrderStats
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.post('/checkout', checkoutOrder);

router.post('/payment-proof', upload.single('proof_image'), uploadPaymentProof);

router.put('/review-wallet-payment', authorizeRoles('super_admin', 'store_manager'), reviewWalletPayment);

router.get('/my-orders', getMyOrders);

router.get('/stats', authorizeRoles('super_admin', 'store_manager'), getOrderStats);
router.get('/all', authorizeRoles('super_admin', 'store_manager'), getAllOrders);
router.put('/:id/status', authorizeRoles('super_admin', 'store_manager'), updateOrderStatus);

export default router;
