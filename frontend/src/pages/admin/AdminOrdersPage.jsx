import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, updatePaymentStatus, getOrderDetail } from '../../api/admin'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchOrders = (pageNum = 1) => {
    setLoading(true)
    const params = {
      page: pageNum,
      size: 10,
      sort: 'orderDate:desc',
    }
    if (search) params.search = search
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    getAllOrders(params)
      .then((res) => {
        let list = Array.isArray(res?.data) ? res.data : []
        if (statusFilter !== 'ALL') {
          list = list.filter(o => o.orderStatus === statusFilter)
        }
        setOrders(list)
        setTotalPages(res?.totalPages || 1)
        setTotalElements(res?.totalElements || 0)
        setPage(pageNum)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders(1)
  }, [statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrders(1)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      fetchOrders(page)
      if (showDetailModal) loadDetail(orderId)
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err?.message || ''))
    }
  }

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus)
      fetchOrders(page)
      if (showDetailModal) loadDetail(orderId)
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err?.message || ''))
    }
  }

  const openDetail = (orderId) => {
    setShowDetailModal(true)
    loadDetail(orderId)
  }

  const loadDetail = (orderId) => {
    setDetailLoading(true)
    getOrderDetail(orderId)
      .then((res) => setDetailOrder(res))
      .catch(() => setDetailOrder(null))
      .finally(() => setDetailLoading(false))
  }

  const closeDetail = () => {
    setShowDetailModal(false)
    setDetailOrder(null)
  }

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getStatusLabel = (s) => ({ PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', SHIPPED: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' }[s] || s)
  const getPaymentLabel = (s) => ({ PENDING: 'Chưa thanh toán', PAID: 'Đã thanh toán', FAILED: 'Thất bại', CANCELLED: 'Đã hủy' }[s] || s)

  const statusBadgeClass = (status) => ({
    PENDING: 'badge--warning', PROCESSING: 'badge--info', SHIPPED: 'badge--primary',
    COMPLETED: 'badge--success', CANCELLED: 'badge--danger',
  }[status] || '')
  const paymentBadgeClass = (status) => ({
    PENDING: 'badge--warning', PAID: 'badge--success', FAILED: 'badge--danger', CANCELLED: 'badge--danger',
  }[status] || '')

  const statusTabs = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPED', label: 'Đang giao' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ]

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">Quản lý đơn hàng</h1>

      {/* Status Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '16px' }}>
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            className={`admin-tab ${statusFilter === tab.value ? 'admin-tab--active' : ''}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="admin-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm theo mã đơn, tên, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search__input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="admin-input"
          style={{ width: '160px' }}
        />
        <span style={{ lineHeight: '36px', color: '#888' }}>—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="admin-input"
          style={{ width: '160px' }}
        />
        <button type="submit" className="admin-search__btn">Lọc</button>
        {(search || startDate || endDate) && (
          <button
            type="button"
            className="admin-btn"
            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); fetchOrders(1) }}
          >
            Xóa lọc
          </button>
        )}
      </form>

      {/* Summary */}
      {!loading && (
        <p className="admin-text-muted" style={{ marginBottom: '12px' }}>
          {totalElements > 0 ? `Hiển thị ${orders.length} / ${totalElements} đơn hàng` : 'Không có đơn hàng nào'}
        </p>
      )}

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
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="admin-table__loading">Đang tải...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-table__empty">Chưa có đơn hàng nào</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <button
                      className="admin-link-btn"
                      onClick={() => openDetail(order.orderId)}
                      title="Xem chi tiết"
                    >
                      #{order.orderId}
                    </button>
                  </td>
                  <td>
                    <div>{order.fullName || order.username || 'Khách'}</div>
                    <div className="admin-text-muted">{order.recipientPhone || ''}</div>
                  </td>
                  <td>
                    <div className="admin-order-items">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="admin-order-item">
                          {item.bookName} <span className="admin-text-muted">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="admin-text-muted">+{order.items.length - 2} sản phẩm</div>
                      )}
                    </div>
                  </td>
                  <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <span className={`badge ${paymentBadgeClass(order.paymentStatus)}`}>
                      {getPaymentLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusBadgeClass(order.orderStatus)}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn--sm"
                      onClick={() => openDetail(order.orderId)}
                    >
                      Chi tiết
                    </button>
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
          <button onClick={() => fetchOrders(page - 1)} disabled={page === 1} className="admin-pagination__btn">← Trước</button>
          <span className="admin-pagination__info">Trang {page} / {totalPages}</span>
          <button onClick={() => fetchOrders(page + 1)} disabled={page === totalPages} className="admin-pagination__btn">Sau →</button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDetail()}>
          <div className="admin-modal admin-modal--lg">
            <div className="admin-modal__header">
              <h3>Chi tiết đơn hàng #{detailOrder?.orderId}</h3>
              <button className="admin-modal__close" onClick={closeDetail}>×</button>
            </div>

            {detailLoading ? (
              <div className="admin-modal__body" style={{ textAlign: 'center', padding: '40px' }}>
                Đang tải...
              </div>
            ) : detailOrder ? (
              <div className="admin-modal__body">
                {/* Info Grid */}
                <div className="admin-detail-grid">
                  <div className="admin-detail-section">
                    <h4 className="admin-detail-section__title">Thông tin khách hàng</h4>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Khách hàng:</span>
                      <span>{detailOrder.fullName || detailOrder.username || 'Khách'}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">SĐT:</span>
                      <span>{detailOrder.recipientPhone || '-'}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Địa chỉ giao:</span>
                      <span>{detailOrder.shippingAddress || '-'}</span>
                    </div>
                  </div>

                  <div className="admin-detail-section">
                    <h4 className="admin-detail-section__title">Thông tin đơn hàng</h4>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Ngày đặt:</span>
                      <span>{formatDate(detailOrder.orderDate)}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Phương thức:</span>
                      <span>{detailOrder.paymentMethod || '-'}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Trạng thái:</span>
                      <select
                        value={detailOrder.orderStatus}
                        onChange={(e) => handleStatusChange(detailOrder.orderId, e.target.value)}
                        className="admin-select admin-select--sm"
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Thanh toán:</span>
                      <select
                        value={detailOrder.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(detailOrder.orderId, e.target.value)}
                        className="admin-select admin-select--sm"
                      >
                        <option value="PENDING">Chưa thanh toán</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <h4 className="admin-detail-section__title" style={{ marginTop: '16px' }}>Sản phẩm</h4>
                <table className="admin-table admin-table--sm">
                  <thead>
                    <tr>
                      <th>Hình</th>
                      <th>Tên sách</th>
                      <th>Đơn giá</th>
                      <th>SL</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={item.image || '/images/no-image.png'}
                            alt={item.bookName}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td>{item.bookName}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td><strong>{formatCurrency(item.totalPrice)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                      <td style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '16px' }}>
                        {formatCurrency(detailOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="admin-modal__body" style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                Không tải được chi tiết đơn hàng
              </div>
            )}

            <div className="admin-modal__footer">
              <button className="admin-btn" onClick={closeDetail}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
