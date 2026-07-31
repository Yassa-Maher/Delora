import express from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', addFavorite);
router.get('/', getFavorites);
router.delete('/:productId', removeFavorite);

export default router;
