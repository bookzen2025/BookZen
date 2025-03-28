import React, { useState } from 'react'
import loginImg from "../assets/login.png"
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
    <section className='min-h-screen flex flex-col lg:flex-row bg-background'>
      {/* Left side - Form */}
      <div className='flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-10'>
            <div className='flex justify-center mb-4'>
              <div className='bg-secondary p-2 rounded-lg inline-flex'>
                <img src={logo} alt="BookZen" className='h-8 w-8' />
              </div>
            </div>
            <h1 className='text-h1 font-heading text-textPrimary mb-2'>BookZen Admin</h1>
            <p className='text-body text-textSecondary'>Đăng nhập để quản lý cửa hàng sách trực tuyến</p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-6'>
            <div>
              <label htmlFor="email" className='block text-body font-medium text-textPrimary mb-2'>
                Email
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaEnvelope className='text-textSecondary' />
                </div>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  type="email" 
                  id="email"
                  placeholder='you@example.com' 
                  className='block w-full pl-10 pr-3 py-3 border border-gray-10 rounded-button bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 text-textPrimary transition-all' 
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className='block text-body font-medium text-textPrimary mb-2'>
                Mật khẩu
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaLock className='text-textSecondary' />
                </div>
                <input 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  placeholder='••••••••' 
                  className='block w-full pl-10 pr-10 py-3 border border-gray-10 rounded-button bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 text-textPrimary transition-all' 
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <FaRegEyeSlash className='text-textSecondary' /> : 
                    <FaRegEye className='text-textSecondary' />
                  }
                </button>
              </div>
            </div>

            <div>
              <button 
                type='submit' 
                className='w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-button font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2'
                disabled={loading}
              >
                {loading ? 
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

      {/* Right side - Image */}
      <div className='hidden lg:block w-1/2 bg-secondary'>
        <div className='h-full w-full bg-opacity-20 flex items-center justify-center'>
          <img 
            src={loginImg} 
            alt="BookZen Login" 
            className='object-cover h-full w-full'
          />
        </div>
      </div>
    </section>
  )
}

export default Login