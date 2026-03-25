import { useState, useEffect } from 'react';
import { getAllFaqsAdmin, createFaq, updateFaq, deleteFaq } from '../../api/admin';
import './AdminFaqPage.css';

const CATEGORY_OPTIONS = [
  { value: 'CHINH_SACH', label: 'Chính sách' },
  { value: 'TAI_KHOAN', label: 'Tài khoản' },
  { value: 'SAN_PHAM', label: 'Sản phẩm' },
  { value: 'DON_HANG', label: 'Đơn hàng' },
  { value: 'KHAC', label: 'Khác' },
];

const EMPTY_FORM = {
  question: '',
  answer: '',
  category: 'CHINH_SACH',
  keywords: '',
  active: true,
  sortOrder: 0,
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchFaqs = () => {
    setLoading(true);
    getAllFaqsAdmin()
      .then((res) => setFaqs(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Không tải được danh sách FAQ', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (faq) => {
    setEditId(faq.id);
    setForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'CHINH_SACH',
      keywords: faq.keywords || '',
      active: faq.active !== false,
      sortOrder: faq.sortOrder || 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      showToast('Câu hỏi và câu trả lời không được để trống', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateFaq(editId, form);
        showToast('Cập nhật FAQ thành công!');
      } else {
        await createFaq(form);
        showToast('Tạo FAQ mới thành công!');
      }
      closeModal();
      fetchFaqs();
    } catch {
      showToast('Lỗi khi lưu FAQ. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa FAQ này?')) return;
    try {
      await deleteFaq(id);
      showToast('Xóa FAQ thành công!');
      fetchFaqs();
    } catch {
      showToast('Lỗi khi xóa FAQ.', 'error');
    }
  };

  const filtered = faqs.filter((f) => {
    const matchCat = !filterCategory || f.category === filterCategory;
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryLabel = (cat) => {
    const found = CATEGORY_OPTIONS.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="admin-faq-page">
      <div className="admin-faq-header">
        <div>
          <h1 className="admin-faq-title">Quản lý FAQ</h1>
          <p className="admin-faq-subtitle">Câu hỏi thường gặp — chatbot hỗ trợ khách hàng</p>
        </div>
        <button className="admin-faq-btn admin-faq-btn--primary" onClick={openCreate}>
          + Thêm FAQ mới
        </button>
      </div>

      <div className="admin-faq-toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi..."
          className="admin-faq-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-faq-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tất cả phân loại</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <span className="admin-faq-count">{filtered.length} FAQ</span>
      </div>

      {loading ? (
        <div className="admin-faq-loading">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-faq-empty">
          {search || filterCategory ? 'Không tìm thấy FAQ nào phù hợp.' : 'Chưa có FAQ nào. Hãy thêm câu hỏi đầu tiên!'}
        </div>
      ) : (
        <div className="admin-faq-table-wrap">
          <table className="admin-faq-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Câu hỏi</th>
                <th>Phân loại</th>
                <th>Keywords</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faq) => (
                <tr key={faq.id} className={faq.active === false ? 'admin-faq-row--inactive' : ''}>
                  <td className="admin-faq-id">#{faq.id}</td>
                  <td className="admin-faq-question">{faq.question}</td>
                  <td>
                    <span className={`admin-faq-cat admin-faq-cat--${faq.category}`}>
                      {categoryLabel(faq.category)}
                    </span>
                  </td>
                  <td className="admin-faq-keywords">
                    {faq.keywords ? (
                      <span title={faq.keywords}>
                        {faq.keywords.length > 30 ? faq.keywords.slice(0, 30) + '…' : faq.keywords}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="admin-faq-order">{faq.sortOrder}</td>
                  <td>
                    <span className={`admin-faq-status ${faq.active ? 'active' : 'inactive'}`}>
                      {faq.active ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="admin-faq-actions">
                    <button className="admin-faq-btn admin-faq-btn--edit" onClick={() => openEdit(faq)}>
                      Sửa
                    </button>
                    <button className="admin-faq-btn admin-faq-btn--delete" onClick={() => handleDelete(faq.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-faq-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="admin-faq-modal">
            <div className="admin-faq-modal__header">
              <h2>{editId ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}</h2>
              <button className="admin-faq-modal__close" onClick={closeModal}>&times;</button>
            </div>
            <form className="admin-faq-modal__form" onSubmit={handleSubmit}>
              <div className="admin-faq-form-group">
                <label>Câu hỏi <span className="required">*</span></label>
                <textarea
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  placeholder="VD: Chính sách đổi trả sách như thế nào?"
                  rows={2}
                  required
                />
              </div>

              <div className="admin-faq-form-group">
                <label>Câu trả lời <span className="required">*</span></label>
                <textarea
                  name="answer"
                  value={form.answer}
                  onChange={handleChange}
                  placeholder="Nhập câu trả lời đầy đủ cho khách hàng..."
                  rows={4}
                  required
                />
              </div>

              <div className="admin-faq-form-row">
                <div className="admin-faq-form-group">
                  <label>Phân loại</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-faq-form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={form.sortOrder}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              </div>

              <div className="admin-faq-form-group">
                <label>Từ khóa (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="keywords"
                  value={form.keywords}
                  onChange={handleChange}
                  placeholder="VD: doi tra, tra hang, doi hang, khong vua"
                />
                <span className="admin-faq-form-hint">
                  Từ khóa giúp chatbot match câu hỏi chính xác hơn
                </span>
              </div>

              <div className="admin-faq-form-group admin-faq-form-group--checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />
                  Hiển thị trên chatbot
                </label>
              </div>

              <div className="admin-faq-modal__footer">
                <button type="button" className="admin-faq-btn admin-faq-btn--cancel" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-faq-btn admin-faq-btn--primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : editId ? 'Lưu thay đổi' : 'Tạo FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-faq-toast admin-faq-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
