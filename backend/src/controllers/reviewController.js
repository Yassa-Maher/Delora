import db from '../config/db.js';

export const createReview = async (req, res) => {
    const userId = req.user.id;
    const { product_id, rating, review_text } = req.body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'رقم المنتج والتقييم (1-5) مطلوبان' });
    }

    try {
        const [existing] = await db.query(
            'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
            [product_id, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'لقد قمت بتقييم هذا المنتج مسبقاً' });
        }

        await db.query(
            'INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
            [product_id, userId, rating, review_text || null]
        );

        const [avg] = await db.query(
            'SELECT ROUND(AVG(rating), 2) AS avg_rating FROM product_reviews WHERE product_id = ?',
            [product_id]
        );
        await db.query('UPDATE products SET avg_rating = ? WHERE id = ?', [avg[0].avg_rating, product_id]);

        res.status(201).json({ message: 'تم إضافة التقييم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.name AS user_name, u.photo_url AS user_photo
             FROM product_reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.is_approved = TRUE
             ORDER BY r.created_at DESC`,
            [productId]
        );
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const [review] = await db.query(
            'SELECT product_id FROM product_reviews WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (review.length === 0) {
            return res.status(404).json({ message: 'التقييم غير موجود أو لا تملك صلاحية حذفه' });
        }

        const productId = review[0].product_id;

        await db.query('DELETE FROM product_reviews WHERE id = ?', [id]);

        const [avg] = await db.query(
            'SELECT ROUND(AVG(rating), 2) AS avg_rating FROM product_reviews WHERE product_id = ?',
            [productId]
        );
        await db.query('UPDATE products SET avg_rating = ? WHERE id = ?', [avg[0].avg_rating || 0, productId]);

        res.status(200).json({ message: 'تم حذف التقييم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const moderateReview = async (req, res) => {
    const { id } = req.params;
    const { is_approved } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE product_reviews SET is_approved = ? WHERE id = ?',
            [is_approved, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'التقييم غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث حالة التقييم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
