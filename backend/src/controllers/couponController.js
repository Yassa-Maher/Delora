import db from '../config/db.js';

export const createCoupon = async (req, res) => {
    const { code, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, start_date, expiry_date } = req.body;

    if (!code || !discount_type || !discount_value) {
        return res.status(400).json({ message: 'الكود ونوع الخصم وقيمة الخصم مطلوبة' });
    }

    if (!['fixed', 'percentage'].includes(discount_type)) {
        return res.status(400).json({ message: 'نوع الخصم يجب أن يكون fixed أو percentage' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO coupons (code, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, start_date, expiry_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, discount_type, discount_value, max_discount_amount || null, min_order_amount || 0, usage_limit || null, start_date || null, expiry_date || null]
        );

        res.status(201).json({ message: 'تم إضافة الكوبون بنجاح', couponId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'كود الخصم موجود مسبقاً' });
        }
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const [coupons] = await db.query('SELECT * FROM coupons ORDER BY id DESC');
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const validateCoupon = async (req, res) => {
    const { code, order_total } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'كود الخصم مطلوب' });
    }

    try {
        const [coupons] = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code]);

        if (coupons.length === 0) {
            return res.status(404).json({ message: 'كود الخصم غير صالح أو غير نشط' });
        }

        const coupon = coupons[0];

        if (coupon.expiry_date && new Date() > new Date(coupon.expiry_date)) {
            return res.status(400).json({ message: 'انتهت صلاحية كود الخصم' });
        }

        if (coupon.start_date && new Date() < new Date(coupon.start_date)) {
            return res.status(400).json({ message: 'كود الخصم لم يبدأ بعد' });
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ message: 'تم استنفاذ عدد استخدامات كود الخصم' });
        }

        if (order_total && order_total < coupon.min_order_amount) {
            return res.status(400).json({ message: `الحد الأدنى للطلب لتطبيق الكوبون هو ${coupon.min_order_amount} جنيه` });
        }

        let discount_amount = coupon.discount_value;
        if (coupon.discount_type === 'percentage') {
            discount_amount = (order_total || 0) * coupon.discount_value / 100;
            if (coupon.max_discount_amount && discount_amount > coupon.max_discount_amount) {
                discount_amount = coupon.max_discount_amount;
            }
        }

        res.status(200).json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: Math.round(discount_amount * 100) / 100
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const fields = ['code', 'discount_type', 'discount_value', 'max_discount_amount', 'min_order_amount', 'usage_limit', 'start_date', 'expiry_date', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of fields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'لم يتم إرسال أي بيانات للتحديث' });
    }

    values.push(id);

    try {
        const [result] = await db.query(
            `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الكوبون غير موجود' });
        }

        res.status(200).json({ message: 'تم تحديث الكوبون بنجاح' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'كود الخصم موجود مسبقاً' });
        }
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الكوبون غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف الكوبون بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};
