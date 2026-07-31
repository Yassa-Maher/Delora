// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    // Verify token is sent in Headers, specifically the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify and decode token using the Secret Key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach decoded user data (id, role) to request for use in controllers
            req.user = decoded;

            // Pass request to the next Route or Controller
            next();
        } catch (error) {
            console.error(' Token verification error:', error.message);
            return res.status(401).json({ message: 'غير مصرح بالدخول، التوكن غير صالح أو منتهي' });
        }
    }

    // If no token was sent at all
    if (!token) {
        return res.status(401).json({ message: 'غير مصرح بالدخول، لم يتم إرسال التوكن' });
    }
};


// Flexible method to verify roles allowed to access the route
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user exists and has a registered role
        if (req.user && allowedRoles.includes(req.user.role)) {
            next(); // Role is allowed, pass the request
        } else {
            return res.status(403).json({ 
                message: `غير مسموح بالدخول، هذا المسار مخصص للأدوار التالية: ${allowedRoles.join(', ')}` 
            });
        }
    };
};