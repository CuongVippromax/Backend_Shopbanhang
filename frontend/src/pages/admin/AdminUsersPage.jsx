import { useState, useEffect } from 'react'
import { getAllUsers, deleteUser, updateUserRole } from '../../api/admin'
import { getUser } from '../../api/client'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [totalElements, setTotalElements] = useState(0)
  const [updatingRole, setUpdatingRole] = useState(null)

  const currentUser = getUser()
  const currentUserId = currentUser?.userId || currentUser?.id

  const fetchUsers = (pageNum = 1) => {
    setLoading(true)
    getAllUsers({ pageNo: pageNum, pageSize: 10, search })
      .then((res) => {
        console.log('[AdminUsersPage] Full API response:', JSON.stringify(res))
        console.log('[AdminUsersPage] res.data:', res?.data)
        console.log('[AdminUsersPage] res.data.pageNo:', res?.data?.pageNo)
        console.log('[AdminUsersPage] res.data.data:', res?.data?.data)
        console.log('[AdminUsersPage] res.data.totalElements:', res?.data?.totalElements)
        const pageData = res?.data
        const list = Array.isArray(pageData?.data) ? pageData.data : (Array.isArray(pageData) ? pageData : [])
        setUsers(list)
        setTotalPages(pageData?.totalPages ?? res?.totalPages ?? 1)
        setTotalElements(pageData?.totalElements ?? res?.totalElements ?? 0)
        setPage(pageNum)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1)
  }

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUserId) {
      alert('Bạn không thể thay đổi vai trò của chính mình!')
      return
    }
    if (!window.confirm(`Đổi vai trò người dùng #${userId} thành "${newRole === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}"?`)) {
      return
    }
    setUpdatingRole(userId)
    try {
      await updateUserRole(userId, newRole)
      fetchUsers(page)
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err?.message || ''))
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleDelete = async (userId, name) => {
    if (userId === currentUserId) {
      alert('Bạn không thể xóa chính mình!')
      return
    }
    if (!window.confirm(`Xóa người dùng "${name || userId}"? Hành động này không thể hoàn tác.`)) return
    try {
      await deleteUser(userId)
      fetchUsers(page)
    } catch (err) {
      alert('Xóa thất bại: ' + (err?.message || ''))
    }
  }

  const filteredUsers = users.filter(user => {
    if (roleFilter === 'all') return true
    return user.role === roleFilter
  })

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="badge badge--danger">Admin</span>
    if (role === 'USER') return <span className="badge badge--info">User</span>
    return <span className="badge">{role || 'User'}</span>
  }

  const summary = {
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <h1 className="admin-page-title">Quản lý thành viên</h1>
        <span className="admin-page-subtitle">{totalElements} thành viên</span>
      </div>

      {/* Summary */}
      <div className="admin-users__summary" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Tổng người dùng', value: totalElements, color: '#1976d2', bg: '#e3f2fd' },
          { label: 'Quản trị viên', value: summary.admins, color: '#d32f2f', bg: '#ffebee' },
          { label: 'Khách hàng', value: summary.users, color: '#388e3c', bg: '#e8f5e9' },
        ].map(item => (
          <div key={item.label} style={{
            flex: '1', padding: '16px', background: item.bg,
            borderRadius: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tên, email, username, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search__input"
          />
          <button type="submit" className="admin-search__btn">Tìm kiếm</button>
        </form>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'ADMIN', label: 'Admin' },
            { key: 'USER', label: 'User' },
          ].map(f => (
            <button
              key={f.key}
              className={`admin-btn admin-btn--sm ${roleFilter === f.key ? 'admin-btn--primary' : ''}`}
              onClick={() => setRoleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Username</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="admin-table__loading">Đang tải...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">Không có người dùng nào</td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelf = user.userId === currentUserId || user.id === currentUserId
                const isUpdating = updatingRole === (user.userId || user.id)
                return (
                  <tr key={user.userId || user.id}>
                    <td>#{user.userId || user.id}</td>
                    <td><strong>{user.fullName || user.username || '—'}</strong></td>
                    <td>{user.email || '—'}</td>
                    <td className="admin-text-muted">{user.username || '—'}</td>
                    <td>{user.phoneNumber || user.phone || '—'}</td>
                    <td>
                      {isSelf ? (
                        getRoleBadge(user.role)
                      ) : (
                        <select
                          value={user.role || 'USER'}
                          onChange={(e) => handleRoleChange(user.userId || user.id, e.target.value)}
                          disabled={isUpdating}
                          className="admin-role-select"
                          style={{
                            opacity: isUpdating ? 0.6 : 1,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <option value="USER">Khách hàng</option>
                          <option value="ADMIN">Quản trị viên</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => handleDelete(user.userId || user.id, user.fullName || user.username)}
                        disabled={isSelf}
                        title={isSelf ? 'Không thể xóa chính mình' : 'Xóa người dùng'}
                        style={isSelf ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {isSelf ? 'Bạn' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => fetchUsers(page - 1)}
            disabled={page === 1}
            className="admin-pagination__btn"
          >
            ← Trước
          </button>
          <span className="admin-pagination__info">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchUsers(page + 1)}
            disabled={page === totalPages}
            className="admin-pagination__btn"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}
