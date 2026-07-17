import db from '../config/db.js';

// 1. جلب جميع المنتجات التي تحتوي على تاغ معين للبحث السريع بالـ Frontend
// Route: GET /api/tags/:tagName
export const getProductsByTag = async (req, res) => {
    const { tagName } = req.params;

    try {
        const [products] = await db.query(
            `SELECT p.*,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price
             FROM products p
             JOIN tagables t ON t.entity_id = p.id AND t.entity_type = 'product'
             JOIN tags tg ON t.tag_id = tg.id
             WHERE tg.tag_name = ? AND p.is_active = TRUE`,
            [tagName]
        );

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات بالوسم', error: error.message });
    }
};

// 2. ربط تاغ بمنتج أو قسم (خاص بالأدمن 🔒)
// Route: POST /api/tags/assign
export const assignTag = async (req, res) => {
    const { tag_name, entity_type, entity_id } = req.body;

    if (!tag_name || !entity_type || !entity_id) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة لربط الوسم' });
    }

    try {
        // أضف التاغ لو مش موجود
        await db.query('INSERT IGNORE INTO tags (tag_name) VALUES (?)', [tag_name]);
        
        // جلب الـ ID الخاص بالتاغ
        const [tagRows] = await db.query('SELECT id FROM tags WHERE tag_name = ?', [tag_name]);
        
        if (tagRows.length === 0) {
            return res.status(404).json({ message: 'فشل في إنشاء أو إيجاد الوسم المطلوب.' });
        }
        
        const tagId = tagRows[0].id;

        // ربط التاغ بالعنصر في جدول tagables
        await db.query(
            'INSERT IGNORE INTO tagables (tag_id, entity_type, entity_id) VALUES (?, ?, ?)',
            [tagId, entity_type, entity_id]
        );

        res.status(201).json({ 
            success: true,
            message: 'تم ربط الوسم بنجاح! 🏷️',
            data: { tag_id: tagId, tag_name, entity_type, entity_id }
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء ربط الوسم', error: error.message });
    }
};