import express from "express";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const categoryRouter = express.Router();

// Route danh mục
categoryRouter.get('/list', getAllCategories);
categoryRouter.post('/create', adminAuth, upload.single('image'), createCategory);
categoryRouter.post('/update', adminAuth, upload.single('image'), updateCategory);
categoryRouter.post('/delete', adminAuth, deleteCategory);

export default categoryRouter; 