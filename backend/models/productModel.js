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
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'category', required:true},
    image: {type:String, required:true},
    images: {type:[String], default: []},
    price: {type:Number, required:true},
    oldPrice: {type:Number},
    author: {type:String},
    publisher: {type:String},
    publishedYear: {type:Number},
    pages: {type:Number},
    date: {type:Number, required:true},
    popular: {type:Boolean},
    newArrivals: {type:Boolean},
    stock: {type:Number, default: 0},
    sku: {type:String},
    reviews: [reviewSchema]
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;