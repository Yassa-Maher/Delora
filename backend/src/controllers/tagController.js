import db from '../config/db.js';

export const createTag = async (req, res) => {
    const { tag_name_ar, tag_name_en } = req.body;

    if (!tag_name_ar) {
        return res.status(400).json({ message: 'اسم التاج بالعربية مطلوب' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO tags (tag_name_ar, tag_name_en) VALUES (?, ?)',
            [tag_name_ar, tag_name_en || null]
        );
        res.status(201).json({ message: 'تم إضافة التاج بنجاح', tagId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'التاج موجود مسبقاً' });
        }
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getTags = async (req, res) => {
    try {
        const [tags] = await db.query('SELECT * FROM tags');
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteTag = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM tags WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'التاج غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف التاج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const attachTag = async (req, res) => {
    const { tag_id, entity_type, entity_id } = req.body;

    if (!tag_id || !entity_type || !entity_id) {
        return res.status(400).json({ message: 'التاج ونوع الكيان ورقمه مطلوبون' });
    }

    if (!['product', 'category'].includes(entity_type)) {
        return res.status(400).json({ message: 'نوع الكيان يجب أن يكون product أو category' });
    }

    try {
        await db.query(
            'INSERT IGNORE INTO tagables (tag_id, entity_type, entity_id) VALUES (?, ?, ?)',
            [tag_id, entity_type, entity_id]
        );
        res.status(201).json({ message: 'تم إرفاق التاج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const detachTag = async (req, res) => {
    const { tag_id, entity_type, entity_id } = req.body;

    try {
        await db.query(
            'DELETE FROM tagables WHERE tag_id = ? AND entity_type = ? AND entity_id = ?',
            [tag_id, entity_type, entity_id]
        );
        res.status(200).json({ message: 'تم فصل التاج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getEntityTags = async (req, res) => {
    const { entity_type, entity_id } = req.params;

    try {
        const [tags] = await db.query(
            `SELECT t.* FROM tags t
             JOIN tagables tg ON t.id = tg.tag_id
             WHERE tg.entity_type = ? AND tg.entity_id = ?`,
            [entity_type, entity_id]
        );
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
