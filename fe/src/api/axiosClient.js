import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

const TOKEN_KEY = 'hk_access_token';
const REFRESH_KEY = 'hk_refresh_token';
const USER_KEY = 'hk_user';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pending = [];

const queueRequest = (cb) => new Promise((resolve, reject) => pending.push({ resolve, reject, cb }));
const flushPending = (newToken, error) => {
  pending.forEach(({ resolve, reject, cb }) => {
    if (error) reject(error);
    else resolve(cb(newToken));
  });
  pending = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        tokenStorage.clear();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return queueRequest((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, refreshToken, {
          headers: { 'Content-Type': 'text/plain' },
        });
        const data = res.data;
        tokenStorage.set(data.accessToken, data.refreshToken);
        flushPending(data.accessToken, null);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        flushPending(null, err);
        tokenStorage.clear();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiBaseUrl = BASE_URL;
export default axiosClient;
