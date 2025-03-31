// src/pages/Login.jsx - ENTIRE UPDATED FILE
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import loginImg from "../assets/login.png";
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

// Schema for login form
const loginSchema = yup.object().shape({
  email: yup.string()
    .required('Email là bắt buộc')
    .email('Vui lòng nhập email hợp lệ'),
  password: yup.string()
    .required('Mật khẩu là bắt buộc')
});

// Schema for registration form
const registerSchema = yup.object().shape({
  name: yup.string()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: yup.string()
    .required('Email là bắt buộc')
    .email('Vui lòng nhập email hợp lệ'),
  password: yup.string()
    .required('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ hoa')
    .matches(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ thường')
    .matches(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
  confirmPassword: yup.string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
});

const Login = () => {
  const { token, navigate, loading, authError, loginUser, registerUser } = useContext(ShopContext);
  const [currState, setCurrState] = useState('Login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Set up form validation based on current state
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(currState === 'Login' ? loginSchema : registerSchema)
  });

  // Watch password value for strength meter
  const password = watch('password', '');

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (currState === "Sign Up") {
      const result = await registerUser(data);
      if (result.success) {
        // Đặt cờ thành công
        setRegistrationSuccess(true);
        // Hiển thị thông báo thành công
        toast.success(result.message);
        // Chuyển sang chế độ đăng nhập
        setCurrState("Login");
        // Reset form để người dùng có thể đăng nhập
        reset();
      }
    } else {
      await loginUser(data);
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/auth/google`;
  };

  // Reset form when switching between login and signup
  useEffect(() => {
    reset();
  }, [currState, reset]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Kiểm tra lỗi đăng nhập từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error === 'auth_failed') {
      // Xóa tham số error khỏi URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

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
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
            <div className='w-full mb-4'>
              <h3 className='bold-36'>{currState}</h3>
              {registrationSuccess && currState === "Login" && (
                <div className="mt-2 text-green-500 text-sm">
                  Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
                </div>
              )}
              {authError && (
                <div className="mt-2 text-red-500 text-sm">
                  {authError}
                </div>
              )}
            </div>
            
            {currState === "Sign Up" && (
              <div className='w-full'>
                <label htmlFor="name" className='medium-14'>
                  Tên
                </label>
                <input 
                  {...register("name")} 
                  type="text" 
                  placeholder='Nhập tên' 
                  className={`w-full px-3 py-1 ring-1 ${errors.name ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1`} 
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
            )}
            
            <div className='w-full'>
              <label htmlFor="email" className='medium-14'>
                Email
              </label>
              <input 
                {...register("email")} 
                type="email" 
                placeholder='Nhập email' 
                className={`w-full px-3 py-1 ring-1 ${errors.email ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1`} 
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className='w-full'>
              <label htmlFor="password" className='medium-14'>
                Mật khẩu
              </label>
              <div className="relative">
                <input 
                  {...register("password")} 
                  type={showPassword ? "text" : "password"} 
                  placeholder='Nhập mật khẩu' 
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
              
              {/* Only show password strength meter during registration */}
              {currState === "Sign Up" && <PasswordStrengthMeter password={password} />}
            </div>
            
            {/* Confirm Password field for Sign Up */}
            {currState === "Sign Up" && (
              <div className='w-full'>
                <label htmlFor="confirmPassword" className='medium-14'>
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input 
                    {...register("confirmPassword")} 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder='Xác nhận mật khẩu' 
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
            )}
            
            <button 
              type="submit" 
              className='w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : currState === "Login" ? 'Đăng nhập' : 'Đăng ký'}
            </button>
            
            {/* Nút đăng nhập bằng Google */}
            <div className="w-full">
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">Hoặc</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-50 transition-all duration-300"
              >
                <FcGoogle className="text-xl" />
                <span>Đăng nhập bằng Google</span>
              </button>
            </div>
            
            {/* Toggle between Login and Sign Up */}
            <div className='w-full text-center mt-4'>
              <p className='text-sm'>
                {currState === "Login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <button 
                  type="button"
                  onClick={() => setCurrState(currState === "Login" ? "Sign Up" : "Login")}
                  className='text-blue-600 hover:underline'
                >
                  {currState === "Login" ? "Đăng ký" : "Đăng nhập"}
                </button>
              </p>
              
              {/* Forgot Password link */}
              {currState === "Login" && (
                <p className='text-sm mt-2'>
                  <button 
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className='text-blue-600 hover:underline'
                  >
                    Quên mật khẩu?
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;