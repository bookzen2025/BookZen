// middleware/csrf.js - NEW FILE
import crypto from 'crypto';

// Generate a CSRF token
export const generateCsrfToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
    // Exclude GET, HEAD, OPTIONS requests from CSRF protection
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    const csrfToken = req.headers['x-csrf-token'];
    const sessionToken = req.headers['csrf-token'];
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed',
            code: 'CSRF_ERROR'
        });
    }
    
    next();
};