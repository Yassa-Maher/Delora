import express from 'express';
import { register, login, verifyEmail, resendOtp, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import db from '../config/db.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.get('/profile', protect, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, gender, role, photo_url FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        res.status(200).json({ user: users[0] });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
});
router.put('/profile', protect, upload.single('photo'), updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
