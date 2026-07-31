import db from '../config/db.js';

export const createNotification = async (req, res) => {
    const { title_ar, title_en, message_ar, message_en, display_duration_seconds, start_at, expires_at } = req.body;

    if (!title_ar || !message_ar || !start_at || !expires_at) {
        return res.status(400).json({ message: 'العنوان والرسالة وتاريخ البدء وتاريخ الانتهاء مطلوبة' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO site_notifications (title_ar, title_en, message_ar, message_en, display_duration_seconds, start_at, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title_ar, title_en || null, message_ar, message_en || null, display_duration_seconds || 10, start_at, expires_at]
        );

        res.status(201).json({ message: 'تم إضافة الإشعار بنجاح', notificationId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getActiveNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT * FROM site_notifications 
             WHERE is_active = TRUE 
             AND start_at <= NOW() 
             AND expires_at >= NOW()
             ORDER BY created_at DESC`
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getAllNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query('SELECT * FROM site_notifications ORDER BY created_at DESC');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateNotification = async (req, res) => {
    const { id } = req.params;
    const fields = ['title_ar', 'title_en', 'message_ar', 'message_en', 'display_duration_seconds', 'start_at', 'expires_at', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
    }

    values.push(id);

    try {
        const [result] = await db.query(
            `UPDATE site_notifications SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الإشعار غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث الإشعار بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM site_notifications WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الإشعار غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف الإشعار بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
