import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { bookApi, reviewApi, categoryApi, unwrapPage } from '../api/shopApi';
import { Icon } from '../components/common/Icon';
import { Rating } from '../components/common/Rating';
import { FullPageLoader, Spinner } from '../components/common/Spinner';
import Breadcrumb from '../components/common/Breadcrumb';
import BookGrid from '../components/book/BookGrid';
import { formatVnd, formatDate, safeImage } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ReviewForm = ({ bookId, onCreated }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="review-login">
        <p>Vui lòng <Link to="/auth/login">đăng nhập</Link> để viết đánh giá.</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.show('Vui lòng nhập nội dung đánh giá.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const data = await reviewApi.create({ bookId, rating, comment: comment.trim() });
      toast.show('Cảm ơn bạn đã đánh giá!', 'success');
      setComment('');
      setRating(5);
      onCreated?.(data);
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể gửi đánh giá. Bạn có thể chưa mua sản phẩm này.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <h4>Viết đánh giá của bạn</h4>
      <div className="rate-row">
        <span>Đánh giá:</span>
        <div className="rate-input">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRating(v)}
              aria-label={`${v} sao`}
              className={`rate-star ${rating >= v ? 'is-on' : ''}`}
            >
              <Icon name="star" size={22} color={rating >= v ? 'var(--color-accent)' : 'var(--color-border)'} />
            </button>
          ))}
          <span className="rate-label">{rating} / 5</span>
        </div>
      </div>
      <textarea
        className="form-control"
        rows={4}
        value={comment}
        placeholder="Chia sẻ cảm nhận về cuốn sách..."
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
        {submitting ? <><Spinner size={14} /> Đang gửi…</> : 'Gửi đánh giá'}
      </button>
      <style>{`
        .review-form { padding: 22px; background: var(--color-bg-alt); border-radius: var(--radius-lg); }
        .review-form h4 { margin: 0 0 14px; }
        .rate-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .rate-input { display: inline-flex; align-items: center; gap: 6px; }
        .rate-star { padding: 0; line-height: 1; }
        .rate-label { font-size: 13px; color: var(--color-text-soft); margin-left: 6px; font-weight: 600; }
        .review-login { padding: 22px; background: var(--color-bg-alt); border-radius: var(--radius-lg); text-align: center; }
        .review-login a { font-weight: 700; }
      `}</style>
    </form>
  );
};

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    bookApi.getById(id)
      .then((data) => setBook(data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!book) return;
    setReviewsLoading(true);
    reviewApi.getByBook(book.bookId, 1, 10)
      .then((resp) => setReviews(unwrapPage(resp).items))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
    if (book.categoryId) {
      categoryApi.getBooks(book.categoryId)
        .then((list) => {
          const arr = Array.isArray(list) ? list : (list?.data || []);
          setRelated(arr.filter((b) => b.bookId !== book.bookId).slice(0, 4));
        })
        .catch(() => setRelated([]));
    }
  }, [book]);

  if (loading) return <FullPageLoader />;
  if (!book) {
    return (
      <div className="container section text-center">
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/books" className="btn btn-primary mt-3">Về trang sản phẩm</Link>
      </div>
    );
  }

  const outOfStock = book.quantity != null && book.quantity <= 0;

  const onAdd = async () => {
    const ok = await addItem(book.bookId, qty);
    if (!ok) return;
  };
  const onBuyNow = async () => {
    const ok = await addItem(book.bookId, qty);
    if (ok) navigate('/checkout');
  };

  return (
    <>
      <Breadcrumb items={[
        { label: 'Sản phẩm', to: '/books' },
        ...(book.category ? [{ label: book.category, to: `/books?category=${book.categoryId}` }] : []),
        { label: book.bookName },
      ]} />

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div className="detail-cover">
              <img
                src={safeImage(book.image, book.bookName)}
                alt={book.bookName}
                onError={(e) => { e.currentTarget.src = safeImage(null, book.bookName); }}
              />
              {outOfStock && <span className="detail-stock-tag">Tạm hết hàng</span>}
            </div>

            <div className="detail-info">
              {book.category && <span className="badge">{book.category}</span>}
              <h1 className="detail-title">{book.bookName}</h1>
              {book.author && <p className="detail-author">Tác giả: <strong>{book.author}</strong></p>}

              <div className="detail-rating">
                <Rating value={book.averageRating || 0} size={18} showValue />
                <span className="detail-rating-count">{book.reviewCount || 0} đánh giá</span>
              </div>

              <div className="detail-price-box">
                <span className="detail-price">{formatVnd(book.price)}</span>
                <span className="detail-price-tax">Đã bao gồm VAT</span>
              </div>

              <ul className="detail-meta">
                {book.publisher && <li><span>NXB</span><strong>{book.publisher}</strong></li>}
                {book.publicationYear && <li><span>Năm phát hành</span><strong>{book.publicationYear}</strong></li>}
                <li><span>Còn hàng</span><strong>{outOfStock ? 'Hết hàng' : `${book.quantity || 0} cuốn`}</strong></li>
              </ul>

              <div className="detail-qty-row">
                <span>Số lượng:</span>
                <div className="qty-input">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Giảm"><Icon name="minus" size={14} /></button>
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    max={book.quantity || 99}
                    onChange={(e) => setQty(Math.max(1, Math.min(book.quantity || 99, parseInt(e.target.value || '1', 10))))}
                  />
                  <button onClick={() => setQty((q) => Math.min(book.quantity || 99, q + 1))} aria-label="Tăng"><Icon name="plus" size={14} /></button>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn btn-secondary btn-lg btn-block" onClick={onAdd} disabled={outOfStock}>
                  <Icon name="cart" size={18} /> Thêm vào giỏ
                </button>
                <button className="btn btn-primary btn-lg btn-block" onClick={onBuyNow} disabled={outOfStock}>
                  Mua ngay
                </button>
              </div>

              <div className="detail-trust">
                <div><Icon name="truck" size={20} /><span>Giao hàng toàn quốc</span></div>
                <div><Icon name="shield" size={20} /><span>Sách chính hãng</span></div>
                <div><Icon name="refresh" size={20} /><span>Đổi trả 7 ngày</span></div>
              </div>
            </div>
          </div>

          <div className="detail-tabs">
            <div className="card">
              <h3 className="card-title">Giới thiệu sách</h3>
              <p className="detail-desc">{book.description || 'Chưa có mô tả cho cuốn sách này.'}</p>
            </div>

            <div className="card">
              <h3 className="card-title">Đánh giá ({book.reviewCount || 0})</h3>
              <ReviewForm bookId={book.bookId} onCreated={(r) => setReviews((prev) => [r, ...prev])} />

              <div className="review-list">
                {reviewsLoading && <Spinner size={22} />}
                {!reviewsLoading && reviews.length === 0 && (
                  <p className="text-mute mt-3">Chưa có đánh giá nào cho cuốn sách này.</p>
                )}
                {reviews.map((r) => {
                  const name = r.username || r.userName || r.reviewerName || 'Khách';
                  const date = r.createdAt || r.reviewDate;
                  return (
                    <div className="review-item" key={r.reviewId}>
                      <div className="review-avatar">{name.charAt(0).toUpperCase()}</div>
                      <div className="review-body">
                        <div className="review-head">
                          <strong>{name}</strong>
                          <Rating value={r.rating || 0} size={13} />
                          <span className="review-date">{formatDate(date)}</span>
                        </div>
                        <p>{r.comment || r.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="section-head mt-6">
              <h2 className="section-title">
                <small>Có thể bạn thích</small>
                Sản phẩm cùng danh mục
              </h2>
            </div>
          )}
          {related.length > 0 && <BookGrid books={related} />}
        </div>
      </section>

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 48px;
          align-items: flex-start;
        }
        .detail-cover {
          background: var(--color-bg-alt);
          border-radius: var(--radius-lg);
          padding: 24px;
          aspect-ratio: 3/4;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          max-width: 460px;
          box-shadow: var(--shadow-sm);
        }
        .detail-cover img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }
        .detail-stock-tag {
          position: absolute;
          top: 14px; right: 14px;
          background: var(--color-danger);
          color: #fff;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
        }
        .detail-info .badge { margin-bottom: 8px; }
        .detail-title {
          font-family: var(--font-serif);
          font-size: 32px;
          line-height: 1.2;
          margin: 0 0 6px;
        }
        .detail-author { color: var(--color-text-soft); margin-bottom: 8px; }
        .detail-rating {
          display: flex; align-items: center; gap: 10px;
          margin: 4px 0 18px;
        }
        .detail-rating-count { font-size: 13px; color: var(--color-text-mute); }
        .detail-price-box {
          background: var(--color-primary-bg);
          padding: 16px 20px;
          border-radius: var(--radius-lg);
          margin-bottom: 20px;
          display: flex; align-items: baseline; gap: 12px;
        }
        .detail-price {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
        }
        .detail-price-tax { font-size: 12px; color: var(--color-text-mute); }
        .detail-meta {
          list-style: none; padding: 0;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 0 0 24px;
        }
        .detail-meta li {
          padding: 10px 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border-soft);
          border-radius: var(--radius-md);
        }
        .detail-meta li span { display: block; font-size: 11px; color: var(--color-text-mute); text-transform: uppercase; letter-spacing: 1px; }
        .detail-meta li strong { font-size: 14px; }

        .detail-qty-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; font-weight: 600; }
        .qty-input {
          display: inline-flex; align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-surface);
        }
        .qty-input button {
          width: 36px; height: 38px;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: var(--color-text-soft);
          transition: background var(--t-fast);
        }
        .qty-input button:hover { background: var(--color-bg-alt); }
        .qty-input input {
          width: 50px; text-align: center;
          height: 38px;
          background: transparent;
          border: 0; outline: none;
          font-weight: 700;
          font-size: 15px;
        }
        .qty-input input::-webkit-outer-spin-button, .qty-input input::-webkit-inner-spin-button { display: none; }

        .detail-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .detail-trust {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding-top: 18px;
          border-top: 1px solid var(--color-border-soft);
        }
        .detail-trust > div {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px;
          color: var(--color-text-soft);
        }
        .detail-trust svg { color: var(--color-primary); }

        .detail-tabs {
          display: flex; flex-direction: column; gap: 20px;
          margin-top: 48px;
        }
        .card-title { font-family: var(--font-serif); font-size: 22px; margin-bottom: 16px; }
        .detail-desc { color: var(--color-text-soft); white-space: pre-line; line-height: 1.75; }

        .review-list { margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
        .review-item { display: flex; gap: 12px; padding: 16px; border-radius: var(--radius-md); background: var(--color-surface-soft); border: 1px solid var(--color-border-soft); }
        .review-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }
        .review-body { flex: 1; }
        .review-head {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .review-date { font-size: 12px; color: var(--color-text-mute); margin-left: auto; }
        .review-body p { margin: 4px 0 0; color: var(--color-text-soft); white-space: pre-line; }

        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr; gap: 24px; }
          .detail-cover { max-width: 100%; aspect-ratio: 1/1; }
          .detail-title { font-size: 26px; }
          .detail-meta { grid-template-columns: 1fr 1fr; }
          .detail-actions { grid-template-columns: 1fr; }
          .detail-trust { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default BookDetailPage;
