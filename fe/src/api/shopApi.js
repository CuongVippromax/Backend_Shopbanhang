import axiosClient from './axiosClient';

/* ===== Helpers to normalize backend response envelopes ===== */
// PageResponse: { pageNo, pageSize, totalElements, totalPages, data }
// DataResponse: { statusCode, message, data }
// ResponseObject: { code, message, data }
export const unwrap = (resp) => {
  if (resp == null) return resp;
  if (typeof resp === 'object' && 'data' in resp && (
    'statusCode' in resp || 'code' in resp || ('message' in resp && Object.keys(resp).length <= 3)
  )) {
    return resp.data;
  }
  return resp;
};

export const unwrapPage = (resp) => {
  // Returns { items, pageNo, pageSize, totalPages, totalElements }
  if (!resp) return { items: [], pageNo: 1, pageSize: 0, totalPages: 0, totalElements: 0 };
  if (Array.isArray(resp)) {
    return { items: resp, pageNo: 1, pageSize: resp.length, totalPages: 1, totalElements: resp.length };
  }
  const inner = resp.data && (resp.statusCode || resp.code) ? resp.data : resp;
  const items = Array.isArray(inner?.data) ? inner.data : (Array.isArray(inner?.items) ? inner.items : (Array.isArray(inner) ? inner : []));
  return {
    items,
    pageNo: inner?.pageNo ?? 1,
    pageSize: inner?.pageSize ?? items.length,
    totalPages: inner?.totalPages ?? 1,
    totalElements: inner?.totalElements ?? items.length,
  };
};

/* ===== Public APIs ===== */
export const bookApi = {
  getAll: (params = {}) =>
    axiosClient.get('/api/v1/books/all', { params }).then((r) => r.data),

  getById: (id) =>
    axiosClient.get(`/api/v1/books/${id}`).then((r) => r.data),

  getFlashSale: (limit = 8) =>
    axiosClient.get('/api/v1/books/flash-sale', { params: { limit } }).then((r) => r.data),

  getRandom: (limit = 8) =>
    axiosClient.get('/api/v1/books/random', { params: { limit } }).then((r) => r.data),
};

export const categoryApi = {
  list: () => axiosClient.get('/api/v1/categories/list').then((r) => r.data),
  getById: (id) => axiosClient.get(`/api/v1/categories/${id}`).then((r) => r.data),
  getBooks: (categoryId) =>
    axiosClient.get(`/api/v1/categories/${categoryId}/books`).then((r) => r.data),
};

export const cartApi = {
  get: (userId) => axiosClient.get(`/api/v1/cart/${userId}`).then((r) => r.data),
  add: (userId, bookId, quantity) =>
    axiosClient.post(`/api/v1/cart/${userId}/add`, null, { params: { bookId, quantity } })
      .then((r) => r.data),
  update: (userId, bookId, quantity) =>
    axiosClient.put(`/api/v1/cart/${userId}/update`, null, { params: { bookId, quantity } })
      .then((r) => r.data),
  remove: (userId, bookId) =>
    axiosClient.delete(`/api/v1/cart/${userId}/remove`, { params: { bookId } })
      .then((r) => r.data),
  clear: (userId) => axiosClient.delete(`/api/v1/cart/${userId}/clear`),
};

export const orderApi = {
  checkout: (payload) =>
    axiosClient.post('/api/v1/orders/checkout', payload).then((r) => r.data),
  myOrders: (page = 1, size = 10) =>
    axiosClient.get('/api/v1/orders/my-orders', { params: { page, size } }).then((r) => r.data),
  getById: (orderId) =>
    axiosClient.get(`/api/v1/orders/${orderId}`).then((r) => r.data),
  cancel: (orderId) =>
    axiosClient.put(`/api/v1/orders/${orderId}/cancel`).then((r) => r.data),
};

export const reviewApi = {
  getByBook: (bookId, page = 1, size = 10) =>
    axiosClient.get(`/api/v1/reviews/book/${bookId}`, { params: { page, size } }).then((r) => r.data),
  myReviews: () => axiosClient.get('/api/v1/reviews/my-reviews').then((r) => r.data),
  create: (payload) => axiosClient.post('/api/v1/reviews', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/api/v1/reviews/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/reviews/${id}`),
};

export const addressApi = {
  list: () => axiosClient.get('/api/v1/users/addresses').then((r) => r.data),
  create: (payload) => axiosClient.post('/api/v1/users/addresses', payload).then((r) => r.data),
  update: (id, payload) =>
    axiosClient.put(`/api/v1/users/addresses/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/users/addresses/${id}`),
  setDefault: (id) =>
    axiosClient.put(`/api/v1/users/addresses/${id}/default`).then((r) => r.data),
};

export const articleApi = {
  list: (pageNo = 0, pageSize = 9) =>
    axiosClient.get('/api/v1/articles', { params: { pageNo, pageSize, page: pageNo, size: pageSize } })
      .then((r) => r.data),
  featured: () => axiosClient.get('/api/v1/articles/featured').then((r) => r.data),
  getById: (id) => axiosClient.get(`/api/v1/articles/${id}`).then((r) => r.data),
};

export const faqApi = {
  list: () => axiosClient.get('/api/v1/faqs').then((r) => r.data),
  categories: () => axiosClient.get('/api/v1/faqs/categories').then((r) => r.data),
  match: (q) => axiosClient.get('/api/v1/faqs/match', { params: { q } }).then((r) => r.data),
};

export const chatbotApi = {
  send: (message, sessionId) =>
    axiosClient.post('/api/v1/chatbot', { message, sessionId }).then((r) => r.data),
};

export const paymentApi = {
  vnPay: (orderId, amount, bankCode) =>
    axiosClient.get('/api/v1/payment/vn-pay', { params: { orderId, amount, bankCode } })
      .then((r) => r.data),
};

/* ===== Admin APIs ===== */
export const adminBookApi = {
  list: (params = { page: 1, size: 20 }) =>
    axiosClient.get('/api/v1/admin/books/all', { params }).then((r) => r.data),
  create: (formData) =>
    axiosClient.post('/api/v1/admin/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  update: (id, formData) =>
    axiosClient.put(`/api/v1/admin/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/admin/books/${id}`),
};

export const adminCategoryApi = {
  list: (params = { pageNo: 1, pageSize: 100 }) =>
    axiosClient.get('/api/v1/admin/categories/all', { params }).then((r) => r.data),
  create: (payload) => axiosClient.post('/api/v1/admin/categories', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/api/v1/admin/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/admin/categories/${id}`),
};

export const adminOrderApi = {
  list: (params = { page: 0, size: 20 }) =>
    axiosClient.get('/api/v1/admin/orders', { params }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/api/v1/admin/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status) =>
    axiosClient.put(`/api/v1/admin/orders/${id}/status`, null, { params: { status } }).then((r) => r.data),
  updatePayment: (id, status) =>
    axiosClient.put(`/api/v1/admin/orders/${id}/payment-status`, null, { params: { status } }).then((r) => r.data),
};

export const adminArticleApi = {
  list: (params = { page: 0, size: 20 }) =>
    axiosClient.get('/api/v1/admin/articles/all', { params }).then((r) => r.data),
  create: (formData) =>
    axiosClient.post('/api/v1/admin/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  update: (id, formData) =>
    axiosClient.put(`/api/v1/admin/articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  setFeatured: (id, featured) =>
    axiosClient.put(`/api/v1/admin/articles/${id}/featured`, null, { params: { featured } }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/admin/articles/${id}`),
};

export const adminReviewApi = {
  list: (params = { page: 1, size: 20 }) =>
    axiosClient.get('/api/v1/admin/reviews', { params }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/admin/reviews/${id}`),
};

export const adminUserApi = {
  list: (params = { pageNo: 1, pageSize: 20 }) =>
    axiosClient.get('/api/v1/admin/users', { params }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/api/v1/admin/users/${id}`).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/api/v1/admin/users/${id}`),
  updateRole: (id, role) =>
    axiosClient.put(`/api/v1/admin/users/${id}/role`, null, { params: { role } }).then((r) => r.data),
};

export const adminDashboardApi = {
  stats: () => axiosClient.get('/api/v1/admin/dashboard').then((r) => r.data),
};
