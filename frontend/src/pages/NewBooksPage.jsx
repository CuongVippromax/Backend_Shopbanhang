import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import { ProductSection } from '../components/ProductCard.jsx'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá: thấp đến cao' },
  { value: 'priceDesc', label: 'Giá: cao đến thấp' }
]

export default function NewBooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    setLoading(true)
    getBooks({ pageNo: 1, pageSize: 30, sortBy: 'bookId:desc' })
      .then((res) => {
        console.log('API Response (sach-moi):', res)
        const raw = res?.data ?? (Array.isArray(res) ? res : [])
        const allBooks = Array.isArray(raw) ? raw : []
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
        setBooks(shuffled.slice(0, 20))
      })
      .catch((err) => {
        console.error('Load sách bán chạy lỗi:', err)
        setBooks([])
      })
      .finally(() => setLoading(false))
  }, [])

  const sortedBooks = useMemo(() => {
    const list = Array.isArray(books) ? [...books] : []
    if (!list.length) return list
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
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>SÁCH MỚI PHÁT HÀNH</span>
      </div>

      <div className="main__content">
        <div className="page-banner page-banner--image">
          <img src="/images/4.webp" alt="Sách mới phát hành" className="page-banner__img" />
        </div>

        <div className="products-toolbar">
          <label className="products-toolbar__label" htmlFor="new-books-sort">
            Sắp xếp:
          </label>
          <select
            id="new-books-sort"
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

        {loading ? (
          <div className="products-loading">Đang tải sách...</div>
        ) : sortedBooks.length > 0 ? (
          <ProductSection
            title="Sách mới phát hành"
            highlight="Mới"
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
    </>
  )
}
