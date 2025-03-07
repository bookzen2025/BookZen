import express from "express"
import adminAuth from "../middleware/adminAuth.js"
import { allOrders, placeOrder, placeBankTransfer, UpdateStatus, userOrders, markBankTransferComplete, checkUserPurchased } from "../controllers/orderController.js"
import authUser from "../middleware/auth.js"

const orderRouter = express.Router()

// For Admin
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, UpdateStatus)

// For Payment 
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/bank-transfer', authUser, placeBankTransfer)

// Mark bank transfer as complete
orderRouter.post('/complete-bank-transfer', authUser, markBankTransferComplete)

// For User
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/check-purchased', authUser, checkUserPurchased)

export default orderRouter