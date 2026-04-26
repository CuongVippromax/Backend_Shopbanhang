import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, updateBook, getBookById, getCategories } from '../../api';
import './AdminProductForm.css';

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    bookName: '',
    author: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    pageCount: '',
    thumbnailUrl: '',
    active: true
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      const cats = data?.data || data || [];
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    setLoadingData(true);
    try {
      const data = await getBookById(id);
      const product = data?.data || data;
      if (product) {
        setFormData({
          bookName: product.bookName || product.title || '',
          author: product.author || '',
          description: product.description || '',
          price: product.price || '',
          quantity: product.quantity || product.stockQuantity || '',
          categoryId: product.categoryId || '',
          isbn: product.isbn || '',
          publisher: product.publisher || '',
          publicationYear: product.publicationYear || '',
          pageCount: product.pageCount || '',
          thumbnailUrl: product.thumbnailUrl || product.image || '',
          active: product.active !== false
        });
        if (product.thumbnailUrl || product.image) {
          setPreviewImage(product.thumbnailUrl || product.image);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Không thể tải thông tin sản phẩm');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bookName?.trim()) {
      newErrors.bookName = 'Vui lòng nhập tên sản phẩm';
    }
    if (!formData.author?.trim()) {
      newErrors.author = 'Vui lòng nhập tên tác giả';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Vui lòng nhập giá hợp lệ';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Vui lòng nhập số lượng tồn kho';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('bookName', formData.bookName);
      submitData.append('author', formData.author || '');
      submitData.append('description', formData.description || '');
      submitData.append('price', parseFloat(formData.price));
      submitData.append('quantity', parseInt(formData.quantity));
      submitData.append('categoryId', parseInt(formData.categoryId));
      submitData.append('publisher', formData.publisher || '');
      submitData.append('publicationYear', formData.publicationYear || '');

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (isEditMode) {
        await updateBook(id, submitData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await createBook(submitData);
        alert('Thêm sản phẩm thành công!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Vui lòng thử lại';
      alert('Lưu thất bại: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-product-form">
      <div className="form-header">
        <h2>{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate('/admin/products')}
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>

            <div className="form-group">
              <label>Tên sản phẩm <span className="required">*</span></label>
              <input
                type="text"
                name="bookName"
                value={formData.bookName}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                className={errors.bookName ? 'error' : ''}
              />
              {errors.bookName && <span className="error-text">{errors.bookName}</span>}
            </div>

            <div className="form-group">
              <label>Tác giả <span className="required">*</span></label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nhập tên tác giả"
                className={errors.author ? 'error' : ''}
              />
              {errors.author && <span className="error-text">{errors.author}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá bán (VNĐ) <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho <span className="required">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={errors.quantity ? 'error' : ''}
                />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Danh mục <span className="required">*</span></label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={errors.categoryId ? 'error' : ''}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                    {cat.categoryName || cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>

            <div className="form-group">
              <label>Mô tả sản phẩm</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả sản phẩm"
                rows="5"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin bổ sung</h3>

            <div className="form-group">
              <label>Nhà xuất bản</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Nhà xuất bản"
              />
            </div>

            <div className="form-group">
              <label>Năm xuất bản</label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                placeholder="2024"
                min="1900"
                max="2099"
              />
            </div>

            <div className="form-section image-section">
              <h3>Hình ảnh sản phẩm</h3>

              <div className="image-upload">
                <div className="image-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : (
                    <div className="no-image">
                      <span>Chưa có hình</span>
                    </div>
                  )}
                </div>

                <div className="image-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-upload"
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="btn-upload">
                    Chọn hình ảnh
                  </label>
                  {imageFile && (
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewImage(null);
                      }}
                    >
                      Xóa hình
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/products')}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
}
