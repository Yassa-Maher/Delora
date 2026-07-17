import express from 'express';
import { 
    getActiveNotifications, 
    getAllNotifications, 
    createNotification, 
    deleteNotification 
} from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js'; //[cite: 6]

const router = express.Router();

// 1. مسار عام ومفتوح للـ Frontend لجلب الإشعارات النشطة لعرضها للزوار
router.get('/active', getActiveNotifications);

// جميع المسارات التالية محمية وتتطلب تسجيل دخول بأدوار الإدارة فقط 🔒
router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager')); //[cite: 14]

router.get('/', getAllNotifications);         // جلب الكل للوحة التحكم
router.post('/', createNotification);       // إضافة تنويه جديد
router.delete('/:id', deleteNotification);   // حذف تنويه

export default router;