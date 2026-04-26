import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllReviewsAdmin, deleteReviewAdmin } from '../../api';
import './AdminReviews.css';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [page, searchTerm, ratingFilter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        keyword: searchTerm || undefined,
        rating: ratingFilter || undefined
      };
      const response = await getAllReviewsAdmin(params);
      
      let data = response?.data || response || {};
      if (data.data) {
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setReviews(data.data || []);
      } else if (Array.isArray(data)) {
        setTotalElements(data.length);
        setTotalPages(1);
        setReviews(data);
      } else if (Array.isArray(data.content)) {
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setReviews(data.content || []);
      } else {
        setReviews([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);
    try {
      await deleteReviewAdmin(reviewToDelete.reviewId || reviewToDelete.id);
      setShowDeleteModal(false);
      setReviewToDelete(null);
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Xóa thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingClass = (rating) => {
    if (rating >= 4) return 'rating-high';
    if (rating >= 2) return 'rating-medium';
    return 'rating-low';
  };

  return (
    <div className="admin-reviews">
      <div className="reviews-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, người đánh giá..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
        
        <div className="toolbar-info">
          <span className="total-count">Tổng: {totalElements} đánh giá</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có đánh giá nào</p>
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.reviewId || review.id} className="review-card">
                <div className="review-header">
                  <div className="book-info">
                    <img
                      src={review.bookImage || review.thumbnailUrl || '/image/default-book.jpg'}
                      alt={review.bookTitle}
                      className="book-thumb"
                      onError={(e) => { e.target.src = '/image/default-book.jpg'; }}
                    />
                    <div className="book-details">
                      <Link 
                        to={`/san-pham/${review.bookId || review.book?.id}`}
                        target="_blank"
                        className="book-title"
                      >
                        {review.bookTitle || review.book?.title || 'Sách'}
                      </Link>
                      <span className="book-author">{review.bookAuthor || review.book?.author || ''}</span>
                    </div>
                  </div>
                  <div className="review-rating">
                    <span className={`rating-stars ${getRatingClass(review.rating)}`}>
                      {renderStars(review.rating)}
                    </span>
                    <span className="rating-number">{review.rating}/5</span>
                  </div>
                </div>
                
                <div className="review-body">
                  <p className="review-comment">{review.comment || review.content || 'Không có nội dung'}</p>
                </div>
                
                <div className="review-footer">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {(review.userName || review.user?.name || review.reviewerName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">
                        {review.userName || review.user?.name || review.reviewerName || 'Người dùng ẩn danh'}
                      </span>
                      <span className="review-date">{formatDate(review.createdAt || review.reviewDate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDelete(review)}
                    className="btn-delete"
                    title="Xóa đánh giá"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="page-btn"
              >
                ««
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="page-btn"
              >
                «
              </button>
              <span className="page-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »»
              </button>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa đánh giá này?</p>
            <p className="warning">Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn-cancel"
                disabled={deleting}
              >
                Hủy
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-confirm-delete"
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
