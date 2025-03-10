import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

// Global variables for payment
const currency = 'usd'
const deliveryCharges = 120000

// Place order using Cash on Delivery
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, promoCode } = req.body

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            promoCode
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

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
        const { userId, items, amount, address, promoCode } = req.body

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Bank Transfer",
            payment: false,
            date: Date.now(),
            promoCode
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

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
        
        // Tìm đơn hàng để kiểm tra phương thức thanh toán
        const order = await orderModel.findById(orderId)
        
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
            // Chấp nhận cả "Delivered" và "Đã giao hàng"
            const isDelivered = order.status === "Delivered" || order.status === "Đã giao hàng";
            
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

export { placeOrder, placeBankTransfer, allOrders, userOrders, markBankTransferComplete, UpdateStatus, checkUserPurchased }