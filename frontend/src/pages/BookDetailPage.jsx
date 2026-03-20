import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getBookById } from '../api/books.js'
import { getReviewsByBook, addReview } from '../api/reviews.js'
import { addToCart } from '../utils/cart'
import { isLoggedIn } from '../api/client.js'

function getImageSrc(image) {
  if (!image || typeof image !== 'string') return null
  const trimmed = image.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return window.location.origin + trimmed
  return trimmed
}

function getDiscount(bookId) {
  if (bookId == null) return 0
  const hash = String(bookId).split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)
  const rand = Math.abs(hash % 100)
  if (rand < 30) return 0
  return 10 + (rand % 31)
}

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const loadReviews = useCallback(() => {
    if (!id) return
    setReviewsLoading(true)
    getReviewsByBook(id, { page: 1, size: 20 })
      .then((res) => {
        setReviews(res?.data ?? [])
        setReviewsTotal(res?.totalElements ?? 0)
      })
      .catch(() => {
        setReviews([])
        setReviewsTotal(0)
      })
      .finally(() => setReviewsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    getBookById(id)
      .then(setBook)
      .catch(() => setError('Không tìm thấy sách.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || activeTab !== 'comments') return
    loadReviews()
  }, [id, activeTab, loadReviews])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    const content = (commentContent || '').trim()
    if (!content) {
      setCommentError('Vui lòng nhập nội dung bình luận.')
      return
    }
    setCommentError(null)
    setCommentSubmitting(true)
    addReview({
      bookId: Number(id),
      rating: 5,
      comment: content
    })
      .then(() => {
        setCommentContent('')
        loadReviews()
      })
      .catch((err) => {
        setCommentError(err.message || 'Gửi bình luận thất bại.')
      })
      .finally(() => setCommentSubmitting(false))
  }

  if (loading) return <div className="page-placeholder">Đang tải...</div>
  if (error || !book) return <div className="page-placeholder">{error || 'Không tìm thấy sách.'}</div>

  const price = book.price != null ? Number(book.price) : 0
  const bookId = book.bookId ?? book.id ?? id
  const discount = getDiscount(bookId)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount ? Math.round(price / (1 - discount / 100)) : price
  const imageSrc = getImageSrc(book.image)
  const categoryName = book.category?.categoryName ?? book.categoryName ?? ''
  const stock = book.quantity != null ? Number(book.quantity) : 150
  const rating = book.averageRating != null ? Math.round(Number(book.averageRating)) : 5
  const reviewCount = book.reviewCount != null ? Number(book.reviewCount) : 0

  const mainImage = imageSrc

  const handleAddToCart = () => {
    addToCart({
      id: String(bookId),
      bookName: book.bookName,
      description: book.description || '',
      image: book.image,
      price,
      originalPrice: hasDiscount ? originalPrice : price,
      quantity
    })
    navigate('/gio-hang?added=1')
  }

  const handleBuyNow = () => {
    addToCart({
      id: String(bookId),
      bookName: book.bookName,
      description: book.description || '',
      image: book.image,
      price,
      originalPrice: hasDiscount ? originalPrice : price,
      quantity
    })
    navigate('/gio-hang?added=1')
  }

  const changeQty = (delta) => {
    setQuantity((q) => Math.max(1, Math.min(stock, q + delta)))
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/san-pham">Sản phẩm</Link>
        {categoryName && (
          <>
            <span className="breadcrumb__sep">›</span>
            <Link to={`/san-pham?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
          </>
        )}
        <span className="breadcrumb__sep">›</span>
        <span>{book.bookName}</span>
      </div>

      <div className="book-detail">
        <div className="book-detail__gallery">
          <div className="book-detail__image-wrap">
            <div className="book-detail__image">
              {mainImage ? (
                <img src={mainImage} alt={book.bookName} />
              ) : (
                <div className="book-detail__image-placeholder" />
              )}
            </div>
          </div>
        </div>

        <div className="book-detail__info">
          <h1 className="book-detail__title">{book.bookName}</h1>

          {categoryName && (
            <p className="book-detail__category">Danh mục: {categoryName}</p>
          )}

          <div className="book-detail__rating-row">
            <div className="book-detail__stars" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= rating ? 'filled' : ''}>★</span>
              ))}
            </div>
            <span className="book-detail__review-count">({reviewCount} bình luận)</span>
          </div>

          <div className="book-detail__prices">
            <span className="book-detail__price-current">{price.toLocaleString('vi-VN')}₫</span>
            {hasDiscount && (
              <>
                <span className="book-detail__price-original">{originalPrice.toLocaleString('vi-VN')}₫</span>
                <span className="book-detail__discount-badge">-{discount}%</span>
              </>
            )}
          </div>

          <dl className="book-detail__attrs">
            <div className="book-detail__attr">
              <dt>Mã hàng</dt>
              <dd>{bookId}</dd>
            </div>
            {(book.publisher || book.category) && (
              <div className="book-detail__attr">
                <dt>Tên Nhà Cung Cấp</dt>
                <dd>
                  {categoryName ? (
                    <Link to={`/san-pham?category=${encodeURIComponent(categoryName)}`} className="book-detail__link">
                      {book.publisher || categoryName}
                    </Link>
                  ) : (
                    book.publisher || '—'
                  )}
                </dd>
              </div>
            )}
            {book.author && (
              <div className="book-detail__attr">
                <dt>Tác giả</dt>
                <dd>{book.author}</dd>
              </div>
            )}
            {book.publisher && (
              <div className="book-detail__attr">
                <dt>NXB</dt>
                <dd>{book.publisher}</dd>
              </div>
            )}
          </dl>

          <div className="book-detail__qty-row">
            <label className="book-detail__qty-label">Số lượng</label>
            <div className="book-detail__qty-controls">
              <button type="button" className="book-detail__qty-btn" onClick={() => changeQty(-1)} disabled={quantity <= 1}>−</button>
              <input
                type="number"
                min={1}
                max={stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value, 10) || 1)))}
                className="book-detail__qty-input"
              />
              <button type="button" className="book-detail__qty-btn" onClick={() => changeQty(1)} disabled={quantity >= stock}>+</button>
            </div>
            <span className="book-detail__stock">{stock} sản phẩm có sẵn</span>
          </div>

          <div className="book-detail__actions">
            <button type="button" className="book-detail__btn book-detail__btn--cart" onClick={handleAddToCart}>
              <span className="book-detail__btn-icon">🛒</span>
              THÊM VÀO GIỎ
            </button>
            <button type="button" className="book-detail__btn book-detail__btn--buy" onClick={handleBuyNow}>
              <span className="book-detail__btn-icon">🛍</span>
              MUA NGAY
            </button>
            <button type="button" className="book-detail__btn-icon-only" title="Yêu thích" aria-label="Yêu thích">♥</button>
            <button type="button" className="book-detail__btn-icon-only" title="So sánh" aria-label="So sánh">⇄</button>
          </div>

          <div className="book-detail__tabs">
            <button
              type="button"
              className={`book-detail__tab ${activeTab === 'description' ? 'book-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả
            </button>
            <button
              type="button"
              className={`book-detail__tab ${activeTab === 'comments' ? 'book-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Bình luận ({reviewsTotal})
            </button>
          </div>
          <div className="book-detail__tab-content">
            {activeTab === 'description' && (
              <div className="book-detail__description">
                {book.description ? (
                  <p>{book.description}</p>
                ) : (
                  <p className="book-detail__no-desc">Chưa có mô tả.</p>
                )}
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="book-detail__comments">
                <h3 className="book-detail__comments-title">Bình luận ({reviewsTotal})</h3>
                <div className="book-detail__comments-body">
                  <div className="book-detail__comment-list">
                    {reviewsLoading ? (
                      <p className="book-detail__comments-loading">Đang tải bình luận...</p>
                    ) : reviews.length === 0 ? (
                      <p className="book-detail__comments-empty">Chưa có bình luận nào.</p>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.reviewId} className="book-detail__comment-item">
                          <div className="book-detail__comment-avatar" aria-hidden>
                            {r.username && r.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="book-detail__comment-main">
                            <div className="book-detail__comment-meta">
                              <span className="book-detail__comment-name">{r.username || 'Ẩn danh'}</span>
                              <span className="book-detail__comment-time">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: false
                                    }).replace(/\//g, '-')
                                  : ''}
                              </span>
                            </div>
                            <p className="book-detail__comment-text">{r.comment || ''}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {isLoggedIn() ? (
                    <div className="book-detail__comment-form-wrap">
                      <h4 className="book-detail__comment-form-title">Để lại bình luận</h4>
                      <form onSubmit={handleSubmitComment} className="book-detail__comment-form">
                        <label htmlFor="book-comment-content" className="book-detail__comment-label">
                          Nội dung <span className="book-detail__comment-required">*</span>
                        </label>
                        <textarea
                          id="book-comment-content"
                          className="book-detail__comment-textarea"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Viết bình luận của bạn..."
                          rows={4}
                          disabled={commentSubmitting}
                        />
                        {commentError && (
                          <p className="book-detail__comment-error">{commentError}</p>
                        )}
                        <button
                          type="submit"
                          className="book-detail__comment-submit"
                          disabled={commentSubmitting}
                        >
                          {commentSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="book-detail__comment-login">
                      <p>Vui lòng đăng nhập để có thể bình luận</p>
                      <Link to="/dang-nhap" className="book-detail__comment-login-btn">
                        Đăng nhập ngay
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
