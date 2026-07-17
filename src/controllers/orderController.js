// src/controllers/orderController.js
import db from '../config/db.js';

export const checkoutOrder = async (req, res) => {
    const userId = req.user.id;
    // استلام عنوان الشحن من خلال معرف العنوان (address_id) أو عنوان يدوي احتياطي (manual_address)
    const { address_id, phone_number, notes, manual_address } = req.body; 

    if (!address_id && !manual_address) {
        return res.status(400).json({ message: 'من فضلك حدد عنوان الشحن لإتمام الطلب' });
    }
    if (!phone_number) {
        return res.status(400).json({ message: 'رقم الهاتف مطلوب لإتمام الطلب' });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. جلب المنتجات وحساب أسعارها النشطة حالياً بناءً على شروط العرض والخصم 🔥
        const [cartItems] = await connection.query(
            `SELECT c.quantity, p.id AS product_id, p.wholesale_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS active_price
             FROM cart_items c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`, 
            [userId]
        );

        if (cartItems.length === 0) {
            await connection.release();
            return res.status(400).json({ message: 'سلتك فارغة، لا يمكنك إتمام الطلب' });
        }

        // 2. التحقق من توافر الكمية في المخزن قبل أي شيء 📦
        for (const item of cartItems) {
            const [stock] = await connection.query(
                'SELECT available_quantity FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (stock.length === 0 || stock[0].available_quantity < item.quantity) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    message: `عذراً يا برنس، الكمية المطلوبة من المنتج رقم (${item.product_id}) غير متوفرة في المخزن حالياً.` 
                });
            }
        }

        // 3. صياغة وتحديد عنوان الشحن بالتفصيل من الداتا بيز 📍
        let shippingAddress = '';

        if (address_id) {
            const [addressResult] = await connection.query(
                'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
                [address_id, userId]
            );

            if (addressResult.length > 0) {
                const addr = addressResult[0];
                shippingAddress = `${addr.title} - ${addr.city}, ${addr.area}, شارع: ${addr.street_details}`;
                if (addr.building_number) shippingAddress += `، عمارة: ${addr.building_number}`;
                if (addr.floor_number) shippingAddress += `، دور: ${addr.floor_number}`;
            } else {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: 'عنوان الشحن المختار غير صالح' });
            }
        } else {
            shippingAddress = manual_address;
        }

        if (notes) {
            shippingAddress += ` | ملاحظة: ${notes}`;
        }

        // 4. حساب إجمالي الفاتورة الفعلي بناءً على أسعار الخصومات النشطة
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.active_price * item.quantity;
        });

        let shippingPrice = 0.00; // يمكن وضع قيمة شحن افتراضية أو متغيرة لاحقاً
        let totalAmount = subtotal + shippingPrice; 

        // 5. إنشاء الطلب الرئيسي وحفظه في جدول orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, subtotal, shipping_price, total_amount, shipping_address, order_status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [userId, subtotal, shippingPrice, totalAmount, shippingAddress]
        );
        const orderId = orderResult.insertId;

        // 6. نقل المنتجات لجدول تفاصيل الطلب (order_items) وتعديل كميات المخزن
        for (const item of cartItems) {
            const itemTotalPrice = item.active_price * item.quantity;
            
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price_per_unit, purchase_wholesale_price, total_price) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.active_price, item.wholesale_price, itemTotalPrice]
            );

            // خصم الكمية من المخزون
            await connection.query(
                `UPDATE product_stock 
                 SET available_quantity = available_quantity - ? 
                 WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );

            // التحقق من حد الأمان للمخزون
            const [updatedStock] = await connection.query(
                'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (updatedStock.length > 0) {
                const currentStock = updatedStock[0].available_quantity;
                const minLevel = updatedStock[0].min_stock_level;

                if (currentStock <= minLevel) {
                    console.log(`\x1b[33m⚠️ تنبيه للإدارة: المنتج رقم (${item.product_id}) قل عن حد الأمان بعد إتمام الطلب! المتبقي حالياً: ${currentStock} قطع فقط.\x1b[0m`);
                }
            }
        }

        // 7. تفريغ سلة التسوق للعميل
        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            message: 'تم تسجيل طلبك وتحديث المخزن بنجاح يا برنس! 🎉📦', 
            orderId: orderId,
            subtotal: subtotal,
            total_amount: totalAmount 
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: 'حدث خطأ أثناء إتمام الطلب وتحديث المخزن', error: error.message });
    }
};

// جلب جميع طلبات العميل الحالي
export const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', 
            [userId]
        );
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};