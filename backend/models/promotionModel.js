// Mô hình dữ liệu cho Khuyến mãi
// Tạo mới: 2024
// Mô tả: Quản lý thông tin các chương trình khuyến mãi trong hệ thống

import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    discountType: { 
        type: String, 
        required: true, 
        enum: ['percentage', 'fixed'], 
        default: 'percentage' 
    },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },  // Áp dụng với discountType là percentage
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }], // Các sản phẩm được áp dụng, nếu trống thì áp dụng cho tất cả
    usageLimit: { type: Number }, // Giới hạn số lần sử dụng, nếu null thì không giới hạn
    usageCount: { type: Number, default: 0 }, // Số lần đã sử dụng
    createdAt: { type: Date, default: Date.now }
});

const promotionModel = mongoose.models.promotion || mongoose.model('promotion', promotionSchema);

export default promotionModel; 