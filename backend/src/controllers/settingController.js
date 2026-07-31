import db from '../config/db.js';

export const getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM store_settings');
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateSetting = async (req, res) => {
    const { key_name, key_value_ar, key_value_en, display_name_ar, display_name_en } = req.body;

    if (!key_name) {
        return res.status(400).json({ message: 'اسم الإعداد مطلوب' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM store_settings WHERE key_name = ?', [key_name]);

        if (existing.length > 0) {
            const updates = [];
            const values = [];
            if (key_value_ar !== undefined) { updates.push('key_value_ar = ?'); values.push(key_value_ar); }
            if (key_value_en !== undefined) { updates.push('key_value_en = ?'); values.push(key_value_en); }
            if (display_name_ar !== undefined) { updates.push('display_name_ar = ?'); values.push(display_name_ar); }
            if (display_name_en !== undefined) { updates.push('display_name_en = ?'); values.push(display_name_en); }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
            }

            values.push(key_name);
            await db.query(
                `UPDATE store_settings SET ${updates.join(', ')} WHERE key_name = ?`,
                values
            );
        } else {
            await db.query(
                'INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en) VALUES (?, ?, ?, ?, ?)',
                [key_name, key_value_ar || null, key_value_en || null, display_name_ar || key_name, display_name_en || null]
            );
        }

        res.status(200).json({ message: 'تم تحديث الإعدادات بنجاح' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'الإعداد موجود مسبقاً' });
        }
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteSetting = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM store_settings WHERE key_name = ?', [req.params.keyName]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الإعداد غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف الإعداد بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
