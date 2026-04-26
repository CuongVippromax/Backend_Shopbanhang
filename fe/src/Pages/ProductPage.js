import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImgAsset from '../public';
import './ProductPage.css';
import { getBookById, addToCart, getReviewsByBookId, createReview, getBooksByCategory } from '../api';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const { cartCount, refresh } = useCart();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('mota');

  useEffect(() => {
    if (id) {
      loadBook();
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const data = await getBookById(id);
      // Backend trả về BookResponse trực tiếp hoặc wrapped trong DataResponse
      const bookData = data?.data || data;
      setBook(bookData);
      
      // Sau khi load book xong, load sách liên quan
      if (bookData?.categoryId) {
        loadRelatedBooks(bookData.categoryId);
      }
    } catch (error) {
      console.error('Error loading book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedBooks = async (categoryId) => {
    try {
      const data = await getBooksByCategory(categoryId, { pageSize: 20 });

      let allBooks = [];
      if (data?.data) {
        allBooks = Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        allBooks = data;
      }

      const filtered = allBooks.filter(b => b.bookId !== parseInt(id)).slice(0, 4);
      setRelatedBooks(filtered);
    } catch (error) {
      console.error('Error loading related books:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await getReviewsByBookId(id, 1, 1000);
      // Backend returns PageResponse with 'data' field containing the list
      const pageData = response?.data;
      let reviewsData = [];
      if (pageData?.data) {
        reviewsData = Array.isArray(pageData.data) ? pageData.data : [];
      } else if (Array.isArray(pageData)) {
        reviewsData = pageData;
      }
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const handleAddToCart = async () => {
    // Check login first
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) {
      setCartMessage('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      setTimeout(() => {
        window.location.href = '/dang-nhap';
      }, 1500);
      return;
    }

    setAddingToCart(true);
    setCartMessage('');
    try {
      const result = await addToCart({ bookId: parseInt(id), quantity });
      console.log('Add to cart result:', result);
      setCartMessage('Đã thêm vào giỏ hàng!');
      // Refresh cart count in header
      await refresh();
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMsg = error?.message || error?.response?.data || 'Thêm vào giỏ hàng thất bại!';
      setCartMessage(errorMsg.includes('logged in') ? 'Vui lòng đăng nhập!' : errorMsg);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    // Check login first
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) {
      setCartMessage('Vui lòng đăng nhập để mua hàng!');
      setTimeout(() => {
        window.location.href = '/dang-nhap';
      }, 1500);
      return;
    }

    setAddingToCart(true);
    setCartMessage('Đang xử lý đơn hàng...');
    try {
      const result = await addToCart({ bookId: parseInt(id), quantity });
      console.log('Buy now add to cart result:', result);
      setCartMessage('Đặt hàng thành công! Đang chuyển đến thanh toán...');
      // Refresh cart count before redirecting
      await refresh();
      // Chuyển hướng đến trang thanh toán trực tiếp
      setTimeout(() => {
        window.location.href = '/thanh-toan';
      }, 1000);
    } catch (error) {
      console.error('Error buying now:', error);
      const errorMsg = error?.message || error?.response?.data || 'Mua ngay thất bại!';
      setCartMessage(errorMsg.includes('logged in') ? 'Vui lòng đăng nhập!' : errorMsg);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    // Check login
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) {
      setReviewMessage('Vui lòng đăng nhập để đánh giá sản phẩm!');
      setTimeout(() => {
        window.location.href = '/dang-nhap';
      }, 1500);
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setSubmittingReview(true);
    setReviewMessage('');
    
    try {
      await createReview(parseInt(id), {
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      
      setReviewMessage('Cảm ơn bạn đã đánh giá!');
      setReviewComment('');
      setReviewRating(5);
      
      // Reload reviews
      await loadReviews();
      
      // Reload book to update rating
      await loadBook();
      
      setTimeout(() => setReviewMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewMessage(error?.message || 'Gửi đánh giá thất bại!');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discountPercent = null; // Backend không có originalPrice

  if (loading) {
    return (
      <div className="product-page">
        <div className="loading-state">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="product-page">
        <div className="error-state">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          
          <div className="search-area">
            <input type="text" placeholder="Bạn muốn mua gì?" />
            <button className="search-btn">🔍</button>
          </div>

          <div className="cart-area">
            <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', marginRight: '15px', paddingRight: '15px', borderRight: '1px solid #ddd'}}>
              <div className="cart-text">Giỏ hàng / <span className="cart-price">0 ₫</span></div>
              <div className="cart-icon">
                <span className="cart-count">{cartCount}</span>
                🛒
              </div>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-nav" style={{marginBottom: '40px'}}>
        <div className="container nav-inner">
          <div className="categories-menu" style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>☰</span> Danh mục sản phẩm
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Product Layout */}
      <main className="container product-main">
        {/* Left: Product Image */}
        <div className="product-image-col">
          <div className="product-image-wrapper">
            {discountPercent && <div className="discount-badge-large">-{discountPercent}%</div>}
            <img 
              src={book.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_2} 
              alt={book.bookName} 
              className="main-book-img" 
            />
          </div>
        </div>

        {/* Center: Product Info */}
        <div className="product-info-col">
          <div className="breadcrumbs">
            TRANG CHỦ / {book.category?.toUpperCase() || 'SÁCH'}
          </div>
          <h1 className="product-title">{book.bookName}</h1>
          
          <div className="product-prices">
            {book.originalPrice && <span className="old-price">{formatPrice(book.originalPrice)}</span>}
            <span className="current-price">{formatPrice(book.price)}</span>
          </div>

          <div className="product-meta">
            <p><strong>Tác giả:</strong> {book.author || 'N/A'}</p>
            <p><strong>Nhà xuất bản:</strong> {book.publisher || 'N/A'}</p>
            <p><strong>Năm xuất bản:</strong> {book.publicationYear || 'N/A'}</p>
            <p><strong>Số lượng:</strong> {book.quantity || 0} cuốn</p>
            {book.averageRating && book.averageRating > 0 && (
              <p className="product-rating-inline">
                <strong>Đánh giá:</strong>
                <span className="inline-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(book.averageRating) ? 'star filled' : 'star'}>★</span>
                  ))}
                </span>
                <span className="rating-count">({book.reviewCount || 0})</span>
              </p>
            )}
          </div>

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <div className="product-actions">
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={addingToCart}>
              {addingToCart ? 'Đang thêm...' : 'THÊM VÀO GIỎ HÀNG'}
            </button>
            <button className="btn-buy-now" onClick={handleBuyNow} disabled={addingToCart}>
              MUA NGAY
            </button>
          </div>
        </div>

        {/* Right: Related Products */}
        <div className="product-related-col">
          <h3>SẢN PHẨM LIÊN QUAN</h3>
          <div className="related-products">
            {relatedBooks.length > 0 ? (
              relatedBooks.map((relatedBook) => (
                <div key={relatedBook.bookId} className="related-item">
                  <Link to={`/san-pham/${relatedBook.bookId}`}>
                    <img 
                      src={relatedBook.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail} 
                      alt={relatedBook.bookName}
                    />
                    <div className="related-info">
                      <h4>{relatedBook.bookName}</h4>
                      <p className="related-price">{formatPrice(relatedBook.price)}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="no-related">Không có sản phẩm liên quan</p>
            )}
          </div>
        </div>
      </main>

      {/* Product Tabs - Mô tả và Đánh giá */}
      <section className="product-tabs-section container">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'mota' ? 'active' : ''}`}
            onClick={() => setActiveTab('mota')}
          >
            MÔ TẢ
          </button>
          <button 
            className={`tab-btn ${activeTab === 'danhgia' ? 'active' : ''}`}
            onClick={() => setActiveTab('danhgia')}
          >
            ĐÁNH GIÁ ({book.reviewCount || 0})
          </button>
        </div>

        {/* Tab Mô tả */}
        {activeTab === 'mota' && (
          <div className="tab-content-mota">
            <div className="mota-header">
              <h2>{book.bookName}</h2>
            </div>
            <div className="mota-meta">
              <p><strong>Tác giả:</strong> {book.author || 'N/A'}</p>
              <p><strong>Nhà xuất bản:</strong> {book.publisher || 'N/A'}</p>
              <p><strong>Năm xuất bản:</strong> {book.publicationYear || 'N/A'}</p>
            </div>
            <div className="mota-content">
              <h3>Giới thiệu sách</h3>
              <p>{book.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
            </div>
          </div>
        )}

        {/* Tab Đánh giá */}
        {activeTab === 'danhgia' && (
          <div className="tab-content-danhgia">
            {/* Form viết đánh giá */}
            <div className="review-form-wrapper">
              <h3>VIET ĐÁNH GIÁ CỦA BẠN</h3>
              <p className="review-notice">Thông tin của bạn sẽ được lưu để gửi đánh giá (nội dung bình luận có thể hiển thị công khai)</p>
              
              <div className="form-group">
                <label>Đánh giá của bạn về sản phẩm này:</label>
                <div className="star-rating-wrapper">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-rating-btn ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewRating === 5 && 'Tuyệt vời'}
                    {reviewRating === 4 && 'Rất tốt'}
                    {reviewRating === 3 && 'Hài lòng'}
                    {reviewRating === 2 && 'Không hài lòng'}
                    {reviewRating === 1 && 'Rất tệ'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung đánh giá của bạn:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập nội dung đánh giá của bạn..."
                  rows="5"
                />
              </div>

              {reviewMessage && (
                <div className={`review-message ${reviewMessage.includes('thất bại') || reviewMessage.includes('đăng nhập') ? 'error' : 'success'}`}>
                  {reviewMessage}
                </div>
              )}

              <div className="form-actions">
                <button 
                  className="btn-send-review"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐI'}
                </button>
              </div>
            </div>

            {/* Danh sách đánh giá */}
            <div className="reviews-wrapper">
              <h3>ĐÁNH GIÁ SẢN PHẨM</h3>
              
              {book.averageRating && book.averageRating > 0 && (
                <div className="rating-overview">
                  <div className="rating-score">
                    <span className="score-number">{book.averageRating.toFixed(1)}</span>
                    <span className="score-star">★</span>
                    <span className="score-total">trên 5</span>
                  </div>
                  <div className="rating-info">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(book.averageRating) ? 'star filled' : 'star'}>★</span>
                    ))}
                    <p>{book.reviewCount || 0} đánh giá</p>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
              ) : (
                <div className="reviews-list-new">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="review-card">
                      <div className="review-card-header">
                        <div className="reviewer-avatar">
                          {review.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.username || 'Khách hàng'}</span>
                          <div className="review-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (review.rating || 0) ? 'star filled' : 'star'}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="review-time">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <div className="review-card-body">
                        <p>{review.comment || review.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 nhasachhaian@gmail.com</p>
          </div>
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li><Link to="/chinh-sach-doi-tra" style={{color: 'inherit', textDecoration: 'none'}}>Chính sách đổi trả sản phẩm</Link></li>
              <li><Link to="/quy-dinh-bao-hanh" style={{color: 'inherit', textDecoration: 'none'}}>Quy định bảo hành</Link></li>
              <li><Link to="/giao-nhan-va-thanh-toan" style={{color: 'inherit', textDecoration: 'none'}}>Giao nhận và thanh toán</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p>1900 1234</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
