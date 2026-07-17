import db from '../config/db.js';

// 1. جلب قائمة المنتجات المفضلة للمستخدم الحالي
export const getMyFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const [favorites] = await db.query(
            `SELECT f.id AS favorite_id, f.created_at, p.id AS product_id, p.name, p.product_image, p.unit, p.price, p.discount_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price
             FROM favorites f
             JOIN products p ON f.product_id = p.id
             WHERE f.user_id = ? 
             ORDER BY f.created_at DESC`,
            [userId]
        );
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات المفضلة', error: error.message });
    }
};

// 2. إضافة منتج للمفضلة (أو حذفه لو مضغوط عليه تاني - Toggle)
export const toggleFavorite = async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: 'رقم المنتج مطلوب' });
    }

    try {
        // التأكد من وجود المنتج أولاً
        const [productCheck] = await db.query('SELECT id FROM products WHERE id = ? AND is_active = TRUE', [product_id]);
        if (productCheck.length === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود أو غير نشط' });
        }

        // التحقق لو المنتج موجود في المفضلة بالفعل
        const [existing] = await db.query('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [userId, product_id]);

        if (existing.length > 0) {
            // لو موجود احذفه (Remove)
            await db.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, product_id]);
            return res.status(200).json({ message: 'تم إزالة المنتج من المفضلة 🤍', isFavorite: false });
        } else {
            // لو مش موجود ضيفه (Add)
            await db.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
            return res.status(201).json({ message: 'تم إضافة المنتج للمفضلة ❤️', isFavorite: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء تعديل المفضلة', error: error.message });
    }
};