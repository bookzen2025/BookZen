// userController.js - ENTIRE UPDATED FILE
import validator from "validator"
import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailUtils.js";

// Function for creating tokens
const createAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' }) // 15 minutes
}

const createRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }) // 7 days
}

// Password strength validation
const isStrongPassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const requirements = [];
    if (!minLength) requirements.push("be at least 8 characters long");
    if (!hasUppercase) requirements.push("contain at least one uppercase letter");
    if (!hasLowercase) requirements.push("contain at least one lowercase letter");
    if (!hasNumber) requirements.push("contain at least one number");
    if (!hasSpecial) requirements.push("contain at least one special character");
    
    return {
        isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
        requirements
    };
}

// Controller function to handle user login
const handleUserLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            // Create access token
            const accessToken = createAccessToken(user._id)
            
            // Create refresh token
            const refreshToken = createRefreshToken(user._id)
            
            // Calculate refresh token expiration
            const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            
            // Store refresh token in database
            await userModel.findByIdAndUpdate(user._id, {
                refreshToken,
                refreshTokenExpires
            })
            
            // Return both tokens
            res.json({ 
                success: true, 
                token: accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to handle user register
const handleUserRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body
        // Check if user already exist or not
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        //Checking email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter valid email address" })
        }
        
        // Check password strength
        const passwordCheck = isStrongPassword(password);
        if (!passwordCheck.isValid) {
            return res.json({ 
                success: false, 
                message: `Password must ${passwordCheck.requirements.join(", ")}`,
                code: "WEAK_PASSWORD",
                requirements: passwordCheck.requirements
            });
        }
        
        // Hashing user password with bcrypt package
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Creating a new user using hashed password
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        
        // Create access token
        const accessToken = createAccessToken(user._id)
        
        // Create refresh token
        const refreshToken = createRefreshToken(user._id)
        
        // Calculate refresh token expiration
        const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        
        // Store refresh token in database
        await userModel.findByIdAndUpdate(user._id, {
            refreshToken,
            refreshTokenExpires
        })
        
        // Return both tokens
        res.json({ 
            success: true, 
            token: accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to handle token refresh
const handleTokenRefresh = async (req, res) => {
    try {
        const { refreshToken } = req.body
        
        if (!refreshToken) {
            return res.json({ success: false, message: "Refresh token is required" })
        }
        
        // Verify the refresh token
        let userId
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
            userId = decoded.id
        } catch (error) {
            return res.json({ success: false, message: "Invalid refresh token" })
        }
        
        // Find the user with the matching refresh token
        const user = await userModel.findOne({ 
            _id: userId,
            refreshToken,
            refreshTokenExpires: { $gt: new Date() }
        })
        
        if (!user) {
            return res.json({ success: false, message: "Invalid refresh token or token expired" })
        }
        
        // Generate new access token
        const accessToken = createAccessToken(user._id)
        
        // Return the new access token
        res.json({ 
            success: true, 
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to handle logout
const handleLogout = async (req, res) => {
    try {
        const { userId } = req.body
        
        // Clear refresh token in database
        await userModel.findByIdAndUpdate(userId, {
            refreshToken: null,
            refreshTokenExpires: null
        })
        
        res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to handle admin login
const handleAdminLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS){
            const token = jwt.sign(email + password, process.env.JWT_SECRET, { expiresIn: '1d' })
            res.json({success:true, token})
        }else{
            res.json({success:false, message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to handle forgot password request
const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Không tìm thấy tài khoản với email này" });
        }
        
        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash the token before storing it
        const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set token and expiration (1 hour)
        user.resetPasswordToken = hash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
        
        await user.save();
        
        // Send reset email with the unhashed token
        try {
            await sendPasswordResetEmail(
                user.email,
                resetToken, // Send the unhashed token
                process.env.FRONTEND_URL
            );
            res.json({ success: true, message: "Email khôi phục mật khẩu đã được gửi" });
        } catch (emailError) {
            console.log("Email sending error:", emailError);
            res.json({ success: false, message: "Lỗi khi gửi email" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Controller function to handle password reset
const handleResetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Hash the token to compare with the stored hash
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with valid token and unexpired timestamp
        const user = await userModel.findOne({
            resetPasswordToken: hash,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.json({ success: false, message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
        }
        
        // Check password strength
        const passwordCheck = isStrongPassword(password);
        if (!passwordCheck.isValid) {
            return res.json({ 
                success: false, 
                message: `Mật khẩu phải ${passwordCheck.requirements.join(", ")}`,
                code: "WEAK_PASSWORD",
                requirements: passwordCheck.requirements
            });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        // Return success
        res.json({ success: true, message: "Mật khẩu đã được đặt lại thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    handleUserLogin, 
    handleUserRegister, 
    handleAdminLogin,
    handleForgotPassword,
    handleResetPassword,
    handleTokenRefresh,
    handleLogout
}