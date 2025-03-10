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
    email: ''
  })

  // Hiển thị thông báo lỗi
  const showErrorToast = (message) => toast.error(message)
  // Hiển thị thông báo thành công
  const showSuccessToast = (message) => toast.success(message)

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
      email: user.email
    })
  }

  // Xử lý khi thay đổi form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      email: ''
    })
  }

  return (
    <div className="w-full p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      {/* Form chỉnh sửa người dùng */}
      {editingUser && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Chỉnh sửa thông tin người dùng</h2>
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded mr-2"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && !users.length ? (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : !users.length ? (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user._id}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users 