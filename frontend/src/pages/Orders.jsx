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
        
        {/* Empty state */}
        {!loading && orderData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
          </div>
        )}
        
        {/* Orders list */}
        {!loading && orderData.length > 0 && (
          <div className="space-y-6">
            {orderData.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng: {item.orderId}</p>
                    <p className="text-sm text-gray-500">Ngày đặt: {new Date(item.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'pending' ? 'Đang xử lý' :
                       item.status === 'confirmed' ? 'Đã xác nhận' :
                       item.status === 'cancelled' ? 'Đã hủy' :
                       item.status}
                    </span>
                  </div>
                </div>
                
                {/* Order details */}
                <div className="flex flex-wrap items-center gap-4 py-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500">Số lượng: {item.quantity}</p>
                    <p className="text-gray-500">Giá: {currency}{item.price.toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                
                {/* Payment info */}
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Phương thức thanh toán: {
                          item.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                          item.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' :
                          item.paymentMethod
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        Trạng thái thanh toán: {
                          item.payment === 'pending' ? 'Chưa thanh toán' :
                          item.payment === 'completed' ? 'Đã thanh toán' :
                          item.payment
                        }
                      </p>
                    </div>
                    
                    {/* Bank transfer confirmation button */}
                    {item.paymentMethod === 'bank' && item.payment === 'pending' && (
                      <button
                        onClick={() => setConfirmingOrder(item.orderId)}
                        className="btn-secondaryOne"
                      >
                        Xác nhận đã chuyển khoản
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Confirmation modal */}
                {confirmingOrder === item.orderId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                      <h3 className="text-lg font-medium mb-4">Xác nhận chuyển khoản</h3>
                      <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn đã hoàn thành chuyển khoản cho đơn hàng này?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setConfirmingOrder(null)}
                          className="btn-outline"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => confirmBankTransfer(item.orderId)}
                          className="btn-secondaryOne"
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </section>
  )
}

export default Orders