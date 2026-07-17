// src/routes/categoryRoutes.js
import express from 'express';
import { createCategory, getAllCategories } from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مسار عام لجلب الأقسام
router.get('/', getAllCategories);

// 🔒 مسار محمي للأدمن والمديرين لإنشاء قسم جديد
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createCategory);

export default router;