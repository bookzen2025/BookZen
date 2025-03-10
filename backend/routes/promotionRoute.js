// Routes cho Khuyến mãi
// Tạo mới: 2024
// Mô tả: Định nghĩa các API endpoints để quản lý khuyến mãi

import express from "express";
import { 
    getAllPromotions, 
    createPromotion, 
    updatePromotion, 
    deletePromotion, 
    getPromotionById,
    validatePromoCode,
    applyPromotion
} from "../controllers/promotionController.js";
import adminAuth from "../middleware/adminAuth.js";

const promotionRouter = express.Router();

// Routes cho Admin
promotionRouter.get('/list', getAllPromotions);
promotionRouter.post('/create', adminAuth, createPromotion);
promotionRouter.put('/update/:id', adminAuth, updatePromotion);
promotionRouter.delete('/delete/:id', adminAuth, deletePromotion);
promotionRouter.get('/detail/:id', getPromotionById);

// Routes cho Client
promotionRouter.post('/validate', validatePromoCode);
promotionRouter.post('/apply', applyPromotion);

export default promotionRouter; 