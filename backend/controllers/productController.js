import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

// Controller function to create product
const createProduct = async (req, res) => {
    try {
        console.log("Request body received:", req.body);
        
        // Destructure với các giá trị mặc định để tránh lỗi undefined
        const { 
            name = "", 
            description = "", 
            category = "", 
            price = 0, 
            popular = false,
            author = "",
            publisher = "",
            publishedYear = "",
            pages = ""
        } = req.body;

        console.log("Extracted fields:", {
            name, description, category, price, popular,
            author, publisher, publishedYear, pages
        });

        let imageUrl = "https://via.placeholder.com/150"; // Default image URL

        // Only upload the image if one is provided
        if (req.file) {
            try {
                console.log("Attempting to upload file:", req.file.path);
                const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                imageUrl = uploadResult.secure_url;
                console.log("Image uploaded successfully:", imageUrl);
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                // Continue with default image if upload fails
            }
        } else {
            console.log("No file provided for upload");
        }

        // Create product data with safe type conversions
        const productData = {
            name: String(name),
            description: String(description),
            category: String(category),
            price: Number(price) || 0,
            popular: popular === "true" || popular === true,
            author: String(author || ""),
            publisher: String(publisher || ""),
            publishedYear: publishedYear ? Number(publishedYear) : null,
            pages: pages ? Number(pages) : null,
            image: imageUrl,
            date: Date.now()
        };

        console.log("Product data to save:", productData);

        const product = new productModel(productData);
        await product.save();

        console.log("Product saved successfully");
        res.json({ success: true, message: "Product Created" });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: error.message || "An error occurred while creating the product" });
    }
};

// Các hàm khác giữ nguyên
const deleteProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Deleted" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};

const getProductById = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};

// Thêm đánh giá cho sản phẩm
const addProductReview = async (req, res) => {
    try {
        const { productId, review, userId } = req.body;
        
        if (!productId || !review || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin sản phẩm, đánh giá hoặc người dùng" 
            });
        }
        
        // Kiểm tra xem sản phẩm có tồn tại không
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy sản phẩm" 
            });
        }
        
        // Kiểm tra xem người dùng đã mua sản phẩm này chưa
        const orders = await orderModel.find({ userId });
        
        if (!orders || orders.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn cần mua sản phẩm này trước khi đánh giá" 
            });
        }
        
        // Kiểm tra xem sản phẩm có trong đơn hàng nào không
        let hasPurchased = false;
        
        for (const order of orders) {
            // Kiểm tra trong mảng items của đơn hàng
            const foundItem = order.items.find(item => item.id === productId);
            
            if (foundItem) {
                hasPurchased = true;
                break;
            }
        }
        
        if (!hasPurchased) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn cần mua sản phẩm này trước khi đánh giá" 
            });
        }
        
        // Thêm đánh giá mới vào mảng reviews
        const newReview = {
            name: review.name,
            rating: review.rating,
            comment: review.comment,
            date: new Date()
        };
        
        product.reviews.push(newReview);
        
        // Lưu sản phẩm với đánh giá mới
        await product.save();
        
        res.json({ 
            success: true, 
            message: "Đánh giá đã được thêm thành công", 
            reviews: product.reviews 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi thêm đánh giá" 
        });
    }
};

export { createProduct, deleteProduct, getAllProducts, getProductById, addProductReview };