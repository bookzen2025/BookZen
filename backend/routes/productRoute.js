import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, addProductReview } from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Make sure upload middleware is correctly applied
productRouter.post('/create', adminAuth, upload.single('image'), createProduct);
productRouter.post('/delete', adminAuth, deleteProduct);
productRouter.post('/single', getProductById);
productRouter.get('/list', getAllProducts);
productRouter.post('/review', addProductReview);

export default productRouter;