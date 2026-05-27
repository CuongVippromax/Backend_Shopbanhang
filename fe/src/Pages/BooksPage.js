import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { bookApi, categoryApi, unwrapPage } from '../api/shopApi';
import { Icon } from '../components/common/Icon';
import BookGrid from '../components/book/BookGrid';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';
import Empty from '../components/common/Empty';

const PAGE_SIZE = 12;

const sortOptions = [
  { value: '', label: 'Mới nhất' },
  { value: 'price:asc', label: 'Giá tăng dần' },
  { value: 'price:desc', label: 'Giá giảm dần' },
  { value: 'bookName:asc', label: 'Tên A → Z' },
  { value: 'bookName:desc', label: 'Tên Z → A' },
  { value: 'averageRating:desc', label: 'Đánh giá cao nhất' },
];

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const [books, setBooks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || params.id || '';
  const sortBy = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const currentCategory = useMemo(
    () => categories.find((c) => String(c.categoryId) === String(categoryId)),
    [categories, categoryId]
  );

  useEffect(() => {
    categoryApi.list()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const reqParams = {
      pageNo: Math.max(0, page - 1),
      pageSize: PAGE_SIZE,
      sortBy: sortBy || undefined,
      search: search || undefined,
      categoryId: categoryId || undefined,
    };
    bookApi.getAll(reqParams)
      .then((resp) => {
        const p = unwrapPage(resp);
        setBooks(p.items);
        setPageInfo({
          pageNo: page,
          totalPages: p.totalPages || 1,
          totalElements: p.totalElements || p.items.length,
        });
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [search, categoryId, sortBy, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value == null) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const onCategorySelect = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === '' || id == null) next.delete('category');
    else next.set('category', id);
    next.delete('page');
    setSearchParams(next);
  };

  const onClearAll = () => setSearchParams({});

  const title = search
    ? `Kết quả cho "${search}"`
    : currentCategory ? currentCategory.categoryName : 'Tất cả sách';

  return (
    <>
      <Breadcrumb items={[
        { label: 'Sản phẩm', to: '/books' },
        ...(currentCategory ? [{ label: currentCategory.categoryName }] : []),
        ...(search ? [{ label: `Tìm: ${search}` }] : []),
      ]} />

      <section className="books-page section">
        <div className="container books-layout">
          <aside className={`books-filters ${filtersOpen ? 'is-open' : ''}`}>
            <div className="filter-block">
              <div className="filter-head">
                <h4>Danh mục</h4>
                {(categoryId || search) && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={onClearAll}>
                    Xoá lọc
                  </button>
                )}
              </div>
              <ul className="cat-list">
                <li>
                  <button
                    type="button"
                    className={`cat-pill ${!categoryId ? 'is-active' : ''}`}
                    onClick={() => onCategorySelect('')}
                  >
                    Tất cả ({categories.reduce((sum, c) => sum + (c.bookCount || 0), 0)})
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.categoryId}>
                    <button
                      type="button"
                      className={`cat-pill ${String(categoryId) === String(c.categoryId) ? 'is-active' : ''}`}
                      onClick={() => onCategorySelect(c.categoryId)}
                    >
                      <span>{c.categoryName}</span>
                      <small>{c.bookCount || 0}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="books-main">
            <div className="books-toolbar">
              <div>
                <h1 className="books-title">{title}</h1>
                {!loading && (
                  <p className="books-sub">{pageInfo.totalElements} sản phẩm</p>
                )}
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm books-mfilter"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  <Icon name="filter" size={14} /> Bộ lọc
                </button>
                <div className="sort-wrap">
                  <Icon name="sort" size={14} />
                  <select value={sortBy} onChange={(e) => setParam('sort', e.target.value)}>
                    {sortOptions.map((o) => (
                      <option value={o.value} key={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(!loading && books.length === 0) ? (
              <Empty
                title="Không tìm thấy sách"
                subtitle="Hãy thử thay đổi từ khoá hoặc bỏ lọc danh mục."
                action={<Link to="/books" className="btn btn-primary">Xem tất cả sách</Link>}
              />
            ) : (
              <>
                <BookGrid books={books} loading={loading} skeletonCount={PAGE_SIZE} />
                <Pagination
                  pageNo={pageInfo.pageNo}
                  totalPages={pageInfo.totalPages}
                  onChange={(p) => setParam('page', p)}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .books-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          align-items: start;
        }
        .books-filters {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
          padding: 18px;
          position: sticky;
          top: calc(var(--header-h) + 64px);
        }
        .filter-block + .filter-block { margin-top: 24px; }
        .filter-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .filter-head h4 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-text-soft); }
        .cat-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .cat-pill {
          width: 100%;
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          text-align: left;
          font-size: 14px;
          color: var(--color-text-soft);
          transition: background var(--t-fast), color var(--t-fast);
        }
        .cat-pill:hover { background: var(--color-bg-alt); color: var(--color-text); }
        .cat-pill.is-active {
          background: var(--color-primary-bg);
          color: var(--color-primary);
          font-weight: 600;
        }
        .cat-pill small {
          background: var(--color-bg-alt);
          color: var(--color-text-mute);
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11px;
        }
        .cat-pill.is-active small { background: var(--color-primary-soft); color: #fff; }

        .books-toolbar {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 12px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .books-title {
          font-family: var(--font-serif);
          font-size: 28px;
          margin: 0;
        }
        .books-sub { color: var(--color-text-mute); margin: 4px 0 0; font-size: 13.5px; }
        .toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sort-wrap {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 6px 10px;
        }
        .sort-wrap select {
          border: 0; outline: none; background: transparent;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
        }
        .books-mfilter { display: none; }

        @media (max-width: 900px) {
          .books-layout { grid-template-columns: 1fr; }
          .books-filters {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 100;
            transform: translateY(100%);
            transition: transform 0.25s ease;
            border-radius: 0;
            margin: 0;
            overflow: auto;
            padding-top: 60px;
          }
          .books-filters.is-open { transform: none; }
          .books-mfilter { display: inline-flex; }
        }
      `}</style>
    </>
  );
};

export default BooksPage;
