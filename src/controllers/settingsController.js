// src/controllers/storeSettingsController.js
import db from '../config/db.js';

// 1. جلب كافة إعدادات الموقع لعرضها (عام أو للأدمن) حسب اللغة الحالية
export const getStoreSettings = async (req, res) => {
    const lang = req.lang;
    try {
        const [settings] = await db.query(
            `SELECT 
                key_name, 
                key_value, 
                IFNULL(display_name_${lang}, display_name_ar) AS display_name 
             FROM store_settings`
        );
        
        // تحويل الإعدادات لـ JSON Object ليسهل قراءتها بالـ Frontend
        const settingsMap = {};
        settings.forEach(item => {
            settingsMap[item.key_name] = {
                value: item.key_value,
                display_name: item.display_name
            };
        });
        
        res.status(200).json(settingsMap);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while fetching settings.' : 'حدث خطأ أثناء جلب الإعدادات', 
            error: error.message 
        });
    }
};

// 2. تحديث قيمة إعداد معين (للأدمن 🔒)
export const updateStoreSetting = async (req, res) => {
    const lang = req.lang;
    const { key_name, key_value } = req.body;

    if (!key_name) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Setting name (key_name) is required.' : 'اسم الإعداد (key_name) مطلوب' 
        });
    }

    try {
        const [result] = await db.query(
            'UPDATE store_settings SET key_value = ? WHERE key_name = ?',
            [key_value, key_name]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Setting not found in the system.' : 'الإعداد غير موجود في النظام' 
            });
        }

        res.status(200).json({ 
            message: lang === 'en' ? 'Setting updated successfully! ⚙️' : 'تم تحديث الإعداد بنجاح! ⚙️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while updating the setting.' : 'حدث خطأ أثناء تحديث الإعداد', 
            error: error.message 
        });
    }
};