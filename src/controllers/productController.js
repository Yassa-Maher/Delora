// src/controllers/productController.js
import db from '../config/db.js';

// 1. جلب المنتجات مع الصورة الأساسية وعمل Join لحساب السعر النشط واللغات
export const getAllProducts = async (req, res) => {
    const lang = req.lang; // التقاط 'ar' أو 'en'
    try {
        const [products] = await db.query(`
            SELECT 
                p.id,
                p.category_id,
                p.slug,
                p.wholesale_price,
                p.price,
                p.discount_price,
                p.comparison_price,
                p.sku,
                p.barcode,
                p.product_image,
                p.avg_rating,
                p.is_active,
                p.created_at,
                p.offer_start_at,
                p.offer_end_at,
                p.offer_until_stock_out,
                p.offer_max_quantity,
                IFNULL(p.name_${lang}, p.name_ar) AS name,
                IFNULL(p.brand_${lang}, p.brand_ar) AS brand,
                IFNULL(p.description_${lang}, p.description_ar) AS description,
                IFNULL(p.unit_${lang}, p.unit_ar) AS unit,
                IFNULL(c.name_${lang}, c.name_ar) AS category_name,
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
        res.status(500).json({ 
            message: req.lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 2. جلب تفاصيل منتج واحد بدلالة الـ ID مع جلب "معرض الصور الإضافية" واللغات
export const getProductById = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        // أ. جلب تفاصيل المنتج الأساسية والمترجمة
        const [products] = await db.query(`
            SELECT 
                p.id,
                p.category_id,
                p.slug,
                p.wholesale_price,
                p.price,
                p.discount_price,
                p.comparison_price,
                p.sku,
                p.barcode,
                p.product_image,
                p.avg_rating,
                p.is_active,
                p.created_at,
                p.offer_start_at,
                p.offer_end_at,
                p.offer_until_stock_out,
                p.offer_max_quantity,
                IFNULL(p.name_${lang}, p.name_ar) AS name,
                IFNULL(p.brand_${lang}, p.brand_ar) AS brand,
                IFNULL(p.description_${lang}, p.description_ar) AS description,
                IFNULL(p.unit_${lang}, p.unit_ar) AS unit,
                IFNULL(c.name_${lang}, c.name_ar) AS category_name,
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
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }

        const product = products[0];

        // ب. جلب المعرض الإضافي للصور الخاصة بهذا المنتج 🖼️
        const [images] = await db.query('SELECT id, image_url FROM product_images WHERE product_id = ?', [id]);
        product.gallery = images.map(img => img.image_url);

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. إضافة منتج جديد مع معرض الصور الإضافية وحقول اللغات (Transaction)
export const createProduct = async (req, res) => {
    const lang = req.lang;
    const { 
        category_id, name_ar, name_en, slug, brand_ar, brand_en, description_ar, description_en, 
        wholesale_price, price, comparison_price, sku, barcode, unit_ar, unit_en, product_image,
        discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity,
        gallery 
    } = req.body;

    // الاسم العربي والوحدة العربية إلزامية كحد أدنى بناءً على معايير قواعد البيانات الجديدة
    if (!category_id || !name_ar || !slug || !wholesale_price || !price || !sku || !unit_ar || !product_image) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please fill all required product fields (Arabic data is mandatory).' : 'من فضلك أدخل جميع البيانات الإجبارية للمنتج (البيانات بالعربية إلزامية).' 
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // أ. إدخال بيانات المنتج الشاملة للغتين
        const [result] = await connection.query(
            `INSERT INTO products 
            (
                category_id, name_ar, name_en, slug, brand_ar, brand_en, description_ar, description_en, 
                wholesale_price, price, comparison_price, sku, barcode, unit_ar, unit_en, product_image,
                discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name_ar, name_en || null, slug, brand_ar || null, brand_en || null, description_ar || null, description_en || null, 
                wholesale_price, price, comparison_price || null, sku, barcode || null, unit_ar, unit_en || null, product_image,
                discount_price !== undefined ? discount_price : null,
                offer_start_at || null,
                offer_end_at || null,
                offer_until_stock_out === true || offer_until_stock_out === 1 ? 1 : 0,
                offer_max_quantity !== undefined ? offer_max_quantity : null
            ]
        );

        const productId = result.insertId;

        // ب. إدخال روابط الصور الإضافية في جدول product_images 🖼️
        if (gallery && Array.isArray(gallery) && gallery.length > 0) {
            const insertImageQuery = 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)';
            for (const imageUrl of gallery) {
                await connection.query(insertImageQuery, [productId, imageUrl]);
            }
        }

        // جـ. إنشاء سجل فارغ افتراضي في الـ product_stock
        await connection.query('INSERT INTO product_stock (product_id, available_quantity) VALUES (?, 0)', [productId]);

        await connection.commit();
        res.status(201).json({ 
            message: lang === 'en' ? 'Product and gallery images added successfully! 📦✨' : 'تم إضافة المنتج وصوره الإضافية بنجاح! 📦✨', 
            productId 
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while adding the product.' : 'حدث خطأ أثناء إضافة المنتج', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// 4. تعديل منتج قائم مع تحديث اللغات ومعرض الصور بالكامل
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    const { 
        category_id, name_ar, name_en, slug, brand_ar, brand_en, description_ar, description_en, 
        wholesale_price, price, comparison_price, sku, barcode, unit_ar, unit_en, product_image, is_active,
        discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity,
        gallery 
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found for update.' : 'المنتج غير موجود لتعديله' 
            });
        }

        // أ. تحديث البيانات الشاملة للغتين للمنتج
        await connection.query(
            `UPDATE products SET 
                category_id = ?, name_ar = ?, name_en = ?, slug = ?, brand_ar = ?, brand_en = ?, description_ar = ?, description_en = ?, 
                wholesale_price = ?, price = ?, comparison_price = ?, sku = ?, barcode = ?, unit_ar = ?, unit_en = ?, product_image = ?, is_active = ?,
                discount_price = ?, offer_start_at = ?, offer_end_at = ?, offer_until_stock_out = ?, offer_max_quantity = ?
            WHERE id = ?`,
            [
                category_id, name_ar, name_en || null, slug, brand_ar || null, brand_en || null, description_ar || null, description_en || null, 
                wholesale_price, price, comparison_price || null, sku, barcode || null, unit_ar, unit_en || null, product_image, is_active !== undefined ? is_active : 1,
                discount_price !== undefined ? discount_price : null,
                offer_start_at || null,
                offer_end_at || null,
                offer_until_stock_out === true || offer_until_stock_out === 1 ? 1 : 0,
                offer_max_quantity !== undefined ? offer_max_quantity : null,
                id
            ]
        );

        // ب. تحديث الـ gallery: تفريغ القديم وإدخال الجديد
        if (gallery && Array.isArray(gallery)) {
            await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
            const insertImageQuery = 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)';
            for (const imageUrl of gallery) {
                await connection.query(insertImageQuery, [id, imageUrl]);
            }
        }

        await connection.commit();
        res.status(200).json({ 
            message: lang === 'en' ? 'Product and gallery images updated successfully! ✏️🖼️' : 'تم تحديث المنتج وصور المعرض بنجاح! ✏️🖼️' 
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while updating the product.' : 'حدث خطأ أثناء تحديث المنتج', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};