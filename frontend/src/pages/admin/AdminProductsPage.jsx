import { useState, useEffect } from 'react'
import { getAllBooksAdmin, deleteBook } from '../../api/admin'

export default function AdminProductsPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchBooks = (pageNum = 1) => {
    setLoading(true)
    getAllBooksAdmin({ page: pageNum, size: 12 })
      .then((res) => {
        setBooks(res.data?.data || [])
        setTotalPages(res.data?.totalPages || 1)
        setPage(pageNum)
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleDelete = async (bookId, bookName) => {
    if (!window.confirm(`Xóa sách "${bookName}"?`)) return
    try {
      await deleteBook(bookId)
      fetchBooks(page)
    } catch (err) {
      alert('Xóa thất bại')
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h1 className="admin-page-title">Quản lý sản phẩm</h1>
        <button className="admin-btn admin-btn--primary">+ Thêm sách mới</button>
      </div>

      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : books.length === 0 ? (
        <div className="admin-empty">Chưa có sách nào</div>
      ) : (
        <>
          <div className="admin-products__grid">
            {books.map((book) => (
              <div key={book.bookId} className="admin-product-card">
                <div className="admin-product-card__image">
                  <img src={book.image || '/images/no-image.png'} alt={book.bookName} />
                </div>
                <div className="admin-product-card__info">
                  <h3 className="admin-product-card__name">{book.bookName}</h3>
                  <p className="admin-product-card__author">{book.author || '未知'}</p>
                  <div className="admin-product-card__price">
                    <span className="admin-product-card__price-current">
                      {formatCurrency(book.price)}
                    </span>
                  </div>
                  <div className="admin-product-card__stock">
                    Kho: <span className={book.quantity < 5 ? 'text-danger' : ''}>{book.quantity}</span>
                  </div>
                </div>
                <div className="admin-product-card__actions">
                  <button className="admin-btn admin-btn--sm">Sửa</button>
                  <button
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => handleDelete(book.bookId, book.bookName)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => fetchBooks(page - 1)}
                disabled={page === 1}
                className="admin-pagination__btn"
              >
                ← Trước
              </button>
              <span className="admin-pagination__info">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => fetchBooks(page + 1)}
                disabled={page === totalPages}
                className="admin-pagination__btn"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
