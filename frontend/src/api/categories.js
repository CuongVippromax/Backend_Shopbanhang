import { apiGet } from './client.js'

export function getCategories(params = {}) {
  console.log('getCategories called - using /categories/list')
  return apiGet('/categories/list', {})
}
