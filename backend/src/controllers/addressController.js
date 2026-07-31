import db from '../config/db.js';

export const createAddress = async (req, res) => {
    const userId = req.user.id;
    const { title, city, area, street_details, building_number, floor_number, is_default } = req.body;

    if (!title || !city || !area || !street_details) {
        return res.status(400).json({ message: 'العنوان والمدينة والمنطقة وتفاصيل الشارع مطلوبة' });
    }

    try {
        if (is_default) {
            await db.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        }

        const [result] = await db.query(
            `INSERT INTO user_addresses (user_id, title, city, area, street_details, building_number, floor_number, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, city, area, street_details, building_number || null, floor_number || null, is_default || false]
        );

        res.status(201).json({ message: 'تم إضافة العنوان بنجاح', addressId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getAddresses = async (req, res) => {
    const userId = req.user.id;

    try {
        const [addresses] = await db.query(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
            [userId]
        );
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateAddress = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, city, area, street_details, building_number, floor_number, is_default } = req.body;

    try {
        const updates = [];
        const values = [];

        if (title !== undefined) { updates.push('title = ?'); values.push(title); }
        if (city !== undefined) { updates.push('city = ?'); values.push(city); }
        if (area !== undefined) { updates.push('area = ?'); values.push(area); }
        if (street_details !== undefined) { updates.push('street_details = ?'); values.push(street_details); }
        if (building_number !== undefined) { updates.push('building_number = ?'); values.push(building_number); }
        if (floor_number !== undefined) { updates.push('floor_number = ?'); values.push(floor_number); }
        if (is_default !== undefined) { updates.push('is_default = ?'); values.push(is_default); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
        }

        values.push(id, userId);
        const [result] = await db.query(
            `UPDATE user_addresses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'العنوان غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث العنوان بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'العنوان غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف العنوان بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
