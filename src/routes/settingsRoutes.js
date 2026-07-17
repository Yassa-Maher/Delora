// src/routes/settingsRoutes.js
import express from 'express';
// 👇 التغيير هنا: تأكد من كتابة اسم الفايل صح تبعاً لاسم الملف عندك
import { getStoreSettings, updateStoreSetting } from '../controllers/settingsController.js'; 
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. جلب الإعدادات (متاح للجميع)
router.get('/', getStoreSettings);

// 2. تحديث إعداد معين (محمي للأدمن فقط)
router.put('/', protect, authorizeRoles('admin'), updateStoreSetting);

export default router;