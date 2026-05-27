import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../api/shopApi';
import { Rating } from '../../components/common/Rating';
import { Spinner } from '../../components/common/Spinner';
import Empty from '../../components/common/Empty';
import { Icon } from '../../components/common/Icon';
import { formatDate, safeImage } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    reviewApi.myReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onRemove = async (id) => {
    if (!window.confirm('Xoá đánh giá này?')) return;
    try {
      await reviewApi.remove(id);
      toast.show('Đã xoá đánh giá.', 'info');
      load();
    } catch (err) {
      toast.show('Không thể xoá đánh giá.', 'error');
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <h2 className="page-title">Đánh giá của tôi</h2>
        <p className="page-sub">Nhận xét, đánh giá bạn đã viết cho các sản phẩm đã mua.</p>
      </div>

      {loading && <div className="card text-center"><Spinner size={28} /></div>}

      {!loading && reviews.length === 0 && (
        <div className="card">
          <Empty title="Chưa có đánh giá" subtitle="Hãy viết đánh giá cho các sản phẩm bạn đã mua." />
        </div>
      )}

      <div className="rev-list">
        {reviews.map((r) => {
          const bookTitle = r.bookName || r.bookTitle;
          return (
            <div className="rev-card" key={r.reviewId}>
              <Link to={`/books/${r.bookId}`} className="rev-thumb">
                <img src={safeImage(r.bookImage || r.thumbnailUrl, bookTitle)} alt={bookTitle}
                  onError={(e) => { e.currentTarget.src = safeImage(null, bookTitle); }}
                />
              </Link>
              <div className="rev-body">
                <Link to={`/books/${r.bookId}`} className="rev-title">{bookTitle}</Link>
                {r.bookAuthor && <span className="rev-author">Tác giả: {r.bookAuthor}</span>}
                <div className="rev-rating">
                  <Rating value={r.rating || 0} size={14} />
                  <span>{formatDate(r.createdAt || r.reviewDate)}</span>
                </div>
                <p className="rev-comment">{r.comment || r.content}</p>
              </div>
              <button className="rev-remove" onClick={() => onRemove(r.reviewId)} aria-label="Xoá">
                <Icon name="trash" size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .page-title { font-family: var(--font-serif); font-size: 22px; margin: 0; }
        .page-sub { color: var(--color-text-mute); margin: 4px 0 0; }
        .rev-list { display: flex; flex-direction: column; gap: 14px; }
        .rev-card {
          display: grid;
          grid-template-columns: 72px 1fr 40px;
          gap: 16px;
          padding: 18px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
        }
        .rev-thumb img { width: 72px; height: 92px; object-fit: cover; border-radius: var(--radius-md); background: var(--color-bg-alt); }
        .rev-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .rev-title { font-weight: 600; color: var(--color-text); font-size: 15px; }
        .rev-title:hover { color: var(--color-primary); }
        .rev-author { font-size: 12.5px; color: var(--color-text-mute); }
        .rev-rating { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
        .rev-rating span { font-size: 12px; color: var(--color-text-mute); }
        .rev-comment { color: var(--color-text-soft); margin: 0; font-size: 14px; line-height: 1.55; }
        .rev-remove {
          width: 36px; height: 36px;
          border-radius: 50%;
          color: var(--color-text-mute);
          display: inline-flex; align-items: center; justify-content: center;
          align-self: flex-start;
          transition: background var(--t-fast), color var(--t-fast);
        }
        .rev-remove:hover { background: var(--color-danger-soft); color: var(--color-danger); }
      `}</style>
    </div>
  );
};

export default MyReviewsPage;
