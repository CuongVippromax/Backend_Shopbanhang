import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBooksAdmin, deleteBook, getCategories } from '../../api';
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      const cats = data?.data || data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 1000,
        search: searchTerm || undefined,
        categoryId: categoryFilter || undefined
      };
      console.log('Loading products with params:', params);
      const response = await getAllBooksAdmin(params);
      console.log('Products response:', response);

      let data = response || {};
      if (data.content) {
        setTotalElements(data.totalElements || 0);
        setProducts(data.content || []);
      } else if (data.data && Array.isArray(data.data)) {
        setTotalElements(data.totalElements || data.data.length);
        setProducts(data.data);
      } else if (Array.isArray(data)) {
        setTotalElements(data.length);
        setProducts(data);
      } else {
        setProducts([]);
        setTotalElements(0);
      }
      console.log('Set products:', data.content || data.data || data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteBook(productToDelete.bookId || productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Xóa thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getImageUrl = (product) => {
    // Check multiple possible field names for image
    const imageUrl = product.image || product.thumbnailUrl || null;
    
    if (imageUrl && imageUrl.trim()) {
      return imageUrl;
    }
    
    // Return default image
    return '/image/default-book.svg';
  };

  return (
    <div className="admin-products">
      <div className="products-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>
        
        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              loadProducts();
            }}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id || cat.categoryId} value={cat.id || cat.categoryId}>
                {cat.name || cat.categoryName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-info">
          <span className="total-count">Tổng: {totalElements} sản phẩm</span>
          <Link to="/admin/products/new" className="btn-add">
            Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có sản phẩm nào</p>
          <Link to="/admin/products/new" className="btn-add">Thêm sản phẩm đầu tiên</Link>
        </div>
      ) : (
        <>
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.bookId || product.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={getImageUrl(product)}
                        alt={product.bookName || product.title || product.name}
                        className="product-thumb"
                        onError={(e) => { e.target.src = '/image/default-book.svg'; }}
                      />
                    </td>
                    <td className="title-cell">
                      <Link to={`/san-pham/${product.bookId || product.id}`} target="_blank">
                        {product.bookName || product.title || product.name}
                      </Link>
                      <div className="product-author">{product.author}</div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {product.categoryName || product.category || '-'}
                      </span>
                    </td>
                    <td className="price-cell">{formatPrice(product.price)}</td>
                    <td>
                      <span className={`stock-badge ${product.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.quantity || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${product.active !== false ? 'active' : 'inactive'}`}>
                        {product.active !== false ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/admin/products/edit/${product.bookId || product.id}`}
                        className="btn-edit"
                        title="Sửa"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => confirmDelete(product)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa sản phẩm "{productToDelete?.bookName || productToDelete?.title || productToDelete?.name}"?</p>
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
