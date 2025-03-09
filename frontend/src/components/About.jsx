import React from 'react'
import Title from './Title'
import { TbTruckReturn } from 'react-icons/tb'
import about from '../assets/book_1.png'

const About = () => {
  return (
    <section className='max-padd-container py-12 xl:py-24'>
      {/* container */}
      <div className='flexCenter flex-col gap-16 xl:gap-8 xl:flex-row'>
        {/* Left side */}
        <div className='flex-1'>
          <Title title1={"Khám phá "} title2={"tính năng nổi bật!"} titleStyles={'pb-10'} paraStyles={'!block'}/>
          <div className='flex flex-col items-start gap-y-4'>
            <div className='flexCenter gap-x-4'>
              <div className='h-16 min-w-16 bg-secondaryOne flexCenter rounded-md'>
                <TbTruckReturn className='text-2xl'/>
              </div>
              <div>
                <h4 className='medium-18'>Dễ dàng đổi trả</h4>
                <p>Chính sách đổi trả linh hoạt trong vòng 7 ngày, giúp bạn mua sắm với sự an tâm tuyệt đối.</p>
              </div>
            </div>
            <div className='flexCenter gap-x-4'>
              <div className='h-16 min-w-16 bg-secondaryOne flexCenter rounded-md'>
                <TbTruckReturn className='text-2xl'/>
              </div>
              <div>
                <h4 className='medium-18'>Thanh toán an toàn</h4>
                <p>Đa dạng phương thức thanh toán với bảo mật cao, đảm bảo an toàn cho giao dịch của bạn.</p>
              </div>
            </div>
            <div className='flexCenter gap-x-4'>
              <div className='h-16 min-w-16 bg-secondaryOne flexCenter rounded-md'>
                <TbTruckReturn className='text-2xl'/>
              </div>
              <div>
                <h4 className='medium-18'>Hỗ trợ khách hàng 24/7</h4>
                <p>Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc của bạn mọi lúc mọi nơi.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className='flex-1 flexCenter'>
          <div className='bg-secondaryOne flexCenter p-24 max-h-[33rem] max-w-[33rem] rounded-3xl'>
            <img src={about} alt="aboutImg" height={244} width={244} className='shadow-2xl shadow-slate-900/50 rounded-lg' />
          </div>
        </div>
      </div>
    </section>
  )
}

export default About