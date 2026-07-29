import express from 'express';
import { addToCart, getCart, updateCartItemQuantity, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:id', updateCartItemQuantity);
router.delete('/:productId', removeFromCart);

export default router;
