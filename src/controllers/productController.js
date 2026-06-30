import db from '../config/db.js';

// 1. جلب المنتجات مع اسم القسم الخاص بها 
export const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
        `);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

// 2. إضافة منتج جديد (مطابق تماماً لحقول الداتا بيز الخاصة بك) 
export const createProduct = async (req, res) => {
    const { 
        category_id, name, slug, brand, description, 
        wholesale_price, price, comparison_price, sku, barcode, unit, product_image 
    } = req.body;

    // التحقق من الحقول الإجبارية (NOT NULL في الجدول) 
    if (!category_id || !name || !slug || !wholesale_price || !price || !sku || !unit || !product_image) {
        return res.status(400).json({ message: 'من فضلك أدخل جميع البيانات الإجبارية للمنتج' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO products 
            (category_id, name, slug, brand, description, wholesale_price, price, comparison_price, sku, barcode, unit, product_image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, name, slug, brand || null, description || null, wholesale_price, price, comparison_price || null, sku, barcode || null, unit, product_image]
        );

        res.status(201).json({ 
            message: 'تم إضافة المنتج بنجاح يا هندسة! 📦', 
            productId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج', error: error.message });
    }
};