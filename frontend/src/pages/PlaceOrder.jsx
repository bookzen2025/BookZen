// src/pages/PlaceOrder.jsx - ENTIRE UPDATED FILE
import React, { useContext, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import Footer from '../components/Footer'
import { ShopContext } from '../context/ShopContext'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'
import { toast } from 'react-toastify'
import vietnamProvinces from '../data/vietnam-provinces'
import { GoArrowRight } from 'react-icons/go'
import { BiArrowBack } from 'react-icons/bi'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { FiInfo } from 'react-icons/fi'

// Create schema for shipping address validation
const shippingSchema = yup.object().shape({
  fullName: yup.string().required('Họ và tên là bắt buộc'),
  email: yup.string().required('Email là bắt buộc').email('Vui lòng nhập email hợp lệ'),
  phone: yup.string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\s-]{8,15}$/, 'Vui lòng nhập số điện thoại hợp lệ'),
  province: yup.string().required('Vui lòng chọn tỉnh/thành phố'),
  district: yup.string().required('Vui lòng chọn quận/huyện'),
  address: yup.string().required('Địa chỉ cụ thể là bắt buộc'),
});

// Tạo component nội bộ để tránh điều hướng không mong muốn
const PlaceOrderPromoInput = () => {
  const { 
    promoCode, 
    setPromoCode, 
    validatePromoCode, 
    promoError, 
    promoLoading,
    activePromotion,
    discountAmount,
    clearPromotion,
    currency,
    getCartAmount
  } = useContext(ShopContext)

  const handleApplyPromo = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const result = await validatePromoCode(promoCode)
    } catch (error) {
      // Xử lý lỗi nếu có
    }
    
    return false
  }

  // Hiển thị thông tin khuyến mãi đã áp dụng
  const renderAppliedPromotion = () => {
    if (!activePromotion) return null

    return (
      <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              <span className="font-medium">{activePromotion.name}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">{activePromotion.description}</div>
            <div className="text-sm font-medium text-green-600 mt-1">
              Giảm: {currency}{discountAmount.toLocaleString('vi-VN')}
            </div>
          </div>
          <button 
            onClick={clearPromotion}
            className="text-gray-500 hover:text-red-500"
            title="Hủy áp dụng"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mt-4">
      <div className="text-gray-700 font-medium mb-2">Mã khuyến mãi</div>
      
      {activePromotion ? (
        // Hiển thị thông tin khuyến mãi đã áp dụng
        renderAppliedPromotion()
      ) : (
        // Form nhập mã
        <div className="flex">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors disabled:bg-blue-300"
          >
            {promoLoading ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        </div>
      )}
      
      {/* Hiển thị lỗi */}
      {promoError && (
        <div className="mt-2 text-red-500 text-sm flex items-start">
          <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
          <span>{promoError}</span>
        </div>
      )}
    </div>
  )
}

const PlaceOrder = () => {
  const { 
    books, 
    navigate, 
    token, 
    cartItems, 
    setCartItems, 
    getCartAmount, 
    getFinalAmount, 
    delivery_charges, 
    backendUrl, 
    currency, 
    activePromotion,
    discountAmount,
    applyPromotion 
  } = useContext(ShopContext)
  const { isAuthenticated, user } = useAuth()
  const [method, setMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState('')
  const [districts, setDistricts] = useState([])
  
  // Hàm trợ giúp điều hướng sang trang orders
  const navigateToOrders = () => {
    // Sử dụng window.location.href thay vì navigate để buộc tải lại trang
    window.location.href = '/orders?success=true';
  }
  
  // Set up form with React Hook Form
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(shippingSchema)
  });

  // Watch the province field to update districts
  const watchProvince = watch('province');

  // Update districts when province changes
  useEffect(() => {
    if (watchProvince) {
      const province = vietnamProvinces.find(p => p.name === watchProvince);
      if (province) {
        setDistricts(province.districts);
        setSelectedProvince(province.name);
        // Reset district when province changes
        setValue('district', '');
      }
    }
  }, [watchProvince, setValue]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
    }
  }, [user, setValue]);
  
  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiếp tục thanh toán", {
        position: "top-center"
      });
      navigate('/login');
      return;
    }
    
    const hasItems = Object.values(cartItems).some(qty => qty > 0);
    if (!hasItems) {
      toast.info("Giỏ hàng của bạn trống", {
        position: "top-center"
      });
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems, navigate]);

  const onSubmitHandler = async (formData) => {
    setIsSubmitting(true)
    
    try {
      let orderItems = []

      for (const itemId in cartItems) {
        if (cartItems[itemId] > 0) {
          const itemInfo = books.find((book) => book._id === itemId)
          if (itemInfo) {
            orderItems.push({
              ...itemInfo,
              quantity: cartItems[itemId]
            })
          }
        }
      }
      
      // Transform form data to fit backend expectations
      const addressData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        province: formData.province,
        district: formData.district,
        address: formData.address
      }
      
      let orderData = {
        address: addressData,
        items: orderItems,
        amount: getFinalAmount() + delivery_charges,
        promoCode: activePromotion ? activePromotion.code : null
      }

      switch (method) {
        // api for COD method
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { 
            headers: { 
              token,
              'x-csrf-token': localStorage.getItem('csrfToken'),
              'csrf-token': localStorage.getItem('csrfToken')
            } 
          })
          if (response.data.success) {
            // Tăng số lượt sử dụng mã khuyến mãi nếu có
            if (activePromotion) {
              await applyPromotion();
            }
            
            // Xóa giỏ hàng trước
            setCartItems({});
            
            // Sau đó điều hướng đến trang orders sử dụng window.location
            toast.success("Đặt hàng thành công!");
            navigateToOrders();
          } else {
            toast.error(response.data.message)
          }
          break;

        // api for bank transfer method
        case 'bank':
          const responseBankTransfer = await axios.post(backendUrl + '/api/order/bank-transfer', orderData, { 
            headers: { 
              token,
              'x-csrf-token': localStorage.getItem('csrfToken'),
              'csrf-token': localStorage.getItem('csrfToken')
            } 
          })
          if (responseBankTransfer.data.success) {
            // Tăng số lượt sử dụng mã khuyến mãi nếu có
            if (activePromotion) {
              await applyPromotion();
            }
            
            // Lưu thông tin đơn hàng và hiển thị màn hình thanh toán
            setOrderInfo({
              orderId: responseBankTransfer.data.orderId,
              amount: getFinalAmount() + delivery_charges,
              items: orderItems,
              address: addressData
            })
            setOrderPlaced(true)
          } else {
            toast.error(responseBankTransfer.data.message)
          }
          break
        default:
          toast.error("Phương thức thanh toán không hợp lệ")
          break;
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmPayment = async () => {
    try {
      setIsSubmitting(true)
      const response = await axios.post(
        backendUrl + '/api/order/complete-bank-transfer',
        { orderId: orderInfo.orderId, userId: token },
        { 
          headers: { 
            token,
            'x-csrf-token': localStorage.getItem('csrfToken'),
            'csrf-token': localStorage.getItem('csrfToken')
          } 
        }
      )
      
      if (response.data.success) {
        // Xóa giỏ hàng trước
        setCartItems({});
        
        // Sau đó điều hướng đến trang orders
        toast.success("Xác nhận thanh toán thành công!");
        navigateToOrders();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Màn hình thông tin thanh toán sau khi đặt hàng bằng chuyển khoản
  if (orderPlaced && orderInfo) {
    return (
      <section className='max-padd-container'>
        <div className='pt-28 pb-16 flex justify-center'>
          <div className='bg-white rounded-xl shadow-md p-8 w-full max-w-2xl'>
            <h2 className='text-2xl font-bold mb-6 text-center'>Thông tin đơn hàng</h2>
            
            {/* Thông tin đơn hàng */}
            <div className='mb-6'>
              <h3 className='font-medium text-lg mb-3'>Chi tiết đơn hàng #{orderInfo.orderId}</h3>
              <div className='bg-primary p-4 rounded-lg'>
                <div className='flex justify-between border-b pb-2 mb-2'>
                  <span className='font-medium'>Sản phẩm</span>
                  <span className='font-medium'>Tổng</span>
                </div>
                
                {orderInfo.items.map((item, index) => (
                  <div key={index} className='flex justify-between border-b pb-2 mb-2'>
                    <span>{item.name} x {item.quantity}</span>
                    <span>{currency}{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
                
                {/* Hiển thị thông tin khuyến mãi nếu có */}
                {activePromotion && discountAmount > 0 && (
                  <div className='flex justify-between border-b pb-2 mb-2 text-green-600'>
                    <span>Khuyến mãi: {activePromotion.code}</span>
                    <span>-{currency}{discountAmount.toLocaleString('vi-VN')}</span>
                  </div>
                )}
                
                <div className='flex justify-between border-b pb-2 mb-2'>
                  <span>Phí vận chuyển</span>
                  <span>{currency}{delivery_charges.toLocaleString('vi-VN')}</span>
                </div>
                
                <div className='flex justify-between font-bold'>
                  <span>Tổng cộng</span>
                  <span>{currency}{orderInfo.amount.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
            
            {/* Thông tin người nhận */}
            <div className='mb-6'>
              <h3 className='font-medium text-lg mb-3'>Địa chỉ giao hàng</h3>
              <div className='bg-primary p-4 rounded-lg'>
                <p><strong>Họ tên:</strong> {orderInfo.address.fullName}</p>
                <p><strong>Địa chỉ:</strong> {orderInfo.address.address}, {orderInfo.address.district}, {orderInfo.address.province}</p>
                <p><strong>Số điện thoại:</strong> {orderInfo.address.phone}</p>
                <p><strong>Email:</strong> {orderInfo.address.email}</p>
              </div>
            </div>
            
            {/* Thông tin thanh toán */}
            <div className='mb-8'>
              <h3 className='font-medium text-lg mb-3'>Thông tin chuyển khoản</h3>
              <div className='bg-secondary bg-opacity-10 p-4 rounded-lg text-secondary'>
                <p><strong>Ngân hàng:</strong> Vietcombank</p>
                <p><strong>Số tài khoản:</strong> 1234567890</p>
                <p><strong>Chủ tài khoản:</strong> BookZen Books</p>
                <p><strong>Số tiền:</strong> {currency}{orderInfo.amount.toLocaleString('vi-VN')}</p>
                <p><strong>Nội dung chuyển khoản:</strong> Thanh toan don hang #{orderInfo.orderId}</p>
                <div className='mt-3 text-sm'>
                  <p>Lưu ý: Vui lòng hoàn tất thanh toán trong vòng 24 giờ. Đơn hàng của bạn sẽ được xử lý sau khi chúng tôi nhận được thanh toán.</p>
                </div>
              </div>
            </div>
            
            {/* Nút bấm */}
            <div className='flex gap-4 justify-center'>
              <button 
                onClick={() => setOrderPlaced(false)} 
                className='px-6 py-2 border border-gray-300 rounded-full text-sm font-medium bg-white hover:bg-gray-50 transition-colors'
                disabled={isSubmitting}
              >
                Quay lại
              </button>
              <button 
                onClick={confirmPayment} 
                className='btn-secondary transition-all duration-300 hover:shadow-md'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : 'Xác nhận đã thanh toán'}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    )
  }

  // Màn hình đặt hàng ban đầu
  return (
    <section className='max-padd-container'>
      {/* Container */}
      <form onSubmit={handleSubmit(onSubmitHandler)} className='pt-28'>
        <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
          {/* Left Side */}
          <div className='flex flex-1 flex-col gap-3 text-[95%]'>
            <Title title1={'Thông tin'} title2={'giao hàng'} title1Styles={'h3'} />
            
            {/* Họ và tên */}
            <div>
              <input 
                {...register('fullName')} 
                type="text" 
                placeholder='Họ và tên' 
                className={`ring-1 ${errors.fullName ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <input 
                {...register('email')} 
                type="email" 
                placeholder='Email' 
                className={`ring-1 ${errors.email ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            {/* Số điện thoại */}
            <div>
              <input 
                {...register('phone')} 
                type="text" 
                placeholder='Số điện thoại' 
                className={`ring-1 ${errors.phone ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Tỉnh/Thành phố */}
            <div>
              <select
                {...register('province')}
                className={`ring-1 ${errors.province ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`}
                aria-invalid={errors.province ? "true" : "false"}
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {vietnamProvinces.map(province => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>
              )}
            </div>
            
            {/* Quận/Huyện */}
            <div>
              <select
                {...register('district')}
                className={`ring-1 ${errors.district ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`}
                aria-invalid={errors.district ? "true" : "false"}
                disabled={!selectedProvince}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(district => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
              )}
            </div>
            
            {/* Địa chỉ cụ thể */}
            <div>
              <input 
                {...register('address')} 
                type="text" 
                placeholder='Địa chỉ cụ thể (số nhà, tên đường, thôn/ấp...)' 
                className={`ring-1 ${errors.address ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                aria-invalid={errors.address ? "true" : "false"}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className='flex flex-1 flex-col'>
            <CartTotal />
            
            {/* Promotion Code */}
            <div className='my-6'>
              <h3 className='bold-20 mb-5'>Mã <span className='text-secondary'>khuyến mãi</span></h3>
              <PlaceOrderPromoInput />
            </div>
            
            {/* Payment method */}
            <div className='my-6'>
              <h3 className='bold-20 mb-5'>Phương thức <span className='text-secondary'>thanh toán</span></h3>
              <div className='flex gap-3'>
                <button
                  type="button"
                  onClick={() => setMethod('bank')} 
                  className={`${method === 'bank' ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer transition-colors`}
                >
                  Chuyển khoản
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('cod')} 
                  className={`${method === 'cod' ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer transition-colors`}
                >
                  Thanh toán khi nhận hàng
                </button>
              </div>
              
              {/* Bank transfer information preview */}
              {method === 'bank' && (
                <div className='mt-4 p-4 bg-white rounded-lg shadow-sm'>
                  <h4 className='font-medium mb-2'>Thông tin chuyển khoản</h4>
                  <div className='space-y-2 text-sm'>
                    <p><span className='font-medium'>Ngân hàng:</span> Vietcombank</p>
                    <p><span className='font-medium'>Số tài khoản:</span> 1234567890</p>
                    <p><span className='font-medium'>Chủ tài khoản:</span> BookZen Books</p>
                    <p className='text-xs text-gray-500 mt-2'>Chi tiết thanh toán sẽ được hiển thị sau khi đặt hàng.</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <button 
                type='submit' 
                className='btn-secondaryOne transition-all duration-300 hover:shadow-md flex items-center justify-center' 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </>
                ) : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <Footer />
    </section>
  )
}

export default PlaceOrder