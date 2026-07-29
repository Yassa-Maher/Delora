import express from 'express';
import { getMyNotifications, getUnreadCount, markNotificationRead, markAllRead } from '../controllers/userNotificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllRead);

export default router;
