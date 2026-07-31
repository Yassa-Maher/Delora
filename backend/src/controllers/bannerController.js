import db from '../config/db.js';

export const createBanner = async (req, res) => {
    const { title_ar, title_en, subtitle_ar, subtitle_en, button_text_ar, button_text_en, product_id, category_id, sort_order } = req.body;
    const image_url = req.file ? req.file.filename : null;

    if (!title_ar || !image_url) {
        return res.status(400).json({ message: 'العنوان بالعربية والصورة مطلوبان' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO banners (title_ar, title_en, subtitle_ar, subtitle_en, button_text_ar, button_text_en, image_url, product_id, category_id, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_ar, title_en || null, subtitle_ar || null, subtitle_en || null, button_text_ar || null, button_text_en || null, image_url, product_id || null, category_id || null, sort_order || 0]
        );

        res.status(201).json({ message: 'تم إضافة البانر بنجاح', bannerId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getBanners = async (req, res) => {
    try {
        const [banners] = await db.query(
            'SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC'
        );
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateBanner = async (req, res) => {
    const { id } = req.params;
    const fields = ['title_ar', 'title_en', 'subtitle_ar', 'subtitle_en', 'button_text_ar', 'button_text_en', 'product_id', 'category_id', 'sort_order', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (req.file) {
        updates.push('image_url = ?');
        values.push(req.file.filename);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
    }

    values.push(id);

    try {
        const [result] = await db.query(
            `UPDATE banners SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'البنر غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث البانر بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'البنر غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف البانر بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
