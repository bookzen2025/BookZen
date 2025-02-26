import React, { useState } from 'react'
import loginImg from "../assets/login.png"
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ForgotPassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email của bạn")
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await axios.post(backendUrl + '/api/user/forgot-password', { email })
      
      if (response.data.success) {
        setEmailSent(true)
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
          {!emailSent ? (
            <form onSubmit={handleSubmit} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
              <div className='w-full mb-4'>
                <h3 className='bold-36'>Quên mật khẩu</h3>
                <p className='text-gray-500 mt-2'>
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                </p>
              </div>
              <div className='w-full'>
                <label htmlFor="email" className='medium-14'>
                  Email
                </label>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  type="email" 
                  placeholder='Nhập email của bạn' 
                  className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1' 
                  required
                />
              </div>
              <button 
                type='submit' 
                className='btn-dark w-full mt-5 !py-[7px] !rounded'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
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
              <h3 className='bold-24 text-center'>Kiểm tra email của bạn</h3>
              <p className='text-center text-gray-500'>
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>. 
                Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
              </p>
              <button 
                onClick={() => navigate('/login')} 
                className='btn-secondary mt-6'
              >
                Quay lại Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword