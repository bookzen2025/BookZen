import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { backend_url } from "../App"
import axios from "axios"
import { toast } from "react-toastify"
import { FaFolderOpen, FaEdit, FaTrash, FaPlus, FaSearch, FaUpload, FaImage } from "react-icons/fa"
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCategories, setFilteredCategories] = useState([])
  const [categoryImage, setCategoryImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log("Fetching categories...")
      const response = await axios.get(`${backend_url}/api/category/list`)
      
      if (response.data.success) {
        console.log("Categories fetched successfully:", response.data.categories)
        setCategories(response.data.categories)
        setFilteredCategories(response.data.categories)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log("Error fetching categories:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Lọc danh mục khi searchTerm thay đổi
  useEffect(() => {
    if (!categories.length) return

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(term)
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  // Xử lý rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      // Dọn dẹp URL khi unmount component
      if (imagePreview && !imagePreview.startsWith(backend_url)) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview, backend_url])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước hình ảnh không được vượt quá 2MB')
      return
    }

    // Dọn dẹp URL cũ trước khi tạo mới
    if (imagePreview && !imagePreview.startsWith(backend_url)) {
      URL.revokeObjectURL(imagePreview)
    }

    setCategoryImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addCategoryHandler = async (event) => {
    event.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('name', categoryName)
      if (categoryImage) {
        formData.append('image', categoryImage)
      }
      
      console.log("Adding category with name:", categoryName)
      console.log("Has image:", categoryImage !== null)
      
      const response = await axios.post(
        `${backend_url}/api/category/create`, 
        formData, 
        { 
          headers: { 
            Authorization: token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      if (response.data.success) {
        toast.success('Thêm danh mục thành công')
        // Dọn dẹp URL khi không còn sử dụng nữa
        if (imagePreview && !imagePreview.startsWith(backend_url)) {
          URL.revokeObjectURL(imagePreview)
        }
        setCategoryName('')
        setCategoryImage(null)
        setImagePreview('')
        setIsAdding(false)
        await fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log("Error adding category:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const editCategoryHandler = async (event) => {
    event.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('id', editId)
      formData.append('name', categoryName)
      if (categoryImage) {
        formData.append('image', categoryImage)
      }
      
      console.log("Editing category with ID:", editId)
      console.log("New name:", categoryName)
      console.log("Has new image:", categoryImage !== null)
      
      const response = await axios.post(
        `${backend_url}/api/category/update`, 
        formData, 
        { 
          headers: { 
            Authorization: token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      if (response.data.success) {
        toast.success('Cập nhật danh mục thành công')
        // Dọn dẹp URL khi không còn sử dụng nữa
        if (imagePreview && !imagePreview.startsWith(backend_url)) {
          URL.revokeObjectURL(imagePreview)
        }
        setCategoryName('')
        setCategoryImage(null)
        setImagePreview('')
        setIsEditing(false)
        setEditId(null)
        await fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log("Error updating category:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    // Dọn dẹp URL trước khi gán URL mới
    if (imagePreview && !imagePreview.startsWith(backend_url)) {
      URL.revokeObjectURL(imagePreview)
    }
    setCategoryName(category.name)
    setEditId(category._id)
    setIsEditing(true)
    setIsAdding(false)
    if (category.image) {
      setImagePreview(`${backend_url}${category.image}`)
    } else {
      setImagePreview('')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return
    }

    try {
      setLoading(true)
      console.log("Deleting category with ID:", id)
      
      const response = await axios.post(
        `${backend_url}/api/category/delete`, 
        { id: id },
        { headers: { Authorization: token } }
      )
      
      console.log("Delete response:", response.data)
      
      if (response.data.success) {
        toast.success('Xóa danh mục thành công')
        await fetchCategories()
      } else {
        toast.error(response.data.message || 'Không thể xóa danh mục')
      }
    } catch (error) {
      console.log("Error deleting category:", error)
      toast.error(error.message || 'Đã xảy ra lỗi khi xóa danh mục')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    // Dọn dẹp URL trước khi reset state
    if (imagePreview && !imagePreview.startsWith(backend_url)) {
      URL.revokeObjectURL(imagePreview)
    }
    setCategoryName('')
    setCategoryImage(null)
    setImagePreview('')
    setIsAdding(true)
    setIsEditing(false)
    setEditId(null)
  }

  const handleCancel = () => {
    // Dọn dẹp URL trước khi reset state
    if (imagePreview && !imagePreview.startsWith(backend_url)) {
      URL.revokeObjectURL(imagePreview)
    }
    setCategoryName('')
    setCategoryImage(null)
    setImagePreview('')
    setIsAdding(false)
    setIsEditing(false)
    setEditId(null)
  }

  useEffect(() => {
    fetchCategories()
  }, [token])

  // Cách tiếp cận tối giản hơn, không sử dụng ReactDOM.render vì có thể
  // gây vấn đề hiệu suất và không tương thích với React 18+
  const renderFallbackIcon = () => (
    <div className="p-2 bg-secondary/10 rounded-full">
      <FaFolderOpen className="text-secondary" />
    </div>
  )
  
  const removeImage = (e) => {
    e.stopPropagation()
    // Dọn dẹp URL khi xóa hình ảnh
    if (imagePreview && !imagePreview.startsWith(backend_url)) {
      URL.revokeObjectURL(imagePreview)
    }
    setCategoryImage(null)
    setImagePreview('')
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý danh mục" 
        subtitle="Thêm, sửa và xóa danh mục sản phẩm"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              className="p-2 bg-secondary/10 text-secondary rounded-button hover:bg-secondary/20 transition-colors"
              title="Làm mới"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary-dark transition-colors"
            >
              <FaPlus size={14} />
              <span>Thêm danh mục mới</span>
            </button>
          </div>
        }
      />

      {/* Form thêm danh mục mới */}
      {isAdding && (
        <Card>
          <form onSubmit={addCategoryHandler} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <FaFolderOpen className="text-secondary text-xl" />
              </div>
              <h3 className="text-body font-heading">Thêm danh mục mới</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="w-full md:w-2/3 space-y-4">
                <input
                  type="text"
                  placeholder="Tên danh mục"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  autoFocus
                />
                <div className="relative border border-dashed border-gray-10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-secondary/50 transition-colors"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <FaUpload className="text-2xl text-gray-20 mb-2" />
                  <p className="text-textSecondary">Nhấp để tải lên hình ảnh danh mục</p>
                  <p className="text-xs text-gray-20 mt-1">PNG, JPG hoặc GIF (Tối đa 2MB)</p>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col">
                <div className="flex-1 border border-gray-10 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <div className="relative h-full">
                      <img 
                        src={imagePreview} 
                        alt="Hình ảnh xem trước" 
                        className="w-full h-full object-contain" 
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-error/70 text-white rounded-full hover:bg-error transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-5 p-4">
                      <FaImage className="text-4xl text-gray-20" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary-dark transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Thêm danh mục'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Form chỉnh sửa danh mục */}
      {isEditing && (
        <Card>
          <form onSubmit={editCategoryHandler} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-full">
                <FaEdit className="text-info text-xl" />
              </div>
              <h3 className="text-body font-heading">Chỉnh sửa danh mục</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="w-full md:w-2/3 space-y-4">
                <input
                  type="text"
                  placeholder="Tên danh mục"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  autoFocus
                />
                <div className="relative border border-dashed border-gray-10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-info/50 transition-colors"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <FaUpload className="text-2xl text-gray-20 mb-2" />
                  <p className="text-textSecondary">Nhấp để cập nhật hình ảnh danh mục</p>
                  <p className="text-xs text-gray-20 mt-1">PNG, JPG hoặc GIF (Tối đa 2MB)</p>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col">
                <div className="flex-1 border border-gray-10 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <div className="relative h-full">
                      <img 
                        src={imagePreview} 
                        alt="Hình ảnh xem trước" 
                        className="w-full h-full object-contain" 
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-error/70 text-white rounded-full hover:bg-error transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-5 p-4">
                      <FaImage className="text-4xl text-gray-20" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-info text-white rounded-button hover:bg-info-dark transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Cập nhật'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      )}

      {loading && !isAdding && !isEditing ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <FaFolderOpen className="mx-auto text-5xl text-gray-20 mb-3" />
            <p className="text-textSecondary mb-1">Không tìm thấy danh mục nào</p>
            <p className="text-small text-gray-20">Thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-10">
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Tên danh mục</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">ID</th>
                  <th className="px-4 py-3 text-right font-medium text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-10 hover:bg-gray-5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center">
                            {/* Sử dụng onError inline để xử lý lỗi hình ảnh */}
                            <img 
                              src={`${backend_url}${category.image}`} 
                              alt={category.name}
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                // Ẩn hình ảnh lỗi và hiển thị fallback icon
                                e.target.style.display = 'none';
                                e.target.parentNode.classList.add('fallback-active');
                                // Nếu chưa có icon fallback, thêm vào
                                if (!e.target.parentNode.querySelector('.fallback-icon')) {
                                  const iconWrapper = document.createElement('div');
                                  iconWrapper.className = 'w-full h-full flex items-center justify-center fallback-icon';
                                  iconWrapper.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="text-secondary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"></path></svg>';
                                  e.target.parentNode.appendChild(iconWrapper);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          renderFallbackIcon()
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-textSecondary">{category._id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-info/10 text-info rounded-full hover:bg-info/20 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 bg-error/10 text-error rounded-full hover:bg-error/20 transition-colors"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Categories 