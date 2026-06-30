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
// الروت الافتراضي للتأكد أن السيرفر شغال
app.get('/', (req, res) => {
    res.send('🚀 Delora Hypermarket API is Running Successfully (ES Modules)!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 السيرفر شغال حالياً على بورت: http://localhost:${PORT}`);
});


