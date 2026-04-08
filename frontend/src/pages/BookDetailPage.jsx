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

// Toast Notification Component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: bgColor,
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideInUp 0.3s ease',
      maxWidth: '400px',
    }}>
      <span style={{ fontSize: '20px' }}>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '8px'
      }}>✕</button>
    </div>
  )
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
  const [selectedRating, setSelectedRating] = useState(5)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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
    if (selectedRating < 1) {
      setCommentError('Vui lòng chọn số sao đánh giá.')
      return
    }
    setCommentError(null)
    setCommentSubmitting(true)
    addReview({
      bookId: Number(id),
      rating: selectedRating,
      comment: commentContent.trim()
    })
      .then(() => {
        setCommentContent('')
        loadReviews()
        setToastMessage('Cảm ơn bạn đã bình luận!')
        setShowToast(true)
      })
      .catch((err) => {
        setCommentError(err.message || 'Gửi bình luận thất bại.')
      })
      .finally(() => setCommentSubmitting(false))
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p>Đang tải thông tin sách...</p>
    </div>
  )
  if (error || !book) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', color: '#ccc' }}>—</div>
      <h3>{error || 'Không tìm thấy sách.'}</h3>
      <Link to="/san-pham" style={{ color: 'var(--primary)', marginTop: '16px', display: 'inline-block' }}>
        ← Quay lại cửa hàng
      </Link>
    </div>
  )

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
  const isOutOfStock = stock === 0

  const mainImage = imageSrc

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setToastMessage('Sản phẩm đã hết hàng!')
      setShowToast(true)
      return
    }
    addToCart({
      id: String(bookId),
      bookName: book.bookName,
      description: book.description || '',
      image: book.image,
      price,
      originalPrice: hasDiscount ? originalPrice : price,
      quantity
    })
    setToastMessage(`Đã thêm "${book.bookName}" vào giỏ hàng!`)
    setShowToast(true)
    window.dispatchEvent(new Event('cart-change'))
  }

  const handleBuyNow = () => {
    if (isOutOfStock) {
      setToastMessage('Sản phẩm đã hết hàng!')
      setShowToast(true)
      return
    }
    addToCart({
      id: String(bookId),
      bookName: book.bookName,
      description: book.description || '',
      image: book.image,
      price,
      originalPrice: hasDiscount ? originalPrice : price,
      quantity
    })
    navigate('/gio-hang')
  }

  const changeQty = (delta) => {
    setQuantity((q) => Math.max(1, Math.min(stock, q + delta)))
  }

  return (
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      
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
          <div className="book-detail__image-wrap" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#fafafa',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div className="book-detail__image">
              {mainImage ? (
                <img src={mainImage} alt={book.bookName} style={{ objectFit: 'contain' }} />
              ) : (
                <div className="book-detail__image-placeholder" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#999'
                }}>Chưa có ảnh</div>
              )}
            </div>
          </div>
        </div>

        <div className="book-detail__info">
          {categoryName && (
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#fff3e0',
              color: '#e65100',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {categoryName}
            </div>
          )}
          
          <h1 className="book-detail__title" style={{ margin: '8px 0' }}>{book.bookName}</h1>

          <div className="book-detail__rating-row">
            <div className="book-detail__stars" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= rating ? 'filled' : ''} style={{ fontSize: '18px' }}>★</span>
              ))}
            </div>
            <span className="book-detail__review-count">({reviewCount} đánh giá)</span>
          </div>

          <div className="book-detail__prices" style={{ margin: '16px 0' }}>
            <span className="book-detail__price-current" style={{ fontSize: '28px' }}>{price.toLocaleString('vi-VN')}₫</span>
            {hasDiscount && (
              <>
                <span className="book-detail__price-original">{originalPrice.toLocaleString('vi-VN')}₫</span>
                <span className="book-detail__discount-badge">-{discount}%</span>
              </>
            )}
          </div>

          {isOutOfStock ? (
            <div style={{
              padding: '16px',
              background: '#ffebee',
              borderRadius: '8px',
              color: '#c62828',
              fontWeight: 600,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Sản phẩm đã hết hàng
            </div>
          ) : stock <= 5 ? (
            <div style={{
              padding: '8px 12px',
              background: '#fff3e0',
              borderRadius: '6px',
              color: '#e65100',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px'
            }}>
              Chỉ còn {stock} sản phẩm - Đặt hàng ngay!
            </div>
          ) : null}

          <dl className="book-detail__attrs">
            <div className="book-detail__attr">
              <dt>Mã sách</dt>
              <dd>#{bookId}</dd>
            </div>
            {book.author && (
              <div className="book-detail__attr">
                <dt>Tác giả</dt>
                <dd style={{ fontWeight: 500 }}>{book.author}</dd>
              </div>
            )}
            {book.publisher && (
              <div className="book-detail__attr">
                <dt>Nhà xuất bản</dt>
                <dd>{book.publisher}</dd>
              </div>
            )}
            {categoryName && (
              <div className="book-detail__attr">
                <dt>Thể loại</dt>
                <dd>
                  <Link to={`/san-pham?category=${encodeURIComponent(categoryName)}`} className="book-detail__link">
                    {categoryName}
                  </Link>
                </dd>
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
          </div>

          <div className="book-detail__actions">
            <button 
              type="button" 
              className="book-detail__btn book-detail__btn--cart" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{ flex: 1 }}
            >
              THÊM VÀO GIỎ
            </button>
            <button 
              type="button" 
              className="book-detail__btn book-detail__btn--buy" 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={{ flex: 1 }}
            >
              MUA NGAY
            </button>
          </div>

          <ul className="book-detail__trust-badges" aria-label="Cam kết dịch vụ">
            <li className="book-detail__trust-item">
              <span className="book-detail__trust-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18h2" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="6.5" cy="18.5" r="2.5" />
                  <circle cx="17.5" cy="18.5" r="2.5" />
                </svg>
              </span>
              <span className="book-detail__trust-label">Miễn phí vận chuyển</span>
            </li>
            <li className="book-detail__trust-item">
              <span className="book-detail__trust-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </span>
              <span className="book-detail__trust-label">Đổi trả trong 7 ngày</span>
            </li>
            <li className="book-detail__trust-item">
              <span className="book-detail__trust-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="book-detail__trust-label">Giao hàng nhanh 24h</span>
            </li>
          </ul>

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
                  <div style={{ lineHeight: 1.8 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Giới thiệu sách</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{book.description}</p>
                  </div>
                ) : (
                  <p className="book-detail__no-desc">Chưa có mô tả cho cuốn sách này.</p>
                )}
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="book-detail__comments">
                <div className="book-detail__comments-body" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="book-detail__comment-list">
                    {reviewsLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Đang tải bình luận...</div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ color: '#666', margin: 0 }}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                      </div>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.reviewId} className="book-detail__comment-item">
                          <div className="book-detail__comment-avatar" aria-hidden>
                            {r.username && r.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="book-detail__comment-main">
                            <div className="book-detail__comment-meta">
                              <span className="book-detail__comment-name">{r.username || 'Ẩn danh'}</span>
                              <span style={{ fontSize: '12px', color: '#f5c518', letterSpacing: '1px', margin: '0 4px' }}>
                                {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                              </span>
                              <span className="book-detail__comment-time">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
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
                      <h4 className="book-detail__comment-form-title">Viết đánh giá của bạn</h4>
                      <form onSubmit={handleSubmitComment} className="book-detail__comment-form">
                        {/* Star Rating Selector */}
                        <div style={{ marginBottom: '12px' }}>
                          <label className="book-detail__comment-label" style={{ display: 'block', marginBottom: '8px' }}>
                            Đánh giá <span className="book-detail__comment-required">*</span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                title={`${star} sao`}
                                onClick={() => setSelectedRating(star)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '28px',
                                  padding: '2px',
                                  lineHeight: 1,
                                  color: star <= selectedRating ? '#f5c518' : '#ddd',
                                  transition: 'transform 0.1s',
                                  transform: star <= selectedRating ? 'scale(1.1)' : 'scale(1)',
                                }}
                              >
                                ★
                              </button>
                            ))}
                            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666', fontWeight: 500 }}>
                              {selectedRating === 5 ? 'Tuyệt vời' : selectedRating === 4 ? 'Rất tốt' : selectedRating === 3 ? 'Khá tốt' : selectedRating === 2 ? 'Trung bình' : 'Kém'}
                            </span>
                          </div>
                        </div>
                        <label htmlFor="book-comment-content" className="book-detail__comment-label">
                          Nội dung bình luận
                        </label>
                        <textarea
                          id="book-comment-content"
                          className="book-detail__comment-textarea"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
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
