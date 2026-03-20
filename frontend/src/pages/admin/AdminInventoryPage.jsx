import { useState, useEffect } from 'react'
import { getBooks } from '../../api/books.js'
import { updateBook } from '../../api/admin'

export default function AdminInventoryPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, low, out, good
  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchBooks = (pageNum = 1) => {
    setLoading(true)
    getBooks({ pageNo: pageNum, pageSize: 20, search, sortBy: 'bookId:desc' })
      .then((res) => {
        setBooks(Array.isArray(res?.data) ? res.data : [])
        setTotalPages(res?.totalPages ?? 1)
        setPage(pageNum)
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks(1)
  }

  const filteredBooks = books.filter(book => {
    if (stockFilter === 'low') return book.quantity > 0 && book.quantity < 5
    if (stockFilter === 'out') return book.quantity === 0
    if (stockFilter === 'good') return book.quantity >= 5
    return true
  })

  const startEdit = (book) => {
    setEditingId(book.bookId)
    setEditQty(String(book.quantity || 0))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQty('')
  }

  const saveEdit = async (book) => {
    const qty = parseInt(editQty)
    if (isNaN(qty) || qty < 0) {
      alert('Số lượng không hợp lệ')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('bookName', book.bookName)
      if (book.price != null) formData.append('price', book.price)
      formData.append('quantity', qty)
      if (book.description) formData.append('description', book.description)
      if (book.author) formData.append('author', book.author)
      if (book.publisher) formData.append('publisher', book.publisher)
      if (book.publicationYear) formData.append('publicationYear', book.publicationYear)
      if (book.category?.categoryId) formData.append('categoryId', book.category.categoryId)
      await updateBook(book.bookId, formData)
      setEditingId(null)
      setEditQty('')
      fetchBooks(page)
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Hết hàng', className: 'badge badge--danger' }
    if (qty < 5) return { label: 'Sắp hết', className: 'badge badge--warning' }
    return { label: 'Còn hàng', className: 'badge badge--success' }
  }

  const summary = {
    total: books.length,
    out: books.filter(b => b.quantity === 0).length,
    low: books.filter(b => b.quantity > 0 && b.quantity < 5).length,
    good: books.filter(b => b.quantity >= 5).length,
  }

  return (
    <div className="admin-inventory">
      <div className="admin-inventory__header">
        <h1 className="admin-page-title">Quản lý kho hàng</h1>
      </div>

      {/* Summary Cards */}
      <div className="admin-inventory__summary">
        {[
          { label: 'Tổng sản phẩm', value: summary.total, icon: '📦', color: '#1976d2', bg: '#e3f2fd' },
          { label: 'Hết hàng', value: summary.out, icon: '🔴', color: '#d32f2f', bg: '#ffebee' },
          { label: 'Sắp hết', value: summary.low, icon: '🟡', color: '#f57c00', bg: '#fff3e0' },
          { label: 'Còn hàng', value: summary.good, icon: '🟢', color: '#388e3c', bg: '#e8f5e9' },
        ].map(item => (
          <div key={item.label} className="admin-inv-card" style={{ background: item.bg }}>
            <div style={{ fontSize: '24px' }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-inventory__filters">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tên sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search__input"
          />
          <button type="submit" className="admin-search__btn">Tìm</button>
        </form>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'out', label: 'Hết hàng' },
            { key: 'low', label: 'Sắp hết' },
            { key: 'good', label: 'Còn hàng' },
          ].map(f => (
            <button
              key={f.key}
              className={`admin-btn admin-btn--sm ${stockFilter === f.key ? 'admin-btn--primary' : ''}`}
              onClick={() => setStockFilter(f.key)}
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
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="admin-table__loading">Đang tải...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan="6" className="admin-table__empty">Không có sản phẩm nào</td></tr>
            ) : (
              filteredBooks.map((book) => {
                const status = getStockStatus(book.quantity)
                const isEditing = editingId === book.bookId
                return (
                  <tr key={book.bookId} className={book.quantity === 0 ? 'admin-table__row--danger' : book.quantity < 5 ? 'admin-table__row--warning' : ''}>
                    <td>#{book.bookId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={book.image || '/images/no-image.png'}
                          alt={book.bookName}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                  <div style={{ fontWeight: '600' }}>{book.bookName}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{book.category || 'Chưa phân loại'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price || 0)}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            min="0"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="admin-input"
                            style={{ width: '80px', padding: '4px 8px' }}
                            autoFocus
                          />
                          <button
                            className="admin-btn admin-btn--sm admin-btn--primary"
                            onClick={() => saveEdit(book)}
                            disabled={saving}
                          >
                            Lưu
                          </button>
                          <button className="admin-btn admin-btn--sm" onClick={cancelEdit}>
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <strong style={{ fontSize: '16px' }}>{book.quantity}</strong>
                      )}
                    </td>
                    <td><span className={status.className}>{status.label}</span></td>
                    <td>
                      {!isEditing && (
                        <button
                          className="admin-btn admin-btn--sm"
                          onClick={() => startEdit(book)}
                        >
                          Cập nhật kho
                        </button>
                      )}
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
          <button onClick={() => fetchBooks(page - 1)} disabled={page === 1} className="admin-pagination__btn">
            ← Trước
          </button>
          <span className="admin-pagination__info">Trang {page} / {totalPages}</span>
          <button onClick={() => fetchBooks(page + 1)} disabled={page === totalPages} className="admin-pagination__btn">
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}
