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
    getWishlist,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    verifyAdminToken,
    handleGoogleCallback,
    handleGoogleUser
} from "../controllers/userController.js"
import { loginRateLimiter, passwordResetRateLimiter } from "../middleware/rateLimiter.js"
import { csrfProtection } from "../middleware/csrf.js"
import authUser from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import passport from "../config/passport.js"

const userRouter = express.Router()

// Không áp dụng CSRF protection cho tất cả các routes nữa
// userRouter.use(csrfProtection)

// Route đăng nhập không cần CSRF protection
userRouter.post('/register', csrfProtection, handleUserRegister)
userRouter.post('/login', loginRateLimiter, csrfProtection, handleUserLogin)
userRouter.post('/admin', loginRateLimiter, handleAdminLogin) // Không có CSRF cho route đăng nhập admin
userRouter.post('/forgot-password', passwordResetRateLimiter, csrfProtection, handleForgotPassword)
userRouter.post('/reset-password', csrfProtection, handleResetPassword)
userRouter.post('/refresh-token', csrfProtection, handleTokenRefresh)
userRouter.post('/logout', authUser, csrfProtection, handleLogout)

// Google OAuth routes
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
userRouter.get('/auth/google/callback', passport.authenticate('google', { session: false }), handleGoogleCallback)
userRouter.get('/auth/google/user/:userId', handleGoogleUser)

// Xác thực token admin
userRouter.get('/verify-admin', verifyAdminToken)

// Wishlist routes
userRouter.post('/wishlist/add', authUser, csrfProtection, addToWishlist)
userRouter.post('/wishlist/remove', authUser, csrfProtection, removeFromWishlist)
userRouter.post('/wishlist/get', authUser, csrfProtection, getWishlist)

// Admin user management routes - Thêm adminAuth và loại bỏ CSRF protection không cần thiết
userRouter.get('/admin/users', adminAuth, getAllUsers)
userRouter.get('/admin/users/:id', adminAuth, getUserById)
userRouter.put('/admin/users/:id', adminAuth, updateUser)
userRouter.delete('/admin/users/:id', adminAuth, deleteUser)

export default userRouter