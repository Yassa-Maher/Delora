// src/controllers/bannerController.js
import db from '../config/db.js';

// 1. جلب البانرات النشطة لتعرض في السلايدر الرئيسي بالـ Frontend حسب اللغة الحالية 🖼️
export const getActiveBanners = async (req, res) => {
    const lang = req.lang;
    try {
        const [banners] = await db.query(
            `SELECT 
                id, image_url, product_id, category_id,
                IFNULL(title_${lang}, title_ar) AS title,
                IFNULL(subtitle_${lang}, subtitle_ar) AS subtitle,
                IFNULL(button_text_${lang}, button_text_ar) AS button_text
             FROM banners 
             WHERE is_active = TRUE 
             ORDER BY sort_order ASC, created_at DESC`
        );
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while fetching banners.' : 'حدث خطأ في السيرفر أثناء جلب البانرات', 
            error: error.message 
        });
    }
};

// 2. جلب جميع البانرات بكافة حقولها (لوحة التحكم للأدمن)
export const getAllBanners = async (req, res) => {
    const lang = req.lang;
    try {
        const [banners] = await db.query('SELECT * FROM banners ORDER BY sort_order ASC');
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. إضافة بانر جديد ودعم توثيق النصوص باللغتين (خاص بالأدمن 🔒)
export const createBanner = async (req, res) => {
    const lang = req.lang;
    const { 
        title_ar, title_en, 
        subtitle_ar, subtitle_en, 
        image_url, 
        button_text_ar, button_text_en, 
        product_id, category_id, sort_order 
    } = req.body;

    if (!title_ar || !image_url) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic title and image URL are required.' : 'العنوان بالعربي ورابط الصورة حقول إجبارية' 
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO banners 
            (title_ar, title_en, subtitle_ar, subtitle_en, image_url, button_text_ar, button_text_en, product_id, category_id, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title_ar, title_en || null, 
                subtitle_ar || null, subtitle_en || null, 
                image_url, 
                button_text_ar || 'اكتشفي عروضنا', button_text_en || 'Discover Offers',
                product_id || null, category_id || null, sort_order || 0
            ]
        );

        res.status(201).json({ 
            message: lang === 'en' ? 'Banner added successfully! 🖼️' : 'تم إضافة البانر بنجاح! 🖼️', 
            bannerId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while creating the banner.' : 'حدث خطأ أثناء إضافة البانر', 
            error: error.message 
        });
    }
};

// 4. حذف بانر نهائياً (خاص بالأدمن 🔒)
export const deleteBanner = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Banner not found.' : 'البانر غير موجود' 
            });
        }
        res.status(200).json({ 
            message: lang === 'en' ? 'Banner deleted successfully 🗑️' : 'تم حذف البانر بنجاح 🗑️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while deleting the banner.' : 'حدث خطأ أثناء حذف البانر', 
            error: error.message 
        });
    }
};