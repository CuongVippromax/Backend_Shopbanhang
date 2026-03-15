const CART_GUEST_KEY = 'cart_guest'

export function getCart() {
  const key = localStorage.getItem('currentCartKey') || CART_GUEST_KEY
  localStorage.setItem('currentCartKey', key)
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, '[]')
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setCart(items) {
  const key = localStorage.getItem('currentCartKey') || CART_GUEST_KEY
  localStorage.setItem(key, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-change'))
}

export function initCartForUser(userId) {
  const newKey = `cart_${userId}`
  localStorage.setItem('currentCartKey', newKey)
  if (!localStorage.getItem(newKey)) {
    localStorage.setItem(newKey, '[]')
  }
  window.dispatchEvent(new Event('cart-change'))
}

export function addToCart(item) {
  const cart = getCart()
  const existing = cart.find((i) => i.id === item.id)
  if (existing) {
    existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
  } else {
    cart.push({
      id: item.id,
      bookName: item.bookName,
      description: item.description ?? '',
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice ?? item.price,
      quantity: item.quantity ?? 1
    })
  }
  setCart(cart)
  return cart
}

export function removeFromCart(id) {
  const idStr = String(id)
  const cart = getCart().filter((i) => String(i.id) !== idStr)
  setCart(cart)
  return cart
}

export function updateQuantity(id, quantity) {
  if (quantity < 1) return removeFromCart(id)
  const cart = getCart()
  const idStr = String(id)
  const idx = cart.findIndex((i) => String(i.id) === idStr)
  if (idx === -1) return cart
  const next = cart.map((i, index) =>
    index === idx ? { ...i, quantity } : i
  )
  setCart(next)
  return next
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + (i.quantity || 1), 0)
}

/** Xóa toàn bộ giỏ hàng hiện tại (sau khi đặt hàng thành công) */
export function clearCart() {
  const key = localStorage.getItem('currentCartKey') || CART_GUEST_KEY
  localStorage.setItem(key, '[]')
  window.dispatchEvent(new Event('cart-change'))
}
