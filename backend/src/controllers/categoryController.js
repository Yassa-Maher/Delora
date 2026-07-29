import db from '../config/db.js';

export const createCategory = async (req, res) => {
    const { name_ar, name_en, slug, parent_id } = req.body;
    const image_url = req.file ? req.file.filename : null;

    if (!name_ar || !slug) {
        return res.status(400).json({ message: 'الاسم والـ slug مطلوبان لإنشاء القسم' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO categories (name_ar, name_en, slug, parent_id, image_url) VALUES (?, ?, ?, ?, ?)',
            [name_ar, name_en || null, slug, parent_id || null, image_url]
        );
        res.status(201).json({ message: 'تم إنشاء القسم بنجاح!', categoryId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories WHERE is_active = TRUE');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const fields = ['name_ar', 'name_en', 'slug', 'parent_id', 'is_active'];
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
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'القسم غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث القسم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'القسم غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف القسم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'لا يمكن حذف القسم. تأكد من عدم وجود منتجات مرتبطة به', error: error.message });
    }
};
