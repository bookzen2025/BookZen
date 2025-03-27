import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url, currency } from '../App';
import { toast } from 'react-toastify';
import { FaSearch, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import { BiImport, BiExport } from 'react-icons/bi';
import { IoMdRefresh } from 'react-icons/io';

// File: Inventory.jsx
// Trang quản lý hàng tồn kho, cho phép xem và cập nhật tồn kho của tất cả sản phẩm

const Inventory = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'stock',
    direction: 'asc'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  // Fetch all products with inventory information
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_url}/api/product/inventory`, {
        headers: { Authorization: token }
      });
      
      if (response.data.success) {
        setProducts(response.data.inventory);
        checkLowStock(response.data.inventory);
      } else {
        toast.error(response.data.message || 'Không thể tải thông tin tồn kho');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Đã xảy ra lỗi khi tải thông tin tồn kho');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Check for low stock items
  const checkLowStock = (items) => {
    const LOW_STOCK_THRESHOLD = 5;
    const lowStockItems = items.filter(item => item.stock <= LOW_STOCK_THRESHOLD);
    setStockAlerts(lowStockItems);
    
    if (lowStockItems.length > 0) {
      toast.warning(`Có ${lowStockItems.length} sản phẩm sắp hết hàng!`);
    }
  };

  // Update product stock
  const handleUpdateStock = async (id, newStock) => {
    try {
      const response = await axios.post(
        `${backend_url}/api/product/update-stock`,
        { id, stock: newStock },
        { headers: { Authorization: token } }
      );
      
      if (response.data.success) {
        toast.success('Cập nhật tồn kho thành công');
        
        // Update local state
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === id ? { ...product, stock: newStock } : product
          )
        );
        
        // Check if we need to update alerts
        if (newStock <= 5) {
          checkLowStock(products.map(product => 
            product._id === id ? { ...product, stock: newStock } : product
          ));
        } else {
          // If stock is now above threshold, we might need to remove from alerts
          setStockAlerts(prev => prev.filter(item => item._id !== id));
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật tồn kho');
    }
  };

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered products
  const getSortedProducts = () => {
    // First apply category filter
    let filteredProducts = selectedCategory === 'all' 
      ? products 
      : products.filter(product => product.category === selectedCategory);
    
    // Then apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Then apply sorting
    return [...filteredProducts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Get stock status class
  const getStockStatusClass = (stock) => {
    if (stock <= 0) return 'text-red-600 font-bold';
    if (stock <= 5) return 'text-orange-500 font-bold';
    return 'text-green-600';
  };

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý hàng tồn kho</h1>
        <p className="text-gray-600">Theo dõi và cập nhật số lượng sản phẩm trong kho</p>
      </div>

      {/* Alerts */}
      {stockAlerts.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                Có {stockAlerts.length} sản phẩm có số lượng tồn kho thấp (≤ 5)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchInventory}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <IoMdRefresh />
            <span>Làm mới</span>
          </button>
          
          <button
            onClick={() => {
              // Implementation for export would go here
              toast.info('Chức năng xuất file sẽ được phát triển trong tương lai');
            }}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
          >
            <BiExport />
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('stock')}
                >
                  <div className="flex items-center">
                    Tồn kho
                    {sortConfig.key === 'stock' && (
                      sortConfig.direction === 'asc' 
                        ? <FaSortNumericDown className="ml-1" /> 
                        : <FaSortNumericUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : getSortedProducts().length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                getSortedProducts().map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.image} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currency}{product.price?.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        className={`w-20 px-2 py-1 border rounded ${
                          product.stock <= 0 
                            ? 'border-red-300 bg-red-50' 
                            : product.stock <= 5 
                              ? 'border-orange-300 bg-orange-50' 
                              : 'border-gray-300'
                        }`}
                        defaultValue={product.stock || 0}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value);
                          if (newValue !== product.stock) {
                            handleUpdateStock(product._id, newValue);
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock <= 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock <= 5 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock <= 0 
                          ? 'Hết hàng' 
                          : product.stock <= 5 
                            ? 'Sắp hết hàng' 
                            : 'Còn hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // Implement quick adjustment
                          const currentStock = product.stock || 0;
                          handleUpdateStock(product._id, currentStock + 1);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => {
                          // Implement quick adjustment
                          const currentStock = product.stock || 0;
                          if (currentStock > 0) {
                            handleUpdateStock(product._id, currentStock - 1);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        disabled={product.stock <= 0}
                      >
                        -1
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng sản phẩm</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Sản phẩm hết hàng</h3>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock <= 0).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Sản phẩm sắp hết</h3>
          <p className="text-2xl font-bold text-orange-500">
            {products.filter(p => p.stock > 0 && p.stock <= 5).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng tồn kho</h3>
          <p className="text-2xl font-bold text-blue-600">
            {products.reduce((sum, product) => sum + (product.stock || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inventory; 