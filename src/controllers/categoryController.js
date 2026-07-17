// src/controllers/categoryController.js
import db from '../config/db.js';

// 1. إضافة قسم جديد (خاص بالأدمن والـ Store Manager 🔒)
export const createCategory = async (req, res) => {
    const { name_ar, name_en, slug, parent_id, image_url } = req.body;
    const lang = req.lang;

    // الاسم العربي إلزامى كحد أدنى بناءً على هيكلة قاعدة البيانات الجديدة
    if (!name_ar || !slug) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic name and slug are required to create a category.' : 'الاسم باللغة العربية والـ slug مطلوبان لإنشاء القسم.' 
        });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO categories (name_ar, name_en, slug, parent_id, image_url) VALUES (?, ?, ?, ?, ?)',
            [name_ar, name_en || null, slug, parent_id || null, image_url || null]
        );
        res.status(201).json({ 
            message: lang === 'en' ? 'Category created successfully! 📂' : 'تم إنشاء القسم بنجاح! 📂', 
            categoryId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 2. جلب كل الأقسام المتاحة (عام للجميع 🔓) مع حساب اللغات
export const getAllCategories = async (req, res) => {
    const lang = req.lang; // التقاط 'ar' أو 'en'
    try {
        // نستخدم IFNULL لتعيد الاسم بالإنجليزية إذا طُلبت وكانت متوفرة، وإلا تعود للاسم العربي كبديل آمن
        const [categories] = await db.query(`
            SELECT 
                id,
                slug,
                parent_id,
                image_url,
                is_active,
                created_at,
                IFNULL(name_${lang}, name_ar) AS name
            FROM categories 
            WHERE is_active = TRUE
        `);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};