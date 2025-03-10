// Controller cho Khuyến mãi
// Tạo mới: 2024
// Mô tả: Xử lý các tác vụ CRUD và logic nghiệp vụ liên quan đến quản lý khuyến mãi

import promotionModel from "../models/promotionModel.js";
import productModel from "../models/productModel.js";

// Lấy danh sách tất cả khuyến mãi
export const getAllPromotions = async (req, res) => {
    try {
        const promotions = await promotionModel
            .find()
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: promotions.length,
            promotions
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách khuyến mãi"
        });
    }
};

// Tạo khuyến mãi mới
export const createPromotion = async (req, res) => {
    try {
        const { name, code, description, discountType, discountValue, minOrderValue, 
                maxDiscountAmount, startDate, endDate, applicableProducts, usageLimit } = req.body;
        
        // Kiểm tra mã khuyến mãi đã tồn tại chưa
        const existingPromotion = await promotionModel.findOne({ code });
        if (existingPromotion) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi đã tồn tại"
            });
        }
        
        // Validate dữ liệu đầu vào
        if (!name || !code || !description || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin khuyến mãi"
            });
        }

        // Kiểm tra ngày hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "Ngày kết thúc phải sau ngày bắt đầu"
            });
        }
        
        // Tạo khuyến mãi mới
        const newPromotion = new promotionModel({
            name,
            code,
            description,
            discountType,
            discountValue,
            minOrderValue: minOrderValue || 0,
            maxDiscountAmount,
            startDate,
            endDate,
            applicableProducts,
            usageLimit,
            isActive: true
        });
        
        await newPromotion.save();
        
        return res.status(201).json({
            success: true,
            message: "Tạo khuyến mãi thành công",
            promotion: newPromotion
        });
        
    } catch (error) {
        console.error("Lỗi khi tạo khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo khuyến mãi"
        });
    }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, discountType, discountValue, minOrderValue, 
                maxDiscountAmount, startDate, endDate, isActive, applicableProducts, usageLimit } = req.body;
        
        // Kiểm tra khuyến mãi tồn tại
        const existingPromotion = await promotionModel.findById(id);
        if (!existingPromotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khuyến mãi"
            });
        }
        
        // Kiểm tra nếu code được thay đổi, đảm bảo không trùng với mã khác
        if (code !== existingPromotion.code) {
            const codeExists = await promotionModel.findOne({ code, _id: { $ne: id } });
            if (codeExists) {
                return res.status(400).json({
                    success: false,
                    message: "Mã khuyến mãi đã tồn tại"
                });
            }
        }
        
        // Kiểm tra ngày hợp lệ
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày kết thúc phải sau ngày bắt đầu"
                });
            }
        }
        
        // Cập nhật thông tin
        const updatedPromotion = await promotionModel.findByIdAndUpdate(
            id,
            {
                name: name || existingPromotion.name,
                code: code || existingPromotion.code,
                description: description || existingPromotion.description,
                discountType: discountType || existingPromotion.discountType,
                discountValue: discountValue || existingPromotion.discountValue,
                minOrderValue: minOrderValue !== undefined ? minOrderValue : existingPromotion.minOrderValue,
                maxDiscountAmount: maxDiscountAmount !== undefined ? maxDiscountAmount : existingPromotion.maxDiscountAmount,
                startDate: startDate || existingPromotion.startDate,
                endDate: endDate || existingPromotion.endDate,
                isActive: isActive !== undefined ? isActive : existingPromotion.isActive,
                applicableProducts: applicableProducts || existingPromotion.applicableProducts,
                usageLimit: usageLimit !== undefined ? usageLimit : existingPromotion.usageLimit
            },
            { new: true }
        );
        
        return res.status(200).json({
            success: true,
            message: "Cập nhật khuyến mãi thành công",
            promotion: updatedPromotion
        });
        
    } catch (error) {
        console.error("Lỗi khi cập nhật khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật khuyến mãi"
        });
    }
};

// Xóa khuyến mãi
export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra khuyến mãi tồn tại
        const existingPromotion = await promotionModel.findById(id);
        if (!existingPromotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khuyến mãi"
            });
        }
        
        // Xóa khuyến mãi
        await promotionModel.findByIdAndDelete(id);
        
        return res.status(200).json({
            success: true,
            message: "Xóa khuyến mãi thành công"
        });
        
    } catch (error) {
        console.error("Lỗi khi xóa khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa khuyến mãi"
        });
    }
};

// Lấy chi tiết khuyến mãi theo ID
export const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const promotion = await promotionModel.findById(id)
            .populate('applicableProducts', 'name image price');
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khuyến mãi"
            });
        }
        
        return res.status(200).json({
            success: true,
            promotion
        });
        
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết khuyến mãi"
        });
    }
};

// Kiểm tra mã khuyến mãi hợp lệ
export const validatePromoCode = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp mã khuyến mãi"
            });
        }
        
        // Tìm khuyến mãi theo mã
        const promotion = await promotionModel.findOne({ code, isActive: true });
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại hoặc đã hết hạn"
            });
        }
        
        // Kiểm tra thời gian hiệu lực
        const currentDate = new Date();
        if (currentDate < promotion.startDate || currentDate > promotion.endDate) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi không trong thời gian hiệu lực"
            });
        }
        
        // Kiểm tra giới hạn sử dụng
        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi đã hết lượt sử dụng"
            });
        }
        
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderValue && orderValue < promotion.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Giá trị đơn hàng phải từ ${promotion.minOrderValue} để áp dụng mã này`
            });
        }
        
        // Tính toán giá trị giảm giá
        let discountAmount = 0;
        
        if (promotion.discountType === 'percentage') {
            discountAmount = (orderValue * promotion.discountValue) / 100;
            
            // Áp dụng giới hạn giảm giá tối đa nếu có
            if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
                discountAmount = promotion.maxDiscountAmount;
            }
        } else {
            // discountType === 'fixed'
            discountAmount = promotion.discountValue;
        }
        
        return res.status(200).json({
            success: true,
            message: "Mã khuyến mãi hợp lệ",
            promotion,
            discountAmount
        });
        
    } catch (error) {
        console.error("Lỗi khi kiểm tra mã khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi kiểm tra mã khuyến mãi"
        });
    }
};

// Áp dụng mã khuyến mãi (tăng số lượt sử dụng)
export const applyPromotion = async (req, res) => {
    try {
        const { code } = req.body;
        
        // Tìm khuyến mãi theo mã
        const promotion = await promotionModel.findOne({ code, isActive: true });
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại hoặc đã hết hạn"
            });
        }
        
        // Tăng số lượt sử dụng
        promotion.usageCount += 1;
        await promotion.save();
        
        return res.status(200).json({
            success: true,
            message: "Áp dụng mã khuyến mãi thành công",
            promotion
        });
        
    } catch (error) {
        console.error("Lỗi khi áp dụng mã khuyến mãi:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi áp dụng mã khuyến mãi"
        });
    }
}; 