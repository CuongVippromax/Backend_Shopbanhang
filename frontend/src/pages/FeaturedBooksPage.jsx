import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getBooksSachHay } from '../api/books.js'
import { ProductSection } from '../components/ProductCard.jsx'
import SachHayHeroBanner from '../components/SachHayHeroBanner.jsx'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá: thấp đến cao' },
  { value: 'priceDesc', label: 'Giá: cao đến thấp' }
]

export default function FeaturedBooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    setLoading(true)
    getBooksSachHay()
      .then((res) => {
        console.log('API Response (sach-hay):', res)
        const raw = res?.data ?? (Array.isArray(res) ? res : [])
        const allBooks = Array.isArray(raw) ? raw : []
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
        setBooks(shuffled.slice(0, 20))
      })
      .catch((err) => {
        console.error('Load sách hay lỗi:', err)
        setBooks([])
      })
      .finally(() => setLoading(false))
  }, [])

  const sortedBooks = useMemo(() => {
    const list = Array.isArray(books) ? [...books] : []
    switch (sortOption) {
      case 'priceAsc':
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      case 'priceDesc':
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      case 'newest':
      default:
        return list.sort((a, b) => (b.bookId ?? 0) - (a.bookId ?? 0))
    }
  }, [books, sortOption])

  return (
    <div className="featured-books-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Sách hay</span>
      </div>

      <SachHayHeroBanner />

      <div id="sach-hay-danh-sach" className="main__content">
        <div className="products-toolbar">
          <h1 className="products-title">Sách hay</h1>
          <div className="products-actions">
            <label className="products-toolbar__label" htmlFor="featured-books-sort">
              Sắp xếp:
            </label>
            <select
              id="featured-books-sort"
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="products-loading">Đang tải sách...</div>
        ) : sortedBooks.length > 0 ? (
          <ProductSection
            title="Sách hay"
            highlight="Hay"
            products={sortedBooks}
            initialVisibleCount={4}
          />
        ) : (
          <div className="products-empty">
            <p>Không tải được danh sách sách.</p>
            <details>
              <summary>Debug info</summary>
              <pre>{JSON.stringify({ loading, booksLength: books.length }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
