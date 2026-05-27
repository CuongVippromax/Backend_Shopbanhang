import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../api/shopApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const emptyCart = { cartId: null, userId: null, items: [], totalItems: 0, totalPrice: 0 };

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user?.userId) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.get(user.userId);
      setCart(data || emptyCart);
    } catch (e) {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart(emptyCart);
  }, [isAuthenticated, fetchCart]);

  const requireLogin = () => {
    if (!isAuthenticated) {
      toast.show('Vui lòng đăng nhập để tiếp tục.', 'warning');
      return false;
    }
    return true;
  };

  const addItem = useCallback(async (bookId, quantity = 1) => {
    if (!requireLogin()) return false;
    try {
      const data = await cartApi.add(user.userId, bookId, quantity);
      setCart(data || emptyCart);
      toast.show('Đã thêm vào giỏ hàng', 'success');
      return true;
    } catch (e) {
      toast.show(e.response?.data?.message || 'Không thể thêm vào giỏ hàng', 'error');
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, isAuthenticated]);

  const updateItem = useCallback(async (bookId, quantity) => {
    if (!requireLogin()) return;
    try {
      const data = await cartApi.update(user.userId, bookId, quantity);
      setCart(data || emptyCart);
    } catch (e) {
      toast.show('Không thể cập nhật số lượng', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, isAuthenticated]);

  const removeItem = useCallback(async (bookId) => {
    if (!requireLogin()) return;
    try {
      const data = await cartApi.remove(user.userId, bookId);
      setCart(data || emptyCart);
      toast.show('Đã xoá khỏi giỏ hàng', 'info');
    } catch (e) {
      toast.show('Không thể xoá sản phẩm', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, isAuthenticated]);

  const clear = useCallback(async () => {
    if (!user?.userId) return;
    try {
      await cartApi.clear(user.userId);
      setCart(emptyCart);
    } catch (_) {}
  }, [user?.userId]);

  const value = {
    cart,
    loading,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
