import express from 'express';
import { createCategory, getAllCategories } from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, createCategory); // هنعدل شرط الأدمن بشكل أدق لاحقاً بناءً على الـ Roles الجديدة

export default router;