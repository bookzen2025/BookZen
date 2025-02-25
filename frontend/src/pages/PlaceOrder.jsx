import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import Footer from '../components/Footer'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const { books, navigate, token, cartItems, setCartItems, getCartAmount, delivery_charges, backendUrl, currency } = useContext(ShopContext)
  const [method, setMethod] = useState('cod')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'Việt Nam',
    phone: '',
  })
  
  // Trạng thái mới để theo dõi quá trình thanh toán
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value

    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault() // prevents page reload
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
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
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
          const responseBankTransfer = await axios.post(backendUrl + '/api/order/bank-transfer', orderData, { headers: { token } })
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
        { headers: { token } }
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
                    <span>{currency}{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className='flex justify-between border-b pb-2 mb-2'>
                  <span>Phí vận chuyển</span>
                  <span>{currency}{delivery_charges}</span>
                </div>
                
                <div className='flex justify-between font-bold'>
                  <span>Tổng cộng</span>
                  <span>{currency}{orderInfo.amount}</span>
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
                <p><strong>Chủ tài khoản:</strong> Bacala Books</p>
                <p><strong>Số tiền:</strong> {currency}{orderInfo.amount}</p>
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
                className='px-6 py-2 border border-gray-300 rounded-full text-sm font-medium'
                disabled={isSubmitting}
              >
                Quay lại
              </button>
              <button 
                onClick={confirmPayment} 
                className='btn-secondary'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
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
      <form onSubmit={onSubmitHandler} className='pt-28'>
        <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
          {/* Left Side */}
          <div className='flex flex-1 flex-col gap-3 text-[95%]'>
            <Title title1={'Thông tin'} title2={'giao hàng'} title1Styles={'h3'} />
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} value={formData.firstName} type="text" name='firstName' placeholder='Tên' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
              <input onChange={onChangeHandler} value={formData.lastName} type="text" name='lastName' placeholder='Họ' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
            </div>
            <input onChange={onChangeHandler} value={formData.email} type="email" name='email' placeholder='Email' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none' required />
            <input onChange={onChangeHandler} value={formData.phone} type="text" name='phone' placeholder='Số điện thoại' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none' required />
            <input onChange={onChangeHandler} value={formData.street} type="text" name='street' placeholder='Địa chỉ' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none' required />
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} value={formData.city} type="text" name='city' placeholder='Thành phố' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
              <input onChange={onChangeHandler} value={formData.state} type="text" name='state' placeholder='Tỉnh/Thành' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
            </div>
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} value={formData.zipcode} type="text" name='zipcode' placeholder='Mã bưu điện' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
              <input onChange={onChangeHandler} value={formData.country} type="text" name='country' placeholder='Quốc gia' className='ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none w-1/2' required />
            </div>
          </div>

          {/* Right side */}
          <div className='flex flex-1 flex-col'>
            <CartTotal />
            {/* Payment method */}
            <div className='my-6'>
              <h3 className='bold-20 mb-5'>Phương thức <span className='text-secondary'>thanh toán</span></h3>
              <div className='flex gap-3'>
                <div onClick={() => setMethod('bank')} className={`${method === 'bank' ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}>Chuyển khoản</div>
                <div onClick={() => setMethod('cod')} className={`${method === 'cod' ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}>Thanh toán khi nhận hàng</div>
              </div>
              
              {/* Bank transfer information preview */}
              {method === 'bank' && (
                <div className='mt-4 p-4 bg-white rounded-lg shadow-sm'>
                  <h4 className='font-medium mb-2'>Thông tin chuyển khoản</h4>
                  <div className='space-y-2 text-sm'>
                    <p><span className='font-medium'>Tên ngân hàng:</span> Vietcombank</p>
                    <p><span className='font-medium'>Số tài khoản:</span> 1234567890</p>
                    <p><span className='font-medium'>Chủ tài khoản:</span> Bacala Books</p>
                    <p className='text-xs text-gray-500 mt-2'>Chi tiết thanh toán sẽ được hiển thị sau khi đặt hàng.</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <button 
                type='submit' 
                className='btn-secondaryOne' 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
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