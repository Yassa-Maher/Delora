import db from '../config/db.js';

// 1. جلب الإشعارات النشطة حالياً (للـ Frontend العام للعملاء)
// يجلب فقط الإشعارات النشطة والتي يقع الوقت الحالي بين تاريخ بدئها وانتهاؤها
export const getActiveNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT id, title, message, display_duration_seconds 
             FROM site_notifications 
             WHERE is_active = TRUE 
               AND start_at <= NOW() 
               AND expires_at >= NOW()
             ORDER BY created_at DESC`
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء جلب الإشعارات', error: error.message });
    }
};

// 2. جلب كل الإشعارات (خاص بالأدمن/المدير لإدارة اللوحة)
export const getAllNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM site_notifications ORDER BY created_at DESC'
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. إنشاء إشعار جديد (خاص بالأدمن والـ Store Manager 🔒)
export const createNotification = async (req, res) => {
    const { title, message, display_duration_seconds, start_at, expires_at } = req.body;

    if (!title || !message || !start_at || !expires_at) {
        return res.status(400).json({ message: 'العنوان، الرسالة، وقت البدء والانتهاء حقول إجبارية' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO site_notifications 
            (title, message, display_duration_seconds, start_at, expires_at) 
            VALUES (?, ?, ?, ?, ?)`,
            [title, message, display_duration_seconds || 10, start_at, expires_at]
        );

        res.status(201).json({ 
            message: 'تم إنشاء التنويه بنجاح! 🔔', 
            notificationId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء إنشاء التنويه', error: error.message });
    }
};

// 4. حذف إشعار (خاص بالأدمن والـ Store Manager 🔒)
export const deleteNotification = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM site_notifications WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'التنويه غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف التنويه بنجاح 🗑️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء حذف التنويه', error: error.message });
    }
};