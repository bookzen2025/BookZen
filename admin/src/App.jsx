import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Users from './pages/Users'
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login'

export const backend_url = import.meta.env.VITE_BACKEND_URL
export const currency = "₫"

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "")

  useEffect(()=>{
    localStorage.setItem('token', token)
  }, [token])

  return (
    <main>
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
        <div className='bg-primary text-[#404040]'>
          <div className='mx-auto max-w-[1440px] flex flex-col sm:flex-row'>
            <Sidebar setToken={setToken}/>
            <Routes>
              <Route path='/' element={<Dashboard token={token}/>} />
              <Route path='/add' element={<Add token={token}/>} />
              <Route path='/list' element={<List token={token}/>} />
              <Route path='/orders' element={<Orders token={token}/>} />
              <Route path='/categories' element={<Categories token={token}/>} />
              <Route path='/users' element={<Users token={token}/>} />
            </Routes>
          </div>
        </div>
      )}
    </main>
  )
}

export default App