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
            newArrivals = false,
            author = "",
            publisher = "",
            publishedYear = "",
            pages = "",
            stock = 0
        } = req.body;

        console.log("Extracted fields:", {
            name, description, category, price, popular, newArrivals,
            author, publisher, publishedYear, pages, stock
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
            newArrivals: newArrivals === "true" || newArrivals === true,
            author: String(author || ""),
            publisher: String(publisher || ""),
            publishedYear: publishedYear ? Number(publishedYear) : null,
            pages: pages ? Number(pages) : null,
            stock: Number(stock) || 0,
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
        
        // Kiểm tra xem sản phẩm có trong đơn hàng đã hoàn thành nào không
        let hasPurchasedAndCompleted = false;
        
        for (const order of orders) {
            // Kiểm tra trong mảng items của đơn hàng - kiểm tra cả id và _id
            const foundItem = order.items.find(item => 
                (item._id === productId) || 
                (item.id === productId) || 
                (String(item._id) === String(productId)) ||
                (String(item.id) === String(productId))
            );
            
            // Đơn hàng phải đã thanh toán và đã giao hàng (Chấp nhận cả "Delivered" và "Đã giao hàng")
            const isDelivered = order.status === "Delivered" || order.status === "Đã giao hàng";
            
            if (foundItem && order.payment === true && isDelivered) {
                hasPurchasedAndCompleted = true;
                break;
            }
        }
        
        if (!hasPurchasedAndCompleted) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn cần mua và nhận sản phẩm này trước khi đánh giá" 
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

// Thêm hàm cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({ success: false, message: "ID sản phẩm không được cung cấp" });
        }

        // Destructure với các giá trị mặc định để tránh lỗi undefined
        const { 
            name = "", 
            description = "", 
            category = "", 
            price = 0, 
            popular = false,
            newArrivals = false,
            author = "",
            publisher = "",
            publishedYear = "",
            pages = "",
            stock = 0
        } = req.body;

        let updateData = {
            name: String(name),
            description: String(description),
            category: String(category),
            price: Number(price) || 0,
            popular: popular === "true" || popular === true,
            newArrivals: newArrivals === "true" || newArrivals === true,
            author: String(author || ""),
            publisher: String(publisher || ""),
            publishedYear: publishedYear ? Number(publishedYear) : null,
            pages: pages ? Number(pages) : null,
            stock: Number(stock) || 0
        };

        // Chỉ cập nhật hình ảnh nếu có file mới được tải lên
        if (req.file) {
            try {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                updateData.image = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Lỗi khi tải lên hình ảnh:", uploadError);
                // Tiếp tục với dữ liệu khác nếu tải lên thất bại
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        res.json({ 
            success: true, 
            message: "Sản phẩm đã được cập nhật thành công",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi cập nhật sản phẩm" 
        });
    }
};

// Thêm API để cập nhật tồn kho
const updateStock = async (req, res) => {
    try {
        const { id, stock } = req.body;
        
        if (!id) {
            return res.status(400).json({ success: false, message: "ID sản phẩm không được cung cấp" });
        }

        if (stock === undefined || stock === null) {
            return res.status(400).json({ success: false, message: "Số lượng tồn kho không được cung cấp" });
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { stock: Number(stock) },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        res.json({ 
            success: true, 
            message: "Số lượng tồn kho đã được cập nhật thành công",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật tồn kho:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi cập nhật tồn kho" 
        });
    }
};

// Lấy thông tin tồn kho của tất cả sản phẩm
const getInventory = async (req, res) => {
    try {
        const products = await productModel.find({}, 'name image category stock price');
        res.json({ 
            success: true, 
            inventory: products 
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tồn kho:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi lấy thông tin tồn kho" 
        });
    }
};

export { createProduct, deleteProduct, getAllProducts, getProductById, addProductReview, updateProduct, updateStock, getInventory };