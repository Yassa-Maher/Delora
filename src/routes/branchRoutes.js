import express from 'express';
import { getActiveBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveBranches); // مسار عام

// مسارات الأدمن المحمية 🔒
router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;