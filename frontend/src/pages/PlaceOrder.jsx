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

// Create schema for shipping address validation
const shippingSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required').email('Please enter a valid email'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/Province is required'),
  zipcode: yup.string().required('ZIP/Postal code is required'),
  country: yup.string().required('Country is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+\s-]{8,15}$/, 'Please enter a valid phone number')
});

const PlaceOrder = () => {
  const { books, navigate, token, cartItems, setCartItems, getCartAmount, delivery_charges, backendUrl, currency } = useContext(ShopContext)
  const { isAuthenticated, user } = useAuth()
  const [method, setMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Set up form with React Hook Form
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      country: 'Việt Nam',
    }
  });

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
      // If we had more user details in our auth context, we could pre-fill more fields
    }
  }, [user, setValue]);
  
  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please login to proceed to checkout", {
        position: "top-center"
      });
      navigate('/login');
      return;
    }
    
    const hasItems = Object.values(cartItems).some(qty => qty > 0);
    if (!hasItems) {
      toast.info("Your cart is empty", {
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
      
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_charges
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
            setCartItems({})
            toast.success("Đặt hàng thành công!")
            navigate('/orders')
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
            // Lưu thông tin đơn hàng và hiển thị màn hình thanh toán
            setOrderInfo({
              orderId: responseBankTransfer.data.orderId,
              amount: getCartAmount() + delivery_charges,
              items: orderItems,
              address: formData
            })
            setOrderPlaced(true)
          } else {
            toast.error(responseBankTransfer.data.message)
          }
          break
        default:
          toast.error("Invalid payment method")
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
        setCartItems({}) // Xóa giỏ hàng
        toast.success("Xác nhận thanh toán thành công!")
        navigate('/orders')
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
                <p><strong>Họ tên:</strong> {orderInfo.address.lastName} {orderInfo.address.firstName}</p>
                <p><strong>Địa chỉ:</strong> {orderInfo.address.street}, {orderInfo.address.city}, {orderInfo.address.state}</p>
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
            <div className='flex gap-3'>
              <div className="w-1/2">
                <input 
                  {...register('firstName')} 
                  type="text" 
                  placeholder='Tên' 
                  className={`ring-1 ${errors.firstName ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <input 
                  {...register('lastName')} 
                  type="text" 
                  placeholder='Họ' 
                  className={`ring-1 ${errors.lastName ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
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
            <div>
              <input 
                {...register('street')} 
                type="text" 
                placeholder='Địa chỉ' 
                className={`ring-1 ${errors.street ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                aria-invalid={errors.street ? "true" : "false"}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>
              )}
            </div>
            <div className='flex gap-3'>
              <div className="w-1/2">
                <input 
                  {...register('city')} 
                  type="text" 
                  placeholder='Thành phố' 
                  className={`ring-1 ${errors.city ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.city ? "true" : "false"}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <input 
                  {...register('state')} 
                  type="text" 
                  placeholder='Tỉnh/Thành' 
                  className={`ring-1 ${errors.state ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.state ? "true" : "false"}
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>
            <div className='flex gap-3'>
              <div className="w-1/2">
                <input 
                  {...register('zipcode')} 
                  type="text" 
                  placeholder='Mã bưu điện' 
                  className={`ring-1 ${errors.zipcode ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.zipcode ? "true" : "false"}
                />
                {errors.zipcode && (
                  <p className="text-red-500 text-xs mt-1">{errors.zipcode.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <input 
                  {...register('country')} 
                  type="text" 
                  placeholder='Quốc gia' 
                  className={`ring-1 ${errors.country ? 'ring-red-500' : 'ring-slate-900/15'} p-1 pl-3 rounded-sm bg-primary outline-none w-full`} 
                  aria-invalid={errors.country ? "true" : "false"}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className='flex flex-1 flex-col'>
            <CartTotal />
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