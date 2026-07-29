import express from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('image'), createCategory);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteCategory);

export default router;
