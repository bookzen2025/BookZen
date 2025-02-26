import express from "express"
import { 
    handleAdminLogin, 
    handleUserLogin, 
    handleUserRegister,
    handleForgotPassword,
    handleResetPassword
} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post('/register', handleUserRegister)
userRouter.post('/login', handleUserLogin)
userRouter.post('/admin', handleAdminLogin)
userRouter.post('/forgot-password', handleForgotPassword)
userRouter.post('/reset-password', handleResetPassword)

export default userRouter