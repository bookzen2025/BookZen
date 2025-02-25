import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId:{type:String, required:true},
    items:{type:Array, required:true},
    amount:{type:Number, required:true},
    address:{type:Object, required:true},
    status:{type:String, required:true, default:'Order placed'},
    paymentMethod:{type:String, required:true},
    payment:{type:Boolean, required:true, default: false},
    transactionId:{type:String}, // New field for bank transfer reference
    date:{type:Number, required:true},
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)

export default orderModel