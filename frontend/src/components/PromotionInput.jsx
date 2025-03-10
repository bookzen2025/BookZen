// frontend/src/components/PromotionInput.jsx
// Tạo mới: 2024
// Mô tả: Component cho phép người dùng nhập và áp dụng mã khuyến mãi

import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { FiInfo } from 'react-icons/fi'

const PromotionInput = () => {
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
    // Ngăn chặn hành vi mặc định của form
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Hàm validatePromoCode trả về true/false
      const result = await validatePromoCode(promoCode)
    } catch (error) {
      // Xử lý lỗi nếu có
    }
    
    // Đảm bảo không chuyển hướng
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
        <form onSubmit={handleApplyPromo} className="flex">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={promoLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors disabled:bg-blue-300"
          >
            {promoLoading ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        </form>
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

export default PromotionInput 