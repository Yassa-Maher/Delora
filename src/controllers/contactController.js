import db from '../config/db.js';

// 1. إرسال رسالة جديدة (عام للزوار والعملاء)
export const submitContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة لإرسال الرسالة' });
    }

    try {
        await db.query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً ✉️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إرسال الرسالة', error: error.message });
    }
};

// 2. جلب جميع الرسائل (خاص بالأدمن والـ Store Manager 🔒)
export const getAllMessages = async (req, res) => {
    try {
        const [messages] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. تعليم الرسالة كـ "مقروءة" (خاص بالأدمن 🔒)
export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('UPDATE contacts SET is_read = TRUE WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الرسالة غير موجودة' });
        }
        res.status(200).json({ message: 'تم تحديد الرسالة كمقروءة بنجاح 👁️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الرسالة', error: error.message });
    }
};