// Trang Quản lý Khuyến mãi
// Tạo mới: 2024
// Mô tả: Giao diện quản lý các chương trình khuyến mãi, bao gồm danh sách, thêm, sửa, xóa

import React, { useState, useEffect } from 'react'
import axios from "axios"
import { backend_url, currency } from '../App'
import { toast } from 'react-toastify'
import { FaTag, FaEdit, FaTrash, FaPlus, FaSearch, FaCalendarAlt } from "react-icons/fa"
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatCard from '../components/StatCard'

const Promotions = ({ token }) => {
  const [promotions, setPromotions] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPromotions, setFilteredPromotions] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPromotion, setCurrentPromotion] = useState(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [promotionIdToDelete, setPromotionIdToDelete] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    maxAmount: '',
    validFrom: '',
    validTo: '',
    applicableProducts: [],
    usageLimit: '',
    isActive: true
  })

  // Thống kê
  const [stats, setStats] = useState({
    activePromotions: 0,
    expiredPromotions: 0,
    upcomingPromotions: 0,
    totalPromotions: 0
  })

  const fetchPromotions = async () => {
    if (!token) return null
    
    try {
      setLoading(true)
      const response = await axios.get(
        `${backend_url}/api/promotion/list`, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        const promotionsData = response.data.promotions
        setPromotions(promotionsData)
        setFilteredPromotions(promotionsData)
        
        // Tính toán thống kê
        const now = new Date()
        
        const activePromotions = promotionsData.filter(promotion => 
          promotion.isActive && 
          new Date(promotion.validFrom) <= now && 
          new Date(promotion.validTo) >= now
        ).length
        
        const expiredPromotions = promotionsData.filter(promotion => 
          new Date(promotion.validTo) < now
        ).length
        
        const upcomingPromotions = promotionsData.filter(promotion => 
          new Date(promotion.validFrom) > now
        ).length
        
        setStats({
          activePromotions,
          expiredPromotions,
          upcomingPromotions,
          totalPromotions: promotionsData.length
        })
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

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/product/list`)
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
  }, [token])

  // Lọc khuyến mãi khi searchTerm thay đổi
  useEffect(() => {
    if (!promotions.length) return

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = promotions.filter(promotion => 
        promotion.name.toLowerCase().includes(term) ||
        promotion.code.toLowerCase().includes(term) ||
        promotion.description?.toLowerCase().includes(term)
      )
      setFilteredPromotions(filtered)
    } else {
      setFilteredPromotions(promotions)
    }
  }, [searchTerm, promotions])

  const handleCreate = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minAmount: '',
      maxAmount: '',
      validFrom: formatDateForInput(new Date()),
      validTo: formatDateForInput(new Date(Date.now() + 7*24*60*60*1000)), // Mặc định 7 ngày
      applicableProducts: [],
      usageLimit: '',
      isActive: true
    })
    setIsCreating(true)
    setIsEditing(false)
    setCurrentPromotion(null)
  }

  const handleEdit = (promotion) => {
    const formattedPromotion = {
      ...promotion,
      validFrom: formatDateForInput(new Date(promotion.validFrom)),
      validTo: formatDateForInput(new Date(promotion.validTo)),
      applicableProducts: promotion.applicableProducts?.map(product => product._id) || []
    }
    
    setFormData(formattedPromotion)
    setCurrentPromotion(promotion)
    setIsEditing(true)
    setIsCreating(false)
  }

  const handleDeleteConfirmation = (promotionId) => {
    setPromotionIdToDelete(promotionId)
    setIsConfirmationOpen(true)
  }

  const handleDelete = async () => {
    if (!promotionIdToDelete) return
    
    try {
      setLoading(true)
      const response = await axios.delete(
        `${backend_url}/api/promotion/delete/${promotionIdToDelete}`, 
        { headers: { Authorization: token } }
      )

      if (response.data.success) {
        toast.success('Xóa khuyến mãi thành công')
        setIsConfirmationOpen(false)
        setPromotionIdToDelete(null)
        await fetchPromotions()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.code || !formData.discountValue || !formData.validFrom || !formData.validTo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    
    try {
      setLoading(true)
      
      const payload = { ...formData }
      let response
      
      if (isEditing) {
        response = await axios.put(
          `${backend_url}/api/promotion/update/${currentPromotion._id}`, 
          payload,
          { headers: { Authorization: token } }
        )
      } else {
        response = await axios.post(
          `${backend_url}/api/promotion/create`,
          payload,
          { headers: { Authorization: token } }
        )
      }

      if (response.data.success) {
        toast.success(isEditing ? 'Cập nhật khuyến mãi thành công' : 'Tạo khuyến mãi thành công')
        setIsCreating(false)
        setIsEditing(false)
        setCurrentPromotion(null)
        await fetchPromotions()
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

  const handleCancel = () => {
    setIsCreating(false)
    setIsEditing(false)
    setCurrentPromotion(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleProductSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      applicableProducts: selectedOptions
    }))
  }

  // Hàm hỗ trợ định dạng ngày tháng
  const formatDateForInput = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Lấy trạng thái của khuyến mãi
  const getPromotionStatus = (promotion) => {
    const now = new Date()
    const validFrom = new Date(promotion.validFrom)
    const validTo = new Date(promotion.validTo)

    if (!promotion.isActive) {
      return { label: 'Không kích hoạt', color: 'bg-gray-10 text-textSecondary' }
    }
    
    if (validFrom > now) {
      return { label: 'Sắp tới', color: 'bg-info/10 text-info' }
    }
    
    if (validTo < now) {
      return { label: 'Đã hết hạn', color: 'bg-error/10 text-error' }
    }
    
    return { label: 'Đang hoạt động', color: 'bg-success/10 text-success' }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý khuyến mãi" 
        subtitle="Tạo và quản lý các chương trình khuyến mãi, mã giảm giá"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPromotions}
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
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
            </div>
        <button 
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary-dark transition-colors"
            >
              <FaPlus size={14} />
              <span>Tạo khuyến mãi mới</span>
        </button>
          </div>
        }
      />

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng số khuyến mãi"
          value={stats.totalPromotions}
          icon={<FaTag />}
          colorClass="bg-secondary/10 text-secondary"
        />
        <StatCard 
          title="Đang hoạt động"
          value={stats.activePromotions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>}
          colorClass="bg-success/10 text-success"
        />
        <StatCard 
          title="Sắp tới"
          value={stats.upcomingPromotions}
          icon={<FaCalendarAlt />}
          colorClass="bg-info/10 text-info"
        />
        <StatCard 
          title="Đã hết hạn"
          value={stats.expiredPromotions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          colorClass="bg-error/10 text-error"
        />
      </div>

      {/* Form tạo/sửa khuyến mãi */}
      {(isCreating || isEditing) && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <FaTag className="text-secondary text-xl" />
              </div>
              <h3 className="text-body font-heading">
                {isCreating ? 'Tạo khuyến mãi mới' : 'Chỉnh sửa khuyến mãi'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                <label className="block text-textSecondary text-small mb-1">Tên khuyến mãi *</label>
                  <input 
                    type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    required
                  />
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Mã giảm giá *</label>
                  <input 
                    type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                <label className="block text-textSecondary text-small mb-1">Mô tả</label>
                  <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    rows="3"
                  ></textarea>
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Loại giảm giá</label>
                  <select 
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Giá trị giảm giá *</label>
                  <input 
                    type="number"
                  name="discountValue"
                    min="0"
                  max={formData.discountType === 'percentage' ? "100" : undefined}
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    required
                  />
                </div>
                
                  <div>
                <label className="block text-textSecondary text-small mb-1">Số tiền tối thiểu</label>
                    <input 
                      type="number"
                  name="minAmount"
                      min="0"
                  value={formData.minAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Giảm tối đa (chỉ áp dụng cho %)</label>
                  <input 
                    type="number"
                  name="maxAmount"
                    min="0"
                  value={formData.maxAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  disabled={formData.discountType !== 'percentage'}
                  />
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Ngày bắt đầu *</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    required
                  />
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Ngày kết thúc *</label>
                <input
                  type="date"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    required
                  />
                </div>
                
                <div>
                <label className="block text-textSecondary text-small mb-1">Số lần sử dụng tối đa</label>
                  <input 
                    type="number"
                  name="usageLimit"
                    min="0"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                
              <div className="md:col-span-2">
                <label className="block text-textSecondary text-small mb-1">Áp dụng cho sản phẩm (giữ Ctrl để chọn nhiều)</label>
                <select
                  name="applicableProducts"
                  multiple
                  value={formData.applicableProducts}
                  onChange={handleProductSelect}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 h-32"
                >
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-small text-textSecondary mt-1">Để trống nếu áp dụng cho tất cả sản phẩm</p>
                </div>
                
                <div className="md:col-span-2">
                <label className="flex items-center">
                            <input 
                              type="checkbox" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span className="ml-2 text-textPrimary">Kích hoạt khuyến mãi</span>
                </label>
              </div>
              </div>
              
            <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary-dark transition-colors"
                  disabled={loading}
                >
                {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo khuyến mãi'}
                </button>
              </div>
            </form>
        </Card>
      )}

      {/* Modal xác nhận xóa */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 max-w-md w-full">
            <h3 className="text-h3 font-heading mb-2">Xác nhận xóa</h3>
            <p className="text-textSecondary mb-6">Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmationOpen(false)}
                className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-error text-white rounded-button hover:bg-error-dark transition-colors"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xóa'}
              </button>
            </div>
          </div>
          </div>
        )}
        
        {/* Danh sách khuyến mãi */}
      {loading && !isCreating && !isEditing && !isConfirmationOpen ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <FaTag className="mx-auto text-5xl text-gray-20 mb-3" />
            <p className="text-textSecondary mb-1">Không tìm thấy khuyến mãi nào</p>
            <p className="text-small text-gray-20">Thử thay đổi từ khóa tìm kiếm hoặc tạo khuyến mãi mới</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-10">
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Tên khuyến mãi</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Mã giảm giá</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Giảm giá</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Thời gian áp dụng</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promotion) => {
                  const status = getPromotionStatus(promotion)
                  
                  return (
                    <tr key={promotion._id} className="border-b border-gray-10 hover:bg-gray-5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/10 rounded-full">
                            <FaTag className="text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{promotion.name}</p>
                            <p className="text-small text-textSecondary line-clamp-1">{promotion.description}</p>
                          </div>
                        </div>
                    </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full">
                          {promotion.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {promotion.discountType === 'percentage' ? (
                          <div>
                            <p className="font-medium">{promotion.discountValue}%</p>
                            {promotion.maxAmount && (
                              <p className="text-small text-textSecondary">
                                Tối đa: {currency}{Number(promotion.maxAmount).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="font-medium">{currency}{Number(promotion.discountValue).toLocaleString('vi-VN')}</p>
                        )}
                        {promotion.minAmount && (
                          <p className="text-small text-textSecondary">
                            Đơn tối thiểu: {currency}{Number(promotion.minAmount).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-small">{formatDateForDisplay(promotion.validFrom)}</p>
                        <p className="text-small text-textSecondary">đến {formatDateForDisplay(promotion.validTo)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-small ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(promotion)} 
                            className="p-2 bg-info/10 text-info rounded-full hover:bg-info/20 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteConfirmation(promotion._id)}
                            className="p-2 bg-error/10 text-error rounded-full hover:bg-error/20 transition-colors"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Promotions 