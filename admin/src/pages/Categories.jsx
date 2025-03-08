import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import { backend_url } from '../App'
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toastConfig'
import upload_icon from "../assets/upload_icon.png"

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  // State cho form thêm/cập nhật danh mục
  const [isEditing, setIsEditing] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  
  useEffect(() => {
    getCategories()
  }, [])
  
  // Lấy danh sách danh mục
  const getCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backend_url}/api/category/list`)
      if (response.data.success) {
        setCategories(response.data.categories)
      } else {
        showErrorToast(response.data.message || "Không thể tải danh sách danh mục")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      showErrorToast("Đã xảy ra lỗi khi tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }
  
  // Xử lý thay đổi hình ảnh
  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }
  
  // Xử lý thêm/cập nhật danh mục
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showErrorToast("Vui lòng nhập tên danh mục")
      return
    }
    
    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      
      // Thêm hình ảnh vào formData nếu có
      if (image) {
        formData.append('image', image)
      }
      
      let response
      if (isEditing) {
        // Cập nhật danh mục
        formData.append('id', categoryId)
        response = await axios.post(`${backend_url}/api/category/update`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            token
          }
        })
      } else {
        // Thêm danh mục mới
        response = await axios.post(`${backend_url}/api/category/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            token
          }
        })
      }
      
      if (response.data.success) {
        showSuccessToast(isEditing ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công")
        resetForm()
        getCategories()
      } else {
        showErrorToast(response.data.message || "Không thể lưu danh mục")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      showErrorToast(error.response?.data?.message || "Đã xảy ra lỗi khi lưu danh mục")
    } finally {
      setLoading(false)
    }
  }
  
  // Xử lý xóa danh mục
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return
    }
    
    try {
      setLoading(true)
      const response = await axios.post(`${backend_url}/api/category/delete`, { id }, {
        headers: { token }
      })
      
      if (response.data.success) {
        showSuccessToast("Xóa danh mục thành công")
        getCategories()
      } else {
        showErrorToast(response.data.message || "Không thể xóa danh mục")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      showErrorToast(error.response?.data?.message || "Đã xảy ra lỗi khi xóa danh mục")
    } finally {
      setLoading(false)
    }
  }
  
  // Xử lý cập nhật danh mục
  const handleEdit = (category) => {
    setIsEditing(true)
    setCategoryId(category._id)
    setName(category.name)
    setDescription(category.description)
    
    // Đặt lại hình ảnh và bản xem trước nếu có
    setImage(null)
    setPreviewImage(category.image || null)
  }
  
  // Reset form
  const resetForm = () => {
    setIsEditing(false)
    setCategoryId('')
    setName('')
    setDescription('')
    setImage(null)
    setPreviewImage(null)
  }
  
  return (
    <div className='w-full sm:w-4/5 bg-white p-4 sm:p-10 overflow-y-auto'>
      <h1 className='text-2xl font-bold mb-6'>Quản lý danh mục</h1>
      
      {/* Form thêm/cập nhật danh mục */}
      <div className='bg-gray-100 p-4 rounded-lg mb-6'>
        <h2 className='text-xl font-semibold mb-4'>{isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Tên danh mục</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              required
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700'>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700'>Hình ảnh danh mục</label>
            <div className='mt-2 flex items-center space-x-4'>
              <label htmlFor="category-image" className='cursor-pointer'>
                <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-300 flex items-center justify-center'>
                  {previewImage ? (
                    <img 
                      src={previewImage.startsWith('blob:') ? previewImage : `${backend_url}${previewImage}`} 
                      alt="Hình ảnh danh mục" 
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <img 
                      src={upload_icon} 
                      alt="Upload" 
                      className='h-10 w-10 opacity-60'
                    />
                  )}
                </div>
                <input
                  type="file"
                  id="category-image"
                  onChange={handleChangeImage}
                  className='hidden'
                  accept="image/*"
                />
              </label>
              <div className='text-sm text-gray-500'>
                Nhấp vào hình ảnh để tải lên. <br/>
                {image ? `Đã chọn: ${image.name}` : 'Chưa chọn file nào'}
              </div>
            </div>
          </div>
          
          <div className='flex space-x-4'>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
            >
              {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {isEditing && (
              <button
                type='button'
                onClick={resetForm}
                className='inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Danh sách danh mục */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-indigo-50'>
            <tr>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                Hình ảnh
              </th>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                Tên
              </th>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                Mô tả
              </th>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category._id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {category.image ? (
                      <img 
                        src={`${backend_url}${category.image}`}
                        alt={category.name} 
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium'>
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {category.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {category.description || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => handleEdit(category)}
                      className='text-indigo-600 hover:text-indigo-900 mr-4'
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className='text-red-600 hover:text-red-900'
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='4' className='px-6 py-4 text-center text-sm text-gray-500'>
                  {loading ? 'Đang tải...' : 'Không có danh mục nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Categories 