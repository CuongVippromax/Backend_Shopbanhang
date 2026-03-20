import { apiGet } from './client.js'

export function getBooks(params = {}) {
  const pageNo = params.pageNo ?? 1
  return apiGet('/books/all', {
    pageNo: pageNo < 1 ? 0 : pageNo - 1,
    pageSize: params.pageSize ?? 12,
    sortBy: params.sortBy ?? 'bookId:desc',
    search: params.search ?? '',
    category: params.category ?? '',
  })
}

/** API cho trang Sách bán chạy (/sach-moi) */
export function getBooksSachMoi() {
  return getBooks({ pageNo: 1, pageSize: 30, sortBy: 'bookId:desc' })
}

/** API cho trang Sách hay (/sach-hay) */
export function getBooksSachHay() {
  return getBooks({ pageNo: 1, pageSize: 30 })
}

export function getBookById(id) {
  return apiGet(`/books/${id}`)
}
