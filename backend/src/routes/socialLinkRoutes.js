import express from 'express';
import { getSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } from '../controllers/socialLinkController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getSocialLinks);
router.post('/', protect, authorizeRoles('super_admin'), createSocialLink);
router.put('/:id', protect, authorizeRoles('super_admin'), updateSocialLink);
router.delete('/:id', protect, authorizeRoles('super_admin'), deleteSocialLink);

export default router;
