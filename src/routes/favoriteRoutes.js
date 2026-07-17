import express from 'express';
import { getMyFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // جميع مسارات المفضلة تتطلب تسجيل دخول العميل 🔐

router.get('/', getMyFavorites);
router.post('/toggle', toggleFavorite);

export default router;