import db from '../config/db.js';

export const getMyNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const [notifications] = await db.query(
            `SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
            [userId]
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    const userId = req.user.id;
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) AS count FROM user_notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        res.status(200).json({ count: result[0].count });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE user_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        res.status(200).json({ message: 'تم تحديث الإشعار' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const markAllRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query(
            'UPDATE user_notifications SET is_read = TRUE WHERE user_id = ?',
            [userId]
        );
        res.status(200).json({ message: 'تم تحديث جميع الإشعارات' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
