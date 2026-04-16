import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import { getCategories } from '../api/categories.js'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx'
import { CategoryBanner } from '../components/CategoryBanner.jsx'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Search: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
}

/* ================================================================
   SORT OPTIONS
   ================================================================ */

const SORT_OPTIONS = [
  { value: 'bookId:desc', label: 'Mới nhất' },
  { value: 'bookId:asc', label: 'Cũ nhất' },
  { value: 'bookName:asc', label: 'Tên: A - Z' },
  { value: 'bookName:desc', label: 'Tên: Z - A' },
  { value: 'price:asc', label: 'Giá: Thấp đến cao' },
  { value: 'price:desc', label: 'Giá: Cao đến thấp' },
]

/* ================================================================
   FILTER CHIPS COMPONENT
   ================================================================ */

function FilterChips({ search, category, categoryId, categoryFilterLabel, onClear, onClearSearch, onClearCategory }) {
  const hasFilters =
    Boolean(String(search || '').trim()) ||
    Boolean(String(category || '').trim()) ||
    categoryId != null ||
    Boolean(String(categoryFilterLabel || '').trim())

  if (!hasFilters) return null

  return (
    <div className="filter-chips">
      <span className="filter-chips__label">
        <Icons.Filter /> Lọc:
      </span>

      {search && (
        <span className="filter-chip filter-chip--search">
          <span>"{search}"</span>
          <button onClick={onClearSearch} aria-label="Xóa tìm kiếm">
            <Icons.X />
          </button>
        </span>
      )}

      {categoryFilterLabel && (
        <span className="filter-chip filter-chip--category">
          <span>{categoryFilterLabel}</span>
          <button onClick={onClearCategory} aria-label="Xóa danh mục">
            <Icons.X />
          </button>
        </span>
      )}

      <button className="filter-chips__clear-all" onClick={onClear}>
        Xóa tất cả
      </button>
    </div>
  )
}

/* ================================================================
   EMPTY STATE COMPONENT
   ================================================================ */

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icons.Search />
      </div>
      <h3 className="empty-state__title">Không tìm thấy sản phẩm</h3>
      <p className="empty-state__description">
        {hasFilters
          ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc để xem thêm sản phẩm.'
          : 'Hiện tại chưa có sản phẩm nào trong danh mục này.'}
      </p>
      {hasFilters && (
        <button className="btn btn-primary" onClick={onClear}>
          Xóa bộ lọc
        </button>
      )}
    </div>
  )
}

/* ================================================================
   LOADING SKELETON
   ================================================================ */

function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="product-grid" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/* ================================================================
   SIDEBAR CATEGORIES
   ================================================================ */

function SidebarCategories({ categories, categoryId, categoryName, onSelectCategory }) {
  return (
    <aside className="sidebar-categories">
      <div className="sidebar-categories__header">
        <Icons.Package />
        <h3>Danh mục sách</h3>
      </div>
      <ul className="sidebar-categories__list">
        <li>
          <button
            className={`sidebar-category-item ${!categoryName && categoryId == null ? 'active' : ''}`}
            onClick={() => onSelectCategory(null, null)}
            aria-label="Xem tất cả sách"
          >
            <span className="sidebar-category-item__name">Tất cả sách</span>
            <span className="sidebar-category-item__arrow">
              <Icons.ChevronDown />
            </span>
          </button>
        </li>
        {categories.map((cat) => {
          const name = cat.categoryName ?? cat.CategoryName ?? ''
          const cid = cat.categoryId ?? cat.CategoryId
          const isActive =
            (categoryId != null && Number(cid) === categoryId) ||
            (categoryId == null && categoryName === name)

          return (
            <li key={cid ?? name}>
              <button
                className={`sidebar-category-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cid, name)}
                aria-label={`Xem sách danh mục ${name}`}
              >
                <span className="sidebar-category-item__name">{name}</span>
                <span className="sidebar-category-item__arrow">
                  <Icons.ChevronDown />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

/* ================================================================
   TOOLBAR COMPONENT
   ================================================================ */

function Toolbar({ title, sortBy, onSortChange, viewMode, onViewModeChange }) {
  return (
    <div className="products-toolbar">
      <div className="products-toolbar__left">
        <h1 className="products-title">{title}</h1>
      </div>
      <div className="products-toolbar__right">
        <div className="sort-dropdown">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Hiển thị lưới"
            title="Hiển thị lưới"
          >
            <Icons.Grid />
          </button>
          <button
            type="button"
            className={`view-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label="Hiển thị danh sách"
            title="Hiển thị danh sách"
          >
            <Icons.List />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN PRODUCTS PAGE COMPONENT
   ================================================================ */

export default function ProductsPage() {
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()

  /* Đọc query từ location.search để luôn khớp URL sau khi bấm Link (dropdown) */
  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const search = query.get('search') ?? ''
  const category = query.get('category') ?? ''
  const categoryIdRaw = query.get('categoryId')?.trim() ?? ''
  const categoryIdParsed = categoryIdRaw !== '' ? parseInt(categoryIdRaw, 10) : NaN
  const categoryId = Number.isFinite(categoryIdParsed) ? categoryIdParsed : null
  const pageRaw = parseInt(query.get('page') ?? '1', 10)
  const pageNo = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  const sortBy = query.get('sortBy') ?? 'bookId:desc'

  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bật skeleton khi đổi trang / lọc
    setLoading(true)
    getBooks({
      pageNo,
      pageSize: 12,
      sortBy,
      search,
      category: categoryId != null ? '' : category,
      categoryId: categoryId ?? undefined,
    })
      .then((res) => {
        if (cancelled) return
        setBooks(Array.isArray(res?.data) ? res.data : [])
        setTotalPages(res?.totalPages ?? 0)
      })
      .catch(() => {
        if (cancelled) return
        setBooks([])
        setTotalPages(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [pageNo, sortBy, search, category, categoryId])

  useEffect(() => {
    getCategories({ pageSize: 50 })
      .then((res) => {
        const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
        const seen = new Set()
        const list = raw.filter((c) => {
          const id = c?.categoryId ?? c?.categoryName ?? c?.CategoryName
          if (seen.has(id)) return false
          seen.add(id)
          return true
        })
        setCategories(list)
      })
      .catch(() => setCategories([]))
  }, [])

  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === '') next.delete(k)
        else next.set(k, String(v))
      })
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resolvedCategoryLabel = useMemo(() => {
    if (categoryId != null) {
      const c = categories.find((x) => Number(x.categoryId ?? x.CategoryId) === categoryId)
      if (c) return String(c.categoryName ?? c.CategoryName ?? '').trim()
    }
    return category ? String(category).trim() : ''
  }, [categoryId, category, categories])

  const categoryFilterLabel =
    resolvedCategoryLabel || (categoryId != null ? `Danh mục #${categoryId}` : '')

  const getTitle = () => {
    if (search) return `Kết quả: "${search}"`
    if (categoryFilterLabel) return categoryFilterLabel
    return 'Tất cả sách'
  }

  const clearAllFilters = () => {
    setSearchParams({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectCategory = (cid, name) => {
    if (cid != null) {
      const label = name != null ? String(name).trim() : ''
      updateParams({ categoryId: cid, category: label, page: 1 })
    } else {
      updateParams({ category: '', categoryId: '', page: 1 })
    }
  }

  const hasFilters =
    Boolean(String(search || '').trim()) ||
    Boolean(String(category || '').trim()) ||
    categoryId != null

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{getTitle()}</span>
      </div>

      <div className="main__content">
        <div className="products-page">
          {/* Sidebar */}
          <SidebarCategories
            categories={categories}
            categoryId={categoryId}
            categoryName={category}
            onSelectCategory={handleSelectCategory}
          />

          {/* Main Content */}
          <div className="products-main">
            {/* Category Banner */}
            <CategoryBanner
              categoryName={categoryFilterLabel || (search ? null : 'Tất cả sách')}
              books={books}
              showBookCovers={books.length > 0 && !loading}
            />

            {/* Toolbar */}
            <Toolbar
              title={getTitle()}
              sortBy={sortBy}
              onSortChange={(value) => updateParams({ sortBy: value, page: 1 })}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Filter Chips */}
            <FilterChips
              search={search}
              category={category}
              categoryId={categoryId}
              categoryFilterLabel={categoryFilterLabel}
              onClear={clearAllFilters}
              onClearSearch={() => updateParams({ search: '', page: 1 })}
              onClearCategory={() => updateParams({ category: '', categoryId: '', page: 1 })}
            />

            {/* Product Grid */}
            {loading ? (
              <LoadingSkeleton count={12} />
            ) : books.length > 0 ? (
              <div className={`product-grid ${viewMode === 'list' ? 'product-grid--list' : ''}`}>
                {books.map((book) => (
                  <ProductCard
                    key={`${categoryId ?? category ?? 'all'}-${book.bookId}`}
                    book={book}
                  />
                ))}
              </div>
            ) : (
              <EmptyState hasFilters={hasFilters} onClear={clearAllFilters} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination__btn pagination__btn--nav"
                  disabled={pageNo <= 1}
                  onClick={() => updateParams({ page: 1 })}
                  aria-label="Trang đầu"
                >
                  «
                </button>
                <button
                  type="button"
                  className="pagination__btn pagination__btn--nav"
                  disabled={pageNo <= 1}
                  onClick={() => updateParams({ page: pageNo - 1 })}
                  aria-label="Trang trước"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1
                  if (totalPages > 5) {
                    const start = Math.max(1, Math.min(pageNo - 2, totalPages - 4))
                    page = start + i
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      className={`pagination__btn ${page === pageNo ? 'active' : ''}`}
                      onClick={() => updateParams({ page })}
                      aria-label={`Trang ${page}`}
                      aria-current={page === pageNo ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  type="button"
                  className="pagination__btn pagination__btn--nav"
                  disabled={pageNo >= totalPages}
                  onClick={() => updateParams({ page: pageNo + 1 })}
                  aria-label="Trang sau"
                >
                  ›
                </button>
                <button
                  type="button"
                  className="pagination__btn pagination__btn--nav"
                  disabled={pageNo >= totalPages}
                  onClick={() => updateParams({ page: totalPages })}
                  aria-label="Trang cuối"
                >
                  »
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
