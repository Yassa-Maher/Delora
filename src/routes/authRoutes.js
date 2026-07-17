// src/routes/authRoutes.js
import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// مسارات البروفايل المحمية لكي يسحبها الفرونت إند 🔐
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;