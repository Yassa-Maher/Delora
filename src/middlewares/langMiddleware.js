export const detectLanguage = (req, res, next) => {
    // التقاط الـ Header ومطابقته (سواء كان ar أو en)
    const clientLang = req.headers['accept-language']?.split(',')[0]?.substring(0, 2).toLowerCase();
    req.lang = (clientLang === 'en' || clientLang === 'ar') ? clientLang : 'ar';
    next();
};