import React, { useEffect } from 'react'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import About from '../components/About'
import PopularBooks from '../components/PopularBooks'
import Features from '../components/Features'
import Footer from '../components/Footer'
import { toast } from 'react-toastify'

const Home = () => {
  // Kiểm tra và hiển thị thông báo đăng nhập thành công một lần duy nhất
  useEffect(() => {
    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      toast.success('Đăng nhập thành công!');
      localStorage.removeItem('showLoginSuccess');
    }
  }, []);

  return (
    <>
      <Hero />
      <NewArrivals />
      <About />
      <PopularBooks />
      <Features />
      <div className='max-padd-container bg-white'>
        <Footer />
      </div>
    </>
  )
}

export default Home