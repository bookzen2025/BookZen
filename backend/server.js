import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./config/db.js"
import connectCloudinary from "./config/cloudinary.js"
import passport from "./config/passport.js"
import userRouter from "./routes/userRoute.js"
import productRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import analyticsRouter from "./routes/analyticsRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import promotionRouter from "./routes/promotionRoute.js"

// App configuration
const app = express()
const port = process.env.PORT || 4000


// middlewares
app.use(express.json())
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5174'],
    credentials: true
}))
app.use(passport.initialize())
connectDB()
connectCloudinary()

// Cấu hình phục vụ tệp tĩnh
app.use('/uploads', express.static('uploads'))

// API endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/category', categoryRouter)
app.use('/api/promotion', promotionRouter)


app.get('/', (req, res) => {
    res.send('API successfully connected!')
})

app.listen(port, () => {
    console.log('Server is running on PORT: ' + port)
})