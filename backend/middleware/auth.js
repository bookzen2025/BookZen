// auth.js - ENTIRE UPDATED FILE
import jwt from "jsonwebtoken"

const authUser = async (req, res, next) => {
    const { token } = req.headers
    if (!token) {
        return res.json({ success: false, message: "Not Authorized please login again", code: "AUTH_REQUIRED" })
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        // Check if error is due to token expiration
        if (error.name === "TokenExpiredError") {
            return res.json({ 
                success: false, 
                message: "Token has expired, please refresh token", 
                code: "TOKEN_EXPIRED" 
            })
        }
        res.json({ success: false, message: error.message, code: "AUTH_ERROR" })
    }
}

export default authUser