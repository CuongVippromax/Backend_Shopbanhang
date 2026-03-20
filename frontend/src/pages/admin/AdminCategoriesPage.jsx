import { useState, useEffect } from 'react'
import { getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../../api/admin'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ categoryName: '', description: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCategories = (pageNum = 1) => {
    setLoading(true)
    getAllCategoriesAdmin({ pageNo: pageNum, pageSize: 10, search })
      .then((res) => {
        const data = res.data?.data || res.data || []
        setCategories(Array.isArray(data) ? data : [])
        const total = res.data?.totalPages || res.totalPages || 1
        setTotalPages(total)
        setPage(pageNum)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCategories(1)
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ categoryName: '', description: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditingId(cat.categoryId)
    setForm({ categoryName: cat.categoryName || '', description: cat.description || '' })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm({ categoryName: '', description: '' })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.categoryName.trim()) {
      setFormError('Tên danh mục không được để trống')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await updateCategory(editingId, form)
      } else {
        await createCategory(form)
      }
      closeModal()
      fetchCategories(page)
    } catch (err) {
      const msg = err?.response?.data || err.message || 'Lỗi khi lưu'
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return
    try {
      await deleteCategory(id)
      fetchCategories(page)
    } catch (err) {
      alert('Xóa thất bại: ' + (err?.message || ''))
    }
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories__header">
        <h1 className="admin-page-title">Quản lý danh mục</h1>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>+ Thêm danh mục</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="admin-search" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm theo tên danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search__input"
        />
        <button type="submit" className="admin-search__btn">Tìm kiếm</button>
      </form>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="admin-table__loading">Đang tải...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="admin-table__empty">Chưa có danh mục nào</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.categoryId}>
                  <td>#{cat.categoryId}</td>
                  <td><strong>{cat.categoryName}</strong></td>
                  <td className="admin-text-muted">{cat.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-btn admin-btn--sm" onClick={() => openEdit(cat)}>Sửa</button>
                      <button
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => handleDelete(cat.categoryId, cat.categoryName)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button onClick={() => fetchCategories(page - 1)} disabled={page === 1} className="admin-pagination__btn">
            ← Trước
          </button>
          <span className="admin-pagination__info">Trang {page} / {totalPages}</span>
          <button onClick={() => fetchCategories(page + 1)} disabled={page === totalPages} className="admin-pagination__btn">
            Sau →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="admin-modal__close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              {formError && <div className="admin-error">{formError}</div>}

              <div className="admin-form-group">
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={form.categoryName}
                  onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  className="admin-input"
                  placeholder="VD: Văn học, Tiểu thuyết..."
                  autoFocus
                />
              </div>

              <div className="admin-form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input admin-input--textarea"
                  placeholder="Mô tả ngắn về danh mục..."
                  rows={3}
                />
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Hủy</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
