// src/controllers/cartController.js
import db from '../config/db.js';

// 1. Add product to cart or update quantity if already exists (with strict stock check)
export const addToCart = async (req, res) => {
    const userId = req.user.id; 
    const { product_id, quantity } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: 'رقم المنتج مطلوب' });
    }

    const itemQuantity = parseFloat(quantity) > 0 ? parseFloat(quantity) : 1;

    try {
        // 1. Fetch current product stock accurately
        const [stockCheck] = await db.query(
            'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
            [product_id]
        );

        if (stockCheck.length === 0) {
            return res.status(404).json({ message: 'هذا المنتج غير مدرج في المخزن حالياً' });
        }

        const availableStock = stockCheck[0].available_quantity;
        const minStockLevel = stockCheck[0].min_stock_level;

        // If stock is completely depleted from the start
        if (availableStock <= 0) {
            return res.status(400).json({ message: 'عذراً يا برنس، هذا المنتج نفد من المخزن تماماً (Out of Stock) ❌' });
        }

        // 2. Check current quantity already in customer's cart
        const [existingItem] = await db.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );

        let currentCartQuantity = existingItem.length > 0 ? parseFloat(existingItem[0].quantity) : 0;
        
        // Calculate total requested (existing in cart + new addition)
        let totalRequestedQuantity = currentCartQuantity + itemQuantity;

        // 3. 🛑 Strict check: if requested exceeds available, cancel entirely and send warning
        if (totalRequestedQuantity > availableStock) {
            return res.status(400).json({ 
                message: `الكمية المطلوبة (${totalRequestedQuantity}) أكبر من المتوفر !` 
            });
        }

    totalRequestedQuantity = parseFloat(totalRequestedQuantity.toFixed(3));

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

        // 5. Early admin warning if total stock is low
        if (availableStock <= minStockLevel) {
            console.log(`⚠️ Admin alert: Product #${product_id} is nearly out of stock! Remaining in warehouse: ${availableStock}`);
        }

        // Response on successful addition
        res.status(201).json({ message: 'تم إضافة المنتج إلى السلة بنجاح! 🎉' });

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 2. Get current customer's cart contents with product data
export const getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const [cartItems] = await db.query(
            `SELECT c.id AS cart_item_id, c.quantity, p.id AS product_id, p.name_ar AS name, p.price, p.discount_price, p.offer_end_at, p.offer_until_stock_out, p.offer_max_quantity, p.product_image, p.unit_ar AS unit 
                FROM cart_items c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?`,
            [userId]
        );

        const now = new Date();
        const itemsWithPrice = cartItems.map(item => ({
            ...item,
            effective_price: item.discount_price && (
                (item.offer_end_at && new Date(item.offer_end_at) > now) || item.offer_until_stock_out
            ) ? parseFloat(item.discount_price) : parseFloat(item.price)
        }));

        res.status(200).json(itemsWithPrice);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. Remove a specific product from cart
export const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || parseFloat(quantity) < 0.1) {
        return res.status(400).json({ message: 'الكمية يجب أن تكون 0.1 على الأقل' });
    }

    try {
        const [item] = await db.query(
            'SELECT id, product_id FROM cart_items WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (item.length === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود في السلة' });
        }

        const [stock] = await db.query(
            'SELECT available_quantity FROM product_stock WHERE product_id = ?',
            [item[0].product_id]
        );

        if (stock.length > 0 && parseFloat(quantity) > stock[0].available_quantity) {
            return res.status(400).json({ message: 'الكمية المطلوبة أكبر من المتوفرة في المخزن' });
        }

        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [parseFloat(quantity), id]
        );

        res.status(200).json({ message: 'تم تحديث الكمية بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

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