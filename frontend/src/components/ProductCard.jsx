import { Link } from 'react-router-dom'
import { useState } from 'react'

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
  const [showAll, setShowAll] = useState(false)

  const safeProducts = Array.isArray(products) ? products : []
  const visibleProducts = showAll ? safeProducts : safeProducts.slice(0, initialVisibleCount)
  const canShowMore = !showAll && safeProducts.length > initialVisibleCount

  return (
    <section className="product-section">
      <div className="section-header">
        <h2>{title}</h2>
        {highlight && <span className="section-highlight">{highlight}</span>}
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
            onClick={() => setShowAll(true)}
          >
            Xem thêm
          </button>
        </div>
      )}
    </section>
  )
}

export default function ProductCard({ book }) {
  if (!book) return null
  const price = book.price != null ? Number(book.price) : 0
  const discount = getDiscount(book.bookId)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount ? Math.round(price / (1 - discount / 100)) : 0
  const imageSrc = getImageSrc(book.image)

  return (
    <article className="product-card">
      <Link to={`/san-pham/${book.bookId}`} className="product-card__image-wrap">
        <div className="product-card__image">
          {imageSrc ? (
            <img src={imageSrc} alt={book.bookName ?? ''} />
          ) : (
            <div className="product-card__image-placeholder" title="Chưa có ảnh" />
          )}
          {hasDiscount && <span className="discount-badge">-{discount}%</span>}
        </div>
      </Link>
      <h3 className="product-card__title">
        <Link to={`/san-pham/${book.bookId}`}>{book.bookName}</Link>
      </h3>
      <div className="product-card__prices">
        <span className="price">{price.toLocaleString('vi-VN')}đ</span>
        {hasDiscount && (
          <span className="original-price">{originalPrice.toLocaleString('vi-VN')}đ</span>
        )}
      </div>
      <Link to={`/san-pham/${book.bookId}`} className="product-card__button">Mua hàng</Link>
    </article>
  )
}
