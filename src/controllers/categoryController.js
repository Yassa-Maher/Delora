import db from '../config/db.js';

// إضافة قسم جديد (خاص بالأدمن والـ Store Manager 🔒)
export const createCategory = async (req, res) => {
    const { name, slug, parent_id, image_url } = req.body;

    if (!name || !slug) {
        return res.status(400).json({ message: 'الاسم والـ slug مطلوبان لإنشاء القسم' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, ?, ?)',
            [name, slug, parent_id || null, image_url || null]
        );
        res.status(201).json({ message: 'تم إنشاء القسم بنجاح! 📂', categoryId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// جلب كل الأقسام المتاحة (عام للجميع 🔓)
export const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories WHERE is_active = TRUE');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};