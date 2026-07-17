import db from '../config/db.js';

// 1. جلب المنتجات مع اسم القسم وحساب السعر النشط تلقائياً بناءً على حالة العرض
export const getAllProducts = async (req, res) => {
    try {
        // الاستعلام يحسب السعر الحالي (current_price) وما إذا كان هناك عرض نشط حالياً (is_on_offer)
        const [products] = await db.query(`
            SELECT p.*, c.name AS category_name,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN TRUE 
                    ELSE FALSE 
                END AS is_on_offer
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
        `);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 2. جلب تفاصيل منتج واحد بدلالة الـ ID مع حساب سعر العرض النشط وحالته
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name AS category_name,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN TRUE 
                    ELSE FALSE 
                END AS is_on_offer
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.is_active = TRUE
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        res.status(200).json(products[0]);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 3. إضافة منتج جديد مع دعم حقول العروض والخصومات الجديدة
export const createProduct = async (req, res) => {
    const { 
        category_id, name, slug, brand, description, 
        wholesale_price, price, comparison_price, sku, barcode, unit, product_image,
        // الحقول الجديدة المضافة تلقائياً من طلبك
        discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity
    } = req.body;

    // التحقق من الحقول الإجبارية (NOT NULL في الجدول)
    if (!category_id || !name || !slug || !wholesale_price || !price || !sku || !unit || !product_image) {
        return res.status(400).json({ message: 'من فضلك أدخل جميع البيانات الإجبارية للمنتج' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO products 
            (
                category_id, name, slug, brand, description, wholesale_price, price, comparison_price, sku, barcode, unit, product_image,
                discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name, slug, brand || null, description || null, wholesale_price, price, comparison_price || null, sku, barcode || null, unit, product_image,
                discount_price !== undefined ? discount_price : null,
                offer_start_at || null,
                offer_end_at || null,
                offer_until_stock_out === true || offer_until_stock_out === 1 ? 1 : 0,
                offer_max_quantity !== undefined ? offer_max_quantity : null
            ]
        );

        res.status(201).json({ 
            message: 'تم إضافة المنتج بنجاح يا هندسة! 📦', 
            productId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج', error: error.message });
    }
};

// 4. تعديل منتج قائم مع تحديث بيانات العروض والخصومات
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { 
        category_id, name, slug, brand, description, 
        wholesale_price, price, comparison_price, sku, barcode, unit, product_image, is_active,
        discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity
    } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود لتعديله' });
        }

        await db.query(
            `UPDATE products SET 
                category_id = ?, name = ?, slug = ?, brand = ?, description = ?, 
                wholesale_price = ?, price = ?, comparison_price = ?, sku = ?, barcode = ?, unit = ?, product_image = ?, is_active = ?,
                discount_price = ?, offer_start_at = ?, offer_end_at = ?, offer_until_stock_out = ?, offer_max_quantity = ?
            WHERE id = ?`,
            [
                category_id, name, slug, brand || null, description || null, 
                wholesale_price, price, comparison_price || null, sku, barcode || null, unit, product_image, is_active !== undefined ? is_active : 1,
                discount_price !== undefined ? discount_price : null,
                offer_start_at || null,
                offer_end_at || null,
                offer_until_stock_out === true || offer_until_stock_out === 1 ? 1 : 0,
                offer_max_quantity !== undefined ? offer_max_quantity : null,
                id
            ]
        );

        res.status(200).json({ message: 'تم تحديث بيانات المنتج والعروض بنجاح! ✏️' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج', error: error.message });
    }
};