// src/controllers/adminLogController.js
import db from '../config/db.js';

// جلب جميع العمليات المسجلة للأدمن (لوحة التحكم لـ Super Admin فقط 🔒)
export const getAdminLogs = async (req, res) => {
    const lang = req.lang;
    try {
        const [logs] = await db.query(
            `SELECT al.id, al.action, al.ip_address, al.created_at, u.name AS admin_name, u.email AS admin_email, u.role
             FROM admin_logs al
             JOIN users u ON al.admin_id = u.id
             ORDER BY al.created_at DESC`
        );
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while fetching admin logs.' : 'حدث خطأ أثناء جلب سجلات العمليات', 
            error: error.message 
        });
    }
};

// دالة مساعدة داخلية (Helper) بيتم استدعاؤها في الـ Controllers لتسجيل العمليات تلقائياً (لا تعتمد على req مباشرة)
export const createLog = async (adminId, action, ipAddress) => {
    try {
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, action, ipAddress || null]
        );
    } catch (error) {
        console.error('❌ فشل حفظ سجل العملية في الـ logs:', error.message);
    }
};