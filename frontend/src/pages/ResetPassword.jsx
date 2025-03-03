// src/pages/ResetPassword.jsx - ENTIRE UPDATED FILE
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import loginImg from "../assets/login.png";
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

// Schema for password reset form
const resetPasswordSchema = yup.object().shape({
  password: yup.string()
    .required('Mật khẩu mới là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ hoa')
    .matches(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ thường')
    .matches(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
  confirmPassword: yup.string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
});

const ResetPassword = () => {
  const { navigate, loading, authError, resetPassword } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [requirements, setRequirements] = useState([]);
  
  // Set up form validation
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(resetPasswordSchema)
  });
  
  // Watch password for strength meter
  const password = watch('password', '');

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data) => {
    const result = await resetPassword(token, data.password);
    if (result.success) {
      setResetSuccess(true);
    } else if (result.code === 'WEAK_PASSWORD') {
      setRequirements(result.requirements || []);
    }
  };

  // Password strength meter component
  const PasswordStrengthMeter = ({ password }) => {
    // Calculate password strength
    const getPasswordStrength = (password) => {
      let strength = 0;
      
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
      
      return strength;
    };
    
    const strength = getPasswordStrength(password || '');
    
    // Determine color and label based on strength
    const getStrengthColor = (strength) => {
      if (strength === 0) return 'bg-gray-200';
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 3) return 'bg-yellow-500';
      if (strength <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    };
    
    const getStrengthLabel = (strength) => {
      if (strength === 0) return '';
      if (strength <= 2) return 'Yếu';
      if (strength <= 3) return 'Trung bình';
      if (strength <= 4) return 'Tốt';
      return 'Mạnh';
    };
    
    return (
      <div className="mt-1">
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= strength ? getStrengthColor(strength) : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {password && (
          <p className={`text-xs ${
            strength <= 2 ? 'text-red-500' : 
            strength <= 3 ? 'text-yellow-500' : 
            strength <= 4 ? 'text-blue-500' : 
            'text-green-500'
          }`}>
            {getStrengthLabel(strength)}
          </p>
        )}
      </div>
    );
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
          {!resetSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
              <div className='w-full mb-4'>
                <h3 className='bold-36'>Đặt lại mật khẩu</h3>
                <p className='text-gray-500 mt-2'>
                  Nhập mật khẩu mới của bạn bên dưới.
                </p>
                {authError && (
                  <div className="mt-2 text-red-500 text-sm">
                    {authError}
                  </div>
                )}
                
                {requirements.length > 0 && (
                  <div className="mt-2 text-red-500 text-sm">
                    <p>Mật khẩu phải:</p>
                    <ul className="list-disc ml-5">
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className='w-full'>
                <label htmlFor="password" className='medium-14'>
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input 
                    {...register("password")} 
                    type={showPassword ? "text" : "password"} 
                    placeholder='Nhập mật khẩu mới' 
                    className={`w-full px-3 py-1 ring-1 ${errors.password ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1 pr-10`} 
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
                
                <PasswordStrengthMeter password={password} />
              </div>
              
              <div className='w-full'>
                <label htmlFor="confirmPassword" className='medium-14'>
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input 
                    {...register("confirmPassword")} 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder='Xác nhận mật khẩu mới' 
                    className={`w-full px-3 py-1 ring-1 ${errors.confirmPassword ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1 pr-10`} 
                  />
                  <button 
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
                  'Đặt lại mật khẩu'
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