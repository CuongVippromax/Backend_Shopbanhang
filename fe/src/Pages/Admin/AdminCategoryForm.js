import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory, updateCategory, getCategoryById } from '../../api';
import './AdminCategoryForm.css';

export default function AdminCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    active: true
  });

  useEffect(() => {
    if (isEditMode) {
      loadCategory();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategory = async () => {
    setLoadingData(true);
    try {
      const data = await getCategoryById(id);
      const category = data?.data || data;
      if (category) {
        setFormData({
          categoryName: category.categoryName || '',
          description: category.description || '',
          active: category.active !== false
        });
      }
    } catch (error) {
      console.error('Error loading category:', error);
      alert('Không thể tải thông tin danh mục');
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

  const validate = () => {
    const newErrors = {};
    if (!formData.categoryName?.trim()) {
      newErrors.categoryName = 'Vui lòng nhập tên danh mục';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditMode) {
        await updateCategory(id, formData);
        alert('Cập nhật danh mục thành công!');
      } else {
        await createCategory(formData);
        alert('Thêm danh mục thành công!');
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
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
    <div className="admin-category-form">
      <div className="form-header">
        <h2>{isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate('/admin/categories')}
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-section">
          <h3>Thông tin danh mục</h3>

          <div className="form-group">
            <label>Tên danh mục <span className="required">*</span></label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="Nhập tên danh mục"
              className={errors.categoryName ? 'error' : ''}
            />
            {errors.categoryName && <span className="error-text">{errors.categoryName}</span>}
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả danh mục"
              rows="4"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              <span>Hoạt động</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/categories')}
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
