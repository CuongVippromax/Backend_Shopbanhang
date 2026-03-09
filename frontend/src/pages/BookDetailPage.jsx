import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBookById } from '../api/books.js'

export default function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    getBookById(id)
      .then(setBook)
      .catch(() => setError('Không tìm thấy sách.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-placeholder">Đang tải...</div>
  if (error || !book) return <div className="page-placeholder">{error || 'Không tìm thấy sách.'}</div>

  const price = book.price != null ? Number(book.price) : 0

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <Link to="/san-pham">SẢN PHẨM</Link>
        <span className="breadcrumb__sep">»</span>
        <span>{book.bookName}</span>
      </div>

      <div className="book-detail">
        <div className="book-detail__image">
          {book.image ? (
            <img src={book.image} alt={book.bookName} />
          ) : (
            <div className="product-card__image-placeholder" style={{ width: '100%', height: 360 }} />
          )}
        </div>
        <div className="book-detail__info">
          <h1 className="book-detail__title">{book.bookName}</h1>
          {book.author && <p className="book-detail__meta">Tác giả: {book.author}</p>}
          {book.publisher && <p className="book-detail__meta">NXB: {book.publisher}</p>}
          <p className="book-detail__price">{price.toLocaleString('vi-VN')}đ</p>
          {book.description && (
            <div className="book-detail__description">
              <h3>Mô tả</h3>
              <p>{book.description}</p>
            </div>
          )}
          <button type="button" className="contact-submit">Thêm vào giỏ</button>
        </div>
      </div>
    </>
  )
}
