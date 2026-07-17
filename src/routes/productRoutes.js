import express from 'express';
import { getAllProducts, createProduct } from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', protect, createProduct);

export default router;