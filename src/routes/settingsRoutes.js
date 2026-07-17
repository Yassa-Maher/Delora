import express from 'express';
import { getStoreSettings, updateStoreSetting } from '../controllers/settingsController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getStoreSettings); // جلب الإعدادات

// تحديث الإعدادات محمي للأدمن 🔒
router.put('/', protect, authorizeRoles('super_admin', 'store_manager'), updateStoreSetting);

export default router;