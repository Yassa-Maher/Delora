export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت' });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({ message: 'خطأ في رفع الملف: ' + err.message });
    }

    res.status(err.status || 500).json({
        message: err.message || 'حدث خطأ غير متوقع في السيرفر'
    });
};

export const notFound = (req, res) => {
    res.status(404).json({ message: `المسار ${req.originalUrl} غير موجود` });
};
