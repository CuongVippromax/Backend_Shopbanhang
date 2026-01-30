const API_BASE = '/api'

export async function fetchProducts(pageNo = 0, pageSize = 100) {
  const res = await fetch(`${API_BASE}/products?pageNo=${pageNo}&pageSize=${pageSize}`)
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Failed to fetch products')
  // PageResponse: { data: [...] }
  return body.data || body
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`)
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Failed to fetch categories')
  return body
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`)
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Failed to fetch product')
  return body
}

