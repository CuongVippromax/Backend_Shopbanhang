import { apiGet, apiPost, apiPostForm, apiPut, apiPutForm, apiDelete } from './client'

// FAQ - Admin
export const getAllFaqsAdmin = () => apiGet('/admin/faqs')
export const createFaq = (data) => apiPost('/admin/faqs', data)
export const updateFaq = (id, data) => apiPut(`/admin/faqs/${id}`, data)
export const deleteFaq = (id) => apiDelete(`/admin/faqs/${id}`)

// Dashboard
export const getDashboardStats = () => apiGet('/admin/dashboard')

// Orders - Admin
export const getAllOrders = (params) => apiGet('/admin/orders', params)
export const getOrderDetail = (orderId) => apiGet(`/admin/orders/${orderId}`)
export const updateOrderStatus = (orderId, status) =>
  apiPut(`/admin/orders/${orderId}/status?status=${status}`)
export const updatePaymentStatus = (orderId, status) =>
  apiPut(`/admin/orders/${orderId}/payment-status?status=${status}`)

// Books - Admin (CRUD)
export const getAllBooksAdmin = (params) => apiGet('/admin/books/all', params)
export const createBook = (data) => apiPostForm('/admin/books', data)
export const updateBook = (bookId, data) => apiPutForm(`/admin/books/${bookId}`, data)
export const deleteBook = (bookId) => apiDelete(`/admin/books/${bookId}`)

// Categories - Admin
export const getAllCategoriesAdmin = (params) => apiGet('/admin/categories/all', params)
export const createCategory = (data) => apiPost('/admin/categories', data)
export const updateCategory = (categoryId, data) => apiPut(`/admin/categories/${categoryId}`, data)
export const deleteCategory = (categoryId) => apiDelete(`/admin/categories/${categoryId}`)

// Users - Admin
export const getAllUsers = (params) => apiGet('/admin/users', params)
export const deleteUser = (userId) => apiDelete(`/admin/users/${userId}`)
export const updateUserRole = (userId, role) =>
  apiPut(`/admin/users/${userId}/role?role=${role}`)

// Reviews - Admin
export const getAllReviews = (params) => apiGet('/admin/reviews', params)
export const deleteReview = (reviewId) => apiDelete(`/admin/reviews/${reviewId}`)
