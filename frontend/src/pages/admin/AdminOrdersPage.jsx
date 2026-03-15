import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '../../api/admin'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const fetchOrders = (pageNum = 1) => {
    setLoading(true)
    getAllOrders({ page: pageNum, size: 10, search })
      .then((res) => {
        setOrders(res.data?.data || [])
        setTotalPages(res.data?.totalPages || 1)
        setPage(pageNum)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrders(1)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      fetchOrders(page)
    } catch (err) {
      alert('Cập nhật thất bại')
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xử lý', className: 'badge--warning' },
      SHIPPED: { label: 'Đang giao', className: 'badge--info' },
      COMPLETED: { label: 'Hoàn thành', className: 'badge--success' },
      CANCELLED: { label: 'Đã hủy', className: 'badge--danger' },
    }
    const info = statusMap[status] || { label: status, className: '' }
    return <span className={`badge ${info.className}`}>{info.label}</span>
  }

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">Quản lý đơn hàng</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="admin-search">
        <input
          type="text"
          placeholder="Tìm theo mã đơn, tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search__input"
        />
        <button type="submit" className="admin-search__btn">Tìm kiếm</button>
      </form>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="admin-table__loading">Đang tải...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">Chưa có đơn hàng nào</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>
                    <div>{order.userName || 'Khách'}</div>
                    <div className="admin-text-muted">{order.userEmail || ''}</div>
                  </td>
                  <td>
                    <div className="admin-order-items">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="admin-order-item">
                          {item.bookName} x{item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="admin-text-muted">+{order.items.length - 2} sản phẩm</div>
                      )}
                    </div>
                  </td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{getStatusBadge(order.orderStatus)}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      className="admin-select"
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="SHIPPED">Đang giao</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => fetchOrders(page - 1)}
            disabled={page === 1}
            className="admin-pagination__btn"
          >
            ← Trước
          </button>
          <span className="admin-pagination__info">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchOrders(page + 1)}
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
