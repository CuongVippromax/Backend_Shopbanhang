import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { addToCart } from '../utils/cart.js'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  Cart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Zap: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
}

/* ================================================================
   HELPERS
   ================================================================ */

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

function formatPrice(price) {
  if (price == null) return '0'
  return Number(price).toLocaleString('vi-VN')
}

/* ================================================================
   MODERN TOAST COMPONENT
   ================================================================ */

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const config = {
    success: { bg: '#10b981', icon: <Icons.Check /> },
    error: { bg: '#ef4444', icon: <Icons.X /> },
    info: { bg: '#3b82f6', icon: <Icons.Check /> },
  }

  const { bg, icon } = config[type] || config.success

  return (
    <div className="toast-modern" style={{ '--toast-bg': bg }}>
      <div className="toast-modern__icon">{icon}</div>
      <div className="toast-modern__content">
        <div className="toast-modern__message">{message}</div>
      </div>
      <button className="toast-modern__close" onClick={onClose}>
        <Icons.X />
      </button>
      <div className="toast-modern__progress" />
    </div>
  )
}

/* ================================================================
   STAR RATING COMPONENT
   ================================================================ */

function StarRating({ stars = 5, count = 0 }) {
  return (
    <div className="product-card__rating">
      <div className="product-card__stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`star ${i < stars ? 'star--filled' : ''}`}>
            <Icons.Star />
          </span>
        ))}
      </div>
      {count > 0 && (
        <span className="product-card__review-count">({count} đánh giá)</span>
      )}
    </div>
  )
}

/* ================================================================
   PRODUCT CARD COMPONENT
   ================================================================ */

export default function ProductCard({ book }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  if (!book) return null

  const price = book.price != null ? Number(book.price) : 0
  const discount = getDiscount(book.bookId)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount ? Math.round(price / (1 - discount / 100)) : 0
  const imageSrc = getImageSrc(book.image)
  const showImage = imageSrc && !imgError
  const detailUrl = `/san-pham/${book.bookId}`

  const stock = book.stock ?? book.quantity ?? 0
  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) {
      setToastMessage('Sản phẩm đã hết hàng!')
      setShowToast(true)
      return
    }
    addToCart({
      id: book.bookId,
      bookName: book.bookName,
      description: book.description ?? '',
      image: book.image,
      price: book.price,
      quantity: 1
    })
    setToastMessage(`Đã thêm "${book.bookName}" vào giỏ hàng!`)
    setShowToast(true)
    window.dispatchEvent(new Event('cart-change'))
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) {
      setToastMessage('Sản phẩm đã hết hàng!')
      setShowToast(true)
      return
    }
    addToCart({
      id: book.bookId,
      bookName: book.bookName,
      description: book.description ?? '',
      image: book.image,
      price: book.price,
      quantity: 1
    })
    navigate('/gio-hang')
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(detailUrl)
  }

  return (
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <article
        className={`product-card ${isOutOfStock ? 'product-card--out-of-stock' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="product-card__image-wrap">
          <Link to={detailUrl} className="product-card__image-link">
            <div className="product-card__image">
              {showImage ? (
                <img
                  src={imageSrc}
                  alt={book.bookName ?? ''}
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="product-card__image-placeholder">
                  <Icons.Package />
                  <span>Chưa có ảnh</span>
                </div>
              )}

              {/* Badges */}
              {hasDiscount && (
                <span className="product-card__badge product-card__badge--sale">
                  <Icons.Zap /> -{discount}%
                </span>
              )}

              {isLowStock && !isOutOfStock && (
                <span className="product-card__badge product-card__badge--low-stock">
                  Sắp hết
                </span>
              )}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="product-card__overlay">
                  <span className="product-card__overlay-text">Hết hàng</span>
                </div>
              )}
            </div>
          </Link>

          {/* Hover Actions */}
          <div className={`product-card__actions-overlay ${isHovered ? 'product-card__actions-overlay--visible' : ''}`}>
            <button
              type="button"
              className="product-card__action-btn"
              onClick={handleQuickView}
              title="Xem nhanh"
            >
              <Icons.Eye />
            </button>
            <button
              type="button"
              className="product-card__action-btn"
              onClick={handleAddToCart}
              title="Thêm vào giỏ"
              disabled={isOutOfStock}
            >
              <Icons.ShoppingBag />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="product-card__content">
          <Link to={detailUrl} className="product-card__title-link">
            <h3 className="product-card__title">{book.bookName}</h3>
          </Link>

          {book.author && (
            <p className="product-card__author">{book.author}</p>
          )}

          <StarRating stars={book.avgRating || 4} count={book.reviewCount || 0} />

          <div className="product-card__pricing">
            <span className="product-card__price">{formatPrice(price)}đ</span>
            {hasDiscount && (
              <span className="product-card__price-original">{formatPrice(originalPrice)}đ</span>
            )}
          </div>

          {isLowStock && !isOutOfStock && (
            <div className="product-card__stock-warning">
              <Icons.Zap /> Chỉ còn {stock} sản phẩm
            </div>
          )}

          {!isOutOfStock && (
            <div className="product-card__cta">
              <button
                type="button"
                className="product-card__btn product-card__btn--outline"
                onClick={handleAddToCart}
              >
                <Icons.ShoppingBag />
                <span>Thêm vào giỏ</span>
              </button>
              <button
                type="button"
                className="product-card__btn product-card__btn--primary"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
            </div>
          )}
        </div>
      </article>
    </>
  )
}

/* ================================================================
   PRODUCT SECTION COMPONENT
   ================================================================ */

export function ProductSection({ title, highlight, products = [], initialVisibleCount = 4, linkTo }) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)
  const safeProducts = Array.isArray(products) ? products : []
  const visibleProducts = safeProducts.slice(0, visibleCount)
  const canShowMore = visibleCount < safeProducts.length

  const handleShowMore = () => {
    setVisibleCount(safeProducts.length)
  }

  return (
    <section className="product-section">
      <div className="section-header section-header--underline">
        <div className="section-header__left">
          <h2 className="section-header__title">{title}</h2>
          {highlight && (
            <span className="section-header__highlight">{highlight}</span>
          )}
        </div>
        <div className="section-header__right">
          <span className="section-header__line" />
          {linkTo && (
            <Link to={linkTo} className="section-header__link">
              Xem tất cả <Icons.ChevronRight />
            </Link>
          )}
        </div>
      </div>

      <div className="product-list stagger-children">
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.bookId} book={product} />
        ))}
      </div>

      {canShowMore && !linkTo && (
        <div className="product-section__more">
          <button
            type="button"
            className="product-section__more-button"
            onClick={handleShowMore}
          >
            Xem tất cả
          </button>
        </div>
      )}
    </section>
  )
}

/* ================================================================
   PRODUCT SKELETON COMPONENT
   ================================================================ */

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton skeleton-image" />
      <div className="product-card-skeleton__content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

export function ProductSectionSkeleton({ count = 4 }) {
  return (
    <section className="product-section">
      <div className="section-header section-header--underline">
        <div className="skeleton" style={{ width: 150, height: 24 }} />
      </div>
      <div className="product-list">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
