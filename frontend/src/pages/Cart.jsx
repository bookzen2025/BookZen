// src/pages/Cart.jsx - ENTIRE UPDATED FILE
import React, { useContext } from 'react'
import { TbTrash } from 'react-icons/tb'
import { FaMinus, FaPlus } from 'react-icons/fa6'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import CartTotal from '../components/CartTotal'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

const Cart = () => {
    const { books, navigate, currency, cartItems, getCartAmount, updateQuantity } = useContext(ShopContext)
    const { isAuthenticated } = useAuth()
    
    // Count items in cart
    const itemCount = Object.values(cartItems).filter(qty => qty > 0).length
    
    const handleProceedToCheckout = () => {
        if (!isAuthenticated) {
            toast.info("Vui lòng đăng nhập để tiếp tục thanh toán", {
                position: "top-center",
                autoClose: 5000
            })
            navigate('/login')
            return
        }
        
        if (getCartAmount() === 0) {
            toast.info("Giỏ hàng của bạn trống", {
                position: "top-center"
            })
            return
        }
        
        navigate('/place-order')
    }
    
    const handleUpdateQuantity = (itemId, newQuantity) => {
        // Add simple validation
        if (newQuantity < 0) newQuantity = 0
        if (newQuantity > 99) {
            toast.warn("Số lượng tối đa là 99")
            newQuantity = 99
        }
        
        updateQuantity(itemId, newQuantity)
    }

    return (
        <section className='max-padd-container'>
            <div className='pt-28'>
                {/* Title */}
                <Title title1={'Giỏ'} title2={'hàng'} title1Styles={'h3'} />
                
                {/* Empty Cart Message */}
                {itemCount === 0 && (
                    <div className="bg-white p-8 rounded-lg text-center my-6">
                        <div className="text-6xl mb-4 text-gray-300 flex justify-center">
                            <TbTrash />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Giỏ hàng của bạn trống</h3>
                        <p className="text-gray-500 mb-6">Có vẻ như bạn chưa thêm sách nào vào giỏ hàng.</p>
                        <button onClick={() => navigate('/shop')} className="btn-secondaryOne">
                            Tiếp tục mua sắm
                        </button>
                    </div>
                )}
                
                {/* Cart Items */}
                <div className='mt-6'>
                    {books.map((item) => {
                        if (cartItems[item._id] > 0) {
                            return (
                                <div key={item._id} className='bg-white p-2 mt-3 rounded-lg transition-all duration-300 hover:shadow-md'>
                                    <div className='flex gap-x-3'>
                                        <div className='flex items-start gap-6'>
                                            <img src={item.image} alt={item.name} className='w-14 rounded' />
                                        </div>
                                        <div className='flex flex-col w-full'>
                                            <h5 className='h5 !my-0 line-clamp-1'>{item.name}</h5>
                                            <div className='flex items-start justify-between'>
                                                <div>
                                                    <p className='mb-1.5'>{item.category}</p>
                                                    <div className='flex items-center ring-1 ring-slate-900/5 rounded-full overflow-hidden bg-primary'>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item._id, cartItems[item._id] - 1)} 
                                                            className='p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors'
                                                            aria-label="Giảm số lượng"
                                                        >
                                                            <FaMinus className='text-xs' />
                                                        </button>
                                                        <p className='px-2'>{cartItems[item._id]}</p>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item._id, cartItems[item._id] + 1)} 
                                                            className='p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors'
                                                            aria-label="Tăng số lượng"
                                                        >
                                                            <FaPlus className='text-xs' />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className='h4'>{currency}{item.price.toLocaleString('vi-VN')}</h4>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item._id, 0)} 
                                                    className='cursor-pointer text-xl text-secondary hover:text-red-500 transition-colors p-1'
                                                    aria-label="Xóa sản phẩm"
                                                >
                                                    <TbTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return null;
                    })}
                </div>

                {/* Cart Summary */}
                {itemCount > 0 && (
                    <div className='flex mt-20'>
                        <div className='w-full sm:w-[450px]'>
                            <CartTotal />
                            <button 
                                onClick={handleProceedToCheckout} 
                                className='btn-secondaryOne mt-7 transition-all duration-300 hover:shadow-md'
                            >
                                Tiến hành đặt hàng
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </section>
    )
}

export default Cart