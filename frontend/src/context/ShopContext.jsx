// src/context/ShopContext.jsx - ENTIRE UPDATED FILE
import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { toast } from "react-toastify"
import authService from '../services/authService'

export const ShopContext = createContext(null)

// Hàm tạo giỏ hàng mặc định trống
const getDefaultCart = () => {
    return {}
}

const ShopContextProvider = (props) => {

    const currency = '₫'
    const delivery_charges = 120000
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [categories, setCategories] = useState([])
    const [token, setToken] = useState("")
    const [refreshToken, setRefreshToken] = useState("")
    const [user, setUser] = useState(null)
    const [cartItems, setCartItems] = useState(getDefaultCart())
    const [wishlistItems, setWishlistItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState(null)
    const [activePromotion, setActivePromotion] = useState(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [promoCode, setPromoCode] = useState('')
    const [promoError, setPromoError] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [wishlistLoaded, setWishlistLoaded] = useState(false)

    // Hàm helper để lấy tên danh mục từ ID
    const getCategoryName = (categoryId) => {
        if (!categoryId) return "";
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : categoryId;
    };

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/category/list`)
            if (response.data.success) {
                setCategories(response.data.categories)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    // Initialize authentication state from storage
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedRefreshToken = localStorage.getItem('refreshToken')
        const storedUser = localStorage.getItem('user')
        
        if (storedToken) setToken(storedToken)
        if (storedRefreshToken) setRefreshToken(storedRefreshToken)
        if (storedUser) setUser(JSON.parse(storedUser))
        
        // Generate CSRF token if it doesn't exist
        if (!localStorage.getItem('csrfToken')) {
            authService.generateCsrfToken()
        }
    }, [])

    // Authentication Methods
    const registerUser = async (userData) => {
        setLoading(true)
        setAuthError(null)
        
        try {
            const response = await authService.register(userData)
            
            if (response.success) {
                // Không lưu token và thông tin người dùng khi đăng ký thành công
                // Chỉ trả về kết quả thành công và thông tin người dùng để hiển thị
                return { 
                    success: true,
                    user: response.user,
                    message: 'Đăng ký thành công! Vui lòng đăng nhập với tài khoản của bạn.'
                }
            } else {
                setAuthError(response.message)
                toast.error(response.message)
                return { success: false, message: response.message }
            }
        } catch (error) {
            const errorMsg = error.message || 'Registration failed'
            setAuthError(errorMsg)
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        } finally {
            setLoading(false)
        }
    }
    
    const loginUser = async (credentials) => {
        setLoading(true)
        setAuthError(null)
        
        try {
            const response = await authService.login(credentials)
            
            if (response.success) {
                setToken(response.token)
                setRefreshToken(response.refreshToken)
                setUser(response.user)
                
                localStorage.setItem('token', response.token)
                localStorage.setItem('refreshToken', response.refreshToken)
                localStorage.setItem('user', JSON.stringify(response.user))
                
                if (response.user) {
                    await getUserCart(response.token)
                }
                
                return { success: true }
            } else {
                setAuthError(response.message)
                toast.error(response.message)
                return { success: false, message: response.message }
            }
        } catch (error) {
            const errorMsg = error.message || 'Login failed'
            setAuthError(errorMsg)
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        } finally {
            setLoading(false)
        }
    }
    
    const logoutUser = async () => {
        setLoading(true)
        
        try {
            if (token) {
                await authService.logout(token)
            }
            
            setToken("")
            setRefreshToken("")
            setUser(null)
            setCartItems({})
            
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            
            navigate('/login')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }
    
    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) return false
            
            const response = await authService.refreshToken(refreshToken)
            
            if (response.success) {
                setToken(response.token)
                
                localStorage.setItem('token', response.token)
                
                return true
            } else {
                // If refresh token is invalid, logout user
                logoutUser()
                return false
            }
        } catch (error) {
            console.error('Token refresh error:', error)
            logoutUser()
            return false
        }
    }
    
    // Setup axios interceptor to handle token expiration
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                if (token) {
                    config.headers.token = token
                }
                return config
            },
            error => Promise.reject(error)
        )
        
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config
                
                // If error is due to token expiration and we haven't tried to refresh yet
                if (error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry && refreshToken) {
                    originalRequest._retry = true
                    
                    const refreshed = await refreshAccessToken()
                    
                    if (refreshed) {
                        // Update the token in the failed request and retry
                        originalRequest.headers.token = localStorage.getItem('token')
                        return axios(originalRequest)
                    }
                }
                
                return Promise.reject(error)
            }
        )
        
        // Cleanup interceptors on unmount
        return () => {
            axios.interceptors.request.eject(requestInterceptor)
            axios.interceptors.response.eject(responseInterceptor)
        }
    }, [token, refreshToken])

    // Adding items to cart
    const addToCart = async (itemId) => {
        const cartData = { ...cartItems } // Use shallow copy

        if (cartData[itemId]) {
            cartData[itemId] += 1
        } else {
            cartData[itemId] = 1
        }
        setCartItems(cartData)

        // Tìm thông tin sách để hiển thị tên trong thông báo
        const bookInfo = books.find((book) => book._id === itemId)
        const bookName = bookInfo ? bookInfo.name : 'Sách'

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId }, { 
                    headers: { 
                        token,
                        'x-csrf-token': localStorage.getItem('csrfToken'),
                        'csrf-token': localStorage.getItem('csrfToken')
                    } 
                })
                // Hiển thị thông báo thành công
                toast.success(`Đã thêm "${bookName}" vào giỏ hàng!`);

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        } else {
            // Hiển thị thông báo thành công ngay cả khi không đăng nhập
            toast.success(`Đã thêm "${bookName}" vào giỏ hàng!`);
        }
    }


    // Getting total cart items
    const getCartCount = () => {
        let totalCount = 0
        for (const item in cartItems) {
            try {
                if (cartItems[item] > 0) {
                    totalCount += cartItems[item]
                }
            } catch (error) {
                console.log(error)
            }
        }
        return totalCount;
    }


    // Getting total cart amount
    const getCartAmount = () => {
        let totalAmount = 0
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = books.find((book) => book._id === item)
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item]
                }
            }
        }
        return totalAmount
    }
    
    // Tính tổng tiền sau khi áp dụng khuyến mãi
    const getFinalAmount = () => {
        const cartTotal = getCartAmount();
        // Nếu không có khuyến mãi, trả về tổng ban đầu
        if (!activePromotion || discountAmount <= 0) {
            return cartTotal;
        }
        
        // Trả về tổng sau khi trừ giảm giá
        return Math.max(0, cartTotal - discountAmount);
    }
    
    // Hàm kiểm tra mã khuyến mãi
    const validatePromoCode = async (code) => {
        if (!code) {
            setPromoError('Vui lòng nhập mã khuyến mãi')
            return false
        }

        const cartTotal = getCartAmount()
        if (cartTotal === 0) {
            setPromoError('Giỏ hàng của bạn đang trống')
            return false
        }

        setPromoLoading(true)
        setPromoError(null)

        try {
            const response = await axios.post(backendUrl + '/api/promotion/validate', {
                code,
                cartTotal
            })

            if (response.data.success) {
                setActivePromotion(response.data.promotion)
                setDiscountAmount(response.data.discountAmount)
                setPromoError(null)
                return true
            } else {
                setPromoError(response.data.message || 'Mã khuyến mãi không hợp lệ')
                return false
            }
        } catch (error) {
            setPromoError('Có lỗi xảy ra khi kiểm tra mã khuyến mãi')
            return false
        } finally {
            setPromoLoading(false)
        }
    }
    
    // Hàm hủy áp dụng mã khuyến mãi
    const clearPromotion = () => {
        setActivePromotion(null)
        setDiscountAmount(0)
        setPromoCode('')
        setPromoError('')
    }
    
    // Áp dụng mã khuyến mãi khi thanh toán
    const applyPromotion = async () => {
        if (!activePromotion) return;
        
        try {
            await axios.post(backendUrl + '/api/promotion/apply', {
                code: activePromotion.code
            })
        } catch (error) {
            console.error('Lỗi khi áp dụng mã khuyến mãi:', error)
        }
    }

    // Updating the Quantity
    const updateQuantity = async (itemId, quantity) => {
        const cartData = { ...cartItems }
        cartData[itemId] = quantity
        setCartItems(cartData)

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', 
                    { itemId, quantity }, 
                    { 
                        headers: { 
                            token,
                            'x-csrf-token': localStorage.getItem('csrfToken'),
                            'csrf-token': localStorage.getItem('csrfToken')
                        } 
                    }
                )
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }


    // Getting all products data
    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setBooks(response.data.products)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting useCart data 
    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/cart/get', 
                {}, 
                { 
                    headers: { 
                        token: userToken || token,
                        'x-csrf-token': localStorage.getItem('csrfToken'),
                        'csrf-token': localStorage.getItem('csrfToken')
                    } 
                }
            )
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Password reset functions
    const forgotPassword = async (email) => {
        setLoading(true)
        setAuthError(null)
        
        try {
            const response = await authService.forgotPassword(email)
            
            if (response.success) {
                toast.success(response.message)
                return { success: true }
            } else {
                setAuthError(response.message)
                toast.error(response.message)
                return { success: false, message: response.message }
            }
        } catch (error) {
            const errorMsg = error.message || 'Password reset request failed'
            setAuthError(errorMsg)
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        } finally {
            setLoading(false)
        }
    }
    
    const resetPassword = async (token, password) => {
        setLoading(true)
        setAuthError(null)
        
        try {
            const response = await authService.resetPassword(token, password)
            
            if (response.success) {
                toast.success(response.message)
                return { success: true }
            } else {
                setAuthError(response.message)
                toast.error(response.message)
                return { 
                    success: false, 
                    message: response.message,
                    code: response.code,
                    requirements: response.requirements
                }
            }
        } catch (error) {
            const errorMsg = error.message || 'Password reset failed'
            setAuthError(errorMsg)
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))  // prevent logout upon reload the page if logged in
            setRefreshToken(localStorage.getItem('refreshToken'))
            
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                setUser(JSON.parse(storedUser))
            }
            
            getUserCart(localStorage.getItem('token'))
        }
        getProductsData()
        fetchCategories()
    }, [])

    // Wishlist Methods
    const addToWishlist = async (productId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích')
            navigate('/login')
            return
        }
        
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/wishlist/add`,
                { userId: user.id, productId },
                { 
                    headers: { 
                        token,
                        'x-csrf-token': localStorage.getItem('csrfToken'),
                        'csrf-token': localStorage.getItem('csrfToken')
                    } 
                }
            )
            
            if (response.data.success) {
                setWishlistItems(response.data.wishlist)
                toast.success('Đã thêm vào danh sách yêu thích')
                return true
            } else {
                toast.error(response.data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error('Đã xảy ra lỗi khi thêm vào danh sách yêu thích')
            return false
        }
    }
    
    const removeFromWishlist = async (productId) => {
        if (!user) {
            return
        }
        
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/wishlist/remove`,
                { userId: user.id, productId },
                { 
                    headers: { 
                        token,
                        'x-csrf-token': localStorage.getItem('csrfToken'),
                        'csrf-token': localStorage.getItem('csrfToken')
                    } 
                }
            )
            
            if (response.data.success) {
                setWishlistItems(response.data.wishlist)
                toast.success('Đã xóa khỏi danh sách yêu thích')
                return true
            } else {
                toast.error(response.data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error('Đã xảy ra lỗi khi xóa khỏi danh sách yêu thích')
            return false
        }
    }
    
    const getWishlist = async () => {
        if (!user) {
            return []
        }
        
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/wishlist/get`,
                { userId: user.id },
                { 
                    headers: { 
                        token,
                        'x-csrf-token': localStorage.getItem('csrfToken'),
                        'csrf-token': localStorage.getItem('csrfToken')
                    } 
                }
            )
            
            if (response.data.success) {
                setWishlistItems(response.data.wishlist)
                return response.data.wishlist
            } else {
                console.log(response.data.message)
                return []
            }
        } catch (error) {
            console.log(error)
            return []
        }
    }
    
    const isInWishlist = (productId) => {
        return wishlistItems.includes(productId)
    }

    // Load wishlist when user is authenticated
    useEffect(() => {
        if (user && token && !wishlistLoaded) {
            getWishlist();
            setWishlistLoaded(true);
        }
    }, [user, token, wishlistLoaded]);

    // Reset wishlistLoaded when user logs out
    useEffect(() => {
        if (!user || !token) {
            setWishlistLoaded(false);
        }
    }, [user, token]);

    // Xử lý đăng nhập Google callback
    const handleGoogleCallback = async (params) => {
        setLoading(true)
        setAuthError(null)
        
        try {
            const { token, refreshToken, userId } = params
            
            if (token && refreshToken && userId) {
                // Lấy thông tin người dùng từ API
                const response = await authService.getGoogleUser(userId)
                
                if (response.success) {
                    setToken(token)
                    setRefreshToken(refreshToken)
                    setUser(response.user)
                    
                    localStorage.setItem('token', token)
                    localStorage.setItem('refreshToken', refreshToken)
                    localStorage.setItem('user', JSON.stringify(response.user))
                    
                    // Lấy giỏ hàng của người dùng
                    await getUserCart(token)
                    
                    return { success: true }
                } else {
                    setAuthError(response.message)
                    toast.error(response.message)
                    return { success: false, message: response.message }
                }
            } else {
                const errorMsg = 'Đăng nhập Google thất bại'
                setAuthError(errorMsg)
                toast.error(errorMsg)
                return { success: false, message: errorMsg }
            }
        } catch (error) {
            const errorMsg = error.message || 'Đăng nhập Google thất bại'
            setAuthError(errorMsg)
            toast.error(errorMsg)
            return { success: false, message: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const contextValue = { 
        books, 
        currency, 
        navigate, 
        token, 
        setToken,
        refreshToken,
        setRefreshToken,
        user,
        setUser,
        loading, 
        authError, 
        cartItems, 
        setCartItems, 
        addToCart, 
        getCartCount, 
        getCartAmount, 
        getFinalAmount,
        updateQuantity, 
        delivery_charges, 
        backendUrl,
        registerUser,
        loginUser,
        logoutUser,
        forgotPassword,
        resetPassword,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        getWishlist,
        isInWishlist,
        activePromotion,
        discountAmount,
        promoCode,
        setPromoCode,
        promoError,
        promoLoading,
        validatePromoCode,
        clearPromotion,
        applyPromotion,
        handleGoogleCallback,
        categories,
        getCategoryName,
        fetchCategories
    }

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider