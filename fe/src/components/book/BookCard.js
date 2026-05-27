import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Rating } from '../common/Rating';
import { formatVnd, safeImage } from '../../utils/format';
import { useCart } from '../../context/CartContext';

const BookCard = ({ book, compact = false }) => {
  const { addItem } = useCart();
  const outOfStock = book?.quantity != null && book.quantity <= 0;

  const onAdd = async (e) => {
    e.preventDefault();
    if (outOfStock) return;
    await addItem(book.bookId, 1);
  };

  return (
    <Link to={`/books/${book.bookId}`} className={`book-card ${compact ? 'is-compact' : ''}`}>
      <div className="book-cover">
        <img
          src={safeImage(book.image, book.bookName)}
          alt={book.bookName}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = safeImage(null, book.bookName); }}
        />
        {outOfStock && <span className="book-tag book-tag-mute">Hết hàng</span>}
        {!outOfStock && book.category && <span className="book-tag book-tag-cat">{book.category}</span>}
        <button
          type="button"
          className="book-quick-add"
          onClick={onAdd}
          disabled={outOfStock}
          aria-label="Thêm vào giỏ"
          title={outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        >
          <Icon name="cart" size={18} />
        </button>
      </div>
      <div className="book-body">
        <h3 className="book-name" title={book.bookName}>{book.bookName}</h3>
        {book.author && <p className="book-author">{book.author}</p>}
        <div className="book-rating">
          <Rating value={book.averageRating || 0} size={14} />
          <span className="book-rating-count">({book.reviewCount || 0})</span>
        </div>
        <div className="book-foot">
          <span className="book-price">{formatVnd(book.price)}</span>
        </div>
      </div>
      <style>{`
        .book-card {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border: 1px solid var(--color-border-soft);
          border-radius: var(--radius-lg);
          overflow: hidden;
          color: inherit;
          transition: transform var(--t-base), box-shadow var(--t-base), border-color var(--t-base);
          height: 100%;
        }
        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary-lighter);
        }
        .book-cover {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--color-bg-alt);
        }
        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .book-card:hover .book-cover img { transform: scale(1.06); }
        .book-tag {
          position: absolute;
          top: 12px; left: 12px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
          background: var(--color-primary);
          color: #fff;
          backdrop-filter: blur(4px);
        }
        .book-tag-cat { background: rgba(255,255,255,0.92); color: var(--color-primary); }
        .book-tag-mute { background: rgba(44,58,51,0.85); color: #fff; }
        .book-quick-add {
          position: absolute;
          bottom: 12px; right: 12px;
          width: 38px; height: 38px;
          border-radius: 50%;
          background: var(--color-surface);
          color: var(--color-primary);
          box-shadow: var(--shadow-md);
          display: inline-flex; align-items: center; justify-content: center;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity var(--t-base), transform var(--t-base), background var(--t-fast);
        }
        .book-card:hover .book-quick-add {
          opacity: 1;
          transform: none;
        }
        .book-quick-add:hover { background: var(--color-primary); color: #fff; }
        .book-quick-add:disabled { background: var(--color-bg-alt); color: var(--color-text-mute); cursor: not-allowed; }

        .book-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .book-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.6em;
        }
        .book-author {
          font-size: 12.5px;
          color: var(--color-text-mute);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .book-rating { display: flex; align-items: center; gap: 4px; }
        .book-rating-count { font-size: 12px; color: var(--color-text-mute); }
        .book-foot {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: auto;
          padding-top: 6px;
        }
        .book-price {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-primary);
          font-family: var(--font-serif);
        }
        .is-compact .book-body { padding: 10px 12px 12px; }
        .is-compact .book-name { font-size: 14px; }
      `}</style>
    </Link>
  );
};

export default BookCard;
