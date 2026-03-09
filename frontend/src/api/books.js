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

export function getBookById(id) {
  return apiGet(`/books/${id}`)
}
