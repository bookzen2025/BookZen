// middleware/rateLimiter.js - NEW FILE
import { rateLimit } from 'express-rate-limit';

// Create login rate limiter
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per window
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after an hour',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});