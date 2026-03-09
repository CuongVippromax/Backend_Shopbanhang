const API_BASE = '/api/v1'

export async function apiGet(path, params = {}) {
  const url = new URL(path, window.location.origin)
  url.pathname = API_BASE + path
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json()
}

export async function apiPost(path, body = {}) {
  const url = new URL(path, window.location.origin)
  url.pathname = API_BASE + path
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json()
}

export async function apiPostForm(path, params = {}) {
  const url = new URL(path, window.location.origin)
  url.pathname = API_BASE + path
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json()
}
