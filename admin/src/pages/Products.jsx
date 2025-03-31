import React, { useState, useEffect } from 'react'
import upload_icon from "../assets/upload_icon.png"
import axios from "axios"
import { backend_url, currency } from '../App'
import { toast } from 'react-toastify'
import { TbTrash } from 'react-icons/tb'
import { FaEdit, FaPlus, FaSearch } from 'react-icons/fa'
import { MdOutlineInventory2 } from 'react-icons/md'
import { BiBook } from 'react-icons/bi'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const Products = ({ token }) => {
  // State cho form thêm/chỉnh sửa sản phẩm
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [popular, setPopular] = useState(false)
  const [newArrivals, setNewArrivals] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Các trường thông tin sách
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [pages, setPages] = useState('')
  const [stock, setStock] = useState(0)
  
  // State cho danh sách sản phẩm
  const [products, setProducts] = useState([])
  const [displayProducts, setDisplayProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // State cho chức năng chỉnh sửa
  const [editMode, setEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState('')
  const [activeTab, setActiveTab] = useState('list') // 'list' hoặc 'add'

  // Hàm để lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backend_url}/api/product/list`)
      if (response.data.success) {
        setProducts(response.data.products)
        setDisplayProducts(response.data.products)
      } else {
        toast.error(response.data.message)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Lấy danh sách danh mục từ API khi component được tải
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/category/list`)
        if (response.data.success && response.data.categories.length > 0) {
          setCategories(response.data.categories)
          // Đặt danh mục mặc định là ID của danh mục đầu tiên thay vì tên
          setCategory(response.data.categories[0]._id)
        } else {
          toast.warning("Không có danh mục nào. Vui lòng tạo danh mục trước khi thêm sản phẩm.")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Không thể tải danh sách danh mục")
      }
    }
    
    fetchCategories()
    fetchProducts() // Lấy danh sách sản phẩm khi component được tải
  }, [])

  // Tìm kiếm sản phẩm
  useEffect(() => {
    if (searchTerm === '') {
      setDisplayProducts(products)
    } else {
      const filteredProducts = products.filter(
        product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof product.category === 'string' && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setDisplayProducts(filteredProducts)
    }
  }, [searchTerm, products])

  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const previewURL = URL.createObjectURL(file)
      setImagePreview(previewURL)
    }
  }

  // Hàm reset form sau khi thêm hoặc chỉnh sửa
  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setImage(null)
    setImagePreview(null)
    setPopular(false)
    setNewArrivals(false)
    setAuthor('')
    setPublisher('')
    setPublishedYear('')
    setPages('')
    setStock(0)
    setEditMode(false)
    setCurrentProductId('')
  }

  // Hàm để thêm/chỉnh sửa sản phẩm
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
      formData.append("newArrivals", newArrivals)
      formData.append("stock", stock)
      
      // Chỉ thêm hình ảnh nếu có chọn hình ảnh mới
      if (image) {
        formData.append("image", image)
      }
      
      // Thêm các trường thông tin sách
      formData.append("author", author)
      formData.append("publisher", publisher)
      formData.append("publishedYear", publishedYear)
      formData.append("pages", pages)

      let response
      if (editMode) {
        formData.append("id", currentProductId)
        response = await axios.post(`${backend_url}/api/product/update`, formData, { headers: { Authorization: token } })
      } else {
        response = await axios.post(`${backend_url}/api/product/create`, formData, { headers: { Authorization: token } })
      }
      
      if (response.data.success) {
        toast.success(response.data.message)
        resetForm()
        fetchProducts() // Cập nhật lại danh sách sản phẩm
        setActiveTab('list') // Chuyển về tab danh sách sau khi thêm/sửa thành công
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

  // Hàm để chỉnh sửa sản phẩm
  const handleEdit = (product) => {
    setEditMode(true)
    setCurrentProductId(product._id)
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price)
    // Tìm ID danh mục dựa trên tên
    const categoryObj = categories.find(cat => cat.name === product.category)
    setCategory(categoryObj?._id || '')
    setPopular(product.popular || false)
    setNewArrivals(product.newArrivals || false)
    setAuthor(product.author || '')
    setPublisher(product.publisher || '')
    setPublishedYear(product.publishedYear || '')
    setPages(product.pages || '')
    setStock(product.stock || 0)
    setImagePreview(product.image)
    setActiveTab('add') // Chuyển qua tab thêm/sửa sản phẩm
  }

  // Hàm để xóa sản phẩm
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(`${backend_url}/api/product/delete`, { id }, { headers: { Authorization: token } })
      if (response.data.success) {
        toast.success(response.data.message)
        // Nếu đang chỉnh sửa sản phẩm bị xóa, reset form
        if (currentProductId === id) {
          resetForm()
        }
        await fetchProducts()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Hàm cập nhật nhanh tồn kho
  const handleUpdateStock = async (id, newStock) => {
    try {
      const response = await axios.post(
        `${backend_url}/api/product/update-stock`, 
        { id, stock: newStock }, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success("Cập nhật tồn kho thành công")
        await fetchProducts() // Cập nhật lại danh sách sản phẩm
      } else {
        toast.error(response.data.message || "Cập nhật thất bại")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Thêm hàm helper để lấy tên danh mục từ ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId;
  };

  // Form thêm/sửa sản phẩm
  const renderProductForm = () => (
    <Card title={editMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}>
      <form onSubmit={onSubmitHandler} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-body font-medium text-textPrimary mb-2">Tên sản phẩm</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-body font-medium text-textPrimary mb-2">Danh mục</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                required
              >
                {categories.map((cat, index) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-body font-medium text-textPrimary mb-2">Giá (VNĐ)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-body font-medium text-textPrimary mb-2">Tồn kho</label>
              <input
                type="number"
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-body font-medium text-textPrimary mb-2">Tác giả</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div>
              <label htmlFor="publisher" className="block text-body font-medium text-textPrimary mb-2">Nhà xuất bản</label>
              <input
                type="text"
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            <div>
              <label htmlFor="image" className="block text-body font-medium text-textPrimary mb-2">Hình ảnh</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-20 rounded-card p-6 h-40 relative">
                {imagePreview ? (
                  <div className="h-full w-full relative">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 bg-error text-white rounded-full p-1 text-xs"
                      onClick={() => {
                        setImage(null)
                        setImagePreview(null)
                      }}
                    >
                      <TbTrash />
                    </button>
                  </div>
                ) : (
                  <>
                    <img src={upload_icon} alt="upload" className="w-10 h-10 mb-2" />
                    <p className="text-small text-textSecondary">Kéo thả hoặc chọn hình ảnh</p>
                  </>
                )}
                <input
                  type="file"
                  id="image"
                  onChange={handleChangeImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                />
              </div>
            </div>

            <div>
              <label htmlFor="publishedYear" className="block text-body font-medium text-textPrimary mb-2">Năm xuất bản</label>
              <input
                type="number"
                id="publishedYear"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div>
              <label htmlFor="pages" className="block text-body font-medium text-textPrimary mb-2">Số trang</label>
              <input
                type="number"
                id="pages"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 text-secondary focus:ring-secondary/50 rounded"
                />
                <label htmlFor="popular" className="ml-2 text-body text-textPrimary">Phổ biến</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newArrivals"
                  checked={newArrivals}
                  onChange={(e) => setNewArrivals(e.target.checked)}
                  className="w-4 h-4 text-secondary focus:ring-secondary/50 rounded"
                />
                <label htmlFor="newArrivals" className="ml-2 text-body text-textPrimary">Mới về</label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-body font-medium text-textPrimary mb-2">Mô tả</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full border border-gray-10 rounded-button py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => {
              resetForm()
              setActiveTab('list')
            }}
            className="px-4 py-2 border border-gray-10 rounded-button text-textPrimary hover:bg-gray-10 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-secondary text-white rounded-button hover:bg-secondary/90 transition-all"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              editMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'
            )}
          </button>
        </div>
      </form>
    </Card>
  )

  // Bảng danh sách sản phẩm
  const renderProductsTable = () => (
    <Card 
      title="Danh sách sản phẩm"
      action={
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-10 rounded-button py-2 pl-10 pr-4 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setActiveTab('add')
            }}
            className="bg-secondary text-white px-4 py-2 rounded-button flex items-center justify-center hover:bg-secondary/90 transition-all"
          >
            <FaPlus className="mr-2" /> Thêm sản phẩm
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-10">
          <BiBook className="mx-auto text-4xl text-gray-20 mb-2" />
          <p className="text-textSecondary">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-10">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-small font-medium text-textSecondary">Sản phẩm</th>
                  <th className="py-3 px-4 text-left text-small font-medium text-textSecondary">Danh mục</th>
                  <th className="py-3 px-4 text-left text-small font-medium text-textSecondary">Giá</th>
                  <th className="py-3 px-4 text-center text-small font-medium text-textSecondary">Tồn kho</th>
                  <th className="py-3 px-4 text-right text-small font-medium text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-10">
                {displayProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-10/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-card object-cover mr-3" 
                        />
                        <div>
                          <p className="font-medium text-textPrimary">{product.name}</p>
                          <p className="text-small text-textSecondary">{product.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-small">
                        {typeof product.category === 'string' ? getCategoryName(product.category) : product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{currency}{Number(product.price).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateStock(product._id, Math.max(0, (product.stock || 0) - 1))}
                          className="w-6 h-6 rounded bg-gray-10 hover:bg-gray-20 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-medium">{product.stock || 0}</span>
                        <button
                          onClick={() => handleUpdateStock(product._id, (product.stock || 0) + 1)}
                          className="w-6 h-6 rounded bg-gray-10 hover:bg-gray-20 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                              removeProduct(product._id)
                            }
                          }}
                          className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                        >
                          <TbTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-small text-textSecondary">
            Hiển thị {displayProducts.length} trên tổng số {products.length} sản phẩm
          </div>
        </>
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý sản phẩm" 
        subtitle="Quản lý danh sách sản phẩm của cửa hàng" 
      />

      <div className="bg-white rounded-button p-1 inline-flex mb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-button flex items-center ${
            activeTab === 'list' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
          }`}
        >
          <MdOutlineInventory2 className="mr-2" /> Danh sách
        </button>
        <button
          onClick={() => {
            resetForm()
            setActiveTab('add')
          }}
          className={`px-4 py-2 rounded-button flex items-center ${
            activeTab === 'add' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
          }`}
        >
          <FaPlus className="mr-2" /> Thêm mới
        </button>
      </div>

      {activeTab === 'list' ? renderProductsTable() : renderProductForm()}
    </div>
  )
}

export default Products 