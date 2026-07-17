import db from '../config/db.js';

// 1. جلب البانرات النشطة لتعرض في السلايدر الرئيسي بالـ Frontend
export const getActiveBanners = async (req, res) => {
    try {
        const [banners] = await db.query(
            `SELECT id, title, subtitle, image_url, button_text, product_id, category_id 
             FROM banners 
             WHERE is_active = TRUE 
             ORDER BY sort_order ASC, created_at DESC`
        );
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء جلب البانرات', error: error.message });
    }
};

// 2. جلب جميع البانرات (لوحة التحكم للأدمن)
export const getAllBanners = async (req, res) => {
    try {
        const [banners] = await db.query('SELECT * FROM banners ORDER BY sort_order ASC');
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. إضافة بانر جديد (خاص بالأدمن 🔒)
export const createBanner = async (req, res) => {
    const { title, subtitle, image_url, button_text, product_id, category_id, sort_order } = req.body;

    if (!title || !image_url) {
        return res.status(400).json({ message: 'العنوان ورابط الصورة حقول إجبارية' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO banners 
            (title, subtitle, image_url, button_text, product_id, category_id, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, subtitle || null, image_url, button_text || 'اكتشفي عروضنا', product_id || null, category_id || null, sort_order || 0]
        );

        res.status(201).json({ message: 'تم إضافة البانر بنجاح! 🖼️', bannerId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة البانر', error: error.message });
    }
};

// 4. حذف بانر (خاص بالأدمن 🔒)
export const deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'البانر غير موجود' });
        }
        res.status(200).json({ message: 'تم حذف البانر بنجاح 🗑️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء حذف البانر', error: error.message });
    }
};