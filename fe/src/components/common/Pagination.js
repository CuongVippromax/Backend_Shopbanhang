import React from 'react';

export const Pagination = ({ pageNo, totalPages, onChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  const current = Number(pageNo);
  const pages = [];
  const max = totalPages;
  const window = 1;

  const add = (p) => pages.push(p);
  add(1);
  if (current - window > 2) add('…');
  for (let p = Math.max(2, current - window); p <= Math.min(max - 1, current + window); p++) add(p);
  if (current + window < max - 1) add('…');
  if (max > 1) add(max);

  const handle = (p) => {
    if (typeof p !== 'number' || p === current) return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      document.documentElement.scrollTop = 0;
    }
    onChange?.(p);
  };

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="page-btn"
        onClick={() => handle(current - 1)}
        disabled={current <= 1}
        aria-label="Trang trước"
      >
        ‹
      </button>
      {pages.map((p, i) => (
        <button
          key={`${p}-${i}`}
          type="button"
          className={`page-btn ${p === current ? 'is-active' : ''} ${p === '…' ? 'is-ellipsis' : ''}`}
          onClick={() => handle(p)}
          disabled={p === '…'}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="page-btn"
        onClick={() => handle(current + 1)}
        disabled={current >= max}
        aria-label="Trang sau"
      >
        ›
      </button>
      <style>{`
        .pagination {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .page-btn {
          min-width: 38px;
          height: 38px;
          padding: 0 10px;
          border-radius: 10px;
          background: var(--color-surface);
          color: var(--color-text-soft);
          font-weight: 600;
          border: 1px solid var(--color-border);
          transition: all 0.18s ease;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--color-primary-soft);
          color: var(--color-primary);
        }
        .page-btn.is-active {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }
        .page-btn:disabled { opacity: 0.45; cursor: default; }
        .page-btn.is-ellipsis { border: none; background: transparent; }
      `}</style>
    </nav>
  );
};

export default Pagination;
