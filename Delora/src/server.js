// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // 👈 استدعاء روت الـ Auth

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ربط المسارات بالـ API الأساسي
app.use('/api/auth', authRoutes); // 👈 أي مسار يخص الـ Auth هيبدأ بـ /api/auth

// الروت الافتراضي للتأكد أن السيرفر شغال
app.get('/', (req, res) => {
    res.send('🚀 Delora Hypermarket API is Running Successfully (ES Modules)!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 السيرفر شغال حالياً على بورت: http://localhost:${PORT}`);
});