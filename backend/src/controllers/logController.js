import db from '../config/db.js';

export const getLogs = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const offset = (page - 1) * limit;

    try {
        const [countResult] = await db.query('SELECT COUNT(*) AS total FROM admin_logs');
        const total = countResult[0].total;

        const [logs] = await db.query(
            `SELECT l.*, u.name AS admin_name
             FROM admin_logs l
             JOIN users u ON l.admin_id = u.id
             ORDER BY l.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.status(200).json({
            logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في السيرفر', error: error.message });
    }
};

export const createLog = async (adminId, action, ipAddress) => {
    try {
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, action, ipAddress || null]
        );
    } catch (error) {
        console.error('Failed to create admin log:', error.message);
    }
};
