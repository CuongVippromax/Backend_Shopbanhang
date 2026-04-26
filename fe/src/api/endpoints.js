import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// ============ PUBLIC APIs ============

// Books
export const getBooks = (params) => {
  const queryParams = { ...params };
  if (queryParams.page !== undefined) {
    queryParams.pageNo = queryParams.page;
    delete queryParams.page;
  }
  if (queryParams.size !== undefined) {
    queryParams.pageSize = queryParams.size;
    delete queryParams.size;
  }
  return apiClient.get('/books/all', { params: queryParams });
};
export const getBooksByCategory = (categoryId, params = {}) => {
  const queryParams = { ...params, categoryId };
  if (queryParams.page !== undefined) {
    queryParams.pageNo = queryParams.page;
    delete queryParams.page;
  }
  if (queryParams.size !== undefined) {
    queryParams.pageSize = queryParams.size;
    delete queryParams.size;
  }
  return apiClient.get('/books/all', { params: queryParams });
};
export const getBookById = (id) => apiClient.get(`/books/${id}`);

// Categories
export const getCategories = () => apiClient.get('/categories/list');
export const getCategoryById = (id) => apiClient.get(`/categories/${id}`);

// Articles
export const getArticles = (params) => {
  const queryParams = { ...params };
  // Backend expects 1-based page, frontend uses 0-based
  if (queryParams.page !== undefined) {
    queryParams.page = queryParams.page + 1;
  }
  return apiClient.get('/articles', { params: queryParams });
};
export const getArticleBySlug = (slug) => apiClient.get(`/articles/slug/${slug}`);
export const getFeaturedArticles = () => apiClient.get('/articles/featured');
export const getArticleById = (id) => apiClient.get(`/articles/${id}`);

// Auth
export const login = (data) => apiClient.post('/auth/login', data);
export const register = (data) => apiClient.post('/users/register', data);
export const forgotPassword = (email) =>
  apiClient.post('/users/forgot-password', { email });
export const resetPassword = (data) => apiClient.post('/users/reset-password', data);
export const logout = (token) => apiClient.post('/auth/logout', null, {
  headers: { 'Authorization': token }
});

// User Profile - Backend uses /users/me
export const getUserProfile = () => apiClient.get('/users/me');
export const updateUserProfile = (data) => apiClient.put('/users/me', data);
export const changePassword = (data) => apiClient.post('/auth/change-password', data);

// ============ CART APIs (User-specific) ============

// Get current user's ID from localStorage
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.userId || user.id;
};

export const getCart = () => {
  const userId = getCurrentUserId();
  if (!userId) return Promise.reject(new Error('Not logged in'));
  return apiClient.get(`/cart/${userId}`);
};

export const addToCart = (data) => {
  const userId = getCurrentUserId();
  if (!userId) return Promise.reject(new Error('Not logged in'));
  return apiClient.post(`/cart/${userId}/add?bookId=${data.bookId}&quantity=${data.quantity}`);
};

export const updateCartItem = (bookId, quantity) => {
  const userId = getCurrentUserId();
  if (!userId) return Promise.reject(new Error('Not logged in'));
  return apiClient.put(`/cart/${userId}/update?bookId=${bookId}&quantity=${quantity}`);
};

export const removeCartItem = (bookId) => {
  const userId = getCurrentUserId();
  if (!userId) return Promise.reject(new Error('Not logged in'));
  return apiClient.delete(`/cart/${userId}/remove?bookId=${bookId}`);
};

export const clearCart = () => {
  const userId = getCurrentUserId();
  if (!userId) return Promise.reject(new Error('Not logged in'));
  return apiClient.delete(`/cart/${userId}/clear`);
};

// ============ ORDER APIs ============

// Get current user's orders with pagination - Backend uses /orders/my-orders
export const getOrders = (params = {}) => {
  const queryParams = { ...params };
  // Backend expects page (1-based, default 1) and size (default 10)
  // Frontend uses 0-based page, so convert: pageNo = page + 1
  if (queryParams.page !== undefined) {
    queryParams.page = queryParams.page + 1;
  }
  return apiClient.get('/orders/my-orders', { params: queryParams });
};
export const getOrderById = (orderId) => apiClient.get(`/orders/${orderId}`);
export const createOrder = (data) => apiClient.post('/orders/checkout', data);
export const cancelOrder = (orderId) => apiClient.put(`/orders/${orderId}/cancel`);

// ============ REVIEW APIs ============

// Get reviews by book - Backend uses /reviews/book/{bookId} with pagination
export const getReviewsByBookId = (bookId, page = 1, size = 1000) => apiClient.get(`/reviews/book/${bookId}?page=${page}&size=${size}`);

// Create review - Backend uses POST /reviews with bookId in body
export const createReview = (bookId, data) => apiClient.post('/reviews', {
  bookId,
  rating: data.rating,
  comment: data.comment
});

// ============ ADMIN APIs ============

const getAdminClient = () => {
  const adminClient = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  adminClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  adminClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
      return Promise.reject(error.response?.data || error);
    }
  );

  return adminClient;
};

// Dashboard
export const getDashboardStats = () => getAdminClient().get('/dashboard');

// Admin Books
export const getAllBooksAdmin = (params) => getAdminClient().get('/books/all', { params });
export const createBook = (formData) => getAdminClient().post('/books', formData);
export const updateBook = (id, formData) => getAdminClient().put(`/books/${id}`, formData);
export const deleteBook = (id) => getAdminClient().delete(`/books/${id}`);

// Admin Categories
export const getAllCategoriesAdmin = (params) => getAdminClient().get('/categories/all', { params });
export const createCategory = (data) => getAdminClient().post('/categories', data);
export const updateCategory = (id, data) => getAdminClient().put(`/categories/${id}`, data);
export const deleteCategory = (id) => getAdminClient().delete(`/categories/${id}`);

// Admin Users
export const getAllUsers = (params) => {
  const queryParams = { ...params };
  // Backend expects 1-based page (pageNo), frontend uses 0-based page
  if (queryParams.page !== undefined) {
    queryParams.pageNo = queryParams.page + 1;
    delete queryParams.page;
  }
  // Backend expects pageSize, frontend uses size
  if (queryParams.size !== undefined) {
    queryParams.pageSize = queryParams.size;
    delete queryParams.size;
  }
  // Backend expects search, frontend uses keyword
  if (queryParams.keyword !== undefined) {
    queryParams.search = queryParams.keyword;
    delete queryParams.keyword;
  }
  // Remove role filter if empty
  if (!queryParams.role) {
    delete queryParams.role;
  }
  return getAdminClient().get('/users', { params: queryParams });
};
export const updateUserRole = (id, role) => getAdminClient().put(`/users/${id}/role?role=${role}`);
export const deleteUser = (id) => getAdminClient().delete(`/users/${id}`);

// Admin Orders
export const getAllOrdersAdmin = (params) => getAdminClient().get('/orders', { params });
export const getOrderDetailAdmin = (id) => getAdminClient().get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => getAdminClient().put(`/orders/${id}/status?status=${status}`);
export const updatePaymentStatus = (id, status) => getAdminClient().put(`/orders/${id}/payment-status?status=${status}`);

// Admin Reviews
export const getAllReviewsAdmin = (params) => getAdminClient().get('/reviews', { params });
export const deleteReviewAdmin = (id) => getAdminClient().delete(`/reviews/${id}`);

// Admin Articles
export const getAllArticlesAdmin = (params) => getAdminClient().get('/articles/all', { params });
export const getArticleByIdAdmin = (id) => getAdminClient().get(`/articles/${id}`);
export const setArticleFeatured = (id, featured) => getAdminClient().put(`/articles/${id}/featured?featured=${featured}`);

// Create article with FormData (multipart)
export const createArticleAdmin = (data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('summary', data.summary || '');
  formData.append('content', data.content || '');
  formData.append('category', data.category || '');
  formData.append('authorName', data.authorName || '');
  formData.append('published', data.published !== false);
  if (data.image) {
    formData.append('image', data.image);
  }
  return axios.post(`${API_BASE_URL}/admin/articles`, formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update article with FormData (multipart)
export const updateArticleAdmin = (id, data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('summary', data.summary || '');
  formData.append('content', data.content || '');
  formData.append('category', data.category || '');
  formData.append('authorName', data.authorName || '');
  if (data.published !== undefined) {
    formData.append('published', data.published);
  }
  if (data.image) {
    formData.append('image', data.image);
  }
  return axios.post(`${API_BASE_URL}/admin/articles/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteArticleAdmin = (id) => getAdminClient().delete(`/articles/${id}`);
