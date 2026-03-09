import { apiGet } from './client.js'

export function getCategories(params = {}) {
  const pageNo = params.pageNo ?? 1
  return apiGet('/categories/all', {
    pageNo: pageNo < 1 ? 0 : pageNo - 1,
    pageSize: params.pageSize ?? 50,
    sortBy: params.sortBy ?? 'categoryId:asc',
    search: params.search ?? '',
  })
}
