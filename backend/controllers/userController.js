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

// Hàm xác thực token admin
const verifyAdminToken = async (req, res) => {
    try {
        // Chấp nhận cả hai định dạng token header
        const token = req.headers.authorization || req.headers.token;
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Không tìm thấy token" });
        }
        
        try {
            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Kiểm tra xem token có phải của admin hay không
            if (!decoded || decoded.id !== 'admin' || decoded.role !== 'admin') {
                return res.status(401).json({ success: false, message: "Token không hợp lệ" });
            }
            
            // Kiểm tra thêm checksum nếu cần
            const expectedChecksum = process.env.ADMIN_EMAIL + process.env.ADMIN_PASS;
            if (decoded.checksum !== expectedChecksum) {
                return res.status(401).json({ success: false, message: "Token không hợp lệ" });
            }
            
            // Token hợp lệ
            return res.json({ success: true, message: "Token hợp lệ" });
        } catch (error) {
            console.error("JWT verification error:", error);
            return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
        }
    } catch (error) {
        console.error("Lỗi xác thực token admin:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

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
            try {
                // Sử dụng object làm payload thay vì string
                const token = jwt.sign(
                    { 
                        id: "admin", 
                        email: email,
                        role: "admin",
                        checksum: email + password // Vẫn lưu checksum để kiểm tra
                    }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '1d' }
                );
                return res.json({success: true, token});
            } catch (jwtError) {
                console.error("Lỗi khi tạo JWT token:", jwtError);
                return res.status(500).json({
                    success: false, 
                    message: "Lỗi khi tạo token đăng nhập",
                    error: jwtError.message
                });
            }
        } else {
            return res.status(401).json({
                success: false, 
                message: "Email hoặc mật khẩu không chính xác"
            });
        }
    } catch (error) {
        console.error("Lỗi đăng nhập admin:", error);
        return res.status(500).json({
            success: false, 
            message: "Lỗi server khi đăng nhập admin",
            error: error.message
        });
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

// Controller function to handle adding item to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin người dùng hoặc sản phẩm" 
            });
        }
        
        // Tìm người dùng
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        // Kiểm tra xem sản phẩm đã có trong wishlist chưa
        if (user.wishlist && user.wishlist.includes(productId)) {
            return res.json({ 
                success: true, 
                message: "Sản phẩm đã có trong danh sách yêu thích",
                wishlist: user.wishlist
            });
        }
        
        // Thêm sản phẩm vào wishlist
        if (!user.wishlist) {
            user.wishlist = [];
        }
        
        user.wishlist.push(productId);
        await user.save();
        
        res.json({ 
            success: true, 
            message: "Đã thêm vào danh sách yêu thích", 
            wishlist: user.wishlist 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi thêm vào danh sách yêu thích" 
        });
    }
};

// Controller function to handle removing item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin người dùng hoặc sản phẩm" 
            });
        }
        
        // Tìm người dùng
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        // Kiểm tra xem sản phẩm có trong wishlist không
        if (!user.wishlist || !user.wishlist.includes(productId)) {
            return res.json({ 
                success: true, 
                message: "Sản phẩm không có trong danh sách yêu thích",
                wishlist: user.wishlist || []
            });
        }
        
        // Xóa sản phẩm khỏi wishlist
        user.wishlist = user.wishlist.filter(id => id !== productId);
        await user.save();
        
        res.json({ 
            success: true, 
            message: "Đã xóa khỏi danh sách yêu thích", 
            wishlist: user.wishlist 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi xóa khỏi danh sách yêu thích" 
        });
    }
};

// Controller function to get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin người dùng" 
            });
        }
        
        // Tìm người dùng
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        res.json({ 
            success: true, 
            wishlist: user.wishlist || [] 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách yêu thích" 
        });
    }
};

// Admin user management functions
const getAllUsers = async (req, res) => {
    try {
        // Lấy danh sách người dùng, loại bỏ trường password
        const users = await userModel.find({}).select('-password -refreshToken');
        res.json({ success: true, users });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi lấy danh sách người dùng" 
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm người dùng theo ID, loại bỏ trường password
        const user = await userModel.findById(id).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi lấy thông tin người dùng" 
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin cần thiết" 
            });
        }
        
        // Kiểm tra email hợp lệ
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Email không hợp lệ" 
            });
        }
        
        // Kiểm tra email đã tồn tại chưa (nếu thay đổi email)
        const existingUser = await userModel.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email đã được sử dụng" 
            });
        }
        
        // Cập nhật thông tin người dùng
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { name, email },
            { new: true }
        ).select('-password -refreshToken');
        
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Cập nhật thông tin người dùng thành công", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi cập nhật thông tin người dùng" 
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Xóa người dùng
        const deletedUser = await userModel.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Xóa người dùng thành công" 
        });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi khi xóa người dùng" 
        });
    }
};

// Hàm xử lý kết quả đăng nhập Google
export const handleGoogleCallback = (req, res) => {
  try {
    // Lấy thông tin người dùng từ req.user (được thiết lập bởi Passport)
    const { user, token, refreshToken } = req.user;

    // Chuyển hướng về frontend với token và refreshToken
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&refreshToken=${refreshToken}&userId=${user.id}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

// Hàm xử lý lấy thông tin người dùng sau khi đăng nhập Google
export const handleGoogleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Tìm người dùng trong cơ sở dữ liệu
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isGoogleUser: user.isGoogleUser
      }
    });
  } catch (error) {
    console.error('Get Google user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

export { 
    handleUserLogin, 
    handleUserRegister, 
    handleAdminLogin,
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
    verifyAdminToken
}