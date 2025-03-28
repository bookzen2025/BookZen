import React from 'react'
import { useState, useEffect } from 'react'
import { backend_url, currency } from "../App"
import axios from "axios"
import { toast } from "react-toastify"
import { TfiPackage } from "react-icons/tfi"


const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    if (!token) {
      return null
    }
    try {
      const response = await axios.post(backend_url + '/api/order/list', {}, { headers: { Authorization: token } })
      console.log(response.data)
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
        if (response.data.orders.length > 0) {
          console.log('Chi tiết đơn hàng đầu tiên:', response.data.orders[0])
          console.log('Địa chỉ đơn hàng:', response.data.orders[0].address)
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backend_url + '/api/order/status', { orderId, status: event.target.value }, { headers: { Authorization: token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div className='px-2 sm:px-8 mt-4 sm:mt-14'>
      <div className='flex flex-col gap-4'>
        {orders.map((order) => (
          <div key={order._id} className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr] gap-4 items-start p-3 text-gray-700 bg-white rounded-lg'>
            <div className='hidden xl:block ring-1 ring-slate-900/5 rounded p-7 bg-primary'>
              <TfiPackage className='text-3xl text-secondary' />
            </div>
            <div>
              <div className='flex items-start gap-1'>
                <div className='medium-14'>Sản phẩm:</div>
                <div className='flex flex-col relative top-0.5'>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p key={index}>
                        {item.name} x {item.quantity}
                      </p>
                    } else {
                      return <p key={index}>
                        {item.name} x {item.quantity}
                      </p>
                    }
                  })}
                </div>
              </div>
              <p><span className='text-tertiary medium-14'>Tên:</span>{order.address.fullName}</p>
              <p><span className='text-tertiary medium-14'>Địa chỉ: </span>
                <span>{order.address.address + ", "}</span>
                <span>{order.address.district + ", " + order.address.province}</span>
              </p>
              <p><span className='text-tertiary medium-14'>Email: </span>{order.address.email}</p>
              <p><span className='text-tertiary medium-14'>Điện thoại: </span>{order.address.phone}</p>
            </div>
            <div>
              <p><span className='text-tertiary medium-14'>Tổng số: </span>{order.items.length}</p>
              <p><span className='text-tertiary medium-14'>Phương thức: </span>{order.paymentMethod}</p>
              <p><span className='text-tertiary medium-14'>Thanh toán: </span>
                <span className={order.payment ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {order.payment ? "Hoàn thành" : "Chưa thanh toán"}
                </span>
              </p>
              <p><span className='text-tertiary medium-14'>Ngày đặt: </span>{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p><span className='text-tertiary medium-14'>Giá: </span>{currency}{order.amount}</p>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='p-1 ring-1 ring-slate-900/5 rounded max-w-36 bg-primary text-xs font-semibold'>
              <option value="Đã đặt hàng">Đã đặt hàng</option>
              <option value="Đang đóng gói">Đang đóng gói</option>
              <option value="Đã giao cho vận chuyển">Đã giao cho vận chuyển</option>
              <option value="Đang giao hàng">Đang giao hàng</option>
              <option value="Đã giao hàng">Đã giao hàng</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders