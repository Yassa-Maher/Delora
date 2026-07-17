// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

// استدعاء الروتس السابقة
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import logRoutes from './routes/logRoutes.js';

// استيراد الموديولات الإضافية النهائية
import seoRoutes from './routes/seoRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();

// 🌐 1. الـ Middleware الخاص بتحديد اللغة (عربي / إنجليزي)
const langMiddleware = (req, res, next) => {
    // لقط اللغة من الـ Header أو من الـ Query string، الافتراضي هو 'ar'
    let lang = req.headers['accept-language'] || req.query.lang || 'ar';
    
    // تنظيف القيمة للتأكد من أنها إما 'en' أو 'ar' فقط
    lang = lang.toLowerCase().startsWith('en') ? 'en' : 'ar';
    
    req.lang = lang; // تثبيت اللغة في الـ request لتكون متاحة في الكنترولرات
    next();
};

// إعداد الـ Rate Limiter ليدعم الاستجابة اللغوية
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // حد أقصى 100 طلب من نفس الـ IP
    handler: (req, res) => {
        res.status(429).json({
            message: req.lang === 'en' 
                ? 'Too many requests, please try again later after 15 minutes.' 
                : 'لقد قمت بإرسال طلبات كثيرة جداً، يرجى المحاولة لاحقاً بعد 15 دقيقة.'
        });
    }
});

// Middlewares الأساسية
app.use(cors());
app.use(express.json());
app.use(langMiddleware); // تفعيل ميثود اللغة على كل المسارات
app.use('/api/', limiter);

// ربط المسارات بالـ API الأساسي
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/logs', logRoutes);

// تفعيل روترات الـ SEO والمخزون والمدفوعات
app.use('/api/seo', seoRoutes);             // مسار الـ SEO للمنتجات والأقسام
app.use('/api/inventory', inventoryRoutes); // مسار حركات دفعات المستودع والصلاحيات
app.use('/api/payments', paymentRoutes);

// الروت الافتراضي للتأكد أن السيرفر شغال
app.get('/', (req, res) => {
    res.send('🚀 Delora Hypermarket API is Running Successfully (ES Modules)!');
});

// Global Error Handling Middleware (متوافق مع اللغتين)
app.use((err, req, res, next) => {
    console.error('❌ خطأ غير متوقع في السيرفر:', err.stack);
    
    const errorMessage = req.lang === 'en'
        ? 'An internal server error occurred, we are working on it.'
        : 'حدث خطأ داخلي في السيرفر، جاري العمل على حل المشكلة.';

    res.status(500).json({
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : {} // إظهار التفاصيل فقط في بيئة التطوير
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 السيرفر شغال حالياً على بورت: http://localhost:${PORT}`);
});