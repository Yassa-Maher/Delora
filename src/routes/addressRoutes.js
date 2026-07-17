import express from 'express';
import { getMyAddresses, addAddress, deleteAddress } from '../controllers/addressController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // جميع مسارات العناوين تتطلب تسجيل دخول العميل 🔐

router.get('/', getMyAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;