// src/controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 1. إنشاء حساب جديد (Customer)
export const register = async (req, res) => {
    const { name, email, password, phone, gender } = req.body;

    // تأكيد وجود البيانات الأساسية
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'من فضلك املأ جميع الحقول الأساسية' });
    }

    try {
        // التأكد إذا كان الإيميل مسجل مسبقاً
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل' });
        }

        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // إدخال المستخدم الجديد في الداتا بيز
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, phone, gender, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone, gender || 'male', 'customer']
        );

        res.status(201).json({ 
            message: 'تم إنشاء الحساب بنجاح يا هندسة!', 
            userId: result.insertId 
        });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 2. تسجيل الدخول (للعملاء والأدمين)
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'من فضلك أدخل البريد الإلكتروني وكلمة المرور' });
    }

    try {
        // البحث عن المستخدم
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const user = users[0];

        // التأكد من صحة الباسورد المشفّرة
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        // توليد الـ JWT Token ويحتوي على الـ id والـ role (أدمين أم عميل)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // صلاحية التوكن يوم واحد
        );

        // إرجاع البيانات بدون الباسورد لحمايتها
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