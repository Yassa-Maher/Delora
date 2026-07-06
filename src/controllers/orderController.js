// src/controllers/orderController.js
import db from '../config/db.js';

export const checkoutOrder = async (req, res) => {
    const userId = req.user.id;
    const { address, phone_number, notes } = req.body; 

    if (!address || !phone_number) {
        return res.status(400).json({ message: 'العنوان ورقم الهاتف مطلوبين لإتمام الطلب' });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. جلب المنتجات اللي في سلة العميل الحالية
        const [cartItems] = await connection.query(
            `SELECT c.quantity, p.id AS product_id, p.price, p.wholesale_price 
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

        // 3. حساب إجمالي الحساب (Subtotal)
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        let shippingPrice = 0.00; 
        let totalAmount = subtotal + shippingPrice; 
        
        const fullShippingAddress = `العنوان: ${address} | تليفون: ${phone_number} ${notes ? '| ملاحظات: ' + notes : ''}`;

        // 4. إنشاء الطلب في جدول orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, subtotal, shipping_price, total_amount, shipping_address, order_status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [userId, subtotal, shippingPrice, totalAmount, fullShippingAddress]
        );
        const orderId = orderResult.insertId;

        // 5. نقل المنتجات لجدول order_items + خصم الكمية من المخزن تلقائياً وتنبيه الإدارة 🔄⚡
        for (const item of cartItems) {
            const itemTotalPrice = item.price * item.quantity;
            
            // أ) تسجيل العنصر في الفاتورة
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price_per_unit, purchase_wholesale_price, total_price) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price, item.wholesale_price, itemTotalPrice]
            );

            // ب) تحديث المخزن (خصم الكمية المباعة) 📉
            await connection.query(
                `UPDATE product_stock 
                 SET available_quantity = available_quantity - ? 
                 WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );

            // ج) فحص المخزن بعد الخصم لإرسال تنبيه للإدارة لو قل عن حد الأمان ⚠️
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

        // 6. تفريغ السلة للعميل بعد ما الطلب نجح
        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        // تأكيد العملية بالكامل في الداتا بيز
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