import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../config/email.js';
import env from '../config/env.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
    const { name, email, password, phone, gender } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'من فضلك املأ جميع الحقول الأساسية' });
    }

    try {
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const otp = generateOtp();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

        const [result] = await db.query(
            `INSERT INTO users (name, email, password_hash, phone, gender, role, verification_code, code_expires_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, passwordHash, phone, gender || 'male', 'customer', otp, codeExpires]
        );

        try {
            await sendOtpEmail(email, otp);
        } catch (emailErr) {
            console.error('Failed to send OTP email:', emailErr.message);
        }

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح! تم إرسال كود التحقق إلى بريدك الإلكتروني',
            userId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'البريد الإلكتروني وكود التحقق مطلوبان' });
    }

    try {
        const [users] = await db.query(
            'SELECT id, verification_code, code_expires_at FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'المستخدم غير موجود' });
        }

        const user = users[0];

        if (user.verification_code !== otp) {
            return res.status(400).json({ message: 'كود التحقق غير صحيح' });
        }

        if (new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ message: 'انتهت صلاحية كود التحقق. الرجاء طلب كود جديد' });
        }

        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_code = NULL, code_expires_at = NULL WHERE id = ?',
            [user.id]
        );

        res.status(200).json({ message: 'تم التحقق من البريد الإلكتروني بنجاح!' });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const resendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'المستخدم غير موجود' });
        }

        const otp = generateOtp();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?',
            [otp, codeExpires, users[0].id]
        );

        try {
            await sendOtpEmail(email, otp);
        } catch (emailErr) {
            console.error('Failed to resend OTP:', emailErr.message);
        }

        res.status(200).json({ message: 'تم إرسال كود التحقق الجديد إلى بريدك الإلكتروني' });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'من فضلك أدخل البريد الإلكتروني وكلمة المرور' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                message: 'البريد الإلكتروني غير موثق. الرجاء التحقق من بريدك الإلكتروني',
                needsVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            env.jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: user.photo_url
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, phone, gender } = req.body;

    try {
        const updates = [];
        const values = [];

        if (name) { updates.push('name = ?'); values.push(name); }
        if (phone) { updates.push('phone = ?'); values.push(phone); }
        if (gender) { updates.push('gender = ?'); values.push(gender); }
        if (req.file) { updates.push('photo_url = ?'); values.push(req.file.filename); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
        }

        values.push(userId);
        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const [users] = await db.query(
            'SELECT id, name, email, phone, gender, role, photo_url FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({ message: 'تم تحديث الملف الشخصي بنجاح', user: users[0] });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' });
        }

        const otp = generateOtp();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?',
            [otp, codeExpires, users[0].id]
        );

        try {
            await sendOtpEmail(email, otp);
        } catch (emailErr) {
            console.error('Failed to send reset OTP:', emailErr.message);
        }

        res.status(200).json({ message: 'تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
        return res.status(400).json({ message: 'البريد الإلكتروني وكود التحقق وكلمة المرور الجديدة مطلوبة' });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    try {
        const [users] = await db.query(
            'SELECT id, verification_code, code_expires_at FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'المستخدم غير موجود' });
        }

        const user = users[0];

        if (user.verification_code !== otp) {
            return res.status(400).json({ message: 'كود التحقق غير صحيح' });
        }

        if (new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ message: 'انتهت صلاحية كود التحقق. الرجاء طلب كود جديد' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(new_password, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, verification_code = NULL, code_expires_at = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        res.status(200).json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
