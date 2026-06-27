// src/config/db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// إنشاء تجمع اتصالات (Connection Pool) لسرعة الأداء
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// تحويل الـ pool لدعم الـ Promises (async/await)
const promisePool = pool.promise();

// اختبار الاتصال عند بداية تشغيل السيرفر
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ فشل الاتصال بقاعدة البيانات يا هندسة:', err.message);
    } else {
        console.log('✅ تم الاتصال بسيرفر MySQL بنجاح.. جاهز للشغل!');
        connection.release();
    }
});

export default promisePool;