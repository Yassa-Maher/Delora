import express from 'express';
import { createNotification, getActiveNotifications, getAllNotifications, updateNotification, deleteNotification } from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveNotifications);
router.get('/all', protect, authorizeRoles('super_admin', 'store_manager'), getAllNotifications);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createNotification);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updateNotification);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteNotification);

export default router;
