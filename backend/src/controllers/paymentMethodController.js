import db from '../config/db.js';

export const getPaymentMethods = async (req, res) => {
    try {
        const [methods] = await db.query('SELECT * FROM payment_methods ORDER BY sort_order ASC');
        res.status(200).json(methods);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getActivePaymentMethods = async (req, res) => {
    try {
        const [methods] = await db.query('SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY sort_order ASC');
        res.status(200).json(methods);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const createPaymentMethod = async (req, res) => {
    const { name_ar, name_en, type, provider, receiver_number, receiver_name, require_screenshot, require_transaction_id, sort_order } = req.body;
    if (!name_ar || !name_en || !type) {
        return res.status(400).json({ message: 'الاسم والنوع مطلوبان' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO payment_methods (name_ar, name_en, type, provider, receiver_number, receiver_name, require_screenshot, require_transaction_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name_ar, name_en, type, provider || null, receiver_number || null, receiver_name || null, require_screenshot ?? true, require_transaction_id ?? true, sort_order || 0]
        );
        res.status(201).json({ message: 'تمت الإضافة بنجاح', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const fields = ['name_ar', 'name_en', 'type', 'provider', 'receiver_number', 'receiver_name', 'require_screenshot', 'require_transaction_id', 'is_active', 'sort_order'];
    try {
        const sets = []; const vals = [];
        for (const f of fields) {
            if (req.body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(req.body[f]); }
        }
        if (sets.length === 0) return res.status(400).json({ message: 'لا توجد بيانات للتحديث' });
        vals.push(id);
        const [result] = await db.query(`UPDATE payment_methods SET ${sets.join(', ')} WHERE id = ?`, vals);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'الطريقة غير موجودة' });
        res.status(200).json({ message: 'تم التحديث بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM payment_methods WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'الطريقة غير موجودة' });
        res.status(200).json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
