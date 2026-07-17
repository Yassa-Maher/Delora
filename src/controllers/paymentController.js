// src/controllers/paymentController.js
import axios from 'axios';

// دالة بدء عملية الدفع وإنشاء رابط الدفع للفرونت إند
export const initiatePaymobPayment = async (req, res) => {
    const { amount, firstName, lastName, email, phone, orderId } = req.body;
    const lang = req.lang; // التقاط 'ar' أو 'en'

    if (!amount || !email || !phone) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Required payment data is missing.' : 'البيانات الأساسية لعملية الدفع ناقصة.' 
        });
    }

    try {
        // الخطوة 1: تسجيل الدخول في باي موب للحصول على الـ Auth Token
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: process.env.PAYMOB_API_KEY
        });
        const token = authResponse.data.token;

        // الخطوة 2: إنشاء طلب (Order Registration) داخل باي موب
        // المبلغ يضرب في 100 لأن باي موب يتعامل بالقروش (Cents)
        const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: amount * 100,
            currency: "EGP",
            items: []
        });
        const paymobOrderId = orderResponse.data.id;

        // الخطوة 3: توليد مفتاح الدفع (Payment Key Request)
        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/ecommerce/payment_keys', {
            auth_token: token,
            amount_cents: amount * 100,
            expiration: 3600, // ساعة واحدة صلاحية الرابط
            order_id: paymobOrderId,
            billing_data: {
                apartment: "NA", floor: "NA", building: "NA", street: "NA", postal_code: "NA", city: "NA",
                country: "EGY", state: "NA",
                first_name: firstName || "Customer",
                last_name: lastName || "User",
                email: email,
                phone_number: phone
            },
            currency: "EGP",
            integration_id: process.env.PAYMOB_INTEGRATION_ID // رقم الـ Integration للفيزا
        });

        const paymentToken = paymentKeyResponse.data.token;
        
        // الرابط النهائي الذي سيفتحه الفرونت إند لإدخل الكارت - ديلورا هايبيرماركت
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

        res.status(200).json({ 
            message: lang === 'en' ? 'Payment link generated successfully!' : 'تم إنشاء رابط الدفع بنجاح!', 
            paymentUrl,
            paymobOrderId 
        });

    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Failed to connect with Paymob payment gateway.' : 'فشل الربط مع بوابة دفع Paymob', 
            error: error.response?.data || error.message 
        });
    }
};

// الـ Webhook: ميثود يستدعيها سيرفر Paymob تلقائياً بعد دفع العميل لتحديث حالة الفاتورة
// (الـ Webhook يتعامل مباشرة مع سيرفر باي موب، لذلك الاستجابة تكون "OK" ثابتة للسيرفر)
export const paymobWebhook = async (req, res) => {
    const data = req.body.obj;

    try {
        // إذا نجحت العملية (success === true)
        if (data.success === true) {
            const paymobOrderId = data.order.id;

            // تحديث حالة الأوردر في قاعدة البيانات عندك بناءً على رقم الأوردر من باي موب
            // يفضل ربط جدول الـ orders بحقل paymob_order_id لمطابقته هنا
            // await db.query('UPDATE orders SET payment_status = "paid", status = "processing" WHERE paymob_order_id = ?', [paymobOrderId]);
            
            console.log(`✅ العملية ناجحة للأوردر رقم: ${paymobOrderId}`);
        }
        
        // إرجاع استجابة 200 لباي موب لتأكيد الاستلام
        res.status(200).send('OK');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};