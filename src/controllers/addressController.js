import db from '../config/db.js';

// 1. جلب عناوين العميل الحالي
export const getMyAddresses = async (req, res) => {
    const userId = req.user.id;
    try {
        const [addresses] = await db.query(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC',
            [userId]
        );
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب العناوين', error: error.message });
    }
};

// 2. إضافة عنوان جديد
export const addAddress = async (req, res) => {
    const userId = req.user.id;
    const { title, city, area, street_details, building_number, floor_number, is_default } = req.body;

    if (!title || !city || !area || !street_details) {
        return res.status(400).json({ message: 'العنوان، المدينة، المنطقة، وتفاصيل الشارع حقول إجبارية' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // إذا تم تحديد العنوان الجديد كافتراضي، نقوم بإلغاء افتراضية العناوين السابقة لليوزر أولاً
        if (is_default) {
            await connection.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        }

        await connection.query(
            `INSERT INTO user_addresses 
            (user_id, title, city, area, street_details, building_number, floor_number, is_default) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, city, area, street_details, building_number || null, floor_number || null, is_default ? 1 : 0]
        );

        await connection.commit();
        res.status(201).json({ message: 'تم إضافة عنوان الشحن بنجاح! 📍' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة العنوان', error: error.message });
    } finally {
        connection.release();
    }
};

// 3. حذف عنوان شحن
export const deleteAddress = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'العنوان غير موجود أو لا تملك صلاحية حذفه' });
        }
        res.status(200).json({ message: 'تم حذف العنوان بنجاح 🗑️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};