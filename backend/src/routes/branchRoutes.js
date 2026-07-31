import express from 'express';
import { createBranch, getBranches, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getBranches);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createBranch);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updateBranch);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteBranch);

export default router;
