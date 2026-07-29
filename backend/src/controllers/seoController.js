import db from '../config/db.js';

export const upsertSeo = async (req, res) => {
    const { entity_type, entity_id, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en, meta_keywords_ar, meta_keywords_en, og_title_ar, og_title_en, og_description_ar, og_description_en, og_image } = req.body;

    if (!entity_type || !entity_id || !meta_title_ar || !meta_description_ar) {
        return res.status(400).json({ message: 'نوع الكيان ورقمه والmeta title والmeta description مطلوبة' });
    }

    if (!['product', 'category'].includes(entity_type)) {
        return res.status(400).json({ message: 'نوع الكيان يجب أن يكون product أو category' });
    }

    try {
        const [existing] = await db.query(
            'SELECT id FROM seo_details WHERE entity_type = ? AND entity_id = ?',
            [entity_type, entity_id]
        );

        if (existing.length > 0) {
            await db.query(
                `UPDATE seo_details SET 
                 meta_title_ar = ?, meta_title_en = ?, meta_description_ar = ?, meta_description_en = ?,
                 meta_keywords_ar = ?, meta_keywords_en = ?, og_title_ar = ?, og_title_en = ?,
                 og_description_ar = ?, og_description_en = ?, og_image = ?
                 WHERE entity_type = ? AND entity_id = ?`,
                [meta_title_ar, meta_title_en || null, meta_description_ar, meta_description_en || null,
                 meta_keywords_ar || null, meta_keywords_en || null, og_title_ar || null, og_title_en || null,
                 og_description_ar || null, og_description_en || null, og_image || null,
                 entity_type, entity_id]
            );
        } else {
            await db.query(
                `INSERT INTO seo_details 
                 (entity_type, entity_id, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en,
                  meta_keywords_ar, meta_keywords_en, og_title_ar, og_title_en, og_description_ar, og_description_en, og_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [entity_type, entity_id, meta_title_ar, meta_title_en || null, meta_description_ar, meta_description_en || null,
                 meta_keywords_ar || null, meta_keywords_en || null, og_title_ar || null, og_title_en || null,
                 og_description_ar || null, og_description_en || null, og_image || null]
            );
        }

        res.status(200).json({ message: 'تم حفظ تحسينات محركات البحث بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getSeo = async (req, res) => {
    const { entity_type, entity_id } = req.params;

    try {
        const [seo] = await db.query(
            'SELECT * FROM seo_details WHERE entity_type = ? AND entity_id = ?',
            [entity_type, entity_id]
        );

        if (seo.length === 0) {
            return res.status(404).json({ message: 'بيانات تحسين محركات البحث غير موجودة' });
        }

        res.status(200).json(seo[0]);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteSeo = async (req, res) => {
    const { entity_type, entity_id } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM seo_details WHERE entity_type = ? AND entity_id = ?',
            [entity_type, entity_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'بيانات تحسين محركات البحث غير موجودة' });
        }

        res.status(200).json({ message: 'تم حذف البيانات بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
