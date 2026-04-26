import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart } from '../api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is logged in
  const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !!(user.userId || user.id);
  };

  // Load cart from server
  const loadCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getCart();
      const items = data?.items || [];
      setCartItems(items);
      // Calculate total item count (sum of all quantities)
      const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalCount);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartCount(0);
      setCartItems([]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Initialize cart on mount and when user changes
  useEffect(() => {
    loadCart();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadCart();
      }
    };

    // Custom event for cart updates within same tab
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [loadCart]);

  // Add item to cart
  const addItem = async (bookId, quantity = 1) => {
    if (!isLoggedIn()) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return false;
    }

    try {
      await apiAddToCart({ bookId, quantity });
      await loadCart();
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  // Update item quantity
  const updateItem = async (bookId, quantity) => {
    if (!isLoggedIn()) return false;

    try {
      await updateCartItem(bookId, quantity);
      await loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  };

  // Remove item from cart
  const removeItem = async (bookId) => {
    if (!isLoggedIn()) return false;

    try {
      await removeCartItem(bookId);
      await loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
  };

  // Clear entire cart
  const clearAll = async () => {
    if (!isLoggedIn()) return false;

    try {
      await clearCart();
      setCartItems([]);
      setCartCount(0);
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  // Refresh cart manually
  const refresh = () => {
    return loadCart();
  };

  const value = {
    cartCount,
    cartItems,
    isLoading,
    isInitialized,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    refresh,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
