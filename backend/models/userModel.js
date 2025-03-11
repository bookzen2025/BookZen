// userModel.js - ENTIRE UPDATED FILE
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:false},
    googleId:{type:String, sparse:true, unique:true},
    profilePicture:{type:String},
    isGoogleUser:{type:Boolean, default:false},
    cartData:{type:Object, default:{}},
    wishlist:{type:Array, default:[]},
    resetPasswordToken:{type:String},
    resetPasswordExpires:{type:Date},
    refreshToken:{type:String},
    refreshTokenExpires:{type:Date},
}, {minimize:false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel