import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getBooks } from '../api/books.js'
import { ProductSection } from '../components/ProductCard.jsx'

function HeroBanner({ hotBooks = [] }) {
  const slides = Array.isArray(hotBooks) ? hotBooks.slice(0, 5) : []
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return undefined
    setCurrent(0)
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [slides.length])

  const currentBook = slides[current]
  const formatPrice = (value) => {
    const num = Number(value ?? 0)
    return num.toLocaleString('vi-VN')
  }

  return (
    <section className="hero">
      <div className="hero__content">
        <span className="hero__label">HOANGKIMBOOKS</span>
        <h1>KIẾN TẠO 2026</h1>
        <p>
          Kho sách chọn lọc giúp bạn phát triển tư duy, kiến tạo tương lai
          bền vững.
        </p>
        <Link to="/san-pham" className="hero__cta">Khám phá ngay</Link>
      </div>
      <div className="hero__banner">
        {currentBook && (
          <div className="hero-slider">
            <div className="hero-slide">
              <div className="hero-slide-image">
                {currentBook.image && (
                  <img src={currentBook.image} alt={currentBook.bookName ?? ''} />
                )}
              </div>
              <div className="hero-slide-info">
                <h3>{currentBook.bookName}</h3>
                {currentBook.author && (
                  <p className="hero-slide-author">{currentBook.author}</p>
                )}
                <div className="hero-slide-price">
                  {formatPrice(currentBook.price)}đ
                </div>
              </div>
            </div>
            {slides.length > 1 && (
              <div className="hero-slider-dots">
                {slides.map((book, index) => (
                  <button
                    key={book.bookId ?? index}
                    type="button"
                    className={index === current ? 'active' : ''}
                    onClick={() => setCurrent(index)}
                    aria-label={`Sách hot ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const [bestSellerBooks, setBestSellerBooks] = useState([])
  const [newBooks, setNewBooks] = useState([])
  const [loadingBest, setLoadingBest] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)

  useEffect(() => {
    setLoadingBest(true)
    setLoadingNew(true)

    // Giả lập "bán chạy" bằng cách lấy danh sách sách và sắp xếp theo giá giảm dần
    getBooks({ pageNo: 1, pageSize: 12, sortBy: 'price:desc' })
      .then((res) => setBestSellerBooks(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setBestSellerBooks([]))
      .finally(() => setLoadingBest(false))

    // Sách mới: sắp xếp theo bookId giảm dần
    getBooks({ pageNo: 1, pageSize: 12, sortBy: 'bookId:desc' })
      .then((res) => setNewBooks(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setNewBooks([]))
      .finally(() => setLoadingNew(false))
  }, [])

  return (
    <>
      <HeroBanner hotBooks={loadingBest ? [] : bestSellerBooks} />
      <div className="main__content">
        <div className="main__sections" style={{ width: '100%' }}>
          <ProductSection
            title="Sản phẩm bán chạy"
            highlight="Bán chạy"
            products={loadingBest ? [] : bestSellerBooks}
            initialVisibleCount={4}
          />
          <ProductSection
            title="Sách mới"
            highlight="Mới"
            products={loadingNew ? [] : newBooks}
            initialVisibleCount={4}
          />
        </div>
      </div>
    </>
  )
}
