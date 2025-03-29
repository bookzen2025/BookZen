import React, { useState } from 'react'
import { backend_url } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import logo from "../assets/logo.png"
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from 'react-icons/fa'

const Login = ({setToken}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault() // prevent reload the page
    
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await axios.post(`${backend_url}/api/user/admin`, {
        email, 
        password
      });
      
      if (response.data.success) {
        toast.success("Đăng nhập thành công!")
        setToken(response.data.token)
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      if (error.response) {
        // Server trả về response với status code không phải 2xx
        toast.error(error.response.data?.message || `Lỗi: ${error.response.status} - ${error.response.statusText}`)
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.")
      } else {
        // Lỗi trong quá trình thiết lập request
        toast.error(`Lỗi: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800'>
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#6d28d9_1px,transparent_1px)] [background-size:20px_20px] blur-[1px]"></div>
      <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Form đăng nhập */}
      <div className='relative z-10 flex flex-col justify-center items-center w-full max-w-lg px-8 py-8'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden'>
          <div className='h-2 bg-gradient-to-r from-secondary to-purple-600'></div>
          <div className='px-8 py-10'>
            <div className='text-center mb-8'>
              <div className='flex justify-center mb-6'>
                {/* Logo với nền trắng để nổi bật logo tím */}
                <div className='bg-white p-4 rounded-2xl inline-flex shadow-lg shadow-secondary/30 border-2 border-secondary/20 transform hover:scale-105 transition-all duration-300'>
                  <img src={logo} alt="BookZen" className='h-12 w-12 drop-shadow-md' />
                </div>
              </div>
              <h1 className='text-h1 font-heading font-bold text-textPrimary mb-3'>BookZen Admin</h1>
              <p className='text-body text-textSecondary'>Đăng nhập để quản lý cửa hàng sách trực tuyến</p>
            </div>

            <form onSubmit={onSubmitHandler} className='space-y-6'>
              <div className='group'>
                <label htmlFor="email" className='block text-body font-medium text-textPrimary mb-2'>
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaEnvelope className='text-secondary/70 group-hover:text-secondary transition-colors duration-300' />
                  </div>
                  <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    id="email"
                    placeholder='you@example.com' 
                    className='block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/50 text-textPrimary transition-all duration-300' 
                  />
                </div>
              </div>

              <div className='group'>
                <label htmlFor="password" className='block text-body font-medium text-textPrimary mb-2'>
                  Mật khẩu
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaLock className='text-secondary/70 group-hover:text-secondary transition-colors duration-300' />
                  </div>
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    placeholder='••••••••' 
                    className='block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/50 text-textPrimary transition-all duration-300' 
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 
                      <FaRegEyeSlash /> : 
                      <FaRegEye />
                    }
                  </button>
                </div>
              </div>

              <div>
                <button 
                  type='submit' 
                  className='w-full bg-gradient-to-r from-secondary to-purple-600 hover:from-secondary/90 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 transform hover:-translate-y-0.5'
                  disabled={loading}
                >
                  {loading ? 
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang đăng nhập...
                    </span> : 
                    'Đăng nhập'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-white/80">
          &copy; {new Date().getFullYear()} BookZen. Mọi quyền được bảo lưu.
        </div>
      </div>
    </section>
  )
}

export default Login