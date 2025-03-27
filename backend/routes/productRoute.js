import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, addProductReview, updateProduct, updateStock, getInventory } from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Make sure upload middleware is correctly applied
productRouter.post('/create', adminAuth, upload.single('image'), createProduct);
productRouter.post('/update', adminAuth, upload.single('image'), updateProduct);
productRouter.post('/delete', adminAuth, deleteProduct);
productRouter.post('/single', getProductById);
productRouter.get('/list', getAllProducts);
productRouter.post('/review', addProductReview);

// Thêm API cho quản lý tồn kho
productRouter.post('/update-stock', adminAuth, updateStock);
productRouter.get('/inventory', adminAuth, getInventory);

export default productRouter;