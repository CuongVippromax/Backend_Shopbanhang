import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import { getCategories } from '../api/categories.js'
import ProductCard from '../components/ProductCard.jsx'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const pageNo = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const sortBy = searchParams.get('sortBy') ?? 'bookId:desc'

  const [books, setBooks] = useState([])
  const [categoryBooks, setCategoryBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // grid | list

  useEffect(() => {
    setLoading(true)
    getBooks({ pageNo, pageSize: 12, sortBy, search, category })
      .then((res) => {
        setBooks(Array.isArray(res?.data) ? res.data : [])
        setTotalPages(res?.totalPages ?? 0)
        setTotalElements(res?.totalElements ?? 0)
      })
      .catch(() => {
        setBooks([])
        setTotalPages(0)
        setTotalElements(0)
      })
      .finally(() => setLoading(false))
  }, [pageNo, sortBy, search, category])

  useEffect(() => {
    getCategories({ pageSize: 50 })
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]))
  }, [])

  // Fetch thêm sách cùng category để fill vào khoảng trắng
  useEffect(() => {
    if (!category || loading) return

    const currentBookIds = books.map(b => b.bookId).join(',')
    getBooks({ pageNo: 1, pageSize: 12, category, sortBy: 'bookId:desc' })
      .then((res) => {
        const allBooks = Array.isArray(res?.data) ? res.data : []
        // Lọc bỏ những sách đã hiển thị
        const filtered = allBooks.filter(b => !currentBookIds.includes(String(b.bookId)))
        setCategoryBooks(filtered.slice(0, 12))
      })
      .catch(() => setCategoryBooks([]))
  }, [category])

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k)
      else next.set(k, String(v))
    })
    setSearchParams(next)
  }

  // Tính toán số lượng sách cần thêm để fill đầy row
  const fillCount = (12 - (books.length % 12)) % 12
  const displayBooks = books.length > 0 && fillCount > 0 && categoryBooks.length > 0
    ? [...books, ...categoryBooks.slice(0, fillCount)]
    : books

  const getTitle = () => {
    if (search) return `Kết quả tìm kiếm: "${search}"`
    if (category) return category
    return 'Sách mới'
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>{getTitle().toUpperCase()}</span>
      </div>

      <div className="main__content page-with-sidebar">
        <aside className="sidebar sidebar-categories">
          <h3 className="sidebar__title">◆ Tủ sách Hoàng Kim</h3>
          <ul className="sidebar__list">
            <li>
              <Link
                to="/san-pham"
                className={!category ? 'active' : ''}
              >
                Tất cả sách
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.categoryId ?? cat.categoryName ?? cat.CategoryName}>
                <Link
                  to={`/san-pham?category=${encodeURIComponent(cat.categoryName ?? cat.CategoryName ?? '')}`}
                  className={category === (cat.categoryName ?? cat.CategoryName) ? 'active' : ''}
                >
                  {cat.categoryName ?? cat.CategoryName}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="products-main">
          <div className="products-toolbar">
            <h1 className="products-title">{getTitle()}</h1>
            <div className="products-actions">
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sortBy: e.target.value, page: 1 })}
                className="sort-select"
              >
                <option value="bookId:desc">Mới nhất</option>
                <option value="bookId:asc">Cũ nhất</option>
                <option value="bookName:asc">Tên A-Z</option>
                <option value="bookName:desc">Tên Z-A</option>
                <option value="price:asc">Giá thấp đến cao</option>
                <option value="price:desc">Giá cao đến thấp</option>
              </select>
              <div className="view-toggle">
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Lưới"
                >
                  ⊞
                </button>
                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="Danh sách"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {search && (
            <p className="search-summary">
              Tìm kiếm &quot;{search}&quot;: {totalElements} kết quả
            </p>
          )}

          {loading ? (
            <div className="products-loading">Đang tải...</div>
          ) : (
            <div className={`product-list ${viewMode === 'list' ? 'product-list--list' : ''}`}>
              {displayBooks.map((book) => (
                <ProductCard key={book.bookId} book={book} />
              ))}
            </div>
          )}

          {!loading && books.length === 0 && (
            <p className="products-empty">Chưa có sản phẩm nào.</p>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={pageNo <= 1}
                onClick={() => updateParams({ page: pageNo - 1 })}
              >
                Trước
              </button>
              <span className="pagination__info">
                Trang {pageNo} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageNo >= totalPages}
                onClick={() => updateParams({ page: pageNo + 1 })}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
