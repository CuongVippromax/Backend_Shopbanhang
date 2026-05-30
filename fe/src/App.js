import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FullPageLoader } from './components/common/Spinner';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/common/ScrollToTop';

const HomePage = lazy(() => import('./Pages/HomePage'));
const BooksPage = lazy(() => import('./Pages/BooksPage'));
const BookDetailPage = lazy(() => import('./Pages/BookDetailPage'));
const CartPage = lazy(() => import('./Pages/CartPage'));
const CheckoutPage = lazy(() => import('./Pages/CheckoutPage'));
const PaymentResultPage = lazy(() => import('./Pages/PaymentResultPage'));
const LoginPage = lazy(() => import('./Pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./Pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./Pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./Pages/auth/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('./Pages/auth/OAuthCallbackPage'));
const AccountPage = lazy(() => import('./Pages/account/AccountPage'));
const ProfilePage = lazy(() => import('./Pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('./Pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('./Pages/account/OrderDetailPage'));
const AddressesPage = lazy(() => import('./Pages/account/AddressesPage'));
const ChangePasswordPage = lazy(() => import('./Pages/account/ChangePasswordPage'));
const MyReviewsPage = lazy(() => import('./Pages/account/MyReviewsPage'));
const ArticlesPage = lazy(() => import('./Pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./Pages/ArticleDetailPage'));
const FaqPage = lazy(() => import('./Pages/FaqPage'));
const AboutPage = lazy(() => import('./Pages/AboutPage'));
const ContactPage = lazy(() => import('./Pages/ContactPage'));
const PaymentMethodsPage = lazy(() => import('./Pages/PaymentMethodsPage'));
const ShippingPage = lazy(() => import('./Pages/ShippingPage'));
const NotFoundPage = lazy(() => import('./Pages/NotFoundPage'));

const AdminLoginPage = lazy(() => import('./Pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./Pages/admin/AdminDashboardPage'));
const AdminBooksPage = lazy(() => import('./Pages/admin/AdminBooksPage'));
const AdminCategoriesPage = lazy(() => import('./Pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./Pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./Pages/admin/AdminOrderDetailPage'));
const AdminArticlesPage = lazy(() => import('./Pages/admin/AdminArticlesPage'));
const AdminUsersPage = lazy(() => import('./Pages/admin/AdminUsersPage'));
const AdminReviewsPage = lazy(() => import('./Pages/admin/AdminReviewsPage'));

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return children;
};

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullPageLoader label="Đang tải trang..." />}>
        <Routes>
          {/* Auth (no shell) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/oauth-success" element={<OAuthCallbackPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/books" element={<AdminBooksPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/articles" element={<AdminArticlesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          </Route>

          {/* Main */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/categories/:id" element={<BooksPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route path="/payment/vn-pay-result" element={<PaymentResultPage />} />
            <Route path="/payment/vn-pay-callback" element={<PaymentResultPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/shipping" element={<ShippingPage />} />

            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>}>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="reviews" element={<MyReviewsPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
