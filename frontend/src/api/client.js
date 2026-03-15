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
    'Content-Type': 'application/json'
  }
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
    let errorObj
    try {
      errorObj = JSON.parse(errorText)
      errorObj.statusCode = res.status
    } catch {
      errorObj = { message: errorText, statusCode: res.status }
    }
    throw new Error(JSON.stringify(errorObj))
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
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

export async function apiPostForm(path, params = {}) {
  return apiRequest('POST', path + '?' + new URLSearchParams(params))
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
