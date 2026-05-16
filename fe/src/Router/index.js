import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import CleanHome from '../Pages/CleanHome';
import ShopPage from '../Pages/ShopPage';
import CartPage from '../Pages/CartPage';
import ProductPage from '../Pages/ProductPage';
import ContactPage from '../Pages/ContactPage';
import AboutPage from '../Pages/AboutPage';
import NewsPage from '../Pages/NewsPage';
import AccountPage from '../Pages/AccountPage';
import OrdersPage from '../Pages/OrdersPage';
import OrderDetailPage from '../Pages/OrderDetailPage';
import ChangePasswordPage from '../Pages/ChangePasswordPage';
import ArticleDetailPage from '../Pages/ArticleDetailPage';
import CheckoutPage from '../Pages/CheckoutPage';
import VNPayCallbackPage from '../Pages/VNPayCallbackPage';
import ReturnPolicyPage from '../Pages/ReturnPolicyPage';
import WarrantyPage from '../Pages/WarrantyPage';
import ShippingPaymentPage from '../Pages/ShippingPaymentPage';
import LoginPage from '../Pages/LoginPage';
import AddressesPage from '../Pages/AddressesPage';

// Admin Pages
import AdminLogin from '../Pages/Admin/AdminLogin';
import AdminLayout from '../Pages/Admin/AdminLayout';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import AdminProducts from '../Pages/Admin/AdminProducts';
import AdminProductForm from '../Pages/Admin/AdminProductForm';
import AdminCategories from '../Pages/Admin/AdminCategories';
import AdminCategoryForm from '../Pages/Admin/AdminCategoryForm';
import AdminOrders from '../Pages/Admin/AdminOrders';
import AdminOrderDetail from '../Pages/Admin/AdminOrderDetail';
import AdminUsers from '../Pages/Admin/AdminUsers';
import AdminReviews from '../Pages/Admin/AdminReviews';
import AdminArticles from '../Pages/Admin/AdminArticles';
import AdminArticleForm from '../Pages/Admin/AdminArticleForm';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '/admin/login';
    return null;
  }
  return children;
};

const RouterDOM = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CleanHome />} />
        <Route path="/cua-hang" element={<ShopPage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/san-pham/:id" element={<ProductPage />} />
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/bai-viet/:slug" element={<ArticleDetailPage />} />
        <Route path="/tai-khoan" element={<AccountPage />} />
        <Route path="/don-hang" element={<OrdersPage />} />
        <Route path="/don-hang/:orderId" element={<OrderDetailPage />} />
        <Route path="/doi-mat-khau" element={<ChangePasswordPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/payment/vn-pay-callback" element={<VNPayCallbackPage />} />
        <Route path="/chinh-sach-doi-tra" element={<ReturnPolicyPage />} />
        <Route path="/quy-dinh-bao-hanh" element={<WarrantyPage />} />
        <Route path="/giao-nhan-va-thanh-toan" element={<ShippingPaymentPage />} />
        <Route path="/dia-chi" element={<AddressesPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Products Management */}
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          
          {/* Categories Management */}
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategoryForm />} />
          <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
          
          {/* Orders Management */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          
          {/* Users Management */}
          <Route path="users" element={<AdminUsers />} />
          
          {/* Reviews Management */}
          <Route path="reviews" element={<AdminReviews />} />
          
          {/* Articles Management */}
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleForm />} />
          <Route path="articles/edit/:id" element={<AdminArticleForm />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default RouterDOM;
