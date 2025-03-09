import React from 'react'
import filter from "../assets/features/filter.png"
import rating from "../assets/features/rating.png"
import wishlist from "../assets/features/wishlist.png"
import secure from "../assets/features/secure.png"

const Features = () => {
  return (
    <section className='max-padd-container py-16'>
      <div className='max-padd-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-12'>
        <div className='flexCenter flex-col gap-3'>
          <img src={filter} alt="featureIcon" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Tìm kiếm và lọc nâng cao</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Dễ dàng tìm kiếm sách theo tên, tác giả, thể loại hoặc khoảng giá.</p>
        </div>
        <div className='flexCenter flex-col gap-3'>
          <img src={rating} alt="featureIcon" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Đánh giá và xếp hạng</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Khách hàng có thể chia sẻ đánh giá, xếp hạng sách và hướng dẫn người đọc khác.</p>
        </div>
        <div className='flexCenter flex-col gap-3'>
          <img src={wishlist} alt="featureIcon" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Danh sách yêu thích</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Lưu sách vào danh sách yêu thích để mua sau hoặc truy cập dễ dàng.</p>
        </div>
        <div className='flexCenter flex-col gap-3'>
          <img src={secure} alt="featureIcon" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Thanh toán trực tuyến an toàn</h5>
            <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Thanh toán dễ dàng với nhiều phương thức thanh toán an toàn.</p>
        </div>
      </div>
    </section>
  )
}

export default Features