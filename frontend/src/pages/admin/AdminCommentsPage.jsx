import { useState, useEffect } from 'react'
import { getAllReviews, deleteReview } from '../../api/admin'

export default function AdminCommentsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all') // all, 5, 4, 3, 2, 1
  const [apiError, setApiError] = useState('')

  const fetchReviews = (pageNum = 1, searchKeyword = search) => {
    setLoading(true)
    setApiError('')
    getAllReviews({ page: pageNum, size: 20, search: searchKeyword })
      .then((res) => {
        // apiGet trả về body JSON trực tiếp (không như axios.response.data)
        const list = Array.isArray(res?.data) ? res.data : []
        setReviews(list)
        setTotalPages(res?.totalPages ?? 1)
        setPage(pageNum)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch((err) => {
        console.error('Reviews API error:', err)
        setApiError(err.message || 'Không thể tải danh sách bình luận')
        setReviews([])
      })
      .finally(() => setLoading(false))
  }

  // Load all reviews cho summary (không phân trang)
  const [summaryData, setSummaryData] = useState({ total: 0, fiveStar: 0, fourStar: 0, threeStar: 0, low: 0 })
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    getAllReviews({ page: 1, size: 1000, search: '' })
      .then((res) => {
        const all = Array.isArray(res?.data) ? res.data : []
        setSummaryData({
          total: res?.totalElements ?? all.length,
          fiveStar: all.filter(r => r.rating === 5).length,
          fourStar: all.filter(r => r.rating === 4).length,
          threeStar: all.filter(r => r.rating === 3).length,
          low: all.filter(r => r.rating <= 2).length,
        })
      })
      .catch(() => {})
      .finally(() => setLoadingSummary(false))
  }, [])

  useEffect(() => {
    fetchReviews(1, '')
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchReviews(1, search)
  }

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'all') return true
    return r.rating === parseInt(ratingFilter)
  })

  const handleDelete = async (id) => {
    try {
      await deleteReview(id)
      fetchReviews(page, search)
      // Cập nhật lại summary
      getAllReviews({ page: 1, size: 1000, search: '' })
        .then((res) => {
          const all = Array.isArray(res?.data) ? res.data : []
          setSummaryData({
            total: res?.totalElements ?? all.length,
            fiveStar: all.filter(r => r.rating === 5).length,
            fourStar: all.filter(r => r.rating === 4).length,
            threeStar: all.filter(r => r.rating === 3).length,
            low: all.filter(r => r.rating <= 2).length,
          })
        })
    } catch (err) {
      alert('Xóa thất bại: ' + (err?.message || ''))
    }
  }

  const renderStars = (rating) => {
    return (
      <span style={{ color: '#f5c518', letterSpacing: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ color: i <= (rating || 0) ? '#f5c518' : '#ddd' }}>★</span>
        ))}
      </span>
    )
  }

  const getRatingBadge = (rating) => {
    if (rating >= 4) return <span className="badge badge--success">{rating} ★</span>
    if (rating >= 3) return <span className="badge badge--warning">{rating} ★</span>
    return <span className="badge badge--danger">{rating} ★</span>
  }

  // Summary
  const summary = loadingSummary ? { total: '...', fiveStar: '...', fourStar: '...', threeStar: '...', low: '...' } : summaryData

  return (
    <div className="admin-comments">
      <div className="admin-comments__header">
        <h1 className="admin-page-title">Quản lý bình luận</h1>
      </div>

      {/* Summary */}
      <div className="admin-comments__summary">
        {[
          { label: 'Tổng bình luận', value: summary.total, icon: '💬', color: '#1976d2', bg: '#e3f2fd' },
          { label: '5 sao', value: summary.fiveStar, icon: '⭐⭐⭐⭐⭐', color: '#2e7d32', bg: '#e8f5e9' },
          { label: '4 sao', value: summary.fourStar, icon: '⭐⭐⭐⭐', color: '#388e3c', bg: '#e9f7ef' },
          { label: '3 sao', value: summary.threeStar, icon: '⭐⭐⭐', color: '#f57c00', bg: '#fff3e0' },
          { label: '1-2 sao', value: summary.low, icon: '⚠️', color: '#c62828', bg: '#ffebee' },
        ].map(item => (
          <div key={item.label} className="admin-inv-card" style={{ background: item.bg }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tên sách, tên người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search__input"
          />
          <button type="submit" className="admin-search__btn">Tìm</button>
        </form>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: '5', label: '⭐⭐⭐⭐⭐' },
            { key: '4', label: '⭐⭐⭐⭐' },
            { key: '3', label: '⭐⭐⭐' },
            { key: '2', label: '⭐⭐' },
            { key: '1', label: '⭐' },
          ].map(f => (
            <button
              key={f.key}
              className={`admin-btn admin-btn--sm ${ratingFilter === f.key ? 'admin-btn--primary' : ''}`}
              onClick={() => setRatingFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {apiError && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {apiError}
        </div>
      )}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sách</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th>Bình luận</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="admin-table__loading">Đang tải...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan="7" className="admin-table__empty">Chưa có bình luận nào</td></tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.reviewId}>
                  <td>#{review.reviewId}</td>
                  <td>
                    <div style={{ fontWeight: '600', maxWidth: '180px' }}>
                      <a href={`/san-pham/${review.bookId}`} target="_blank" rel="noopener noreferrer" className="admin-link">
                        {review.bookName}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div>{review.username || 'Khách'}</div>
                  </td>
                  <td>{renderStars(review.rating)}</td>
                  <td>
                    <div style={{ maxWidth: '280px' }}>
                      <div className="admin-text-muted" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '13px',
                      }}>
                        {review.comment || '(Không có bình luận)'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => handleDelete(review.reviewId)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button onClick={() => fetchReviews(page - 1)} disabled={page === 1} className="admin-pagination__btn">
            ← Trước
          </button>
          <span className="admin-pagination__info">Trang {page} / {totalPages}</span>
          <button onClick={() => fetchReviews(page + 1)} disabled={page === totalPages} className="admin-pagination__btn">
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}
