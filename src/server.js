// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // 👈 استدعاء روت الـ Auth
import categoryRoutes from './routes/categoryRoutes.js'; // 👈 استدعاء الأقسام
import productRoutes from './routes/productRoutes.js';   // 👈 استدعاء المنتجات
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; // 👈 استدعاء روت الطلبات
import notificationRoutes from './routes/notificationRoutes.js';
// 1. استيراد الـ Routes الجديدة في الجزء العلوي للملف
import bannerRoutes from './routes/bannerRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import addressRoutes from './routes/addressRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ربط المسارات بالـ API الأساسي
app.use('/api/auth', authRoutes); // 👈 أي مسار يخص الـ Auth هيبدأ بـ /api/auth
app.use('/api/categories', categoryRoutes); // 👈 مسار الأقسام
app.use('/api/products', productRoutes);     // 👈 مسار المنتجات
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // 👈 تفعيل مسار الطلبات
app.use('/api/notifications', notificationRoutes);
// 2. تفعيل المسارات داخل الـ Express App الخاص بك
app.use('/api/banners', bannerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/settings', settingsRoutes);


app.use('/api/contacts', contactRoutes);    // مسار الدعم الفني واتصل بنا
app.use('/api/addresses', addressRoutes);   // مسار عناوين شحن العميل
// الروت الافتراضي للتأكد أن السيرفر شغال

app.get('/', (req, res) => {
    res.send('🚀 Delora Hypermarket API is Running Successfully (ES Modules)!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 السيرفر شغال حالياً على بورت: http://localhost:${PORT}`);
});


