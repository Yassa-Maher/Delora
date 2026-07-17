// src/controllers/seoController.js
import db from '../config/db.js';

// 1. جلب تفاصيل الـ SEO لعنصر معين حسب لغة واجهة العميل (منتج أو قسم)
export const getSeoDetails = async (req, res) => {
    const { entity_type, entity_id } = req.params;
    const lang = req.lang;

    if (!['product', 'category'].includes(entity_type)) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Invalid entity type (must be product or category).' : 'نوع الكيان غير صحيح (يجب أن يكون product أو category)' 
        });
    }

    try {
        const [seo] = await db.query(
            `SELECT 
                id, entity_type, entity_id, og_image, created_at, updated_at,
                IFNULL(meta_title_${lang}, meta_title_ar) AS meta_title,
                IFNULL(meta_description_${lang}, meta_description_ar) AS meta_description,
                IFNULL(meta_keywords_${lang}, meta_keywords_ar) AS meta_keywords,
                IFNULL(og_title_${lang}, og_title_ar) AS og_title,
                IFNULL(og_description_${lang}, og_description_ar) AS og_description
             FROM seo_details 
             WHERE entity_type = ? AND entity_id = ?`,
            [entity_type, entity_id]
        );

        if (seo.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'No custom SEO details found for this item.' : 'لا توجد بيانات SEO مخصصة لهذا العنصر' 
            });
        }

        res.status(200).json(seo[0]);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while fetching SEO details.' : 'حدث خطأ أثناء جلب بيانات الـ SEO', 
            error: error.message 
        });
    }
};

// 2. إضافة أو تحديث (Upsert) تفاصيل الـ SEO باللغتين (للأدمن 🔒)
export const saveSeoDetails = async (req, res) => {
    const lang = req.lang;
    const { 
        entity_type, entity_id, 
        meta_title_ar, meta_title_en, 
        meta_description_ar, meta_description_en, 
        meta_keywords_ar, meta_keywords_en, 
        og_title_ar, og_title_en, 
        og_description_ar, og_description_en, 
        og_image 
    } = req.body;

    if (!entity_type || !entity_id || !meta_title_ar || !meta_description_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Core Arabic SEO fields are required.' : 'الحقول الأساسية للـ SEO باللغة العربية مطلوبة' 
        });
    }

    try {
        // استخدام INSERT ... ON DUPLICATE KEY UPDATE بناءً على الـ UNIQUE KEY
        await db.query(
            `INSERT INTO seo_details 
                (entity_type, entity_id, 
                 meta_title_ar, meta_title_en, 
                 meta_description_ar, meta_description_en, 
                 meta_keywords_ar, meta_keywords_en, 
                 og_title_ar, og_title_en, 
                 og_description_ar, og_description_en, 
                 og_image) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                meta_title_ar = VALUES(meta_title_ar),
                meta_title_en = VALUES(meta_title_en),
                meta_description_ar = VALUES(meta_description_ar),
                meta_description_en = VALUES(meta_description_en),
                meta_keywords_ar = VALUES(meta_keywords_ar),
                meta_keywords_en = VALUES(meta_keywords_en),
                og_title_ar = VALUES(og_title_ar),
                og_title_en = VALUES(og_title_en),
                og_description_ar = VALUES(og_description_ar),
                og_description_en = VALUES(og_description_en),
                og_image = VALUES(og_image)`,
            [
                entity_type, entity_id, 
                meta_title_ar, meta_title_en || null, 
                meta_description_ar, meta_description_en || null, 
                meta_keywords_ar || null, meta_keywords_en || null, 
                og_title_ar || null, og_title_en || null, 
                og_description_ar || null, og_description_en || null, 
                og_image || null
            ]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'SEO details saved and updated successfully! 🚀' : 'تم حفظ وتحديث بيانات الـ SEO بنجاح! 🚀' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while saving SEO details.' : 'حدث خطأ أثناء حفظ بيانات الـ SEO', 
            error: error.message 
        });
    }
};