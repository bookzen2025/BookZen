import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import Title from '../components/Title'
import Footer from '../components/Footer'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'

const Orders = () => {

  const { backendUrl, token, currency, setCartItems } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])
  const [confirmingOrder, setConfirmingOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const loadOrderData = async () => {
    setLoading(true)
    try {
      if (!token) {
        setLoading(false)
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const confirmBankTransfer = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/complete-bank-transfer', 
        { orderId, userId: token }, 
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success(response.data.message)
        setConfirmingOrder(null)
        await loadOrderData()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Kiểm tra success parameter trong URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderSuccess = params.get('success');
    
    if (orderSuccess === 'true') {
      // Hiển thị thông báo thành công
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm cùng BookZen.", {
        position: "top-center",
        autoClose: 5000
      });
      
      // Xóa query parameter để tránh hiển thị lại khi tải lại trang
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Tải dữ liệu đơn hàng khi component mount hoặc token thay đổi
  useEffect(() => {
    loadOrderData()
  }, [token])

  return (
    <section className='max-padd-container'>
      <div className='pt-28 pb-10'>
        {/* Title */}
        <Title title1={'Danh sách'} title2={'đơn hàng'} title1Styles={'h3'} />
        
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Container */}
        {!loading && (
          orderData.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center my-6">
              <div className="text-6xl mb-4 text-gray-300 flex justify-center">
                <i className="far fa-clipboard"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa đặt đơn hàng nào. Hãy tiếp tục mua sắm!</p>
              <button onClick={() => window.location.href = '/shop'} className="btn-secondaryOne">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            orderData.map((item, i) => (
              <div key={i} className='bg-white p-2 mt-3 rounded-lg'>
                <div className='text-gray-700 flex flex-col gap-4'>
                  <div className='flex gap-x-3 w-full'>
                    {/* Image */}
                    <div className='flex gap-6'>
                      <img src={item.image} alt="orderItemImg" width={55} className='object-cover aspect-square rounded' />
                    </div>
                    {/* order info */}
                    <div className='block w-full'>
                      <h5 className='h5 capitalize line-clamp-1'>{item.name}</h5>
                      <div className='flexBetween'>
                        <div>
                          <div className='flex items-center gap-x-1 sm:gap-x-3'>
                            <div className='flexCenter gap-x-1'>
                              <h5 className='medium-14'>Giá:</h5>
                              <p>{currency}{item.price}</p>
                            </div>
                            <div className='flexCenter gap-x-1'>
                              <h5 className='medium-14'>Số lượng:</h5>
                              <p>{item.quantity}</p>
                            </div>
                            <div className='sm:flexCenter gap-x-1 hidden'>
                              <h5 className='medium-14'>Thanh toán:</h5>
                              <p className='text-gray-400'>{item.paymentMethod}</p>
                            </div>
                          </div>
                          <div className='flex items-center gap-x-1'>
                            <h5 className='medium-14'>Ngày:</h5>
                            <p className='text-gray-400'>{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                          <div className='flex items-center gap-x-1 sm:hidden'>
                            <h5 className='medium-14'>Thanh toán:</h5>
                            <p className='text-gray-400'>{item.paymentMethod}</p>
                          </div>
                        </div>
                        
                        {/* Status & buttons */}
                        <div className='flex flex-col xl:flex-row gap-3'>
                          <div className='flex items-center gap-2'>
                            <p className='min-w-2 h-2 rounded-full bg-secondary'></p>
                            <p>{item.status}</p>
                          </div>
                          
                          {/* Show confirm payment button for bank transfers that are not yet paid */}
                          {item.paymentMethod === 'Bank Transfer' && !item.payment && item.orderId !== confirmingOrder && (
                            <button 
                              onClick={() => setConfirmingOrder(item.orderId)}
                              className='btn-secondaryOne !px-2.5 !py-1 !text-xs'
                            >
                              Xác nhận đã thanh toán
                            </button>
                          )}
                          
                          {/* Confirmation buttons */}
                          {item.orderId === confirmingOrder && (
                            <div className='flex gap-2'>
                              <button 
                                onClick={() => confirmBankTransfer(item.orderId)}
                                className='bg-green-500 text-white rounded-full px-2 py-1 text-xs'
                              >
                                Xác nhận
                              </button>
                              <button 
                                onClick={() => setConfirmingOrder(null)}
                                className='bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs'
                              >
                                Hủy
                              </button>
                            </div>
                          )}
                          
                          {/* Track order button */}
                          <button 
                            onClick={loadOrderData} 
                            className='btn-secondaryOne !px-1.5 !py-1 !text-xs'
                          >
                            Theo dõi đơn hàng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      <Footer />
    </section>
  )
}

export default Orders