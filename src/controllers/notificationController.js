// src/controllers/notificationController.js
import db from '../config/db.js';

// 1. جلب الإشعارات النشطة حالياً (للـ Frontend العام للعملاء) حسب اللغة الحالية
export const getActiveNotifications = async (req, res) => {
    const lang = req.lang;
    try {
        const [notifications] = await db.query(
            `SELECT 
                id, display_duration_seconds,
                IFNULL(title_${lang}, title_ar) AS title,
                IFNULL(message_${lang}, message_ar) AS message
             FROM site_notifications 
             WHERE is_active = TRUE 
               AND start_at <= NOW() 
               AND expires_at >= NOW()
             ORDER BY created_at DESC`
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while fetching notifications.' : 'حدث خطأ في السيرفر أثناء جلب الإشعارات', 
            error: error.message 
        });
    }
};

// 2. جلب كل الإشعارات بكافة الأعمدة (خاص بالأدمن/المدير لإدارة اللوحة)
export const getAllNotifications = async (req, res) => {
    const lang = req.lang;
    try {
        const [notifications] = await db.query(
            'SELECT * FROM site_notifications ORDER BY created_at DESC'
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. إنشاء إشعار جديد مع دعم اللغتين (خاص بالأدمن والـ Store Manager 🔒)
export const createNotification = async (req, res) => {
    const lang = req.lang;
    const { 
        title_ar, title_en, 
        message_ar, message_en, 
        display_duration_seconds, start_at, expires_at 
    } = req.body;

    if (!title_ar || !message_ar || !start_at || !expires_at) {
        return res.status(400).json({ 
            message: lang === 'en' 
                ? 'Arabic title, message, start and expiration times are required.' 
                : 'العنوان والرسالة بالعربي، ووقت البدء والانتهاء حقول إجبارية' 
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO site_notifications 
            (title_ar, title_en, message_ar, message_en, display_duration_seconds, start_at, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title_ar, title_en || null, message_ar, message_en || null, display_duration_seconds || 10, start_at, expires_at]
        );

        res.status(201).json({ 
            message: lang === 'en' ? 'Notification created successfully! 🔔' : 'تم إنشاء التنويه بنجاح! 🔔', 
            notificationId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while creating notification.' : 'حدث خطأ في السيرفر أثناء إنشاء التنويه', 
            error: error.message 
        });
    }
};

// 4. حذف إشعار (خاص بالأدمن والـ Store Manager 🔒)
export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;

    try {
        const [result] = await db.query('DELETE FROM site_notifications WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Notification not found.' : 'التنويه غير موجود' 
            });
        }

        res.status(200).json({ 
            message: lang === 'en' ? 'Notification deleted successfully 🗑️' : 'تم حذف التنويه بنجاح 🗑️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while deleting notification.' : 'حدث خطأ في السيرفر أثناء حذف التنويه', 
            error: error.message 
        });
    }
};