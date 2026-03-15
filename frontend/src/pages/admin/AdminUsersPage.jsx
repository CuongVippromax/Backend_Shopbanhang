import { useState, useEffect } from 'react'
import { getAllUsers } from '../../api/admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = (pageNum = 1) => {
    setLoading(true)
    getAllUsers({ page: pageNum, size: 10 })
      .then((res) => {
        setUsers(res.data?.data || [])
        setTotalPages(res.data?.totalPages || 1)
        setPage(pageNum)
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="badge badge--danger">Admin</span>
    if (role === 'USER') return <span className="badge badge--info">User</span>
    return <span className="badge">{role}</span>
  }

  return (
    <div className="admin-users">
      <h1 className="admin-page-title">Quản lý người dùng</h1>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="admin-table__loading">Đang tải...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table__empty">Chưa có người dùng nào</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId}>
                  <td>#{user.userId}</td>
                  <td>{user.fullName || 'Chưa có'}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || '-'}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
