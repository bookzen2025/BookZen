import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        // Chấp nhận cả hai định dạng: Authorization hoặc token
        const token = req.headers.authorization || req.headers.token;
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized please login again" })
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Kiểm tra xem token có phải của admin hay không
            if (!decoded || decoded.id !== 'admin' || decoded.role !== 'admin') {
                return res.status(401).json({ success: false, message: "Not Authorized please login again" })
            }
            
            // Kiểm tra thêm checksum nếu cần
            const expectedChecksum = process.env.ADMIN_EMAIL + process.env.ADMIN_PASS;
            if (decoded.checksum !== expectedChecksum) {
                return res.status(401).json({ success: false, message: "Not Authorized please login again" })
            }
            
            next();
        } catch (jwtError) {
            console.error('JWT Verification failed:', jwtError);
            return res.status(401).json({ success: false, message: "Token invalid or expired, please login again" })
        }
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

export default adminAuth