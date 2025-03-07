// userRoute.js - ENTIRE UPDATED FILE
import express from "express"
import { 
    handleAdminLogin, 
    handleUserLogin, 
    handleUserRegister,
    handleForgotPassword,
    handleResetPassword,
    handleTokenRefresh,
    handleLogout,
    addToWishlist,
    removeFromWishlist,
    getWishlist
} from "../controllers/userController.js"
import { loginRateLimiter, passwordResetRateLimiter } from "../middleware/rateLimiter.js"
import { csrfProtection } from "../middleware/csrf.js"
import authUser from "../middleware/auth.js"

const userRouter = express.Router()

// Apply CSRF protection to all routes
userRouter.use(csrfProtection)

// Apply rate limiters to specific routes
userRouter.post('/register', handleUserRegister)
userRouter.post('/login', loginRateLimiter, handleUserLogin)
userRouter.post('/admin', loginRateLimiter, handleAdminLogin)
userRouter.post('/forgot-password', passwordResetRateLimiter, handleForgotPassword)
userRouter.post('/reset-password', handleResetPassword)
userRouter.post('/refresh-token', handleTokenRefresh)
userRouter.post('/logout', authUser, handleLogout)

// Wishlist routes
userRouter.post('/wishlist/add', authUser, addToWishlist)
userRouter.post('/wishlist/remove', authUser, removeFromWishlist)
userRouter.post('/wishlist/get', authUser, getWishlist)

export default userRouter