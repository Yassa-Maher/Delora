import db from '../config/db.js';

export const getStock = async (req, res) => {
    try {
        const [stock] = await db.query(
            `SELECT ps.*, p.name_ar AS product_name, p.sku
             FROM product_stock ps
             JOIN products p ON ps.product_id = p.id
             ORDER BY ps.updated_at DESC`
        );
        res.status(200).json(stock);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateStock = async (req, res) => {
    const { product_id, available_quantity, min_stock_level } = req.body;

    if (!product_id || available_quantity === undefined) {
        return res.status(400).json({ message: 'رقم المنتج والكمية المتاحة مطلوبان' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM product_stock WHERE product_id = ?', [product_id]);

        if (existing.length > 0) {
            const updates = [];
            const values = [];
            updates.push('available_quantity = ?'); values.push(available_quantity);
            if (min_stock_level !== undefined) { updates.push('min_stock_level = ?'); values.push(min_stock_level); }
            values.push(product_id);

            await db.query(
                `UPDATE product_stock SET ${updates.join(', ')} WHERE product_id = ?`,
                values
            );
        } else {
            await db.query(
                'INSERT INTO product_stock (product_id, available_quantity, min_stock_level) VALUES (?, ?, ?)',
                [product_id, available_quantity, min_stock_level || 5]
            );
        }

        res.status(200).json({ message: 'تم تحديث المخزون بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const addBatch = async (req, res) => {
    const { product_id, batch_number, quantity_received, expiry_date } = req.body;

    if (!product_id || !quantity_received) {
        return res.status(400).json({ message: 'رقم المنتج والكمية المستلمة مطلوبان' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO inventory_batches (product_id, batch_number, quantity_received, expiry_date) VALUES (?, ?, ?, ?)',
            [product_id, batch_number || null, quantity_received, expiry_date || null]
        );

        await db.query(
            'UPDATE product_stock SET available_quantity = available_quantity + ? WHERE product_id = ?',
            [quantity_received, product_id]
        );

        res.status(201).json({ message: 'تم إضافة الدفعة وتحديث المخزون بنجاح', batchId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getBatches = async (req, res) => {
    try {
        const [batches] = await db.query(
            `SELECT ib.*, p.name_ar AS product_name
             FROM inventory_batches ib
             JOIN products p ON ib.product_id = p.id
             ORDER BY ib.received_at DESC`
        );
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteBatch = async (req, res) => {
    try {
        const [batch] = await db.query('SELECT product_id, quantity_received FROM inventory_batches WHERE id = ?', [req.params.id]);

        if (batch.length === 0) {
            return res.status(404).json({ message: 'الدفعة غير موجودة' });
        }

        await db.query(
            'UPDATE product_stock SET available_quantity = GREATEST(available_quantity - ?, 0) WHERE product_id = ?',
            [batch[0].quantity_received, batch[0].product_id]
        );

        await db.query('DELETE FROM inventory_batches WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'تم حذف الدفعة وتحديث المخزون بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
