// src/pages/ForgotPassword.jsx - ENTIRE UPDATED FILE
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import loginImg from "../assets/login.png";
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

// Schema for forgot password form
const forgotPasswordSchema = yup.object().shape({
  email: yup.string()
    .required('Email là bắt buộc')
    .email('Vui lòng nhập email hợp lệ'),
});

const ForgotPassword = () => {
  const { navigate, loading, authError, forgotPassword } = useContext(ShopContext);
  const [emailSent, setEmailSent] = useState(false);
  
  // Set up form validation
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(forgotPasswordSchema)
  });
  
  // Watch email value for display in success message
  const emailValue = watch('email', '');

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      setEmailSent(true);
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
              <div className='w-full mb-4'>
                <h3 className='bold-36'>Quên mật khẩu</h3>
                <p className='text-gray-500 mt-2'>
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                </p>
                {authError && (
                  <div className="mt-2 text-red-500 text-sm">
                    {authError}
                  </div>
                )}
              </div>
              <div className='w-full'>
                <label htmlFor="email" className='medium-14'>
                  Email
                </label>
                <input 
                  {...register("email")} 
                  type="email" 
                  placeholder='Nhập email của bạn' 
                  className={`w-full px-3 py-1 ring-1 ${errors.email ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1`} 
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <button 
                type='submit' 
                className='btn-dark w-full mt-5 !py-[7px] !rounded flex justify-center'
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Gửi liên kết đặt lại'
                )}
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
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{emailValue}</strong>. 
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