import React from 'react'
import { FaSquarePlus } from "react-icons/fa6"
import { FaListAlt, FaTags, FaUsers } from "react-icons/fa"
import { MdFactCheck, MdDashboard } from "react-icons/md"
import { BiLogOut } from "react-icons/bi"
import { MdProductionQuantityLimits } from "react-icons/md"
import { MdLocalOffer } from "react-icons/md"
import { BsBoxSeam } from "react-icons/bs"
import logo from "../assets/logo.png"
import { Link, NavLink } from 'react-router-dom'

const Sidebar = ({setToken}) => {
    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        // Cập nhật state token trong App
        setToken('');
    }

    // Định nghĩa các menu item
    const menuItems = [
        { path: '/', icon: <MdDashboard className="text-xl" />, label: 'Tổng quan' },
        { path: '/products', icon: <MdProductionQuantityLimits className="text-xl" />, label: 'Sản phẩm' },
        { path: '/inventory', icon: <BsBoxSeam className="text-xl" />, label: 'Tồn kho' },
        { path: '/categories', icon: <FaTags className="text-xl" />, label: 'Danh mục' },
        { path: '/orders', icon: <MdFactCheck className="text-xl" />, label: 'Đơn hàng' },
        { path: '/users', icon: <FaUsers className="text-xl" />, label: 'Người dùng' },
        { path: '/promotions', icon: <MdLocalOffer className="text-xl" />, label: 'Khuyến mãi' },
    ];

    return (
        <aside className="bg-secondary text-white sm:w-64 max-sm:w-20 min-h-screen transition-all duration-300 ease-in-out">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <Link to={'/'} className="flex items-center p-4 border-b border-secondaryLight/20">
                    <div className="bg-white p-1 rounded">
                        <img src={logo} alt="BookZen" className="h-8 w-8" />
                    </div>
                    <span className="text-xl font-heading ml-3 text-white max-sm:hidden">BookZen</span>
                </Link>
                
                {/* Menu Items */}
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item, index) => (
                        <NavLink 
                            key={index}
                            to={item.path} 
                            className={({ isActive }) => 
                                `flex items-center px-4 py-3 text-sm transition-all duration-200 ease-in-out
                                ${isActive 
                                    ? 'bg-white/10 border-l-4 border-accent font-medium' 
                                    : 'hover:bg-white/5 border-l-4 border-transparent'}`
                            }
                        >
                            <span className="flex items-center justify-center w-6 h-6">{item.icon}</span>
                            <span className="ml-3 max-sm:hidden">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-secondaryLight/20 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-white/5 rounded-button transition-all duration-200 ease-in-out"
                    >
                        <span className="flex items-center justify-center w-6 h-6">
                            <BiLogOut className="text-xl" />
                        </span>
                        <span className="ml-3 max-sm:hidden">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar