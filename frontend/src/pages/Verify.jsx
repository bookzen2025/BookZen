import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Footer from '../components/Footer'

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const orderId = searchParams.get('orderId')

  // Verify bank transfer
  const verifyPayment = async (e) => {
    if (e) e.preventDefault()
    
    try {
      if (!token) {
        toast.error("Please login to continue")
        return navigate('/login')
      }
      
      if (!transactionId) {
        toast.error("Transaction ID is required")
        return
      }
      
      setIsSubmitting(true)
      
      const response = await axios.post(
        backendUrl + '/api/order/verify-bank-transfer', 
        { orderId, transactionId, userId: token }, 
        { headers: { token } }
      )
      
      if (response.data.success) {
        setCartItems({})
        toast.success("Payment verified successfully")
        navigate('/orders')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='max-padd-container'>
      <div className='pt-28 pb-16 flex justify-center'>
        <div className='bg-white rounded-xl shadow-md p-8 w-full max-w-md'>
          <h2 className='text-2xl font-bold mb-6 text-center'>Verify Bank Transfer</h2>
          
          {!orderId ? (
            <div className='text-center'>
              <p className='text-red-500'>No order ID provided. Please return to checkout.</p>
              <button 
                onClick={() => navigate('/cart')}
                className='btn-secondary mt-4'
              >
                Return to Cart
              </button>
            </div>
          ) : (
            <>
              <div className='mb-6 p-4 bg-primary rounded-lg'>
                <h3 className='font-medium mb-2'>Payment Instructions</h3>
                <div className='space-y-2 text-sm'>
                  <p><span className='font-medium'>Bank Name:</span> ABC Bank</p>
                  <p><span className='font-medium'>Account Number:</span> 1234-5678-9012-3456</p>
                  <p><span className='font-medium'>Account Holder:</span> Bacala Books</p>
                  <p><span className='font-medium'>SWIFT/BIC:</span> ABCDEFG123</p>
                  <p><span className='font-medium'>Reference:</span> {orderId}</p>
                </div>
              </div>
            
              <form onSubmit={verifyPayment}>
                <div className='mb-4'>
                  <label htmlFor='transactionId' className='block text-sm font-medium mb-1'>
                    Enter Transaction ID
                  </label>
                  <input
                    type='text'
                    id='transactionId'
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder='e.g. TRX123456789'
                    className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Enter the transaction ID from your bank transfer receipt
                  </p>
                </div>
                
                <div className='flex gap-4 mt-6'>
                  <button
                    type='button'
                    onClick={() => navigate('/orders')}
                    className='flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50'
                  >
                    View Orders
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='flex-1 btn-secondary'
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Payment'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </section>
  )
}

export default Verify