import db from '../config/db.js';

export const checkoutOrder = async (req, res) => {
    const userId = req.user.id;
    const { address, phone_number, notes, payment_method, coupon_code } = req.body;

    if (!address || !phone_number) {
        return res.status(400).json({ message: 'العنوان ورقم الهاتف مطلوبين لإتمام الطلب' });
    }

    const validMethods = ['cash_on_delivery', 'wallet'];
    const selectedMethod = validMethods.includes(payment_method) ? payment_method : 'cash_on_delivery';

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [cartItems] = await connection.query(
            `SELECT c.quantity, p.id AS product_id, p.price, p.discount_price, p.offer_end_at, p.offer_until_stock_out, p.offer_max_quantity, p.wholesale_price
             FROM cart_items c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'سلتك فارغة، لا يمكنك إتمام الطلب' });
        }

        const now = new Date();
        for (const item of cartItems) {
            const [stock] = await connection.query(
                'SELECT available_quantity FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (stock.length === 0 || stock[0].available_quantity < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    message: `الكمية المطلوبة من المنتج رقم (${item.product_id}) غير متوفرة في المخزن حالياً.`
                });
            }

            item.effective_price = item.discount_price && (
                (item.offer_end_at && new Date(item.offer_end_at) > now) || item.offer_until_stock_out
            ) ? parseFloat(item.discount_price) : parseFloat(item.price);
        }

        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.effective_price * item.quantity;
        });

        let shippingPrice = 0.00;
        let discountAmount = 0;
        let couponId = null;

        if (coupon_code) {
            const [coupons] = await connection.query(
                'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
                [coupon_code]
            );
            if (coupons.length > 0) {
                const coupon = coupons[0];
                if (!coupon.expiry_date || new Date() <= new Date(coupon.expiry_date)) {
                    if (!coupon.start_date || new Date() >= new Date(coupon.start_date)) {
                        if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
                            if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
                                discountAmount = coupon.discount_value;
                                if (coupon.discount_type === 'percentage') {
                                    discountAmount = subtotal * coupon.discount_value / 100;
                                    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                                        discountAmount = coupon.max_discount_amount;
                                    }
                                }
                                couponId = coupon.id;
                                await connection.query(
                                    'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
                                    [coupon.id]
                                );
                            }
                        }
                    }
                }
            }
        }

        let totalAmount = subtotal + shippingPrice - discountAmount;
        if (totalAmount < 0) totalAmount = 0;

        const fullShippingAddress = `العنوان: ${address} | تليفون: ${phone_number} ${notes ? '| ملاحظات: ' + notes : ''}`;

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, subtotal, shipping_price, total_amount, discount_amount, coupon_id, shipping_address, payment_method, payment_status, order_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
            [userId, subtotal, shippingPrice, totalAmount, discountAmount, couponId, fullShippingAddress, selectedMethod]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            const itemTotalPrice = item.effective_price * item.quantity;

            await connection.query(
                `INSERT INTO order_items
                (order_id, product_id, quantity, price_per_unit, purchase_wholesale_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.effective_price, item.wholesale_price, itemTotalPrice]
            );

            await connection.query(
                `UPDATE product_stock
                 SET available_quantity = available_quantity - ?
                 WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );

            const [updatedStock] = await connection.query(
                'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (updatedStock.length > 0) {
                const currentStock = updatedStock[0].available_quantity;
                const minLevel = updatedStock[0].min_stock_level;

                if (currentStock <= minLevel) {
                    console.log(`⚠️ Admin alert: Product #${item.product_id} fell below safety threshold after order! Remaining: ${currentStock} units.`);
                }
            }
        }

        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        await connection.commit();

        res.status(201).json({
            message: selectedMethod === 'cash_on_delivery'
                ? 'تم تسجيل طلبك بنجاح! سيتم الدفع عند الاستلام.'
                : 'تم تسجيل طلبك بنجاح! يرجى إرسال إثبات الدفع عبر تحويل بنكي.',
            orderId: orderId,
            subtotal: subtotal,
            total_amount: totalAmount,
            payment_method: selectedMethod,
            payment_status: 'pending'
        });

    } catch (error) {
        if (connection) {
            try { await connection.rollback(); } catch (e) { /* ignore */ }
        }
        res.status(500).json({ message: 'حدث خطأ أثناء إتمام الطلب', error: error.message });
    } finally {
        if (connection) try { connection.release(); } catch (e) { /* ignore */ }
    }
};

export const uploadPaymentProof = async (req, res) => {
    const userId = req.user.id;
    const { order_id, process_number, sender_phone, sender_name, transfer_date } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: 'رقم الطلب مطلوب' });
    }

    if (!process_number || !sender_name || !transfer_date) {
        return res.status(400).json({ message: 'جميع الحقول المطلوبة: رقم العملية، اسم المرسل، تاريخ التحويل' });
    }

    try {
        const [orders] = await db.query(
            'SELECT id, user_id, payment_status, payment_method FROM orders WHERE id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }
        if (orders[0].user_id !== userId) {
            return res.status(403).json({ message: 'هذا الطلب ليس لك' });
        }
        if (orders[0].payment_status === 'paid') {
            return res.status(400).json({ message: 'تم دفع هذا الطلب بالفعل' });
        }
        if (orders[0].payment_method !== 'wallet') {
            return res.status(400).json({ message: 'طريقة الدفع لهذا الطلب ليست محفظة. اختر wallet عند إنشاء الطلب.' });
        }

        const proofImage = req.file ? req.file.filename : null;

        const paymentInfo = JSON.stringify({
            process_number,
            sender_phone: sender_phone || null,
            sender_name,
            transfer_date
        });

        await db.query(
            `UPDATE orders
             SET payment_method = 'wallet',
                 payment_reference_id = ?,
                 payment_proof_image = ?,
                 payment_status = 'pending',
                 wallet_review_status = 'pending_review'
             WHERE id = ?`,
            [paymentInfo, proofImage, order_id]
        );

        res.status(200).json({ message: 'تم إرسال إثبات الدفع. في انتظار مراجعة الإدارة.' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const reviewWalletPayment = async (req, res) => {
    const { order_id, action } = req.body;

    if (!order_id || !action) {
        return res.status(400).json({ message: 'رقم الطلب والإجراء مطلوبان' });
    }

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'الإجراء يجب أن يكون approve أو reject' });
    }

    try {
        const [orders] = await db.query(
            'SELECT id, payment_method, wallet_review_status FROM orders WHERE id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        if (orders[0].payment_method !== 'wallet') {
            return res.status(400).json({ message: 'طريقة الدفع لهذا الطلب ليست محفظة' });
        }

        if (orders[0].wallet_review_status !== 'pending_review') {
            return res.status(400).json({ message: 'تمت مراجعة هذا الطلب بالفعل' });
        }

        if (action === 'approve') {
            await db.query(
                'UPDATE orders SET payment_status = ?, wallet_review_status = ? WHERE id = ?',
                ['paid', 'approved', order_id]
            );
            return res.status(200).json({ message: 'تم اعتماد الدفع بنجاح' });
        } else {
            await db.query(
                'UPDATE orders SET payment_status = ?, wallet_review_status = ? WHERE id = ?',
                ['failed', 'rejected', order_id]
            );
            return res.status(200).json({ message: 'تم رفض إثبات الدفع' });
        }

    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
            [userId]
        );
        res.status(200).json(orders.map(parsePaymentInfo));
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.name AS user_name, u.email AS user_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.order_date DESC`
        );
        res.status(200).json(orders.map(parsePaymentInfo));
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

const statusLabels = {
    pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد المعالجة',
    out_for_delivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي', completed: 'مكتمل'
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { order_status, delivery_boy_id } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'completed'];

    if (!order_status || !validStatuses.includes(order_status)) {
        return res.status(400).json({ message: `حالة الطلب غير صالحة. الحالات المسموحة: ${validStatuses.join(', ')}` });
    }

    try {
        const [order] = await db.query('SELECT user_id FROM orders WHERE id = ?', [id]);
        if (order.length === 0) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        const updates = ['order_status = ?'];
        const values = [order_status];

        if (delivery_boy_id !== undefined) {
            updates.push('delivery_boy_id = ?');
            values.push(delivery_boy_id);
        }

        values.push(id);

        const [result] = await db.query(
            `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        const label = statusLabels[order_status] || order_status;
        await db.query(
            `INSERT INTO user_notifications (user_id, title_ar, message_ar, order_id)
             VALUES (?, ?, ?, ?)`,
            [order[0].user_id, `تحديث حالة الطلب #${id}`, `تم تحديث حالة طلبك إلى: ${label}`, id]
        );

        res.status(200).json({ message: 'تم تحديث حالة الطلب بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const getOrderStats = async (req, res) => {
    try {
        const [totalOrders] = await db.query('SELECT COUNT(*) AS count FROM orders');
        const [revenue] = await db.query('SELECT SUM(total_amount) AS total FROM orders WHERE order_status != "cancelled"');
        const [statusCounts] = await db.query('SELECT order_status, COUNT(*) AS count FROM orders GROUP BY order_status');
        const [bestSeller] = await db.query(
            `SELECT p.id, p.name_ar, p.price, p.product_image, SUM(oi.quantity) AS total_sold
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.order_status != 'cancelled'
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 1`
        );
        const [monthlySales] = await db.query(
            `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total_amount) AS total
             FROM orders WHERE order_status != 'cancelled'
             GROUP BY month ORDER BY month ASC LIMIT 12`
        );
        const [categoryStats] = await db.query(
            `SELECT c.id, c.name_ar, COUNT(oi.id) AS total_items
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN categories c ON p.category_id = c.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.order_status != 'cancelled'
             GROUP BY c.id ORDER BY total_items DESC`
        );
        res.status(200).json({
            totalOrders: totalOrders[0].count,
            totalRevenue: revenue[0].total || 0,
            statusCounts,
            bestSeller: bestSeller[0] || null,
            monthlySales,
            categoryStats,
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

const parsePaymentInfo = (order) => {
    if (order.payment_reference_id && order.payment_method === 'wallet') {
        try { order.payment_info = JSON.parse(order.payment_reference_id); } catch (e) { order.payment_info = null; }
    }
    return order;
};
