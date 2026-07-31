import db from '../config/db.js';

export const addFavorite = async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: 'رقم المنتج مطلوب' });
    }

    try {
        await db.query(
            'INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
            [userId, product_id]
        );
        res.status(201).json({ message: 'تمت الإضافة إلى المفضلة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const [favorites] = await db.query(
            `SELECT f.id, f.product_id, p.name_ar, p.name_en, p.price, p.product_image, f.created_at
             FROM favorites f
             JOIN products p ON f.product_id = p.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userId]
        );
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const removeFavorite = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود في المفضلة' });
        }

        res.status(200).json({ message: 'تم الحذف من المفضلة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
