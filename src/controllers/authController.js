// src/controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// إعداد سيرفر الجيميل (SMTP) لإرسال الأكواد تلقائياً
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// 1. إنشاء حساب جديد (Customer) + إرسال كود التحقق (OTP)
export const register = async (req, res) => {
    const { name, email, password, phone, gender } = req.body;
    const lang = req.lang;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please fill all required fields.' : 'من فضلك املأ جميع الحقول الأساسية.' 
        });
    }

    try {
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Email or Phone number is already registered.' : 'هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // توليد كود الـ OTP ووقت انتهاء صلاحيته (10 دقائق)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        const [result] = await db.query(
            `INSERT INTO users (name, email, password_hash, phone, gender, role, is_verified, verification_code, code_expires_at) 
             VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?)`,
            [name, email, passwordHash, phone, gender || 'male', 'customer', otpCode, expiresAt]
        );

        // إرسال الكود بناءً على اللغة
        const mailSubject = lang === 'en' ? 'Verify Your Account - Delora' : 'تأكيد حسابك - كود التحقق لديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
                <h2 style="color: #333;">Welcome ${name} to Delora! 🎉</h2>
                <p style="color: #555; font-size: 16px;">Thank you for registering with us. Your account activation OTP code is:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0; font-size: 34px;">${otpCode}</h1>
                </div>
                <p style="color: #999; font-size: 12px;">This code is valid for 10 minutes only for security reasons.</p>
            </div>
        ` : `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: center;">
                <h2 style="color: #333;">أهلاً بك يا ${name} في ديلورا! 🎉</h2>
                <p style="color: #555; font-size: 16px;">شكراً لتسجيلك معنا. كود التحقق الخاص بك لتفعيل الحساب هو:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0; font-size: 34px;">${otpCode}</h1>
                </div>
                <p style="color: #999; font-size: 12px;">هذا الكود صالح لمدة 10 دقائق فقط لدواعي الأمان.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        });

        res.status(201).json({ 
            message: lang === 'en' ? 'Your data has been registered successfully! Verification code has been sent to your email. 📨' : 'تم تسجيل بياناتك بنجاح! تم إرسال كود التحقق إلى بريدك الإلكتروني. 📨',
            userId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while creating the account.' : 'حدث خطأ أثناء إنشاء الحساب.', 
            error: error.message 
        });
    }
};

// 2. التحقق من الكود وتفعيل الحساب بشكل نهائي
export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    const lang = req.lang;

    if (!email || !otp) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Email and OTP code are required.' : 'البريد الإلكتروني وكود التحقق مطلوبان.' 
        });
    }

    try {
        const [user] = await db.query('SELECT verification_code, code_expires_at FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }

        const { verification_code, code_expires_at } = user[0];

        if (verification_code !== otp || new Date() > new Date(code_expires_at)) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Invalid or expired code. ❌' : 'الكود غير صحيح أو انتهت صلاحيته ❌' 
            });
        }

        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_code = NULL, code_expires_at = NULL WHERE email = ?',
            [email]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Your account has been verified successfully! You can log in now. 🚀🛒' : 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول 🚀🛒' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred during verification.' : 'حدث خطأ أثناء عملية التحقق.', 
            error: error.message 
        });
    }
};

// 3. إعادة إرسال كود التفعيل (Resend OTP) 🔄
export const resendOTP = async (req, res) => {
    const { email } = req.body;
    const lang = req.lang;

    if (!email) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Email is required.' : 'البريد الإلكتروني مطلوب.' 
        });
    }

    try {
        const [user] = await db.query('SELECT id, name, is_verified FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'This email is not registered.' : 'هذا الإيميل غير مسجل.' 
            });
        }
        if (user[0].is_verified) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'This account is already verified, you can log in.' : 'هذا الحساب مفعّل بالفعل، يمكنك تسجيل الدخول.' 
            });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query('UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?', [newOtp, expiresAt, email]);

        const mailSubject = lang === 'en' ? 'Resend Verification Code - Delora' : 'إعادة إرسال كود التحقق - ديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="text-align: center; font-family: sans-serif;">
                <h3>Your new verification code is:</h3>
                <h1 style="color: #2196F3; letter-spacing: 5px;">${newOtp}</h1>
                <p>Valid for 10 minutes.</p>
            </div>
        ` : `
            <div style="direction: rtl; text-align: center; font-family: sans-serif;">
                <h3>كود التحقق الجديد الخاص بك:</h3>
                <h1 style="color: #2196F3; letter-spacing: 5px;">${newOtp}</h1>
                <p>صالح لمدة 10 دقائق.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        });

        res.status(200).json({ 
            message: lang === 'en' ? 'Verification code has been resent successfully! 📩' : 'تم إعادة إرسال كود التحقق بنجاح! 📩' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while resending the code.' : 'حدث خطأ أثناء إعادة إرسال الكود.', 
            error: error.message 
        });
    }
};

// 4. طلب استعادة كلمة المرور (Forgot Password) 🔑
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const lang = req.lang;

    if (!email) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please enter your email.' : 'من فضلك أدخل البريد الإلكتروني.' 
        });
    }

    try {
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Email not found.' : 'البريد الإلكتروني غير موجود.' 
            });
        }

        // استخدام نفس الحقول المخصصة في قاعدة البيانات
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        // تحديث الأعمدة الخاصة بكود الاستعادة (verification_code و code_expires_at كحل موحد أو استخدام أعمدة محددة إذا وجدت)
        // وبما أن الحقول الافتراضية هي كود التحقق، يُفضل استخدامها أو إدخالها في حقول مخصصة بالداتا بيز
        await db.query('UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?', [resetCode, expiresAt, email]);

        const mailSubject = lang === 'en' ? 'Reset Password Request - Delora' : 'طلب إعادة تعيين كلمة المرور - ديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="text-align: center; font-family: sans-serif;">
                <h2>Reset Password Request</h2>
                <p>Use the following code to reset your account password:</p>
                <h1 style="color: #E91E63; letter-spacing: 5px;">${resetCode}</h1>
                <p>This code expires in 15 minutes.</p>
            </div>
        ` : `
            <div style="direction: rtl; text-align: center; font-family: sans-serif;">
                <h2>طلب تغيير كلمة المرور</h2>
                <p>استخدم الكود التالي لإعادة تعيين باسوورد حسابك:</p>
                <h1 style="color: #E91E63; letter-spacing: 5px;">${resetCode}</h1>
                <p>هذا الكود ينتهي بعد 15 دقيقة.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        });

        res.status(200).json({ 
            message: lang === 'en' ? 'Password reset code has been sent to your email successfully!' : 'تم إرسال كود إعادة تعيين الباسوورد إلى إيميلك بنجاح!' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// 5. تعيين كلمة المرور الجديدة (Reset Password) 🛠️
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const lang = req.lang;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'All fields are required.' : 'جميع الحقول مطلوبة.' 
        });
    }

    try {
        const [user] = await db.query('SELECT verification_code, code_expires_at FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }

        const { verification_code, code_expires_at } = user[0];

        if (verification_code !== otp || new Date() > new Date(code_expires_at)) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Invalid or expired password reset code ❌' : 'كود استعادة الباسوورد خاطئ أو منتهي الصلاحية ❌' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, verification_code = NULL, code_expires_at = NULL WHERE email = ?',
            [newPasswordHash, email]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Password changed successfully! You can now log in with your new password. 🎉' : 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بالباسوورد الجديدة. 🎉' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while resetting the password.' : 'حدث خطأ أثناء إعادة تعيين كلمة المرور.', 
            error: error.message 
        });
    }
};

// 6. تسجيل الدخول وتوليد التوكن
export const login = async (req, res) => {
    const { email, password } = req.body;
    const lang = req.lang;

    if (!email || !password) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please enter both email and password.' : 'من فضلك أدخل البريد الإلكتروني وكلمة المرور.' 
        });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Incorrect login credentials.' : 'بيانات الدخول غير صحيحة.' 
            });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({ 
                message: lang === 'en' ? 'Your account is not verified yet, please enter verification code first.' : 'حسابك لم يتم تفعيله بعد، يرجى إدخال كود التحقق أولاً.' 
            });
        }

        // const isMatch = await bcrypt.compare(password, user.password_hash);
        const isMatch = (password === user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Incorrect login credentials.' : 'بيانات الدخول غير صحيحة. اي خحاجة' 
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: lang === 'en' ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred during login.' : 'حدث خطأ أثناء تسجيل الدخول.', 
            error: error.message 
        });
    }
};

// 7. جلب بيانات الملف الشخصي (Profile)
export const getProfile = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, second_phone, gender, photo_url, role, country, governorate, zip_code, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// 8. تحديث بيانات الملف الشخصي (Profile Update)
export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    const { name, phone, second_phone, gender, photo_url, country, governorate, zip_code } = req.body;

    try {
        if (phone) {
            const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, userId]);
            if (existingPhone.length > 0) {
                return res.status(400).json({ 
                    message: lang === 'en' ? 'This phone number is already registered to another account.' : 'رقم الهاتف هذا مسجل بالفعل لحساب آخر.' 
                });
            }
        }

        await db.query(
            `UPDATE users SET 
                name = COALESCE(?, name), phone = COALESCE(?, phone), second_phone = ?, 
                gender = COALESCE(?, gender), photo_url = ?, country = COALESCE(?, country), 
                governorate = ?, zip_code = ? WHERE id = ?`,
            [name || null, phone || null, second_phone || null, gender || null, photo_url || null, country || null, governorate || null, zip_code || null, userId]
        );
        res.status(200).json({ 
            message: lang === 'en' ? 'Your profile has been updated successfully!' : 'تم تحديث ملفك الشخصي بنجاح! 👤✨' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};