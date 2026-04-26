import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleByIdAdmin, createArticleAdmin, updateArticleAdmin } from '../../api';
import './AdminArticleForm.css';

export default function AdminArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    authorName: '',
    image: null,
    imagePreview: '',
    published: true,
    featured: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const response = await getArticleByIdAdmin(id);
      const article = response?.data || response;
      if (article) {
        setFormData({
          title: article.title || '',
          summary: article.summary || '',
          content: article.content || '',
          category: article.category || '',
          authorName: article.authorName || '',
          image: null,
          imagePreview: article.image || '',
          published: article.published !== false,
          featured: article.featured === true
        });
      }
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Không thể tải bài viết');
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
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, publishNow = true) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        authorName: formData.authorName,
        published: publishNow,
        featured: formData.featured
      };

      if (isEditMode) {
        await updateArticleAdmin(id, { ...data, image: formData.image });
        alert('Cập nhật bài viết thành công!');
      } else {
        await createArticleAdmin({ ...data, image: formData.image });
        alert('Tạo bài viết thành công!');
      }
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      alert(error.response?.data?.message || error.message || 'Lưu bài viết thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-article-form">
      <div className="form-card">
        <div className="form-header">
          <h2>{isEditMode ? 'Sửa Bài Viết' : 'Tạo Bài Viết Mới'}</h2>
          <button onClick={() => navigate('/admin/articles')} className="btn-back">
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề bài viết *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="authorName">Tác giả</label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                placeholder="Nhập tên tác giả"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="VD: Tin tức, Khuyến mãi..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="summary">Tóm tắt</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Nhập tóm tắt ngắn gọn (hiển thị ở trang danh sách)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung bài viết *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung bài viết đầy đủ (hỗ trợ HTML)"
              rows={15}
              className={errors.content ? 'error' : ''}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          <div className="form-group">
            <label>Hình ảnh đại diện</label>
            <div className="image-upload">
              {formData.imagePreview && (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              <p className="help-text">Chọn ảnh có kích thước tối đa 5MB</p>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              <span>Xuất bản ngay</span>
            </label>
            <p className="help-text">
              Nếu không chọn, bài viết sẽ được lưu ở chế độ bản nháp
            </p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Nổi bật</span>
            </label>
            <p className="help-text">
              Bài viết nổi bật sẽ hiển thị ở trang chủ
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/articles')}
              className="btn-cancel"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="btn-save-draft"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Đăng bài')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
