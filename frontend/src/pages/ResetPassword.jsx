import React, { useState, useEffect } from 'react'
import loginImg from "../assets/login.png"
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'

const ResetPassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      toast.error("Liên kết đặt lại không hợp lệ")
      navigate('/login')
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp")
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await axios.post(backendUrl + '/api/user/reset-password', {
        token,
        password
      })
      
      if (response.data.success) {
        setResetSuccess(true)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='absolute top-0 left-0 h-full w-full z-50 bg-white'>
      {/* Container */}
      <div className='flex h-full w-full'>
        {/* Image Side */}
        <div className='w-1/2 hidden sm:block'>
          <img src={loginImg} alt="" className='object-cover aspect-square h-full w-full' />
        </div>
        {/* Form Side */}
        <div className='flexCenter w-full sm:w-1/2'>
          {!resetSuccess ? (
            <form onSubmit={handleSubmit} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
              <div className='w-full mb-4'>
                <h3 className='bold-36'>Đặt lại mật khẩu</h3>
                <p className='text-gray-500 mt-2'>
                  Nhập mật khẩu mới của bạn bên dưới.
                </p>
              </div>
              
              <div className='w-full'>
                <label htmlFor="password" className='medium-14'>
                  Mật khẩu mới
                </label>
                <input 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  type="password" 
                  placeholder='Nhập mật khẩu mới' 
                  className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1' 
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mật khẩu phải có ít nhất 8 ký tự
                </p>
              </div>
              
              <div className='w-full'>
                <label htmlFor="confirmPassword" className='medium-14'>
                  Xác nhận mật khẩu
                </label>
                <input 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  value={confirmPassword} 
                  type="password" 
                  placeholder='Xác nhận mật khẩu mới' 
                  className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1' 
                  required
                />
              </div>
              
              <button 
                type='submit' 
                className='btn-dark w-full mt-5 !py-[7px] !rounded'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
              
              <div className='w-full flex flex-col gap-y-3 medium-14'>
                <div 
                  onClick={() => navigate('/login')} 
                  className='underline cursor-pointer hover:text-secondaryOne'
                >
                  Quay lại Đăng nhập
                </div>
              </div>
            </form>
          ) : (
            <div className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
              <div className='w-16 h-16 bg-green-100 rounded-full flexCenter mb-4'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className='bold-24 text-center'>Đặt lại mật khẩu thành công</h3>
              <p className='text-center text-gray-500'>
                Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
              </p>
              <button 
                onClick={() => navigate('/login')} 
                className='btn-secondary mt-6'
              >
                Đi đến Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ResetPassword