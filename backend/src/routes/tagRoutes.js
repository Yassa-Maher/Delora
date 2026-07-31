import express from 'express';
import { createTag, getTags, deleteTag, attachTag, detachTag, getEntityTags } from '../controllers/tagController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getTags);
router.get('/entity/:entity_type/:entity_id', getEntityTags);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createTag);
router.post('/attach', protect, authorizeRoles('super_admin', 'store_manager'), attachTag);
router.post('/detach', protect, authorizeRoles('super_admin', 'store_manager'), detachTag);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteTag);

export default router;
