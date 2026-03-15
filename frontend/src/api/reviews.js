import { apiGet, apiPost } from './client.js'

/**
 * Lấy danh sách bình luận/đánh giá theo sách (phân trang)
 * @param {string|number} bookId
 * @param {{ page?: number, size?: number }} params
 */
export function getReviewsByBook(bookId, params = {}) {
  const page = params.page ?? 1
  const size = params.size ?? 10
  return apiGet(`/reviews/book/${bookId}`, { page, size })
}

/**
 * Gửi bình luận/đánh giá (yêu cầu đăng nhập)
 * @param {{ bookId: number, rating: number, comment: string }} data
 */
export function addReview(data) {
  return apiPost('/reviews', data)
}
