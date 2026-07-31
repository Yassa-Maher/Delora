import db from '../config/db.js';
import env from '../config/env.js';

export const getAllProducts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(env.pagination.maxLimit, parseInt(req.query.limit, 10) || env.pagination.defaultLimit);
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'newest';

        let whereClause = 'WHERE p.is_active = TRUE';
        let queryParams = [];

        if (search) {
            whereClause += ' AND (p.name_ar LIKE ? OR p.name_en LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            whereClause += ' AND p.category_id = ?';
            queryParams.push(category);
        }

        let orderClause = 'ORDER BY p.created_at DESC';
        if (sort === 'price_asc') orderClause = 'ORDER BY p.price ASC';
        else if (sort === 'price_desc') orderClause = 'ORDER BY p.price DESC';
        else if (sort === 'name_asc') orderClause = 'ORDER BY p.name_ar ASC';

        const [countResult] = await db.query(
            `SELECT COUNT(*) AS total FROM products p ${whereClause}`, queryParams
        );
        const total = countResult[0].total;

        const [products] = await db.query(`
            SELECT p.*, c.name_ar AS category_name, ps.available_quantity
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_stock ps ON p.id = ps.product_id
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        res.status(200).json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.name_ar AS category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }

        const product = products[0];

        const [stock] = await db.query(
            'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
            [req.params.id]
        );

        const [reviews] = await db.query(
            `SELECT r.rating, r.review_text, r.created_at, u.name AS user_name
             FROM product_reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.is_approved = TRUE
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );

        const [images] = await db.query(
            'SELECT image_url FROM product_images WHERE product_id = ?',
            [req.params.id]
        );

        const [tags] = await db.query(
            `SELECT t.tag_name_ar, t.tag_name_en FROM tags t
             JOIN tagables tg ON t.id = tg.tag_id
             WHERE tg.entity_type = 'product' AND tg.entity_id = ?`,
            [req.params.id]
        );

        const [related] = await db.query(
            `SELECT id, name_ar, price, product_image FROM products 
             WHERE category_id = ? AND id != ? AND is_active = TRUE
             LIMIT 4`,
            [product.category_id, req.params.id]
        );

        const [seo] = await db.query(
            'SELECT * FROM seo_details WHERE entity_type = ? AND entity_id = ?',
            ['product', req.params.id]
        );

        res.status(200).json({
            ...product,
            stock: stock[0] || null,
            reviews,
            reviews_count: reviews.length,
            additional_images: images,
            tags,
            related_products: related,
            seo: seo[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const createProduct = async (req, res) => {
    let { 
        category_id, name_ar, slug, brand_ar, description_ar, 
        wholesale_price, price, discount_price, comparison_price, sku, barcode, unit_ar,
        offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity,
        available_quantity
    } = req.body;

    if (!category_id || !name_ar || !price || !unit_ar) {
        return res.status(400).json({ message: 'من فضلك أدخل جميع البيانات الإجبارية للمنتج' });
    }

    if (!slug && name_ar) {
        slug = name_ar.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase() + '-' + Date.now();
    }

    if (!sku) {
        sku = 'SKU-' + Date.now();
    }

    if (!wholesale_price) {
        wholesale_price = 0;
    }

    const product_image = req.file ? req.file.filename : (req.body.product_image || 'placeholder.png');

    try {
        const [result] = await db.query(
            `INSERT INTO products 
            (category_id, name_ar, slug, brand_ar, description_ar, wholesale_price, price, discount_price, comparison_price, sku, barcode, unit_ar, product_image, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, name_ar, slug || null, brand_ar || null, description_ar || null, wholesale_price, price, discount_price || null, comparison_price || null, sku, barcode || null, unit_ar, product_image, offer_start_at || null, offer_end_at || null, offer_until_stock_out === true || offer_until_stock_out === 'true' || offer_until_stock_out === '1' || offer_until_stock_out === 1 ? 1 : 0, offer_max_quantity || null]
        );

        const productId = result.insertId;

        if (available_quantity !== undefined && available_quantity !== '') {
            await db.query(
                `INSERT INTO product_stock (product_id, available_quantity, min_stock_level)
                 VALUES (?, ?, 5)`,
                [productId, parseInt(available_quantity) || 0]
            );
        }

        res.status(201).json({ 
            message: 'تم إضافة المنتج بنجاح!', 
            productId 
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const fields = ['category_id', 'name_ar', 'name_en', 'slug', 'brand_ar', 'brand_en', 'description_ar', 'description_en', 'unit_ar', 'unit_en', 'wholesale_price', 'price', 'discount_price', 'comparison_price', 'sku', 'barcode', 'is_active', 'offer_start_at', 'offer_end_at', 'offer_until_stock_out', 'offer_max_quantity'];
    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            let val = req.body[field];
            if (field === 'offer_until_stock_out') {
                val = val === true || val === 'true' || val === 1 || val === '1' ? 1 : 0;
            } else if (val === '' && (field === 'sku' || field === 'barcode' || field === 'product_image' || field === 'discount_price' || field === 'offer_start_at' || field === 'offer_end_at' || field === 'offer_max_quantity')) {
                val = null;
            }
            updates.push(`${field} = ?`);
            values.push(val);
        }
    }

    if (req.file) {
        updates.push('product_image = ?');
        values.push(req.file.filename);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
    }

    values.push(id);

    try {
        const [result] = await db.query(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }

        if (req.body.available_quantity !== undefined && req.body.available_quantity !== '') {
            const qty = parseInt(req.body.available_quantity) || 0;
            const [existing] = await db.query('SELECT id FROM product_stock WHERE product_id = ?', [id]);
            if (existing.length > 0) {
                await db.query('UPDATE product_stock SET available_quantity = ? WHERE product_id = ?', [qty, id]);
            } else {
                await db.query('INSERT INTO product_stock (product_id, available_quantity, min_stock_level) VALUES (?, ?, 5)', [id, qty]);
            }
        }

        res.status(200).json({ message: 'تم تحديث المنتج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج', error: error.message });
    }
};
