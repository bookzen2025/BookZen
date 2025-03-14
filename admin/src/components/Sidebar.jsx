import React from 'react'
import { FaSquarePlus } from "react-icons/fa6"
import { FaListAlt, FaTags, FaUsers } from "react-icons/fa"
import { MdFactCheck, MdDashboard } from "react-icons/md"
import { BiLogOut } from "react-icons/bi"
import { MdProductionQuantityLimits } from "react-icons/md"
import { MdLocalOffer } from "react-icons/md"
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

    return (
        <div className='max-sm:flexCenter max-xs:pb-3 rounded bg-white pb-3 sm:w-1/5 sm:min-h-screen'>
            <div className='flex flex-col gap-y-6 max-sm:items-center sm:flex-col pt-4 sm:pt-14'>
                {/* logo */}
                <Link to={'/'} className='bold-24 flex items-baseline sm:pl-12'>
                    <img src={logo} alt="logoImg" height={24} width={24} />
                    <span className='text-secondary pl-2 sm:hidden lg:flex'>BookZen</span>
                </Link>
                <div className='flex sm:flex-col gap-x-5 gap-y-8 sm:pt-10'>
                    <NavLink to={'/'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <MdDashboard />
                        <div className='hidden lg:flex'>Dashboard</div>
                    </NavLink>
                    <NavLink to={'/products'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <MdProductionQuantityLimits />
                        <div className='hidden lg:flex'>Sản phẩm</div>
                    </NavLink>
                    <NavLink to={'/categories'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <FaTags />
                        <div className='hidden lg:flex'>Categories</div>
                    </NavLink>
                    <NavLink to={'/orders'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <MdFactCheck />
                        <div className='hidden lg:flex'>Orders</div>
                    </NavLink>
                    <NavLink to={'/users'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <FaUsers />
                        <div className='hidden lg:flex'>Users</div>
                    </NavLink>
                    <NavLink to={'/promotions'} className={({ isActive }) => isActive ? "active-link" : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl"}>
                        <MdLocalOffer />
                        <div className='hidden lg:flex'>Khuyến mãi</div>
                    </NavLink>
                    {/* Logout button */}
                    <div className='max-sm:ml-5 sm:mt-60'>
                        <button 
                            onClick={handleLogout}
                            className='flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl hover:bg-gray-100 w-full'
                        >
                            <BiLogOut className='text-lg'/>
                            <div className='hidden lg:flex'>Đăng xuất</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar