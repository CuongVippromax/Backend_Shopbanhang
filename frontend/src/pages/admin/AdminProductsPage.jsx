import { useState, useEffect } from 'react'
import { getBooks } from '../../api/books.js'
import { deleteBook, createBook, updateBook, getAllCategoriesAdmin } from '../../api/admin'

export default function AdminProductsPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    bookName: '', price: '', quantity: '', description: '',
    author: '', publisher: '', publicationYear: '', categoryId: '', image: null,
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchBooks = (pageNum = 1) => {
    setLoading(true)
    getBooks({ pageNo: pageNum, pageSize: 12, search, sortBy: 'bookId:desc' })
      .then((res) => {
        setBooks(Array.isArray(res?.data) ? res.data : [])
        setTotalPages(res?.totalPages ?? 1)
        setPage(pageNum)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }

  const fetchCategories = () => {
    return getAllCategoriesAdmin({ pageSize: 100 })
      .then((res) => {
        const data = res.data?.data || res.data || []
        setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks(1)
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ bookName: '', price: '', quantity: '', description: '', author: '', publisher: '', publicationYear: '', categoryId: '', image: null })
    setFormError('')
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (book) => {
    setEditingId(book.bookId)
    setForm({
      bookName: book.bookName || '',
      price: book.price != null ? String(book.price) : '',
      quantity: book.quantity != null ? String(book.quantity) : '',
      description: book.description || '',
      author: book.author || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      categoryId: book.categoryId || book.category?.categoryId || '',
      image: null,
    })
    setFormError('')
    setImagePreview(book.image || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormError('')
    setImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, image: file })
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.bookName.trim()) { setFormError('Tên sách không được để trống'); return }
    if (!form.price || parseFloat(form.price) <= 0) { setFormError('Giá phải lớn hơn 0'); return }
    if (!form.quantity || parseInt(form.quantity) < 0) { setFormError('Số lượng phải >= 0'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('bookName', form.bookName.trim())
      fd.append('price', parseFloat(form.price))
      fd.append('quantity', parseInt(form.quantity))
      if (form.description.trim()) fd.append('description', form.description.trim())
      if (form.author.trim()) fd.append('author', form.author.trim())
      if (form.publisher.trim()) fd.append('publisher', form.publisher.trim())
      if (form.publicationYear) fd.append('publicationYear', form.publicationYear)
      if (form.categoryId) fd.append('categoryId', form.categoryId)
      if (form.image) fd.append('image', form.image)

      if (editingId) {
        await updateBook(editingId, fd)
      } else {
        await createBook(fd)
      }
      closeModal()
      fetchBooks(page)
    } catch (err) {
      const msg = err?.response?.data || err?.message || 'Lỗi khi lưu'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bookId, bookName) => {
    if (!window.confirm(`Xóa sách "${bookName}"?`)) return
    try {
      await deleteBook(bookId)
      fetchBooks(page)
    } catch (err) {
      alert('Xóa thất bại: ' + (err?.message || ''))
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h1 className="admin-page-title">Quản lý sản phẩm</h1>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>+ Thêm sách mới</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="admin-search" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm theo tên sách, tác giả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search__input"
        />
        <button type="submit" className="admin-search__btn">Tìm kiếm</button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : books.length === 0 ? (
        <div className="admin-empty">Chưa có sách nào</div>
      ) : (
        <>
          <div className="admin-products__grid">
            {books.map((book) => (
              <div key={book.bookId} className="admin-product-card">
                <div className="admin-product-card__image">
                  <img src={book.image || '/images/no-image.png'} alt={book.bookName} />
                </div>
                <div className="admin-product-card__info">
                  <h3 className="admin-product-card__name">{book.bookName}</h3>
                  <p className="admin-product-card__author">{book.author || 'Chưa có tác giả'}</p>
                  <div className="admin-product-card__price">
                    <span className="admin-product-card__price-current">{formatCurrency(book.price)}</span>
                  </div>
                  <div className="admin-product-card__stock">
                    Kho: <span className={book.quantity < 5 ? 'text-danger' : ''}>{book.quantity}</span>
                  </div>
                </div>
                <div className="admin-product-card__actions">
                  <button className="admin-btn admin-btn--sm" onClick={() => openEdit(book)}>Sửa</button>
                  <button
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => handleDelete(book.bookId, book.bookName)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button onClick={() => fetchBooks(page - 1)} disabled={page === 1} className="admin-pagination__btn">← Trước</button>
              <span className="admin-pagination__info">Trang {page} / {totalPages}</span>
              <button onClick={() => fetchBooks(page + 1)} disabled={page === totalPages} className="admin-pagination__btn">Sau →</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal admin-modal--lg">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Sửa sách' : 'Thêm sách mới'}</h3>
              <button className="admin-modal__close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              {formError && <div className="admin-error">{formError}</div>}

              <div className="admin-modal__form-grid">
                <div className="admin-form-group">
                  <label>Tên sách *</label>
                  <input type="text" value={form.bookName}
                    onChange={(e) => setForm({ ...form, bookName: e.target.value })}
                    className="admin-input" placeholder="VD: Đắc Nhân Tâm" autoFocus />
                </div>

                <div className="admin-form-group">
                  <label>Tác giả</label>
                  <input type="text" value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="admin-input" placeholder="VD: Dale Carnegie" />
                </div>

                <div className="admin-form-group">
                  <label>Giá (VNĐ) *</label>
                  <input type="number" value={form.price} min="0"
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="admin-input" placeholder="VD: 99000" />
                </div>

                <div className="admin-form-group">
                  <label>Số lượng *</label>
                  <input type="number" value={form.quantity} min="0"
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="admin-input" placeholder="VD: 100" />
                </div>

                <div className="admin-form-group">
                  <label>Nhà xuất bản</label>
                  <input type="text" value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="admin-input" placeholder="VD: NXB Trẻ" />
                </div>

                <div className="admin-form-group">
                  <label>Năm xuất bản</label>
                  <input type="number" value={form.publicationYear} min="1900" max="2099"
                    onChange={(e) => setForm({ ...form, publicationYear: e.target.value })}
                    className="admin-input" placeholder="VD: 2024" />
                </div>

                <div className="admin-form-group">
                  <label>Danh mục</label>
                  <select value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="admin-input">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Mô tả</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input admin-input--textarea"
                  placeholder="Mô tả về cuốn sách..." rows={3} />
              </div>

              <div className="admin-form-group">
                <label>{editingId ? 'Đổi hình ảnh' : 'Hình ảnh'}</label>
                <input type="file" accept="image/*"
                  onChange={handleImageChange}
                  className="admin-input" />
                {imagePreview && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={imagePreview} alt="Preview"
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </div>
                )}
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
