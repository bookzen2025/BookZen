import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Error getting categories:", error);
        res.status(500).json({ success: false, message: error.message || "Đã xảy ra lỗi khi lấy danh sách danh mục" });
    }
};

// Tạo danh mục mới
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Kiểm tra xem đã có danh mục với tên này chưa
        const categoryExists = await categoryModel.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Danh mục với tên này đã tồn tại" });
        }
        
        // Xử lý file ảnh nếu có
        let imageUrl = "";
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const categoryData = {
            name: String(name),
            description: String(description || ""),
            image: imageUrl,
            date: Date.now()
        };
        
        const category = new categoryModel(categoryData);
        await category.save();
        
        res.json({ success: true, message: "Đã tạo danh mục", category });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ success: false, message: error.message || "Đã xảy ra lỗi khi tạo danh mục" });
    }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        
        // Kiểm tra danh mục tồn tại
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
        }
        
        // Kiểm tra xem tên mới đã tồn tại chưa (nếu thay đổi tên)
        if (name !== category.name) {
            const categoryExists = await categoryModel.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ success: false, message: "Danh mục với tên này đã tồn tại" });
            }
        }
        
        // Xử lý file ảnh nếu có
        let imageUrl = category.image; // Giữ nguyên ảnh cũ nếu không có ảnh mới
        if (req.file) {
            // Xóa ảnh cũ nếu có
            if (category.image) {
                const oldImagePath = path.join(__dirname, "../", category.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        // Cập nhật thông tin
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        category.image = imageUrl;
        
        await category.save();
        
        res.json({ success: true, message: "Đã cập nhật danh mục", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: error.message || "Đã xảy ra lỗi khi cập nhật danh mục" });
    }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        
        // Kiểm tra danh mục tồn tại
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
        }
        
        // Xóa ảnh nếu có
        if (category.image) {
            const imagePath = path.join(__dirname, "../", category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await categoryModel.findByIdAndDelete(id);
        
        res.json({ success: true, message: "Đã xóa danh mục" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: error.message || "Đã xảy ra lỗi khi xóa danh mục" });
    }
}; 