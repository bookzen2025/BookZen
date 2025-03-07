import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, default: "" }, // Đường dẫn tới hình ảnh danh mục
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now }
});

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema);

export default categoryModel; 