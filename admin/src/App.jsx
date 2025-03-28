import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Users from './pages/Users'
import Promotions from './pages/Promotions'
import Inventory from './pages/Inventory'
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login'
import axios from 'axios'

export const backend_url = import.meta.env.VITE_BACKEND_URL
export const currency = "₫"

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || "")
  const [isVerifying, setIsVerifying] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Lưu token vào localStorage khi thay đổi
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      // Cấu hình axios để tự động gửi token trong header Authorization
      axios.defaults.headers.common['Authorization'] = token;
    } else {
      localStorage.removeItem('token')
      // Xóa header Authorization khi không có token
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token])

  // Kiểm tra tính hợp lệ của token
  useEffect(() => {
    const verifyToken = async () => {
      setIsVerifying(true)
      
      // Nếu không có token, không cần kiểm tra
      if (!token) {
        setIsVerifying(false)
        return
      }
      
      try {
        // Gọi API để xác thực token
        const response = await axios.get(`${backend_url}/api/user/verify-admin`)
        
        if (!response.data.success) {
          // Token không hợp lệ hoặc đã hết hạn
          setToken("")
        }
      } catch (error) {
        console.error("Token verification failed:", error)
        // Xóa token nếu xác thực thất bại
        setToken("")
      } finally {
        setIsVerifying(false)
      }
    }
    
    verifyToken()
  }, [token])

  // Hiển thị màn hình loading trong quá trình xác thực
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-textSecondary">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-background text-textPrimary min-h-screen">
      <ToastContainer 
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Bounce}
      />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar setToken={setToken}/>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            
            <div className="flex-1 overflow-auto px-6 py-6">
              <div className="container mx-auto">
                <Routes>
                  <Route path='/' element={<Dashboard token={token}/>} />
                  <Route path='/products' element={<Products token={token}/>} />
                  <Route path='/inventory' element={<Inventory token={token}/>} />
                  <Route path='/orders' element={<Orders token={token}/>} />
                  <Route path='/categories' element={<Categories token={token}/>} />
                  <Route path='/users' element={<Users token={token}/>} />
                  <Route path='/promotions' element={<Promotions token={token}/>} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App