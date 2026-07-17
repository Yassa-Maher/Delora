import db from '../config/db.js';

// 1. تسجيل دفعة مخزن جديدة وزيادة الـ available_quantity تلقائياً في الـ product_stock
export const receiveInventoryBatch = async (req, res) => {
    const { product_id, batch_number, quantity_received, expiry_date } = req.body;

    if (!product_id || !quantity_received) {
        return res.status(400).json({ message: 'رقم المنتج والكمية المستلمة حقول إجبارية' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // أ. التحقق من وجود المنتج
        const [product] = await connection.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (product.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'المنتج غير موجود لتسجيل الدفعة' });
        }

        // ب. إدخال سجل الدفعة
        await connection.query(
            `INSERT INTO inventory_batches (product_id, batch_number, quantity_received, expiry_date) 
             VALUES (?, ?, ?, ?)`,
            [product_id, batch_number || null, quantity_received, expiry_date || null]
        );

        // جـ. زيادة الكمية الإجمالية للمنتج في جدول product_stock
        // نستخدم ON DUPLICATE KEY UPDATE احتياطياً لو السجل غير منشأ
        await connection.query(
            `INSERT INTO product_stock (product_id, available_quantity) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE available_quantity = available_quantity + VALUES(available_quantity)`,
            [product_id, quantity_received]
        );

        await connection.commit();
        res.status(201).json({ message: 'تم تسجيل دفعة التوريد الجديدة بنجاح وزيادة كمية المخزون! 📥📦' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'حدث خطأ أثناء توريد الشحنة', error: error.message });
    } finally {
        connection.release();
    }
};

// 2. جلب جميع حركات الشحنات للمستودعات (للأدمن)
export const getInventoryBatches = async (req, res) => {
    try {
        const [batches] = await db.query(
            `SELECT ib.*, p.name AS product_name, p.sku, p.unit
             FROM inventory_batches ib
             JOIN products p ON ib.product_id = p.id
             ORDER BY ib.received_at DESC`
        );
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب دفعات المخزون', error: error.message });
    }
};