// Trang Quản lý Khuyến mãi
// Tạo mới: 2024
// Mô tả: Giao diện quản lý các chương trình khuyến mãi, bao gồm danh sách, thêm, sửa, xóa

import React, { useState, useEffect } from 'react'
import axios from "axios"
import { backend_url, currency } from '../App'
import { toast } from 'react-toastify'
import { TbTrash } from 'react-icons/tb'
import { FaEdit } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

const Promotions = ({ token }) => {
  // State cho form thêm/chỉnh sửa khuyến mãi
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('0')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)))
  const [isActive, setIsActive] = useState(true)
  const [usageLimit, setUsageLimit] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(false)

  // State cho danh sách
  const [promotions, setPromotions] = useState([])
  const [products, setProducts] = useState([])
  const [showProductSelection, setShowProductSelection] = useState(false)
  
  // State cho chức năng chỉnh sửa
  const [editMode, setEditMode] = useState(false)
  const [currentPromotionId, setCurrentPromotionId] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // Hàm lấy danh sách khuyến mãi
  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/promotion/list`)
      if (response.data.success) {
        setPromotions(response.data.promotions)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error("Lỗi khi tải danh sách khuyến mãi")
    }
  }

  // Hàm lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/product/list`)
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (error) {
      console.log(error)
      toast.error("Lỗi khi tải danh sách sản phẩm")
    }
  }

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
  }, [])

  // Reset form
  const resetForm = () => {
    setName('')
    setCode('')
    setDescription('')
    setDiscountType('percentage')
    setDiscountValue('')
    setMinOrderValue('0')
    setMaxDiscountAmount('')
    setStartDate(new Date())
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)))
    setIsActive(true)
    setUsageLimit('')
    setSelectedProducts([])
    setEditMode(false)
    setCurrentPromotionId('')
  }

  // Xử lý khi submit form
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!name || !code || !description || !discountValue) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
        setLoading(false)
        return
      }

      const promotionData = {
        name,
        code,
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        startDate,
        endDate,
        isActive,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        applicableProducts: selectedProducts.length > 0 ? selectedProducts : undefined
      }

      let response
      if (editMode) {
        // Cập nhật khuyến mãi
        response = await axios.put(
          `${backend_url}/api/promotion/update/${currentPromotionId}`,
          promotionData,
          { headers: { Authorization: token } }
        )
      } else {
        // Tạo khuyến mãi mới
        response = await axios.post(
          `${backend_url}/api/promotion/create`,
          promotionData,
          { headers: { Authorization: token } }
        )
      }

      if (response.data.success) {
        toast.success(response.data.message)
        fetchPromotions()
        resetForm()
        setShowForm(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Lỗi khi lưu khuyến mãi")
    }

    setLoading(false)
  }

  // Xử lý khi chọn chỉnh sửa
  const handleEdit = (promotion) => {
    setName(promotion.name)
    setCode(promotion.code)
    setDescription(promotion.description)
    setDiscountType(promotion.discountType)
    setDiscountValue(promotion.discountValue.toString())
    setMinOrderValue(promotion.minOrderValue.toString())
    setMaxDiscountAmount(promotion.maxDiscountAmount ? promotion.maxDiscountAmount.toString() : '')
    setStartDate(new Date(promotion.startDate))
    setEndDate(new Date(promotion.endDate))
    setIsActive(promotion.isActive)
    setUsageLimit(promotion.usageLimit ? promotion.usageLimit.toString() : '')
    setSelectedProducts(promotion.applicableProducts || [])
    setEditMode(true)
    setCurrentPromotionId(promotion._id)
    setShowForm(true)
  }

  // Xử lý khi xóa khuyến mãi
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        const response = await axios.delete(`${backend_url}/api/promotion/delete/${id}`, {
          headers: { Authorization: token }
        })

        if (response.data.success) {
          toast.success("Xóa khuyến mãi thành công")
          fetchPromotions()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error("Lỗi khi xóa khuyến mãi")
      }
    }
  }

  // Hiển thị trạng thái khuyến mãi
  const getPromotionStatus = (promotion) => {
    const now = new Date()
    const start = new Date(promotion.startDate)
    const end = new Date(promotion.endDate)

    if (!promotion.isActive) {
      return <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">Không hoạt động</span>
    } else if (now < start) {
      return <span className="px-2 py-1 rounded-full bg-blue-200 text-blue-700 text-xs">Sắp diễn ra</span>
    } else if (now > end) {
      return <span className="px-2 py-1 rounded-full bg-red-200 text-red-700 text-xs">Đã kết thúc</span>
    } else {
      return <span className="px-2 py-1 rounded-full bg-green-200 text-green-700 text-xs">Đang diễn ra</span>
    }
  }

  // Hiển thị giá trị giảm giá
  const displayDiscountValue = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`
    } else {
      return `${promotion.discountValue.toLocaleString()}${currency}`
    }
  }

  // Xử lý khi chọn/bỏ chọn sản phẩm
  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  return (
    <div className="w-full p-4 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6">Quản lý Khuyến mãi</h1>
        
        <button 
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mb-4"
        >
          {showForm ? 'Đóng form' : 'Thêm khuyến mãi mới'}
        </button>
        
        {/* Form thêm/sửa khuyến mãi */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editMode ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={onSubmitHandler}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Tên chương trình <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên chương trình khuyến mãi"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Mã khuyến mãi <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mã khuyến mãi (VD: SUMMER2024)"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Loại giảm giá <span className="text-red-500">*</span></label>
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">
                    {discountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={discountType === 'percentage' ? "Nhập % giảm (VD: 10)" : "Nhập số tiền giảm"}
                    min="0"
                    required
                  />
                </div>
                
                {discountType === 'percentage' && (
                  <div>
                    <label className="block text-gray-700 mb-1">Giảm giá tối đa</label>
                    <input 
                      type="number"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Giới hạn số tiền giảm tối đa"
                      min="0"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-700 mb-1">Giá trị đơn hàng tối thiểu</label>
                  <input 
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Giá trị đơn hàng tối thiểu để áp dụng"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    dateFormat="dd/MM/yyyy"
                    minDate={startDate}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Giới hạn sử dụng</label>
                  <input 
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Số lần sử dụng tối đa (để trống nếu không giới hạn)"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Trạng thái</label>
                  <div className="flex items-center mt-2">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Kích hoạt</span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Áp dụng cho sản phẩm</label>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {selectedProducts.length === 0 
                          ? "Áp dụng cho tất cả sản phẩm" 
                          : `Đã chọn ${selectedProducts.length} sản phẩm`}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setShowProductSelection(!showProductSelection)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      >
                        {showProductSelection ? 'Ẩn danh sách' : 'Chọn sản phẩm'}
                      </button>
                      {selectedProducts.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setSelectedProducts([])}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm ml-2"
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>
                    
                    {showProductSelection && (
                      <div className="mt-2 border rounded p-3 max-h-60 overflow-y-auto">
                        {products.map(product => (
                          <div key={product._id} className="flex items-center mb-2">
                            <input 
                              type="checkbox" 
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => toggleProductSelection(product._id)}
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2">{product.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : editMode ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Danh sách khuyến mãi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tên chương trình</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Giảm giá</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Đã dùng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-3 text-center text-sm text-gray-500">
                      Không có khuyến mãi nào. Hãy tạo khuyến mãi mới!
                    </td>
                  </tr>
                ) : (
                  promotions.map(promotion => (
                    <tr key={promotion._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{promotion.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{promotion.code}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>{displayDiscountValue(promotion)}</div>
                        {promotion.minOrderValue > 0 && (
                          <div className="text-xs text-gray-500">
                            Đơn tối thiểu: {promotion.minOrderValue.toLocaleString()}{currency}
                          </div>
                        )}
                        {promotion.discountType === 'percentage' && promotion.maxDiscountAmount && (
                          <div className="text-xs text-gray-500">
                            Tối đa: {promotion.maxDiscountAmount.toLocaleString()}{currency}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                        <div>đến {new Date(promotion.endDate).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getPromotionStatus(promotion)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {promotion.usageCount}
                        {promotion.usageLimit && (
                          <span className="text-gray-500">/{promotion.usageLimit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(promotion)} 
                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(promotion._id)} 
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <TbTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Promotions 