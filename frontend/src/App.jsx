import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import BookDetailPage from './pages/BookDetailPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="san-pham" element={<ProductsPage />} />
          <Route path="san-pham/:id" element={<BookDetailPage />} />
          <Route path="lien-he" element={<ContactPage />} />
          {/* Placeholder routes */}
          <Route path="hop-sach-tet-2026" element={<div className="page-placeholder">Hộp sách Tết 2026</div>} />
          <Route path="ngay-hoi-chua-lanh" element={<div className="page-placeholder">Ngày hội chữa lành</div>} />
          <Route path="tin-tuc" element={<div className="page-placeholder">Tin tức</div>} />
          <Route path="dang-nhap" element={<div className="auth-page">
            <div className="auth-card">
              <h1>Đăng nhập</h1>
              <p className="auth-desc">Nhập thông tin để đăng nhập vào tài khoản của bạn.</p>
              <form className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" placeholder="Nhập email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <input id="password" type="password" placeholder="Nhập mật khẩu" required />
                </div>
                <button type="submit" className="auth-button">Đăng nhập</button>
              </form>
              <div className="auth-footer">
                <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
                <span style={{margin: '0 8px'}}>|</span>
                <Link to="/dang-ky">Đăng ký</Link>
              </div>
            </div>
          </div>} />
          <Route path="dang-ky" element={<div className="page-placeholder">Đăng ký</div>} />
          <Route path="gio-hang" element={<div className="page-placeholder">Giỏ hàng</div>} />
          <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
