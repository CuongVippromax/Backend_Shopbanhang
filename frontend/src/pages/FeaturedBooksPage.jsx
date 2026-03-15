import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import ProductCard from '../components/ProductCard.jsx'

const CARD_WIDTH = 200
const VISIBLE_GAP = 16

export default function FeaturedBooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getBooks({ pageNo: 1, pageSize: 24 })
      .then((res) => {
        const allBooks = Array.isArray(res?.data) ? res.data : []
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
        setBooks(shuffled)
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  const scroll = (dir) => {
    const el = carouselRef.current
    if (!el) return
    const step = (CARD_WIDTH + VISIBLE_GAP) * 4
    el.scrollBy({ left: dir === 'prev' ? -step : step, behavior: 'smooth' })
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>SÁCH HAY</span>
      </div>

      <div className="new-books-banner new-books-banner--image">
        <img src="/images/7.jpg" alt="Sách Hay" className="new-books-banner__img" />
      </div>

      <div className="main__content">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : books.length > 0 ? (
          <div className="bestseller-carousel">
            <button
              type="button"
              className="bestseller-carousel__arrow bestseller-carousel__arrow--prev"
              onClick={() => scroll('prev')}
              aria-label="Trước"
            >
              ‹
            </button>
            <div className="bestseller-carousel__track" ref={carouselRef}>
              {books.map((book) => (
                <div key={book.bookId} className="bestseller-carousel__card">
                  <ProductCard book={book} />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="bestseller-carousel__arrow bestseller-carousel__arrow--next"
              onClick={() => scroll('next')}
              aria-label="Sau"
            >
              ›
            </button>
          </div>
        ) : (
          <div className="empty-state">Chưa có sách hay</div>
        )}
      </div>
    </>
  )
}
