import express from 'express';
import { getAdminLogs } from '../controllers/logController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// السجلات حساسة جداً، تعرض فقط للـ Super Admin 🔒
router.get('/', protect, authorizeRoles('super_admin'), getAdminLogs);

export default router;