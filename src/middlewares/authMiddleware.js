// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    // التأكد من أن التوكن مبعوث في الـ Headers وتحديداً الـ Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // استخراج التوكن من الـ Header (بيكون شكله: Bearer token_string)
            token = req.headers.authorization.split(' ')[1];

            // التحقق من صحة التوكن وفكه باستخدام الـ Secret Key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // إضافة بيانات المستخدم المفكوكة (id, role) للـ request عشان نستخدمها في الـ controllers
            req.user = decoded;

            // انقل الطلب للـ Route أو الـ Controller اللي بعده
            next();
        } catch (error) {
            console.error(' خطأ في التحقق من التوكن:', error.message);
            return res.status(401).json({ message: 'غير مصرح بالدخول، التوكن غير صالح أو منتهي' });
        }
    }

    // إذا لم يتم إرسال توكن من الأساس
    if (!token) {
        return res.status(401).json({ message: 'غير مصرح بالدخول، لم يتم إرسال التوكن' });
    }
};


// ميثود مرنة للتحقق من الأدوار المسموح لها بدخول الروت
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // التأكد من أن المستخدم موجود ومعه دور مسجل
        if (req.user && allowedRoles.includes(req.user.role)) {
            next(); // الدور مسموح له، مرر الطلب
        } else {
            return res.status(403).json({ 
                message: `غير مسموح بالدخول، هذا المسار مخصص للأدوار التالية: ${allowedRoles.join(', ')}` 
            });
        }
    };
};