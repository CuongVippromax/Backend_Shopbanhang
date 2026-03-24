import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import BookDetailPage from './pages/BookDetailPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderDetailPage from './pages/OrderDetailPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import TruyenTranhThieuNhiPage from './pages/TruyenTranhThieuNhiPage.jsx'
import CartPage from './pages/CartPage.jsx'
import NewBooksPage from './pages/NewBooksPage.jsx'
import FeaturedBooksPage from './pages/FeaturedBooksPage.jsx'
import PolicyPage from './pages/PolicyPage.jsx'
import WarrantyPolicyPage from './pages/WarrantyPolicyPage.jsx'
import StaticInfoPage from './pages/StaticInfoPage.jsx'
import VNPayCallbackPage from './pages/VNPayCallbackPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx'
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage.jsx'
import AdminInventoryPage from './pages/admin/AdminInventoryPage.jsx'
import AdminCommentsPage from './pages/admin/AdminCommentsPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import { getCart } from './utils/cart'

function App() {
  getCart()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="san-pham" element={<ProductsPage />} />
          <Route path="sach-moi" element={<NewBooksPage />} />
          <Route path="sach-hay" element={<FeaturedBooksPage />} />
          <Route path="san-pham/:id" element={<BookDetailPage />} />
          <Route path="lien-he" element={<ContactPage />} />
          {/* Placeholder routes */}
          <Route path="hop-sach-tet-2026" element={<div className="page-placeholder">Hộp sách Tết 2026</div>} />
          <Route path="ngay-hoi-chua-lanh" element={<div className="page-placeholder">Ngày hội chữa lành</div>} />
          <Route path="truyen-tranh-thieu-nhi" element={<TruyenTranhThieuNhiPage />} />
          <Route path="chinh-sach" element={<PolicyPage />} />
          <Route path="chinh-sach-bao-hanh" element={<WarrantyPolicyPage />} />
          {/* Trang tĩnh: điều khoản, bảo mật, FAQ… — slug trong StaticInfoPage.jsx */}
          <Route path="trang/:slug" element={<StaticInfoPage />} />
          <Route path="dang-nhap" element={<LoginPage />} />
          <Route path="tai-khoan" element={<AccountPage />} />
          <Route path="doi-mat-khau" element={<ChangePasswordPage />} />
          <Route path="don-hang" element={<OrdersPage />} />
          <Route path="don-hang/:orderId" element={<OrderDetailPage />} />
          <Route path="dang-ky" element={<RegisterPage />} />
          <Route path="gio-hang" element={<CartPage />} />
          <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/payment/vn-pay-callback" element={<VNPayCallbackPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="statistics" element={<AdminStatisticsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
