import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"

// Global variables for payment
const currency = 'usd'

// Hàm tính phí vận chuyển dựa trên tỉnh/thành phố
const calculateDeliveryCharges = (province) => {
    // Nếu là Hà Nội thì phí vận chuyển là 30.000 (nội thành)
    if (province === 'Hà Nội') {
        return 30000
    }
    // Nếu không phải Hà Nội hoặc không có thông tin tỉnh/thành phố thì phí vận chuyển là 50.000 (ngoại thành)
    return 50000
}

// Hàm để cập nhật tồn kho khi đặt hàng
const updateStockForOrder = async (items, increase = false) => {
    try {
        for (const item of items) {
            const productId = item._id || item.id;
            const quantity = item.quantity || 1;
            
            // Tìm sản phẩm
            const product = await productModel.findById(productId);
            if (!product) continue;
            
            // Cập nhật tồn kho: giảm nếu đặt hàng, tăng nếu hủy đơn hàng
            const newStock = increase 
                ? (product.stock || 0) + quantity 
                : Math.max(0, (product.stock || 0) - quantity);
            
            await productModel.findByIdAndUpdate(productId, { stock: newStock });
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật tồn kho:", error);
        // Không ném lỗi, chỉ ghi nhật ký
    }
};

// Place order using Cash on Delivery
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, promoCode, shippingFee } = req.body

        // Kiểm tra tồn kho trước khi đặt hàng
        let insufficientStock = [];
        for (const item of items) {
            const productId = item._id || item.id;
            const quantity = item.quantity || 1;
            
            const product = await productModel.findById(productId);
            if (!product) continue;
            
            // Nếu sản phẩm không đủ tồn kho
            if ((product.stock || 0) < quantity) {
                insufficientStock.push({
                    name: product.name,
                    available: product.stock || 0,
                    requested: quantity
                });
            }
        }
        
        // Nếu có sản phẩm không đủ tồn kho
        if (insufficientStock.length > 0) {
            return res.json({ 
                success: false, 
                message: "Một số sản phẩm không đủ tồn kho", 
                insufficientStock 
            });
        }

        // Tính phí vận chuyển nếu không được cung cấp
        const deliveryCharges = shippingFee || calculateDeliveryCharges(address.province)

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            promoCode,
            shippingFee: deliveryCharges
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Cập nhật tồn kho - giảm số lượng
        await updateStockForOrder(items);

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order placed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Place order using Bank Transfer
const placeBankTransfer = async (req, res) => {
    try {
        const { userId, items, amount, address, promoCode, shippingFee } = req.body

        // Kiểm tra tồn kho trước khi đặt hàng
        let insufficientStock = [];
        for (const item of items) {
            const productId = item._id || item.id;
            const quantity = item.quantity || 1;
            
            const product = await productModel.findById(productId);
            if (!product) continue;
            
            // Nếu sản phẩm không đủ tồn kho
            if ((product.stock || 0) < quantity) {
                insufficientStock.push({
                    name: product.name,
                    available: product.stock || 0,
                    requested: quantity
                });
            }
        }
        
        // Nếu có sản phẩm không đủ tồn kho
        if (insufficientStock.length > 0) {
            return res.json({ 
                success: false, 
                message: "Một số sản phẩm không đủ tồn kho", 
                insufficientStock 
            });
        }

        // Tính phí vận chuyển nếu không được cung cấp
        const deliveryCharges = shippingFee || calculateDeliveryCharges(address.province)

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Bank Transfer",
            payment: false,
            date: Date.now(),
            promoCode,
            shippingFee: deliveryCharges
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Cập nhật tồn kho - giảm số lượng
        await updateStockForOrder(items);

        // Return the order data without clearing cart (cart will be cleared after payment confirmation)
        res.json({ 
            success: true, 
            message: "Đặt hàng thành công. Vui lòng hoàn tất thanh toán chuyển khoản.",
            orderId: newOrder._id
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Mark bank transfer as completed
const markBankTransferComplete = async (req, res) => {
    const { orderId, userId } = req.body
    try {
        await orderModel.findByIdAndUpdate(orderId, { 
            payment: true,
            status: 'Order placed' // Thay đổi từ 'Đang xử lý' thành 'Order placed'
        })
        
        // Clear cart after payment confirmation
        await userModel.findByIdAndUpdate(userId, { cartData: {} })
        
        res.json({ success: true, message: "Cảm ơn bạn đã xác nhận thanh toán. Đơn hàng của bạn đang được xử lý." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// All orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// All orders data for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Updating order status for Admin Panel
const UpdateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        
        // Tìm đơn hàng để kiểm tra phương thức thanh toán và trạng thái hiện tại
        const order = await orderModel.findById(orderId)
        const oldStatus = order.status;
        
        // Nếu đơn hàng bị hủy, trả lại tồn kho
        if (status === "Cancelled" && oldStatus !== "Cancelled") {
            await updateStockForOrder(order.items, true); // tăng lại tồn kho
        }
        
        // Nếu đơn hàng trước đó đã hủy, nhưng giờ được kích hoạt lại
        if (oldStatus === "Cancelled" && status !== "Cancelled") {
            await updateStockForOrder(order.items); // giảm lại tồn kho
        }
        
        if (status === "Delivered" && order.paymentMethod === "COD") {
            // Nếu là đơn hàng COD và trạng thái mới là "Delivered", tự động cập nhật payment thành true
            await orderModel.findByIdAndUpdate(orderId, { status, payment: true })
        } else {
            // Nếu không, chỉ cập nhật trạng thái
            await orderModel.findByIdAndUpdate(orderId, { status })
        }
        
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Kiểm tra xem người dùng đã mua sách chưa
const checkUserPurchased = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin người dùng hoặc sản phẩm" 
            });
        }
        
        // Tìm tất cả đơn hàng của người dùng
        const orders = await orderModel.find({ userId });
        
        if (!orders || orders.length === 0) {
            return res.json({ 
                success: true, 
                hasPurchased: false,
                message: "Người dùng chưa có đơn hàng nào" 
            });
        }
        
        // Kiểm tra xem sản phẩm có trong đơn hàng hoàn thành nào không
        // Đơn hàng hoàn thành là đơn hàng đã thanh toán và có trạng thái "Delivered"
        let hasPurchased = false;
        
        for (const order of orders) {
            // Tìm sản phẩm trong đơn hàng - kiểm tra cả id và _id
            const foundItem = order.items.find(item => 
                (item._id === productId) || 
                (item.id === productId) || 
                (String(item._id) === String(productId)) ||
                (String(item.id) === String(productId))
            );
            
            // Kiểm tra xem đơn hàng đã thanh toán và đã giao hàng chưa
            // Chấp nhận cả "Delivered" và "Đã giao hàng" và các trạng thái tương ứng
            const isDelivered = 
                order.status === "Delivered" || 
                order.status === "Đã giao hàng";
            
            if (foundItem && order.payment === true && isDelivered) {
                hasPurchased = true;
                break;
            }
        }
        
        res.json({ 
            success: true, 
            hasPurchased,
            message: hasPurchased ? "Người dùng đã mua và nhận sản phẩm này" : "Người dùng chưa mua hoặc chưa nhận sản phẩm này"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Đã xảy ra lỗi khi kiểm tra lịch sử mua hàng" 
        });
    }
};

// Hủy đơn hàng từ phía người dùng
const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        
        // Tìm đơn hàng
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }
        
        // Đảm bảo người dùng chỉ hủy được đơn hàng của chính họ
        if (String(order.userId) !== String(userId)) {
            return res.json({
                success: false,
                message: "Bạn không có quyền hủy đơn hàng này"
            });
        }
        
        // Chỉ cho phép hủy đơn hàng chưa giao
        const nonCancelableStatuses = ["Delivered", "Đã giao hàng"];
        if (nonCancelableStatuses.includes(order.status)) {
            return res.json({
                success: false,
                message: "Không thể hủy đơn hàng đã giao"
            });
        }
        
        // Nếu đơn hàng chưa bị hủy trước đó, cập nhật tồn kho
        if (order.status !== "Cancelled") {
            await updateStockForOrder(order.items, true); // Tăng lại tồn kho
        }
        
        // Cập nhật trạng thái đơn hàng
        await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });
        
        res.json({
            success: true,
            message: "Đơn hàng đã được hủy thành công"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi hủy đơn hàng"
        });
    }
};

export { placeOrder, placeBankTransfer, allOrders, userOrders, markBankTransferComplete, UpdateStatus, checkUserPurchased, cancelOrder }