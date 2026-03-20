const API_BASE = '/api/v1'

function getToken() {
  return localStorage.getItem('token')
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

function setToken(token, refreshToken, user) {
  if (token) localStorage.setItem('token', token)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
  if (user) localStorage.setItem('user', JSON.stringify(user))
  window.dispatchEvent(new Event('cart-change'))
}

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

async function tryRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const res = await fetch(window.location.origin + API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(refreshToken)
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data.accessToken
    }
    return null
  } catch (e) {
    console.error('Refresh token failed:', e)
    return null
  }
}

async function apiRequest(method, path, body = null, params = {}) {
  const pathOnly = path.split('?')[0]
  const url = new URL(pathOnly, window.location.origin)
  url.pathname = API_BASE + pathOnly
  console.log('API Request URL before params:', url.toString())
  const pathSearch = path.includes('?') ? new URLSearchParams(path.split('?')[1]) : null
  if (pathSearch) {
    pathSearch.forEach((v, k) => url.searchParams.set(k, v))
  }
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v))
  })
  console.log('API Request URL final:', url.toString())

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
  // Thêm timestamp để tránh cache 304
  url.searchParams.set('_t', Date.now().toString())
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  // Nếu 401, thử refresh token và retry
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true

    const newToken = await tryRefreshToken()

    if (newToken) {
      // Retry với token mới
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      })
      onTokenRefreshed(newToken)
    } else {
      // Refresh thất bại, logout
      logout()
      window.location.href = '/dang-nhap'
    }

    isRefreshing = false
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    let message = errorText
    try {
      const parsed = JSON.parse(errorText)
      if (parsed && typeof parsed.message === 'string') message = parsed.message
    } catch (_) {}
    throw new Error(message)
  }

  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    // Backend trả về plain text (vd: "Change password successfully") thì coi như thành công
    return { message: text }
  }
}

export async function apiGet(path, params = {}) {
  return apiRequest('GET', path, null, params)
}

export async function apiPost(path, body = {}) {
  return apiRequest('POST', path, body)
}

export async function apiPut(path, body = {}) {
  return apiRequest('PUT', path, body)
}

export async function apiDelete(path) {
  return apiRequest('DELETE', path)
}

export async function apiPostForm(path, body) {
  const url = new URL(path, window.location.origin)
  url.pathname = API_BASE + path

  const headers = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Browser tự set Content-Type: multipart/form-data với boundary khi body là FormData

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body
  })

  if (res.status === 401) {
    logout()
    window.location.href = '/dang-nhap'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    throw new Error(errorText)
  }

  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function updateUser(userId, userData) {
  return apiPut(`/users/update/${userId}`, userData)
}

export function getUser() {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

export function isLoggedIn() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.removeItem('currentCartKey')
  window.dispatchEvent(new Event('cart-change'))
}

export { setToken }
