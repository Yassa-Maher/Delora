// src/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// مسار إنشاء حساب: POST http://localhost:5000/api/auth/register
router.post('/register', register);

// مسار تسجيل الدخول: POST http://localhost:5000/api/auth/login
router.post('/login', login);

export default router;