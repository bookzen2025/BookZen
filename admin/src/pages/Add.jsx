import React, { useState, useEffect } from 'react'
import upload_icon from "../assets/upload_icon.png"
import axios from "axios"
import { backend_url } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {

  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [popular, setPopular] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Các trường thông tin sách
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [pages, setPages] = useState('')

  useEffect(() => {
    // Lấy danh sách danh mục từ API khi component được tải
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/category/list`)
        if (response.data.success && response.data.categories.length > 0) {
          setCategories(response.data.categories)
          // Đặt danh mục mặc định là danh mục đầu tiên
          setCategory(response.data.categories[0].name)
        } else {
          toast.warning("Không có danh mục nào. Vui lòng tạo danh mục trước khi thêm sản phẩm.")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Không thể tải danh sách danh mục")
      }
    }
    
    fetchCategories()
  }, [])

  const handleChangeImage = (e) => {
    setImage(e.target.files[0])
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    if (!category) {
      return toast.error("Vui lòng chọn danh mục")
    }
    
    try {
      setLoading(true)
      const formData = new FormData()

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("popular", popular)
      formData.append("image", image)
      
      // Thêm các trường thông tin sách
      formData.append("author", author)
      formData.append("publisher", publisher)
      formData.append("publishedYear", publishedYear)
      formData.append("pages", pages)

      const response = await axios.post(`${backend_url}/api/product/create`, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setPrice('')
        setImage(null)
        setPopular(false)
        setAuthor('')
        setPublisher('')
        setPublishedYear('')
        setPages('')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='px-2 sm:px-8 sm:mt-14 pb-16'>
      <form onSubmit={onSubmitHandler} className='flex flex-col gap-y-3 medium-14 lg:w-[777px]'>
        <div className='w-full'>
          <h5 className='h5'>Product Name</h5>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Write here..' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>
        
        <div className='w-full'>
          <h5 className='h5'>Author</h5>
          <input onChange={(e) => setAuthor(e.target.value)} value={author} type="text" placeholder='Author Name' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>
        
        <div className='w-full'>
          <h5 className='h5'>Product description</h5>
          <textarea onChange={(e) => setDescription(e.target.value)} value={description} type="text" rows={5} placeholder='Write here..' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>
        
        <div className='flex flex-wrap gap-x-6 gap-y-3'>
          {/* categories */}
          <div>
            <h5 className='h5'>Category</h5>
            {categories.length > 0 ? (
              <select 
                onChange={(e) => setCategory(e.target.value)} 
                value={category} 
                className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 sm:w-full text-gray-30'
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            ) : (
              <div className='mt-1 text-red-500'>
                Chưa có danh mục nào. Vui lòng thêm danh mục trước!
                <button
                  type='button'
                  onClick={() => window.location.href = '/categories'}
                  className='ml-2 text-blue-500 underline'
                >
                  Đến trang danh mục
                </button>
              </div>
            )}
          </div>
          
          <div className='flex gap-x-2 pt-2'>
            <label htmlFor="image">
              <img src={image ? URL.createObjectURL(image) : upload_icon} alt="" className='w-14 h-14 aspect-square object-cover ring-1 ring-slate-900/5 bg-white rounded-lg' />
              <input type="file" onChange={handleChangeImage} name='image' id='image' hidden />
            </label>
          </div>
        </div>
        
        <div className='flex flex-wrap gap-x-6 gap-y-3'>
          <div>
            <h5 className='h5'>Price</h5>
            <input onChange={(e) => setPrice(e.target.value)} value={price} type="number" placeholder='Price' min={0} className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white w-20' />
          </div>
          
          <div>
            <h5 className='h5'>Published Year</h5>
            <input onChange={(e) => setPublishedYear(e.target.value)} value={publishedYear} type="number" placeholder='Year' min={1800} max={2025} className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white w-24' />
          </div>
          
          <div>
            <h5 className='h5'>Pages</h5>
            <input onChange={(e) => setPages(e.target.value)} value={pages} type="number" placeholder='Pages' min={1} className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white w-20' />
          </div>
        </div>
        
        <div className='w-full'>
          <h5 className='h5'>Publisher</h5>
          <input onChange={(e) => setPublisher(e.target.value)} value={publisher} type="text" placeholder='Publisher Name' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>
        
        <div className='flexStart gap-2 my-2'>
          <input onChange={(e) => setPopular((prev) => !prev)} type="checkbox" checked={popular} id='popular' />
          <label htmlFor="popular" className='cursor-pointer'>Add to popular</label>
        </div>
        <button type='submit' disabled={loading || categories.length === 0} className='btn-dark mt-3 max-w-44 sm:w-full'>
          {loading ? 'Đang xử lý...' : 'Add Product'}
        </button>
      </form>
    </div>
  )
}

export default Add