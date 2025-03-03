// src/pages/Login.jsx - ENTIRE UPDATED FILE
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import loginImg from "../assets/login.png";
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

// Schema for login form
const loginSchema = yup.object().shape({
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup.string()
    .required('Password is required')
});

// Schema for registration form
const registerSchema = yup.object().shape({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

const Login = () => {
  const { token, navigate, loading, authError, loginUser, registerUser } = useContext(ShopContext);
  const [currState, setCurrState] = useState('Login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      await registerUser(data);
    } else {
      await loginUser(data);
    }
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
      if (strength <= 2) return 'Weak';
      if (strength <= 3) return 'Fair';
      if (strength <= 4) return 'Good';
      return 'Strong';
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
              {authError && (
                <div className="mt-2 text-red-500 text-sm">
                  {authError}
                </div>
              )}
            </div>
            
            {currState === "Sign Up" && (
              <div className='w-full'>
                <label htmlFor="name" className='medium-14'>
                  Name
                </label>
                <input 
                  {...register("name")} 
                  type="text" 
                  placeholder='Name' 
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
                placeholder='Email' 
                className={`w-full px-3 py-1 ring-1 ${errors.email ? 'ring-red-500' : 'ring-slate-900/10'} rounded bg-primary mt-1`} 
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className='w-full'>
              <label htmlFor="password" className='medium-14'>
                Password
              </label>
              <div className="relative">
                <input 
                  {...register("password")} 
                  type={showPassword ? "text" : "password"} 
                  placeholder='Password' 
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    {...register("confirmPassword")} 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder='Confirm Password' 
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
              type='submit' 
              className='btn-dark w-full mt-5 !py-[7px] !rounded flex justify-center'
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                currState === "Sign Up" ? 'Sign Up' : 'Login'
              )}
            </button>
            
            <div className='w-full flex flex-col gap-y-3 medium-14'>
              <div 
                onClick={() => navigate('/forgot-password')} 
                className='underline cursor-pointer hover:text-secondaryOne'
              >
                Quên mật khẩu?
              </div>
              {currState === 'Login' ? (
                <div className='underline'>Don't have an account? <span onClick={() => setCurrState('Sign Up')} className='cursor-pointer hover:text-secondaryOne'>Create account</span></div>
              ) : (
                <div className='underline'>Already have an account? <span onClick={() => setCurrState('Login')} className='cursor-pointer hover:text-secondaryOne'>Login</span></div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login