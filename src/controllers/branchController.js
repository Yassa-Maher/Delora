import db from '../config/db.js';

// 1. جلب الفروع النشطة (عرض عام للعملاء)
export const getActiveBranches = async (req, res) => {
    try {
        const [branches] = await db.query(
            'SELECT id, name, address, phone, working_hours, gps_link, branch_link FROM branches WHERE is_active = TRUE'
        );
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء جلب الفروع', error: error.message });
    }
};

// 2. إضافة فرع جديد (للأدمن 🔒)
export const createBranch = async (req, res) => {
    const { name, address, phone, working_hours, gps_link, branch_link } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'اسم الفرع حقل إجباري' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO branches (name, address, phone, working_hours, gps_link, branch_link) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [name, address || null, phone || null, working_hours || null, gps_link || null, branch_link || null]
        );
        res.status(201).json({ message: 'تم إضافة الفرع بنجاح! 📍', branchId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة الفرع', error: error.message });
    }
};

// 3. تعديل فرع (للأدمن 🔒)
export const updateBranch = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, working_hours, gps_link, branch_link, is_active } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE branches SET 
                name = ?, address = ?, phone = ?, working_hours = ?, gps_link = ?, branch_link = ?, is_active = ?
                WHERE id = ?`,
            [name, address || null, phone || null, working_hours || null, gps_link || null, branch_link || null, is_active !== undefined ? is_active : 1, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الفرع غير موجود' });
        }
        res.status(200).json({ message: 'تم تحديث بيانات الفرع بنجاح! ✏️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث الفرع', error: error.message });
    }
};

// 4. حذف فرع (للأدمن 🔒)
export const deleteBranch = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM branches WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الفرع غير موجود' });
        }
        res.status(200).json({ message: 'تم حذف الفرع بنجاح 🗑️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء حذف الفرع', error: error.message });
    }
};