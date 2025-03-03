// userModel.js - ENTIRE UPDATED FILE
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    cartData:{type:Object, default:{}},
    resetPasswordToken:{type:String},
    resetPasswordExpires:{type:Date},
    refreshToken:{type:String},
    refreshTokenExpires:{type:Date},
}, {minimize:false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel