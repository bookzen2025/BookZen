import React, { useState, useEffect } from 'react'
import { backend_url } from "../App"
import axios from "axios"
import { toast } from "react-toastify"
import { FaFolderOpen, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
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

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backend_url}/api/category/list`)
      
      if (response.data.success) {
        setCategories(response.data.categories)
        setFilteredCategories(response.data.categories)
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

  const addCategoryHandler = async (event) => {
    event.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(
        `${backend_url}/api/category/create`, 
        { name: categoryName }, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success('Thêm danh mục thành công')
        setCategoryName('')
        setIsAdding(false)
        await fetchCategories()
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

  const editCategoryHandler = async (event) => {
    event.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      setLoading(true)
      const response = await axios.put(
        `${backend_url}/api/category/update`, 
        { _id: editId, name: categoryName }, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success('Cập nhật danh mục thành công')
        setCategoryName('')
        setIsEditing(false)
        setEditId(null)
        await fetchCategories()
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

  const handleEdit = (category) => {
    setCategoryName(category.name)
    setEditId(category._id)
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete(
        `${backend_url}/api/category/delete`, 
        { 
          headers: { Authorization: token },
          data: { _id: id }
        }
      )
      
      if (response.data.success) {
        toast.success('Xóa danh mục thành công')
        await fetchCategories()
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

  const handleAddNew = () => {
    setCategoryName('')
    setIsAdding(true)
    setIsEditing(false)
    setEditId(null)
  }

  const handleCancel = () => {
    setCategoryName('')
    setIsAdding(false)
    setIsEditing(false)
    setEditId(null)
  }

  useEffect(() => {
    fetchCategories()
  }, [token])

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
              <input
                type="text"
                placeholder="Tên danh mục"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary-dark transition-colors"
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
              <input
                type="text"
                placeholder="Tên danh mục"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-info text-white rounded-button hover:bg-info-dark transition-colors"
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
                        <div className="p-2 bg-secondary/10 rounded-full">
                          <FaFolderOpen className="text-secondary" />
                        </div>
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