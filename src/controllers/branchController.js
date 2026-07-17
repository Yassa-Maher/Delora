// src/controllers/branchController.js
import db from '../config/db.js';

// 1. جلب كافة الفروع النشطة بناءً على لغة الطلب الحالية 📍
export const getActiveBranches = async (req, res) => {
    const lang = req.lang;
    try {
        const [branches] = await db.query(
            `SELECT 
                id, phone, gps_link, branch_link,
                IFNULL(name_${lang}, name_ar) AS name,
                IFNULL(address_${lang}, address_ar) AS address,
                IFNULL(working_hours_${lang}, working_hours_ar) AS working_hours
             FROM branches 
             WHERE is_active = TRUE`
        );
        res.status(200).json(branches); 
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while fetching branches.' : 'حدث خطأ في السيرفر أثناء جلب الفروع', 
            error: error.message 
        });
    }
};

// 2. إضافة فرع جديد مع دعم الحقول باللغتين العربية والإنجليزية (للأدمن 🔒)
export const createBranch = async (req, res) => {
    const lang = req.lang;
    const { 
        name_ar, name_en, 
        address_ar, address_en, 
        phone, 
        working_hours_ar, working_hours_en, 
        gps_link, branch_link 
    } = req.body;

    // التحقق من الحقل الأساسي الإجباري
    if (!name_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Branch name in Arabic is required.' : 'اسم الفرع باللغة العربية حقل إجباري' 
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO branches 
            (name_ar, name_en, address_ar, address_en, phone, working_hours_ar, working_hours_en, gps_link, branch_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name_ar, name_en || null, 
                address_ar || null, address_en || null, 
                phone || null, 
                working_hours_ar || null, working_hours_en || null, 
                gps_link || null, branch_link || null
            ]
        );
        res.status(201).json({ 
            message: lang === 'en' ? 'Branch added successfully! 📍' : 'تم إضافة الفرع بنجاح! 📍', 
            branchId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while creating the branch.' : 'حدث خطأ أثناء إضافة الفرع', 
            error: error.message 
        });
    }
};

// 3. تعديل فرع بالكامل ودعم اللغتين (للأدمن 🔒)
export const updateBranch = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    const { 
        name_ar, name_en, 
        address_ar, address_en, 
        phone, 
        working_hours_ar, working_hours_en, 
        gps_link, branch_link, is_active 
    } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE branches SET 
                name_ar = ?, name_en = ?, 
                address_ar = ?, address_en = ?, 
                phone = ?, 
                working_hours_ar = ?, working_hours_en = ?, 
                gps_link = ?, branch_link = ?, 
                is_active = ?
             WHERE id = ?`,
            [
                name_ar, name_en || null, 
                address_ar || null, address_en || null, 
                phone || null, 
                working_hours_ar || null, working_hours_en || null, 
                gps_link || null, branch_link || null, 
                is_active !== undefined ? is_active : 1, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Branch not found.' : 'الفرع غير موجود' 
            });
        }
        res.status(200).json({ 
            message: lang === 'en' ? 'Branch details updated successfully! ✏️' : 'تم تحديث بيانات الفرع بنجاح! ✏️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while updating the branch.' : 'حدث خطأ أثناء تحديث الفرع', 
            error: error.message 
        });
    }
};

// 4. حذف فرع نهائياً (للأدمن 🔒)
export const deleteBranch = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        const [result] = await db.query('DELETE FROM branches WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Branch not found.' : 'الفرع غير موجود' 
            });
        }
        res.status(200).json({ 
            message: lang === 'en' ? 'Branch deleted successfully 🗑️' : 'تم حذف الفرع بنجاح 🗑️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while deleting the branch.' : 'حدث خطأ أثناء حذف الفرع', 
            error: error.message 
        });
    }
};