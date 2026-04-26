import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategoriesAdmin, deleteCategory } from '../../api';
import './AdminCategories.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [searchTerm]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategoriesAdmin({ search: searchTerm || undefined });
      let data = response?.data || response || {};
      if (data.content) {
        setCategories(data.content || []);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(categoryToDelete.categoryId || categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Xóa thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  return (
    <div className="admin-categories">
      <div className="categories-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-info">
          <span className="total-count">Tổng: {categories.length} danh mục</span>
          <Link to="/admin/categories/new" className="btn-add">
            Thêm danh mục
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có danh mục nào</p>
          <Link to="/admin/categories/new" className="btn-add">Thêm danh mục đầu tiên</Link>
        </div>
      ) : (
        <div className="categories-table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN DANH MỤC</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.categoryId || category.id}>
                  <td className="id-cell">#{index + 1}</td>
                  <td className="name-cell">
                    {category.categoryName || category.name}
                    {category.bookCount > 0 && (
                      <span className="book-count">({category.bookCount} sách)</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/categories/edit/${category.categoryId || category.id}`}
                      className="btn-action btn-sua"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => confirmDelete(category)}
                      className="btn-action btn-xoa"
                      disabled={category.bookCount > 0}
                      title={category.bookCount > 0 ? 'Không thể xóa danh mục đang có sách' : 'Xóa danh mục'}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa danh mục "{categoryToDelete?.categoryName || categoryToDelete?.name}"?</p>
            {categoryToDelete?.bookCount > 0 && (
              <p className="warning">Danh mục này đang chứa {categoryToDelete.bookCount} sách. Hãy chuyển sách sang danh mục khác trước khi xóa.</p>
            )}
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
                disabled={deleting || categoryToDelete?.bookCount > 0}
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
