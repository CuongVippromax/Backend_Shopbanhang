import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllArticlesAdmin, deleteArticleAdmin, setArticleFeatured } from '../../api';
import './AdminArticles.css';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [page, searchTerm]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const response = await getAllArticlesAdmin({ 
        page, 
        size: 10,
        keyword: searchTerm || undefined
      });
      
      let data = response?.data || response || {};
      if (data.content) {
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setArticles(data.content || []);
      } else if (Array.isArray(data)) {
        setTotalElements(data.length);
        setTotalPages(1);
        setArticles(data);
      } else {
        setArticles([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      await deleteArticleAdmin(articleToDelete.articleId || articleToDelete.id);
      setShowDeleteModal(false);
      setArticleToDelete(null);
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Xóa thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  const toggleFeatured = async (article) => {
    try {
      const newFeatured = !(article.featured === true);
      await setArticleFeatured(article.articleId || article.id, newFeatured);
      loadArticles();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Không thể cập nhật trạng thái nổi bật');
    }
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

  return (
    <div className="admin-articles">
      <div className="articles-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="toolbar-info">
          <span className="total-count">Tổng: {totalElements} bài viết</span>
          <Link to="/admin/articles/new" className="btn-add">
            ➕ Thêm bài viết mới
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có bài viết nào</p>
          <Link to="/admin/articles/new" className="btn-add">Tạo bài viết đầu tiên</Link>
        </div>
      ) : (
        <>
          <div className="articles-table-wrapper">
            <table className="articles-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Nổi bật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <tr key={article.articleId || article.id || index}>
                    <td>{page * 10 + index + 1}</td>
                    <td>
                      <img
                        src={article.image || '/image/default-article.jpg'}
                        alt={article.title}
                        className="article-thumb"
                        onError={(e) => { e.target.src = '/image/default-article.jpg'; }}
                      />
                    </td>
                    <td className="title-cell">
                      <Link to={`/bai-viet/${article.articleId || article.id}`} target="_blank">
                        {article.title}
                      </Link>
                    </td>
                    <td>{article.authorName || 'Admin'}</td>
                    <td>
                      <span className="category-badge">{article.category || 'Tin tức'}</span>
                    </td>
                    <td>{formatDate(article.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${article.published ? 'published' : 'draft'}`}>
                        {article.published ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleFeatured(article)}
                        className={`btn-featured ${article.featured ? 'active' : ''}`}
                        title={article.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                      >
                        {article.featured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/admin/articles/edit/${article.articleId || article.id}`}
                        className="btn-edit"
                        title="Sửa"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => confirmDelete(article)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="page-btn"
              >
                «
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="page-btn"
              >
                ‹
              </button>
              <span className="page-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa bài viết "{articleToDelete?.title}"?</p>
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
