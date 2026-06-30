// src/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; // 👈 استيراد الميدل وير

const router = express.Router();

router.post('/register', register); //[cite: 4]
router.post('/login', login); //[cite: 4]

// 👈 روت تجريبي محمي: مش هيدخل غير اللي معاه Token صالح
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: 'أهلاً بك في صفحتك الشخصية المحمية يا هندسة! 🔐',
        user: req.user // هيرجع الـ id والـ role المفكوكين من التوكن
    });
});

export default router;