// src/routes/productRoutes.js
import express from 'express';
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct 
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مسارات عامة للجميع (تعتمد على اللغة المرسلة تلقائياً)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 🔒 مسارات إدارية محمية لإضافة وتعديل المنتجات (خاص بالـ Roles الجديدة)
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createProduct);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updateProduct);

export default router;