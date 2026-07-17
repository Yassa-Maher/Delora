// src/controllers/cartController.js
import db from '../config/db.js';

// 1. إضافة منتج إلى السلة أو زيادة الكمية لو موجود مسبقاً (مع فحص المخزن الحازم)
export const addToCart = async (req, res) => {
    const userId = req.user.id; 
    const { product_id, quantity } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: 'رقم المنتج مطلوب' });
    }

    // التأكد أن الكمية المرسلة رقم صحيح وموجب، وإذا لم ترسل نعتبرها 1
    const itemQuantity = parseInt(quantity, 10) > 0 ? parseInt(quantity, 10) : 1;

    try {
        // 1. جلب المخزون الحالي للمنتج بدقة
        const [stockCheck] = await db.query(
            'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
            [product_id]
        );

        if (stockCheck.length === 0) {
            return res.status(404).json({ message: 'هذا المنتج غير مدرج في المخزن حالياً' });
        }

        const availableStock = stockCheck[0].available_quantity;
        const minStockLevel = stockCheck[0].min_stock_level;

        // لو المخزن منتهي تماماً من البداية
        if (availableStock <= 0) {
            return res.status(400).json({ message: 'عذراً يا برنس، هذا المنتج نفد من المخزن تماماً (Out of Stock) ❌' });
        }

        // 2. التحقق إذا كان المنتج مضافاً بالفعل في سلة العميل
        const [existingItem] = await db.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );

        let currentCartQuantity = existingItem.length > 0 ? existingItem[0].quantity : 0;
        let totalRequestedQuantity = currentCartQuantity + itemQuantity;

        // التحقق من الكمية الكلية المطلوبة ضد المخزن المتوفر
        if (totalRequestedQuantity > availableStock) {
            return res.status(400).json({ 
                message: `الكمية المطلوبة (${totalRequestedQuantity}) أكبر من المتوفر في المخزن حالياً! المتاح هو (${availableStock}) فقط.` 
            });
        }

        // 3. إما تحديث الكمية أو إدخال سجل جديد
        if (existingItem.length > 0) {
            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [totalRequestedQuantity, existingItem[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, product_id, totalRequestedQuantity]
            );
        }

        // تنبيه في الـ Console إذا وصل المخزون للحد الحرج (الأمان)
        if (availableStock <= minStockLevel) {
            console.log(`⚠️ تنبيه للإدارة: المنتج رقم (${product_id}) قارب على النفاد! المتبقي في المستودع: ${availableStock}`);
        }

        res.status(201).json({ message: 'تم إضافة المنتج إلى السلة بنجاح! 🎉' });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 2. جلب محتويات السلة الخاصة بالعميل الحالي مع حساب سعر الخصم النشط 🔥
export const getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const [cartItems] = await db.query(
            `SELECT c.id AS cart_item_id, c.quantity, p.id AS product_id, p.name, p.product_image, p.unit, p.price AS original_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS price
             FROM cart_items c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. حذف منتج معين من السلة
export const removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود في السلة' });
        }

        res.status(200).json({ message: 'تم حذف المنتج من السلة بنجاح 🗑️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};