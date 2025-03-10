import React, { useState } from 'react'
import loginImg from "../assets/login.png"
import { backend_url } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({setToken}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault() // prevent reload the page
    
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu")
      return
    }
    
    setLoading(true)
    
    try {
      console.log('===== CLIENT DEBUGGING =====');
      console.log(`Attempting login with email: ${email}`);
      console.log(`API URL: ${backend_url}/api/user/admin`);
      
      // Log request config trước khi gửi
      const requestConfig = {
        method: 'POST',
        url: `${backend_url}/api/user/admin`,
        data: { email, password: '***HIDDEN***' },
        headers: { 'Content-Type': 'application/json' }
      };
      console.log('Request config:', requestConfig);
      
      const startTime = new Date().getTime();
      
      const response = await axios.post(`${backend_url}/api/user/admin`, {
        email, 
        password
      });
      
      const endTime = new Date().getTime();
      console.log(`Request took ${endTime - startTime}ms to complete`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', { ...response.data, token: response.data.token ? 'TOKEN_EXISTS' : 'NO_TOKEN' });
      
      if (response.data.success) {
        toast.success("Đăng nhập thành công!")
        console.log('Setting token in app state and redirecting...');
        setToken(response.data.token)
      } else {
        console.error('Server returned success: false');
        toast.error(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("===== CLIENT ERROR DETAILS =====");
      console.error("Lỗi đăng nhập:", error);
      
      // Hiển thị thông báo lỗi chi tiết
      if (error.response) {
        // Server trả về response với status code không phải 2xx
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        toast.error(error.response.data?.message || `Lỗi: ${error.response.status} - ${error.response.statusText}`)
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error('No response received:', error.request);
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.")
      } else {
        // Lỗi trong quá trình thiết lập request
        console.error('Request setup error:', error.message);
        toast.error(`Lỗi: ${error.message}`)
      }
      
      // Log thêm thông tin về cấu hình axios
      console.error('Axios defaults:', {
        baseURL: axios.defaults.baseURL,
        timeout: axios.defaults.timeout,
        headers: axios.defaults.headers
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='absolute top-0 left-0 h-full w-full z-50 bg-white'>
      {/* container */}
      <div className='flex h-full w-full'>
        {/* image right side */}
        <div className='w-1/2 hidden sm:block'>
          <img src={loginImg} alt="" className='object-cover h-full w-full'/>
        </div>
        {/* Form side */}
        <div className='flexCenter w-full sm:w-1/2'>
          <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
            <div className='w-full mb-4'>
              <h3 className="bold-32">Admin Panel</h3>
            </div>
            <div className='w-full'>
              <label htmlFor="email" className='medium-15'>Email</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                id="email"
                placeholder='Email' 
                className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1' 
              />
            </div>
            <div className='w-full'>
              <label htmlFor="password" className='medium-15'>Password</label>
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                type="password" 
                id="password"
                placeholder='Password' 
                className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1' 
              />
            </div>
            <button 
              type='submit' 
              className='btn-dark w-full mt-5 !py-[7px] !rounded'
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login