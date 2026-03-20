import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import ProductCard from '../components/ProductCard.jsx'
import { CategoryBanner } from '../components/CategoryBanner.jsx'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá: thấp đến cao' },
  { value: 'priceDesc', label: 'Giá: cao đến thấp' }
]

export default function TruyenTranhThieuNhiPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getBooks({ pageNo: 1, pageSize: 24, category: 'Truyện tranh' }),
      getBooks({ pageNo: 1, pageSize: 24, category: 'Thiếu nhi' })
    ])
      .then(([resComic, resChildren]) => {
        const comic = Array.isArray(resComic?.data) ? resComic.data : []
        const children = Array.isArray(resChildren?.data) ? resChildren.data : []
        const combined = [...comic, ...children]
        setBooks(combined)
      })
      .catch(() => setBooks([]))
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
    <div className="truyen-tranh-page">
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>TRUYỆN TRANH & THIẾU NHI</span>
      </div>

      <div className="main__content">
        <div className="page-banner page-banner--image">
          <img src="/images/10.png" alt="Truyện tranh & Thiếu nhi" className="page-banner__img" />
        </div>

        <div className="products-main" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <CategoryBanner
            categoryName="Truyện tranh & Thiếu nhi"
            books={books}
            showBookCovers={books.length > 0}
          />
          <div className="products-toolbar">
            <h1 className="products-title">Truyện tranh & Thiếu nhi</h1>
            <div className="products-actions">
              <label className="products-toolbar__label" htmlFor="comic-sort">
                Sắp xếp:
              </label>
              <select
                id="comic-sort"
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
            <div className="products-loading">Đang tải...</div>
          ) : (
            <div className="product-list">
              {sortedBooks.map((book) => (
                <ProductCard key={book.bookId} book={book} />
              ))}
            </div>
          )}

          {!loading && sortedBooks.length === 0 && (
            <p className="products-empty">Chưa có sản phẩm nào trong mục này.</p>
          )}
        </div>
      </div>
    </div>
  )
}
