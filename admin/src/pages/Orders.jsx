import React, { useState, useEffect } from 'react'
import { backend_url, currency } from "../App"
import axios from "axios"
import { toast } from "react-toastify"
import { TfiPackage } from "react-icons/tfi"
import { BiPackage } from "react-icons/bi"
import { FaSearch, FaSort } from "react-icons/fa"
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOrders, setFilteredOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedOrderAction, setSelectedOrderAction] = useState(null)

  const statusOptions = [
    'Đã đặt hàng',
    'Đang đóng gói',
    'Đã giao cho vận chuyển',
    'Đang giao hàng',
    'Đã giao hàng'
  ]

  const fetchAllOrders = async () => {
    if (!token) return null
    
    try {
      setLoading(true)
      const response = await axios.post(
        `${backend_url}/api/order/list`, 
        {}, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        const ordersData = response.data.orders.reverse()
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId, order) => {
    const newStatus = event.target.value
    
    // Nếu đang chuyển sang trạng thái "Đã giao hàng", hiển thị xác nhận
    if (newStatus === 'Đã giao hàng') {
      setSelectedOrderAction({
        orderId,
        status: newStatus,
        currentPayment: order.payment
      })
      setShowConfirmDialog(true)
      return
    }
    
    try {
      setLoading(true)
      const response = await axios.post(
        `${backend_url}/api/order/status`, 
        { orderId, status: newStatus }, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công')
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleConfirmStatusChange = async () => {
    if (!selectedOrderAction) return
    
    try {
      setLoading(true)
      
      // Cập nhật trạng thái đơn hàng - thêm tham số payment vào API hiện có
      const statusResponse = await axios.post(
        `${backend_url}/api/order/status`, 
        { 
          orderId: selectedOrderAction.orderId, 
          status: selectedOrderAction.status,
          payment: true // Thêm trạng thái thanh toán vào cùng một API call
        }, 
        { headers: { Authorization: token } }
      )
      
      // Không còn cần gọi API riêng về thanh toán - API này gây lỗi 404
      // if (!selectedOrderAction.currentPayment) {
      //   await axios.post(
      //     `${backend_url}/api/order/payment`, 
      //     { 
      //       orderId: selectedOrderAction.orderId, 
      //       payment: true 
      //     }, 
      //     { headers: { Authorization: token } }
      //   )
      // }
      
      if (statusResponse.data.success) {
        toast.success('Cập nhật trạng thái thành công. Đơn hàng đã hoàn thành và không thể thay đổi trạng thái.')
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
      setShowConfirmDialog(false)
      setSelectedOrderAction(null)
    }
  }
  
  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false)
    setSelectedOrderAction(null)
    fetchAllOrders() // Làm mới dữ liệu để reset dropdown
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  // Lọc đơn hàng khi searchTerm hoặc statusFilter thay đổi
  useEffect(() => {
    if (!orders.length) return

    let filtered = [...orders]
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.address.fullName.toLowerCase().includes(term) ||
        order._id.toLowerCase().includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term))
      )
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  // Hàm để lấy màu cho trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'Đã đặt hàng':
        return 'bg-info/10 text-info'
      case 'Đang đóng gói':
        return 'bg-secondary/10 text-secondary'
      case 'Đã giao cho vận chuyển':
        return 'bg-accent/10 text-accent'
      case 'Đang giao hàng':
        return 'bg-warning/10 text-warning'
      case 'Đã giao hàng':
        return 'bg-success/10 text-success'
      default:
        return 'bg-gray-10 text-textSecondary'
    }
  }

  // Hàm để lấy icon cho phương thức thanh toán
  const getPaymentIcon = (method) => {
    if (method === 'Stripe') {
      return (
        <div className="bg-secondary/10 p-1 rounded">
          <svg className="h-4 w-4 text-secondary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="bg-success/10 p-1 rounded">
          <svg className="h-4 w-4 text-success" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.25 22.5a2.25 2.25 0 0 0 2.25-2.25h-4.5a2.25 2.25 0 0 0 2.25 2.25Z" />
            <path d="M19.5 18.75H3a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5Z" />
            <path d="M18.894 10.28A1.42 1.42 0 0 0 20.25 9v-.75a9 9 0 0 0-18 0V9a1.42 1.42 0 0 0 1.356 1.28 1.5 1.5 0 0 0 1.394 1.22 1.501 1.501 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5 1.5h7.5a1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0 1.394-1.22Z" />
          </svg>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý đơn hàng" 
        subtitle="Quản lý và cập nhật trạng thái đơn hàng"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllOrders}
              className="p-2 bg-secondary/10 text-secondary rounded-button hover:bg-secondary/20 transition-colors"
              title="Làm mới"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-button p-1 inline-flex">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-button ${
            statusFilter === 'all' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
          }`}
        >
          Tất cả
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-button ${
              statusFilter === status ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Modal Xác nhận */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 max-w-md w-full">
            <h3 className="text-h3 font-heading mb-4">Xác nhận hoàn thành đơn hàng</h3>
            <p className="mb-6">Khi xác nhận đơn hàng đã giao, trạng thái đơn hàng sẽ được khóa và không thể thay đổi. Đồng thời, trạng thái thanh toán sẽ chuyển sang "Đã thanh toán". Bạn có chắc chắn muốn tiếp tục?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={handleCancelStatusChange}
                className="px-4 py-2 border border-gray-10 rounded-button hover:bg-gray-10"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-success text-white rounded-button hover:bg-success/90"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <BiPackage className="mx-auto text-5xl text-gray-20 mb-3" />
            <p className="text-textSecondary mb-1">Không tìm thấy đơn hàng nào</p>
            <p className="text-small text-gray-20">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className="hidden md:flex items-start">
                  <div className="p-4 bg-secondary/10 rounded-card">
                    <TfiPackage className="text-2xl text-secondary" />
                  </div>
                </div>
                
                {/* Order Info - Left Column */}
                <div className="md:flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-h3 font-heading">Mã đơn hàng: #{order._id}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-small ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-small ${
                        order.payment || order.status === 'Đã giao hàng' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-error/10 text-error'
                      }`}>
                        {order.payment || order.status === 'Đã giao hàng' ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Products */}
                    <div className="flex-1">
                      <p className="text-body font-medium mb-2">Sản phẩm</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-small">{item.name}</span>
                            <span className="text-small text-textSecondary">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex-1">
                      <p className="text-body font-medium mb-2">Thông tin khách hàng</p>
                      <p className="text-small">
                        <span className="text-textSecondary">Tên:</span> {order.address.fullName}
                      </p>
                      <p className="text-small truncate max-w-xs">
                        <span className="text-textSecondary">Địa chỉ:</span> {order.address.address}, {order.address.district}, {order.address.province}
                      </p>
                      <p className="text-small">
                        <span className="text-textSecondary">Email:</span> {order.address.email}
                      </p>
                      <p className="text-small">
                        <span className="text-textSecondary">Điện thoại:</span> {order.address.phone}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Order Info - Right Column */}
                <div className="space-y-3 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(order.paymentMethod)}
                    <span className="text-small">{order.paymentMethod}</span>
                  </div>
                  <p className="text-h3 font-heading">{currency}{order.amount.toLocaleString('vi-VN')}</p>
                  <p className="text-small text-textSecondary">
                    {new Date(order.date).toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <select 
                    onChange={(event) => statusHandler(event, order._id, order)} 
                    value={order.status} 
                    disabled={order.status === 'Đã giao hàng'}
                    className={`w-full px-3 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm ${
                      order.status === 'Đã giao hàng' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {order.status === 'Đã giao hàng' && (
                    <p className="text-xs text-gray-20 italic">Đơn hàng đã hoàn thành và được khóa</p>
                  )}
                </div>
              </div>
            </Card>
        ))}
      </div>
      )}
    </div>
  )
}

export default Orders