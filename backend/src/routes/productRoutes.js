import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('product_image'), createProduct);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('product_image'), updateProduct);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteProduct);

export default router;
