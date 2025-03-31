import React, { useContext } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'

const CartTotal = () => {
    const { 
        currency, 
        getCartAmount, 
        getFinalAmount, 
        calculateDeliveryCharges, 
        activePromotion, 
        discountAmount,
        selectedProvince
    } = useContext(ShopContext)

    const cartAmount = getCartAmount()
    const finalAmount = getFinalAmount()
    const showDiscount = activePromotion && discountAmount > 0
    
    // Tính phí vận chuyển dựa trên tỉnh/thành phố đã chọn
    const delivery_charges = calculateDeliveryCharges(selectedProvince) 
    const totalWithShipping = finalAmount + (cartAmount > 0 ? delivery_charges : 0)

    // Hiển thị loại phí vận chuyển
    const shippingType = selectedProvince === 'Hà Nội' ? '(Nội thành)' : '(Ngoại thành)'

    return (
        <div className='w-full'>
            {/* Title */}
            <Title title1={'Cart'} title2={'Total'} title1Styles={'h3'} />
            <div className='flexBetween pt-3'>
                <h5 className='h5'>SubTotal:</h5>
                <p className='h5'>{currency}{cartAmount.toLocaleString('vi-VN')}</p>
            </div>

            {/* Hiển thị giảm giá nếu có */}
            {showDiscount && (
                <>
                    <hr className='mx-auto h-[1px] w-full bg-gray-900/10 my-1' />
                    <div className='flexBetween pt-3'>
                        <h5 className='h5'>
                            Giảm giá:
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                ({activePromotion.code})
                            </span>
                        </h5>
                        <p className='h5 text-green-600'>-{currency}{discountAmount.toLocaleString('vi-VN')}</p>
                    </div>
                </>
            )}

            <hr className='mx-auto h-[1px] w-full bg-gray-900/10 my-1' />
            <div className='flexBetween pt-3'>
                <h5 className='h5'>
                    Phí vận chuyển: 
                    <span className="ml-2 text-xs font-normal text-gray-500">
                        {selectedProvince ? shippingType : ''}
                    </span>
                </h5>
                <p className='h5'>{cartAmount === 0 ? "0" : `${currency}${delivery_charges.toLocaleString('vi-VN')}`}</p>
            </div>
            <hr className='mx-auto h-[1px] w-full bg-gray-900/10 my-1' />
            <div className='flexBetween pt-3'>
                <h5 className='h5'>Total:</h5>
                <p className='h5'>{currency}{cartAmount === 0 ? "0" : totalWithShipping.toLocaleString('vi-VN')}</p>
            </div>
            <hr className='mx-auto h-[1px] w-full bg-gray-900/10 my-1' />
        </div>
    )
}

export default CartTotal