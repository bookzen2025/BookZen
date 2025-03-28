import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FaUserCircle, FaSearch, FaBell } from 'react-icons/fa'
import { IoIosArrowDown } from 'react-icons/io'
import { MdHelpOutline } from 'react-icons/md'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()

  // Tạo breadcrumbs từ location path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment)
    
    if (pathSegments.length === 0) {
      return [{ name: 'Tổng quan', path: '/' }]
    }

    const breadcrumbs = [{ name: 'Tổng quan', path: '/' }]
    
    let accumulatedPath = ''
    pathSegments.forEach(segment => {
      accumulatedPath += `/${segment}`
      
      let name = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Map route name sang tiếng Việt
      switch(segment) {
        case 'products':
          name = 'Sản phẩm'
          break
        case 'inventory':
          name = 'Tồn kho'
          break
        case 'categories':
          name = 'Danh mục'
          break
        case 'orders':
          name = 'Đơn hàng'
          break
        case 'users':
          name = 'Người dùng'
          break
        case 'promotions':
          name = 'Khuyến mãi'
          break
        default:
          break
      }
      
      breadcrumbs.push({ name, path: accumulatedPath })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="bg-white shadow-card py-3 px-6">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <span className={index === breadcrumbs.length - 1 
                ? "font-medium text-secondary" 
                : "text-textSecondary hover:text-secondary transition-colors cursor-pointer"
              }>
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 rounded-button pl-10 pr-4 py-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Notification */}
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <FaBell className="text-textSecondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {/* Help */}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MdHelpOutline className="text-textSecondary" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FaUserCircle className="text-secondary text-2xl" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-textSecondary">Quản trị viên</p>
              </div>
              <IoIosArrowDown className="text-textSecondary" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-card py-2 z-10">
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Cài đặt tài khoản</a>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Hỗ trợ</a>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100 text-error">Đăng xuất</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header