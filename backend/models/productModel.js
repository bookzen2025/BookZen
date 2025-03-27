import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: {type:String, required:true},
    description: {type:String, required:true},
    category: {type:String, required:true},
    image: {type:String, required:true},
    price: {type:Number, required:true},
    author: {type:String},
    publisher: {type:String},
    publishedYear: {type:Number},
    pages: {type:Number},
    date: {type:Number, required:true},
    popular: {type:Boolean},
    newArrivals: {type:Boolean},
    stock: {type:Number, default: 0},
    reviews: [reviewSchema]
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;