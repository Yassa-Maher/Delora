import db from '../config/db.js';
import transporter from '../config/email.js';

export const submitContact = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    try {
        await db.query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getContacts = async (req, res) => {
    try {
        const [contacts] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const markContactRead = async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE contacts SET is_read = TRUE WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الرسالة غير موجودة' });
        }

        res.status(200).json({ message: 'تم تحديث حالة الرسالة' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const replyContact = async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
        return res.status(400).json({ message: 'نص الرد مطلوب' });
    }

    try {
        const [contacts] = await db.query('SELECT * FROM contacts WHERE id = ?', [id]);

        if (contacts.length === 0) {
            return res.status(404).json({ message: 'الرسالة غير موجودة' });
        }

        const contact = contacts[0];

        await db.query(
            'UPDATE contacts SET admin_reply = ?, replied_at = NOW() WHERE id = ?',
            [reply.trim(), id]
        );

        try {
            await transporter.sendMail({
                from: `"Delora Market" <${process.env.GMAIL_EMAIL}>`,
                to: contact.email,
                subject: `رد على رسالتك: ${contact.subject || 'من Delora Market'}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #2d6a4f;">Delora Market</h2>
                        <p><strong>مرحباً ${contact.name}،</strong></p>
                        <p>رسالتك:</p>
                        <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 12px; color: #333;">${contact.message}</div>
                        <p>رد الإدارة:</p>
                        <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border-right: 3px solid #2d6a4f; color: #333;">${reply.trim()}</div>
                        <p style="color: #666; margin-top: 16px;">شكراً لتواصلك معنا،</p>
                        <p style="color: #2d6a4f; font-weight: bold;">فريق Delora Market</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send reply email:', emailErr.message);
        }

        res.status(200).json({ message: 'تم إرسال الرد بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الرسالة غير موجودة' });
        }

        res.status(200).json({ message: 'تم حذف الرسالة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
