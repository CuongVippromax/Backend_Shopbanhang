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
  }, [page, searchTerm, ratingFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateStr);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      5: 'Tuyệt vời',
      4: 'Tốt',
      3: 'Bình thường',
      2: 'Kém',
      1: 'Rất kém'
    };
    return labels[rating] || '';
  };

  const getUserAvatar = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="admin-reviews-page">
      <div className="reviews-header">
        <div className="header-content">
          <h1>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Quản lý đánh giá
          </h1>
          <p className="header-subtitle">Xem và quản lý tất cả đánh giá sản phẩm</p>
        </div>
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalElements}</span>
              <span className="stat-label">Tổng đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, người đánh giá..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => { setSearchTerm(''); setPage(0); }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="filter-wrapper">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>Chưa có đánh giá nào</h3>
          <p>Khi có đánh giá từ khách hàng, chúng sẽ xuất hiện tại đây</p>
        </div>
      ) : (
        <>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.reviewId || review.id} className="review-card-modern">
                <div className="card-top">
                  <div className="book-section">
                    <img
                      src={review.bookImage || review.thumbnailUrl || '/image/default-book.jpg'}
                      alt={review.bookTitle}
                      className="book-cover"
                      onError={(e) => { e.target.src = '/image/default-book.jpg'; }}
                    />
                    <div className="book-meta">
                      <Link 
                        to={`/san-pham/${review.bookId || review.book?.id}`}
                        target="_blank"
                        className="book-title-link"
                      >
                        {review.bookTitle || review.book?.title || 'Sách'}
                      </Link>
                      <span className="book-author">
                        {review.bookAuthor || review.book?.author || ''}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="rating-badge"
                    style={{ backgroundColor: getRatingColor(review.rating) + '15', color: getRatingColor(review.rating) }}
                  >
                    <span className="rating-number">{review.rating}</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="rating-label">{getRatingLabel(review.rating)}</span>
                  </div>
                </div>

                <div className="card-stars">
                  {renderStars(review.rating)}
                </div>
                
                <div className="card-body">
                  <div className="comment-bubble">
                    <p className="comment-text">
                      {review.comment || review.content || 'Không có nội dung'}
                    </p>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="user-section">
                    <div 
                      className="user-avatar"
                      style={{ background: getUserAvatar(review.userName || review.user?.name || review.reviewerName) }}
                    >
                      {getInitials(review.userName || review.user?.name || review.reviewerName)}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {review.userName || review.user?.name || review.reviewerName || 'Người dùng ẩn danh'}
                      </span>
                      <span className="review-time">{getTimeAgo(review.createdAt || review.reviewDate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDelete(review)}
                    className="btn-delete-review"
                    title="Xóa đánh giá"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="page-btn-nav"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="11 17 6 12 11 7"/>
                  <polyline points="18 17 13 12 18 7"/>
                </svg>
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="page-btn-nav"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`page-num ${page === pageNum ? 'active' : ''}`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="page-btn-nav"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="page-btn-nav"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13 17 18 12 13 7"/>
                  <polyline points="6 17 11 12 6 7"/>
                </svg>
              </button>
              
              <span className="page-info-text">
                Trang {page + 1} / {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Xác nhận xóa đánh giá</h3>
            <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
            <p className="warning-text">Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn-cancel-modal"
                disabled={deleting}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-delete-modal"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Xóa đánh giá
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
