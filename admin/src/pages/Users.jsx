import React, { useEffect, useState } from 'react'
import { backend_url } from "../App"
import axios from "axios"
import { toast } from "react-toastify"
import { FaUser, FaEdit, FaTrash, FaLock, FaUnlockAlt, FaSearch, FaUserShield } from "react-icons/fa"
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState(null)

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    role: 'user'
  })

  const roleOptions = [
    { value: 'user', label: 'Người dùng' },
    { value: 'admin', label: 'Quản trị viên' }
  ]

  const fetchUsers = async () => {
    if (!token) return null
    
    try {
      setLoading(true)
      const response = await axios.get(
        `${backend_url}/api/user/admin/users`, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        const usersData = response.data.users
        setUsers(usersData)
        setFilteredUsers(usersData)
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

  useEffect(() => {
    fetchUsers()
  }, [token])

  // Filter users when searchTerm changes
  useEffect(() => {
    if (!users.length) return

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.address && user.address.toLowerCase().includes(term)) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleEdit = (user) => {
    setCurrentUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      phone: user.phone || '',
      role: user.role || 'user'
    })
    setIsEditing(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await axios.put(
        `${backend_url}/api/user/admin/users/${currentUser._id}`, 
        formData,
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success('Cập nhật người dùng thành công')
        setIsEditing(false)
        setCurrentUser(null)
        await fetchUsers()
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

  const handleDeleteConfirmation = (userId) => {
    setUserIdToDelete(userId)
    setIsConfirmationOpen(true)
  }

  const handleDelete = async () => {
    if (!userIdToDelete) return
    
    try {
      setLoading(true)
      const response = await axios.delete(
        `${backend_url}/api/user/admin/users/${userIdToDelete}`, 
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success('Xóa người dùng thành công')
        setIsConfirmationOpen(false)
        setUserIdToDelete(null)
        await fetchUsers()
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

  const toggleActive = async (userId, currentStatus) => {
    try {
      setLoading(true)
      const response = await axios.put(
        `${backend_url}/api/user/admin/users/${userId}`, 
        { active: !currentStatus },
        { headers: { Authorization: token } }
      )
      
      if (response.data.success) {
        toast.success(`Người dùng đã được ${!currentStatus ? 'kích hoạt' : 'khóa'} thành công`)
        await fetchUsers()
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentUser(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý người dùng" 
        subtitle="Quản lý thông tin và phân quyền người dùng"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
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
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20" />
            </div>
          </div>
        }
      />

      {/* Form chỉnh sửa người dùng */}
      {isEditing && currentUser && (
        <Card>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-full">
                <FaEdit className="text-info text-xl" />
              </div>
              <h3 className="text-body font-heading">Chỉnh sửa thông tin người dùng</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-textSecondary text-small mb-1">Họ tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              
              <div>
                <label className="block text-textSecondary text-small mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-textSecondary text-small mb-1">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              
              <div>
                <label className="block text-textSecondary text-small mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              
              <div>
                <label className="block text-textSecondary text-small mb-1">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-10 rounded-button focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-info text-white rounded-button hover:bg-info-dark transition-colors"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Modal xác nhận xóa */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 max-w-md w-full">
            <h3 className="text-h3 font-heading mb-2">Xác nhận xóa</h3>
            <p className="text-textSecondary mb-6">Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmationOpen(false)}
                className="px-4 py-2 bg-gray-10 text-textPrimary rounded-button hover:bg-gray-20 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-error text-white rounded-button hover:bg-error-dark transition-colors"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !isEditing && !isConfirmationOpen ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <FaUser className="mx-auto text-5xl text-gray-20 mb-3" />
            <p className="text-textSecondary mb-1">Không tìm thấy người dùng nào</p>
            <p className="text-small text-gray-20">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-10">
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Người dùng</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Liên hệ</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Vai trò</th>
                  <th className="px-4 py-3 text-left font-medium text-textSecondary">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-10 hover:bg-gray-5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-full">
                          <FaUser className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-small text-textSecondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-small">{user.phone || '—'}</p>
                      <p className="text-small text-textSecondary truncate max-w-[200px]">{user.address || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 rounded-full text-small bg-accent/10 text-accent flex items-center gap-1">
                            <FaUserShield className="text-xs" />
                            Quản trị viên
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-small bg-secondary/10 text-secondary">
                            Người dùng
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-small ${user.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {user.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(user._id, user.active)}
                          className={`p-2 ${user.active ? 'bg-error/10 text-error' : 'bg-success/10 text-success'} rounded-full hover:bg-opacity-20 transition-colors`}
                          title={user.active ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        >
                          {user.active ? <FaLock /> : <FaUnlockAlt />}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 bg-info/10 text-info rounded-full hover:bg-info/20 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirmation(user._id)}
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

export default Users 