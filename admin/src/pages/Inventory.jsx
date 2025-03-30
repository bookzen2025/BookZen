import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url, currency } from '../App';
import { toast } from 'react-toastify';
import { FaArchive, FaEdit, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

// File: Inventory.jsx
// Trang quản lý hàng tồn kho, cho phép xem và cập nhật tồn kho của tất cả sản phẩm
// Cải thiện giao diện: Thêm hiệu ứng animation, cải thiện hover, thiết kế tổng thể

const Inventory = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockValue, setStockValue] = useState('');

  // Thống kê
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });

  const fetchInventory = async () => {
    if (!token) return null;
    
    try {
      setLoading(true);
      console.log("Đang gọi API lấy thông tin tồn kho...");
      const response = await axios.get(
        `${backend_url}/api/product/inventory`,
        { headers: { Authorization: token } }
      );
      
      console.log("Kết quả API tồn kho:", response.data);
      
      if (response.data.success) {
        const productsData = response.data.inventory;
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Kiểm tra cấu trúc sản phẩm
        if (productsData.length > 0) {
          console.log("Cấu trúc sản phẩm mẫu:", productsData[0]);
        }
        
        // Tính toán thống kê
        const totalProducts = productsData.length;
        const totalStock = productsData.reduce((sum, product) => sum + product.stock, 0);
        const lowStockProducts = productsData.filter(product => product.stock > 0 && product.stock <= 10).length;
        const outOfStockProducts = productsData.filter(product => product.stock === 0).length;
        
        setStats({
          totalProducts,
          totalStock,
          lowStockProducts,
          outOfStockProducts
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, [token]);

  // Khi giá trị category filter thay đổi, in thông tin để debug
  useEffect(() => {
    console.log("Bộ lọc danh mục hiện tại:", categoryFilter);
  }, [categoryFilter]);

  // Lọc sản phẩm khi searchTerm hoặc filters thay đổi
  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }
    
    // Lọc theo danh mục
    if (categoryFilter !== 'all') {
      console.log("Lọc theo danh mục:", categoryFilter);
      
      // Tìm tên danh mục dựa vào ID trong bộ lọc
      const selectedCategory = categories.find(cat => cat._id === categoryFilter);
      if (selectedCategory && selectedCategory.name) {
        const categoryName = selectedCategory.name;
        console.log("Tên danh mục cần lọc:", categoryName);
        
        filtered = filtered.filter(product => {
          // Lấy tên danh mục của sản phẩm
          const productCategoryName = getCategoryName(product);
          console.log(`So sánh: "${productCategoryName}" với "${categoryName}"`);
          
          // So sánh trực tiếp với tên danh mục
          return productCategoryName === categoryName;
        });
      }
    }
    
    // Lọc theo tình trạng tồn kho
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'outOfStock':
          filtered = filtered.filter(product => product.stock === 0);
          break;
        case 'lowStock':
          filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
          break;
        case 'inStock':
          filtered = filtered.filter(product => product.stock > 10);
          break;
      }
    }
    
    console.log("Sản phẩm sau khi lọc:", filtered.length);
    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, stockFilter, products, categories]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    try {
      setLoading(true);
      const newStock = parseInt(stockValue);
      
      if (isNaN(newStock) || newStock < 0) {
        toast.error('Vui lòng nhập số lượng hợp lệ');
        return;
      }
      
      const response = await axios.post(
        `${backend_url}/api/product/update-stock`,
        { 
          id: editingProduct._id, 
          stock: newStock 
        },
        { headers: { Authorization: token } }
      );
      
      if (response.data.success) {
        toast.success('Cập nhật tồn kho thành công');
        setEditingProduct(null);
        setStockValue('');
        await fetchInventory();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setStockValue(product.stock.toString());
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setStockValue('');
  };

  // Hàm lấy màu cho trạng thái tồn kho
  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'bg-error/10 text-error';
    if (stock <= 10) return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  // Hàm lấy nhãn cho trạng thái tồn kho
  const getStockStatusLabel = (stock) => {
    if (stock === 0) return 'Hết hàng';
    if (stock <= 10) return 'Sắp hết';
    return 'Còn hàng';
  };

  // Hàm để lấy tên danh mục, hỗ trợ cả định dạng cũ và mới
  const getCategoryName = (product) => {
    if (!product) return 'Chưa phân loại';
    
    // Ưu tiên dùng categoryName từ API mới
    if (product.categoryName) {
      return product.categoryName;
    }
    
    // Trường hợp category là object (sau khi populate)
    if (product.category && typeof product.category === 'object' && product.category.name) {
      return product.category.name;
    }
    
    // Trường hợp category là string (định dạng cũ)
    if (product.category && typeof product.category === 'string') {
      return product.category;
    }
    
    return 'Chưa phân loại';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý kho hàng" 
        subtitle="Theo dõi và cập nhật số lượng tồn kho sản phẩm"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchInventory}
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
            </div>
          </div>
        }
      />

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng số sản phẩm"
          value={stats.totalProducts}
          icon={<FaArchive />}
          colorClass="bg-secondary/10 text-secondary"
        />
        <StatCard 
          title="Tổng tồn kho"
          value={stats.totalStock}
          description="sản phẩm"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>}
          colorClass="bg-info/10 text-info"
        />
        <StatCard 
          title="Sắp hết hàng"
          value={stats.lowStockProducts}
          description="sản phẩm"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>}
          colorClass="bg-warning/10 text-warning"
        />
        <StatCard 
          title="Hết hàng"
          value={stats.outOfStockProducts}
          description="sản phẩm"
          icon={<FaExclamationTriangle />}
          colorClass="bg-error/10 text-error"
        />
          </div>
          
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-button p-1">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-4 py-2 rounded-button ${
              stockFilter === 'all' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStockFilter('inStock')}
            className={`px-4 py-2 rounded-button ${
              stockFilter === 'inStock' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
            }`}
          >
            Còn hàng
          </button>
          <button
            onClick={() => setStockFilter('lowStock')}
            className={`px-4 py-2 rounded-button ${
              stockFilter === 'lowStock' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
            }`}
          >
            Sắp hết
          </button>
          <button
            onClick={() => setStockFilter('outOfStock')}
            className={`px-4 py-2 rounded-button ${
              stockFilter === 'outOfStock' ? 'bg-secondary text-white' : 'text-textPrimary hover:bg-gray-10'
            }`}
          >
            Hết hàng
          </button>
        </div>

        <select 
          value={categoryFilter} 
          onChange={(e) => {
            console.log("Đã chọn danh mục:", e.target.value);
            setCategoryFilter(e.target.value);
          }}
          className="px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form cập nhật tồn kho */}
      {editingProduct && (
        <Card>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-full">
                <FaEdit className="text-info text-xl" />
              </div>
              <h3 className="text-body font-heading">Cập nhật tồn kho</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-16 w-16 bg-gray-10 rounded-card overflow-hidden">
                  {editingProduct.images && editingProduct.images[0] ? (
                    <img 
                      src={`${backend_url}${editingProduct.images[0]}`} 
                      alt={editingProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-10 text-gray-20">
                      <FaArchive className="text-xl" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{editingProduct.name}</h4>
                  <p className="text-small text-textSecondary">
                    {getCategoryName(editingProduct)} · SKU: {editingProduct.sku || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-textSecondary text-small mb-1">Tồn kho hiện tại</label>
                  <div className="px-4 py-2 bg-gray-5 rounded-button">
                    <span className="font-medium">{editingProduct.stock}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-textSecondary text-small mb-1">Tồn kho mới</label>
                  <input
                    type="number"
                    min="0"
                    value={stockValue}
                    onChange={(e) => setStockValue(e.target.value)}
                    className="w-24 px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>
              
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

      {/* Danh sách sản phẩm */}
      {loading && !editingProduct ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
                    </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <FaArchive className="mx-auto text-5xl text-gray-20 mb-3" />
            <p className="text-textSecondary mb-1">Không tìm thấy sản phẩm nào</p>
            <p className="text-small text-gray-20">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-10">
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Danh mục</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Giá</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Tồn kho</th>
                  <th className="px-4 py-3 text-right font-medium text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-10 hover:bg-gray-5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-10 rounded-card overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img 
                              src={`${backend_url}${product.images[0]}`} 
                            alt={product.name} 
                              className="w-full h-full object-cover"
                          />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-10 text-gray-20">
                              <FaArchive />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-small text-textSecondary">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getCategoryName(product)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{currency}{product.price.toLocaleString('vi-VN')}</div>
                      {product.oldPrice && (
                        <div className="text-small text-error line-through">
                          {currency}{product.oldPrice.toLocaleString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-small ${getStockStatusColor(product.stock)}`}>
                          {getStockStatusLabel(product.stock)}
                      </span>
                        <span className="text-textSecondary">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-info/10 text-info rounded-full hover:bg-info/20 transition-colors"
                          title="Cập nhật tồn kho"
                        >
                          <FaEdit />
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
  );
};

export default Inventory;

// Thêm CSS global vào file CSS chính nếu cần
// @keyframes spin-slow {
//   to {
//     transform: rotate(360deg);
//   }
// }
// 
// .animate-spin-slow {
//   animation: spin-slow 3s linear infinite;
// } 