import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backend_url } from '../App'
import { toast } from 'react-toastify'

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'Hoạt động',
    balance: 0
  })

  // Hiển thị thông báo lỗi
  const showErrorToast = (message) => toast.error(message)
  // Hiển thị thông báo thành công
  const showSuccessToast = (message) => toast.success(message)

  // Định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backend_url}/api/user/admin/users`, {
        headers: {
          Authorization: token
        }
      })
      if (response.data.success) {
        setUsers(response.data.users)
      } else {
        showErrorToast(response.data.message || 'Không thể tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showErrorToast('Đã xảy ra lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  // Xử lý khi chọn chỉnh sửa người dùng
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      status: user.status || 'Hoạt động',
      balance: user.balance || 0
    })
  }

  // Xử lý khi thay đổi form
  const handleChange = (e) => {
    const value = e.target.name === 'balance' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value
      
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  // Xử lý khi cập nhật thông tin người dùng
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      setLoading(true)
      const response = await axios.put(`${backend_url}/api/user/admin/users/${editingUser._id}`, formData, {
        headers: {
          Authorization: token
        }
      })

      if (response.data.success) {
        showSuccessToast('Cập nhật thông tin người dùng thành công')
        fetchUsers()
        handleCancel()
      } else {
        showErrorToast(response.data.message || 'Không thể cập nhật thông tin người dùng')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showErrorToast('Đã xảy ra lỗi khi cập nhật thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý khi xóa người dùng
  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      setLoading(true)
      const response = await axios.delete(`${backend_url}/api/user/admin/users/${userId}`, {
        headers: {
          Authorization: token
        }
      })

      if (response.data.success) {
        showSuccessToast('Xóa người dùng thành công')
        fetchUsers()
      } else {
        showErrorToast(response.data.message || 'Không thể xóa người dùng')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showErrorToast('Đã xảy ra lỗi khi xóa người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      status: 'Hoạt động',
      balance: 0
    })
  }

  // Tính tổng số dư
  const calculateTotalBalance = () => {
    return users.reduce((total, user) => total + (user.balance || 0), 0);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2 text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
        Quản lý người dùng
      </h1>

      {/* Form chỉnh sửa người dùng */}
      {editingUser && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-purple-100 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
            <span className="mr-2 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </span>
            Chỉnh sửa thông tin người dùng
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tổng chi tiêu (VND)</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <th className="px-6 py-4 text-left font-medium tracking-wider">Tên</th>
                <th className="px-6 py-4 text-left font-medium tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-medium tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium tracking-wider">Tổng chi tiêu</th>
                <th className="px-6 py-4 text-center font-medium tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !users.length ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-6 w-6 text-purple-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : !users.length ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      Không có người dùng nào
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user._id} className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50'} hover:bg-purple-100`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                        user.status === 'Không hoạt động' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${
                          user.status === 'Không hoạt động' ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                        {user.status || 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-medium ${(user.balance || 0) < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatCurrency(user.balance || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg transition-all hover:bg-blue-100 inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg transition-all hover:bg-red-100 inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {users.length > 0 && (
                <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 font-medium border-t-2 border-purple-200">
                  <td colSpan="3" className="px-6 py-4 text-right text-gray-800">Tổng chi tiêu</td>
                  <td className="px-6 py-4 text-right text-gray-800">{formatCurrency(calculateTotalBalance())}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users 