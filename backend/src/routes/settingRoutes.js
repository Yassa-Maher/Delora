import express from 'express';
import { getSettings, updateSetting, deleteSetting } from '../controllers/settingController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorizeRoles('super_admin'), updateSetting);
router.delete('/:keyName', protect, authorizeRoles('super_admin'), deleteSetting);

export default router;
