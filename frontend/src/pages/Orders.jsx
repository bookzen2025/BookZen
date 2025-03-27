import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import Title from '../components/Title'
import Footer from '../components/Footer'
import { toast } from 'react-toastify'
import { useLocation, Link } from 'react-router-dom'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp, FiCalendar, FiDollarSign, FiCreditCard, FiShoppingBag } from 'react-icons/fi'

/**
 * Trang quản lý đơn hàng của người dùng
 * Được thiết kế lại để:
 * - Cải thiện trải nghiệm người dùng với giao diện hiện đại
 * - Thêm tính năng lọc và tìm kiếm đơn hàng
 * - Phân loại đơn hàng theo trạng thái
 * - Thêm tính năng theo dõi đơn hàng và hiển thị timeline
 * - Cải thiện hiển thị chi tiết đơn hàng
 */
const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])
  const [confirmingOrder, setConfirmingOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [groupedOrders, setGroupedOrders] = useState({})
  const location = useLocation()

  // Tải dữ liệu đơn hàng
  const loadOrderData = async () => {
    setLoading(true)
    try {
      if (!token) {
        setLoading(false)
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        // Xử lý và nhóm đơn hàng
        processOrderData(response.data.orders)
      }
    } catch (error) {
      console.log(error)
      toast.error('Không thể tải dữ liệu đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý và nhóm đơn hàng theo ID
  const processOrderData = (orders) => {
    // Nhóm sản phẩm theo orderId
    const groupedItems = orders.reduce((acc, order) => {
      const orderId = order._id
      
      if (!acc[orderId]) {
        acc[orderId] = {
          orderId: orderId,
          date: order.date,
          status: order.status,
          payment: order.payment,
          paymentMethod: order.paymentMethod,
          items: [],
          totalAmount: 0,
          address: order.address || {},
          trackingNumber: order.trackingNumber || ''
        }
      }
      
      // Thêm sản phẩm vào nhóm đơn hàng
      order.items.forEach(item => {
        acc[orderId].items.push(item)
        acc[orderId].totalAmount += item.price * item.quantity
      })
      
      return acc
    }, {})
    
    // Chuyển đổi thành mảng và sắp xếp theo ngày giảm dần
    const ordersArray = Object.values(groupedItems).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    
    setOrderData(ordersArray)
    
    // Phân loại đơn hàng theo status
    const byStatus = ordersArray.reduce((acc, order) => {
      const status = order.status
      if (!acc[status]) acc[status] = []
      acc[status].push(order)
      return acc
    }, { all: ordersArray })
    
    setGroupedOrders(byStatus)
  }

  // Xác nhận chuyển khoản
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
      toast.error('Có lỗi xảy ra khi xác nhận chuyển khoản')
    }
  }

  // Mở rộng/thu gọn chi tiết đơn hàng
  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  // Lấy biểu tượng trạng thái đơn hàng
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock className="text-yellow-500" />
      case 'confirmed': return <FiCheckCircle className="text-green-500" />
      case 'cancelled': return <FiXCircle className="text-red-500" />
      default: return <FiPackage className="text-gray-500" />
    }
  }

  // Lấy tên trạng thái của đơn hàng
  const getStatusName = (status) => {
    switch(status) {
      case 'pending': return 'Đang xử lý'
      case 'confirmed': return 'Đã xác nhận'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  // Lấy tên phương thức thanh toán
  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'cod': return 'Thanh toán khi nhận hàng'
      case 'bank': return 'Chuyển khoản ngân hàng'
      default: return method
    }
  }

  // Lấy tên trạng thái thanh toán
  const getPaymentStatusName = (status) => {
    switch(status) {
      case 'pending': return 'Chưa thanh toán'
      case 'completed': return 'Đã thanh toán'
      default: return status
    }
  }

  // Hiển thị timeline theo dõi đơn hàng
  const renderOrderTimeline = (order) => {
    const steps = [
      { id: 'order_placed', label: 'Đã đặt hàng', completed: true, date: new Date(order.date).toLocaleDateString('vi-VN') },
      { id: 'payment_confirmed', label: 'Đã xác nhận thanh toán', completed: order.payment === 'completed', date: order.payment === 'completed' ? '---' : null },
      { id: 'processing', label: 'Đang xử lý', completed: order.status === 'confirmed' || order.status === 'shipped', date: '---' },
      { id: 'shipped', label: 'Đang giao hàng', completed: order.status === 'shipped', date: order.shippedDate || null },
      { id: 'delivered', label: 'Đã giao hàng', completed: order.status === 'delivered', date: order.deliveredDate || null }
    ]

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Theo dõi đơn hàng</h4>
        <div className="relative">
          <div className="absolute top-5 left-5 h-full w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start">
                <div className={`absolute left-0 rounded-full h-10 w-10 flex items-center justify-center ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {index === 0 ? <FiShoppingBag /> : 
                   index === 1 ? <FiDollarSign /> : 
                   index === 2 ? <FiPackage /> : 
                   index === 3 ? <FiPackage /> : <FiCheckCircle />}
                </div>
                <div className="ml-14">
                  <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                  {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Kiểm tra success parameter trong URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderSuccess = params.get('success');
    
    if (orderSuccess === 'true') {
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm cùng BookZen.", {
        position: "top-center",
        autoClose: 5000
      });
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Tải dữ liệu đơn hàng khi component mount hoặc token thay đổi
  useEffect(() => {
    loadOrderData()
  }, [token])

  // Lọc danh sách đơn hàng theo tab
  const filteredOrders = activeTab === 'all' 
    ? orderData 
    : groupedOrders[activeTab] || []

  return (
    <section className='max-padd-container'>
      <div className='pt-28 pb-10'>
        {/* Header và thống kê */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <Title title1={'Đơn hàng'} title2={'của tôi'} title1Styles={'h3'} />
            <p className="text-gray-600 mt-2">Quản lý và theo dõi đơn hàng của bạn</p>
          </div>
          
          {/* Tổng số đơn hàng */}
          {!loading && orderData.length > 0 && (
            <div className="mt-4 sm:mt-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="text-xl font-semibold text-gray-800">{orderData.length}</span>
                <p className="text-sm text-gray-600">Tổng đơn</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="text-xl font-semibold text-yellow-600">{groupedOrders['pending']?.length || 0}</span>
                <p className="text-sm text-gray-600">Đang xử lý</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="text-xl font-semibold text-green-600">{groupedOrders['confirmed']?.length || 0}</span>
                <p className="text-sm text-gray-600">Đã xác nhận</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="text-xl font-semibold text-red-600">{groupedOrders['cancelled']?.length || 0}</span>
                <p className="text-sm text-gray-600">Đã hủy</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs lọc đơn hàng */}
        {!loading && orderData.length > 0 && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex overflow-x-auto whitespace-nowrap pb-px -mb-px" aria-label="Tabs">
              <button 
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Tất cả ({orderData.length})
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Đang xử lý ({groupedOrders['pending']?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('confirmed')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'confirmed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Đã xác nhận ({groupedOrders['confirmed']?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'cancelled' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Đã hủy ({groupedOrders['cancelled']?.length || 0})
              </button>
            </nav>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && orderData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
            <FiPackage className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bạn chưa có đơn hàng nào</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Hãy khám phá những sản phẩm tuyệt vời của chúng tôi và đặt hàng ngay
            </p>
            <Link to="/" className="btn-primaryOne">
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
        
        {/* Empty filtered results */}
        {!loading && orderData.length > 0 && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Không có đơn hàng nào trong danh mục này</p>
          </div>
        )}
        
        {/* Orders list */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order header */}
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-lg font-medium text-gray-900">Đơn hàng #{order.orderId.substring(order.orderId.length - 8)}</h3>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusName(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="h-4 w-4" />
                        <span>{new Date(order.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <button 
                        onClick={() => toggleOrderDetails(order.orderId)}
                        className="flex items-center gap-1 text-primary hover:text-secondary transition-colors"
                      >
                        {expandedOrders[order.orderId] ? 
                          <>Thu gọn <FiChevronUp /></> : 
                          <>Xem chi tiết <FiChevronDown /></>
                        }
                      </button>
                    </div>
                  </div>
                  
                  {/* Order summary */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img 
                            src={order.items[0]?.image} 
                            alt={order.items[0]?.name} 
                            className="h-16 w-16 object-cover rounded-md"
                          />
                          {order.items.length > 1 && (
                            <div className="absolute -right-2 -bottom-2 bg-secondary text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
                              +{order.items.length - 1}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.items[0]?.name}</p>
                        <p className="text-sm text-gray-500">
                          {order.items.length > 1 
                            ? `${order.items.length} sản phẩm trong đơn hàng`
                            : '1 sản phẩm trong đơn hàng'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Tổng tiền</p>
                      <p className="text-xl font-semibold text-secondary">{currency}{order.totalAmount.toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Order details (expanded) */}
                {expandedOrders[order.orderId] && (
                  <div className="p-4 sm:p-6">
                    {/* Order information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin thanh toán</h4>
                        <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <FiCreditCard className="text-secondary" />
                            <div>
                              <p className="text-sm font-medium">Phương thức thanh toán</p>
                              <p className="text-sm text-gray-600">{getPaymentMethodName(order.paymentMethod)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="text-secondary" />
                            <div>
                              <p className="text-sm font-medium">Trạng thái thanh toán</p>
                              <p className={`text-sm ${
                                order.payment === 'completed' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {getPaymentStatusName(order.payment)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bank transfer confirmation button */}
                        {order.paymentMethod === 'bank' && order.payment === 'pending' && (
                          <button
                            onClick={() => setConfirmingOrder(order.orderId)}
                            className="mt-3 w-full btn-secondaryOne"
                          >
                            Xác nhận đã chuyển khoản
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</h4>
                        <div className="bg-primary/10 rounded-lg p-4">
                          {order.address?.fullName ? (
                            <>
                              <p className="font-medium">{order.address.fullName}</p>
                              <p className="text-sm text-gray-600">{order.address.phoneNumber}</p>
                              <p className="text-sm text-gray-600">
                                {[
                                  order.address.street,
                                  order.address.ward,
                                  order.address.district,
                                  order.address.province
                                ].filter(Boolean).join(', ')}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Không có thông tin địa chỉ</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order items */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sản phẩm đã đặt</h4>
                      <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-primary/5">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sản phẩm
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số lượng
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-primary/5">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                      {item.author && <div className="text-xs text-gray-500">{item.author}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                  {currency}{item.price.toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-secondary">
                                  {currency}{(item.price * item.quantity).toLocaleString('vi-VN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-primary/5">
                            <tr>
                              <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                                Tổng cộng
                              </th>
                              <td className="px-6 py-3 text-right text-sm font-bold text-secondary">
                                {currency}{order.totalAmount.toLocaleString('vi-VN')}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                    
                    {/* Order timeline */}
                    {renderOrderTimeline(order)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmingOrder && (
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
                onClick={() => confirmBankTransfer(confirmingOrder)}
                className="btn-secondaryOne"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </section>
  )
}

export default Orders