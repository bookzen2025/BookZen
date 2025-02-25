import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

// Global variables for payment
const currency = 'usd'
const deliveryCharges = 120000

// Place order using Cash on Delivery
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
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
        const { userId, items, amount, address } = req.body

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Bank Transfer",
            payment: false,
            date: Date.now()
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
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { placeOrder, placeBankTransfer, allOrders, userOrders, markBankTransferComplete, UpdateStatus }