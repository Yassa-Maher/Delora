import express from 'express';
import { getPaymentMethods, getActivePaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../controllers/paymentMethodController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getPaymentMethods);
router.get('/active', getActivePaymentMethods);
router.post('/', protect, authorizeRoles('super_admin'), createPaymentMethod);
router.put('/:id', protect, authorizeRoles('super_admin'), updatePaymentMethod);
router.delete('/:id', protect, authorizeRoles('super_admin'), deletePaymentMethod);

export default router;
