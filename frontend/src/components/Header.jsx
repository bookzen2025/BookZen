// src/components/Header.jsx - ENTIRE UPDATED FILE
import React, { useContext, useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import Navbar from './Navbar'
import { CgMenuLeft } from "react-icons/cg"
import { TbUserCircle } from "react-icons/tb"
import { RiUserLine, RiShoppingBag4Line } from "react-icons/ri"
import { BiLogOut } from "react-icons/bi"
import { FaHeart } from "react-icons/fa"
import { ShopContext } from '../context/ShopContext'
import { useAuth } from '../hooks/useAuth'

const Header = () => {
    const { getCartCount } = useContext(ShopContext)
    const { user, isAuthenticated, logoutUser, loading } = useAuth()
    const navigate = useNavigate()
    const [active, setActive] = useState(false)
    const [menuOpened, setMenuOpened] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const toggleMenu = () => {
        setMenuOpened((prev) => !prev)
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        await logoutUser()
        setLoggingOut(false)
    }

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                // close the menu if opened when scrolling occurs
                if (menuOpened) {
                    setMenuOpened(false)
                }
            }
            // detect scroll
            setActive(window.scrollY > 30)
        }
        window.addEventListener("scroll", handleScroll)
        // clean up the event listener when component unmounts
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [menuOpened])

    return (
        <header className='fixed top-0 w-full left-0 right-0 z-50'>
            <div className={`${active ? 'bg-white py-2.5' : 'bg-primary py-3'} max-padd-container flexBetween border-b border-slate-900/10 rounded transition-all duration-300`}>
                {/* logo */}
                <Link to={'/'} className='flex-1 flex items-center justify-start'>
                    <img src={logo} alt="" height={36} width={36} className='hidden sm:flex mr-2' />
                    <h4 className='bold-24'>BookZen</h4>
                </Link>
                {/* Navbar */}
                <div className='flex-1'>
                    <Navbar menuOpened={menuOpened} toggleMenu={toggleMenu} containerStyles={`${menuOpened ? "flex flex-col gap-y-16 h-screen w-[222px] absolute left-0 top-0 bg-white z-50 px-10 py-4 shadow-xl" : "hidden xl:flex justify-center gap-x-8 xl:gap-x-14 medium-15 px-2 py-1"}`} />
                </div>
                {/* Right side */}
                <div className='flex-1 flex items-center justify-end gap-x-3 sm:gap-x-10'>
                    <CgMenuLeft onClick={toggleMenu} className='text-2xl xl:hidden cursor-pointer' />
                    <Link to={'/cart'} className='flex relative'>
                        <RiShoppingBag4Line className='text-[33px] bg-secondary text-primary p-1.5 rounded-full' />
                        <span className='bg-primary ring-1 ring-slate-900/5 medium-14 absolute left-5 -top-2.5 flexCenter w-5 h-5 rounded-full shadow-md'>{getCartCount()}</span>
                    </Link>
                    <div className='relative group'>
                        <div className=''>
                            {isAuthenticated ? (
                                <div className="flex items-center">
                                    <div className="mr-2 text-sm hidden md:block">
                                        {user?.name || "User"}
                                    </div>
                                    <TbUserCircle className='text-[29px] cursor-pointer' />
                                </div>
                            ) : (
                                <button onClick={()=> navigate('/login')} className='btn-outline flexCenter gap-x-2'>
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                    ) : 'Đăng nhập'}
                                    <RiUserLine />
                                </button>
                            )}
                        </div>
                        {isAuthenticated && <>
                            <ul className='bg-white p-1 w-32 ring-1 ring-slate-900/5 rounded absolute right-0 top-7 hidden group-hover:flex flex-col regular-14 shadow-md'>
                                <li onClick={()=> navigate('/orders')} className='p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer'>Đơn hàng</li>
                                <li onClick={()=> navigate('/wishlist')} className='p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer flex items-center'>
                                    <FaHeart className="mr-1 text-red-500" />
                                    Yêu thích
                                </li>
                                <li onClick={handleLogout} className='p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer flex items-center'>
                                    {loggingOut ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                            Đang đăng xuất...
                                        </>
                                    ) : (
                                        <>
                                            <BiLogOut className="mr-1" />
                                            Đăng xuất
                                        </>
                                    )}
                                </li>
                            </ul>
                        </>}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header