import db from '../config/db.js';

export const createBranch = async (req, res) => {
    const { name_ar, name_en, address_ar, address_en, phone, working_hours_ar, working_hours_en, gps_link, branch_link } = req.body;

    if (!name_ar || !address_ar) {
        return res.status(400).json({ message: 'الاسم والعنوان بالعربية مطلوبان' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO branches (name_ar, name_en, address_ar, address_en, phone, working_hours_ar, working_hours_en, gps_link, branch_link)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name_ar, name_en || null, address_ar, address_en || null, phone || null, working_hours_ar || null, working_hours_en || null, gps_link || null, branch_link || null]
        );

        res.status(201).json({ message: 'تم إضافة الفرع بنجاح', branchId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getBranches = async (req, res) => {
    try {
        const [branches] = await db.query('SELECT * FROM branches WHERE is_active = TRUE');
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateBranch = async (req, res) => {
    const { id } = req.params;
    const fields = ['name_ar', 'name_en', 'address_ar', 'address_en', 'phone', 'working_hours_ar', 'working_hours_en', 'gps_link', 'branch_link', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
    }

    values.push(id);

    try {
        const [result] = await db.query(
            `UPDATE branches SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الفرع غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث الفرع بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteBranch = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM branches WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الفرع غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف الفرع بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
