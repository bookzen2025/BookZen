import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import { backend_url } from '../App'
import { showSuccessToast, showErrorToast } from '../utils/toastConfig'

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [csrfToken, setCsrfToken] = useState('')

  // Lấy CSRF token khi component được mount
  useEffect(() => {
    // Tạo CSRF token ngẫu nhiên nếu chưa có
    const token = localStorage.getItem('csrfToken') || Math.random().toString(36).substring(2, 15)
    localStorage.setItem('csrfToken', token)
    setCsrfToken(token)
  }, [])

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backend_url}/api/user/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken,
          'csrf-token': csrfToken
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
    if (csrfToken) {
      fetchUsers()
    }
  }, [token, csrfToken])

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email
    })
  }

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle update user
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${backend_url}/api/user/admin/users/${editingUser._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken,
          'csrf-token': csrfToken
        }
      })
      if (response.data.success) {
        showSuccessToast('Cập nhật người dùng thành công')
        setEditingUser(null)
        fetchUsers()
      } else {
        showErrorToast(response.data.message || 'Không thể cập nhật người dùng')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showErrorToast('Đã xảy ra lỗi khi cập nhật người dùng')
    }
  }

  // Handle delete user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await axios.delete(`${backend_url}/api/user/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-csrf-token': csrfToken,
            'csrf-token': csrfToken
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
      }
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setEditingUser(null)
  }

  return (
    <div className='w-full sm:w-4/5 bg-white p-4 sm:p-10 overflow-y-auto'>
      <h1 className='text-2xl font-bold mb-6'>Quản lý người dùng</h1>

      {/* Edit User Form */}
      {editingUser && (
        <div className='bg-gray-100 p-4 rounded-lg mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Chỉnh sửa người dùng</h2>
          <form onSubmit={handleUpdate} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Tên</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Email</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                required
              />
            </div>
            <div className='flex space-x-4'>
              <button
                type='submit'
                className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Cập nhật
              </button>
              <button
                type='button'
                onClick={handleCancel}
                className='inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className='text-center py-4'>Đang tải...</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-indigo-50'>
              <tr>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                  ID
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                  Tên
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                  Email
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user._id.substring(0, 8)}...
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {user.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleEdit(user)}
                        className='text-indigo-600 hover:text-indigo-900 mr-4'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
                    Không có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Users 