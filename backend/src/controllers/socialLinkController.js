import db from '../config/db.js';

export const getSocialLinks = async (req, res) => {
    try {
        const [links] = await db.query('SELECT * FROM social_links ORDER BY sort_order ASC');
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const createSocialLink = async (req, res) => {
    const { platform_name, url, icon, sort_order } = req.body;
    if (!platform_name || !url || !icon) {
        return res.status(400).json({ message: 'اسم المنصة والرابط والأيقونة مطلوبة' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO social_links (platform_name, url, icon, sort_order) VALUES (?, ?, ?, ?)',
            [platform_name, url, icon, sort_order || 0]
        );
        res.status(201).json({ message: 'تمت الإضافة بنجاح', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateSocialLink = async (req, res) => {
    const { id } = req.params;
    const { platform_name, url, icon, sort_order, is_active } = req.body;
    try {
        const sets = []; const vals = [];
        if (platform_name !== undefined) { sets.push('platform_name = ?'); vals.push(platform_name); }
        if (url !== undefined) { sets.push('url = ?'); vals.push(url); }
        if (icon !== undefined) { sets.push('icon = ?'); vals.push(icon); }
        if (sort_order !== undefined) { sets.push('sort_order = ?'); vals.push(sort_order); }
        if (is_active !== undefined) { sets.push('is_active = ?'); vals.push(is_active); }
        if (sets.length === 0) return res.status(400).json({ message: 'لا توجد بيانات للتحديث' });
        vals.push(id);
        const [result] = await db.query(`UPDATE social_links SET ${sets.join(', ')} WHERE id = ?`, vals);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'الرابط غير موجود' });
        res.status(200).json({ message: 'تم التحديث بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteSocialLink = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM social_links WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'الرابط غير موجود' });
        res.status(200).json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
