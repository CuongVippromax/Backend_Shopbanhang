import { Link, useNavigate } from 'react-router-dom'
import { useState, useId } from 'react'
import { addToCart } from '../utils/cart.js'

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

export function ProductSection({ title, highlight, products = [], initialVisibleCount = 4 }) {
  console.log('ProductSection received products:', products)
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)

  const handleShowMore = () => {
    setVisibleCount(products.length)
  }

  const safeProducts = Array.isArray(products) ? products : []
  const visibleProducts = safeProducts.slice(0, visibleCount)
  const canShowMore = visibleCount < safeProducts.length

  return (
    <section className="product-section">
      <div className="section-header section-header--underline">
        <h2 className="section-header__title">{title}</h2>
        <span className="section-header__line" />
      </div>
      <div className="product-list">
        {visibleProducts.map((product) => (
          <ProductCard key={product.bookId} book={product} />
        ))}
      </div>
      {canShowMore && (
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

function StarRating({ stars = 5 }) {
  return (
    <div className="product-card__rating" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`product-card__star ${i < stars ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  )
}

export default function ProductCard({ book }) {
  console.log('ProductCard received:', book)
  const navigate = useNavigate()
  const arrowId = useId()
  const [imgError, setImgError] = useState(false)
  if (!book) return null
  const price = book.price != null ? Number(book.price) : 0
  const discount = getDiscount(book.bookId)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount ? Math.round(price / (1 - discount / 100)) : 0
  const imageSrc = getImageSrc(book.image)
  const showImage = imageSrc && !imgError
  const detailUrl = `/san-pham/${book.bookId}`

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: book.bookId,
      bookName: book.bookName,
      description: book.description ?? '',
      image: book.image,
      price: book.price,
      quantity: 1
    })
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: book.bookId,
      bookName: book.bookName,
      description: book.description ?? '',
      image: book.image,
      price: book.price,
      quantity: 1
    })
    navigate('/gio-hang?added=1')
  }

  const handleViewDetail = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(detailUrl)
  }

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <Link to={detailUrl} className="product-card__image-link">
          <div className="product-card__image">
            {showImage ? (
              <img
                src={imageSrc}
                alt={book.bookName ?? ''}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="product-card__image-placeholder" title="Chưa có ảnh">Chưa có ảnh</div>
            )}
            {hasDiscount && <span className="discount-badge">-{discount}%</span>}
            <div className="product-card__hover-actions">
              <button
                type="button"
                className="product-card__hover-btn"
                title="Mua ngay"
                aria-label="Mua ngay"
                onClick={handleBuyNow}
              >
                <span className="product-card__hover-icon">👜</span>
              </button>
              <button
                type="button"
                className="product-card__hover-btn"
                title="Xem chi tiết"
                aria-label="Xem chi tiết"
                onClick={handleViewDetail}
              >
                <span className="product-card__hover-icon product-card__hover-icon--diagonal">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <defs>
                      <marker id={arrowId} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                        <path d="M0 0 L4 2 L0 4 Z" fill="currentColor" stroke="none" />
                      </marker>
                    </defs>
                    <line x1="3" y1="3" x2="13" y2="13" markerEnd={`url(#${arrowId})`} />
                    <line x1="3" y1="13" x2="13" y2="3" markerEnd={`url(#${arrowId})`} />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="product-card__hover-btn"
                title="Thêm vào giỏ"
                aria-label="Thêm vào giỏ"
                onClick={handleAddToCart}
              >
                <span className="product-card__hover-icon">🛒</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
      <h3 className="product-card__title">
        <Link to={detailUrl}>{book.bookName}</Link>
      </h3>
      <StarRating />
      <div className="product-card__prices">
        <span className="price">{price.toLocaleString('vi-VN')}₫</span>
        {hasDiscount && (
          <span className="original-price">{originalPrice.toLocaleString('vi-VN')}₫</span>
        )}
      </div>
    </article>
  )
}
