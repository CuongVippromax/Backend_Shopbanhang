import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import { tokenStorage } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      const profile = res?.data || res;
      const next = { ...(tokenStorage.getUser() || {}), ...profile };
      tokenStorage.setUser(next);
      setUser(next);
      return next;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenStorage.get();
      if (token) {
        await refreshProfile();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshProfile]);

  const login = useCallback(async (usernameOrEmail, password) => {
    const res = await authApi.login(usernameOrEmail, password);
    tokenStorage.set(res.accessToken, res.refreshToken);
    const profile = {
      userId: res.userId,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      phone: res.phone,
      address: res.address,
      role: res.role,
    };
    tokenStorage.setUser(profile);
    setUser(profile);
    return profile;
  }, []);

  const loginWithOAuth = useCallback((data) => {
    tokenStorage.set(data.accessToken, data.refreshToken);
    const profile = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      imageUrl: data.imageUrl,
      role: data.role,
      provider: data.provider,
    };
    tokenStorage.setUser(profile);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    tokenStorage.clear();
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      tokenStorage.setUser(next);
      return next;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    loginWithOAuth,
    logout,
    refreshProfile,
    updateUserLocal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
