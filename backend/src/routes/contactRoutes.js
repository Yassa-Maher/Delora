import express from 'express';
import { submitContact, getContacts, markContactRead, replyContact, deleteContact } from '../controllers/contactController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, authorizeRoles('super_admin'), getContacts);
router.put('/:id/read', protect, authorizeRoles('super_admin'), markContactRead);
router.post('/:id/reply', protect, authorizeRoles('super_admin'), replyContact);
router.delete('/:id', protect, authorizeRoles('super_admin'), deleteContact);

export default router;
