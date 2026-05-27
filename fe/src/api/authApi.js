import axiosClient from './axiosClient';

export const authApi = {
  login: (usernameOrEmail, password) =>
    axiosClient.post('/api/v1/auth/login', { usernameOrEmail, password }).then((r) => r.data),

  register: (payload) =>
    axiosClient.post('/api/v1/users/register', payload).then((r) => r.data),

  logout: () => axiosClient.post('/api/v1/auth/logout'),

  refresh: (refreshToken) =>
    axiosClient.post('/api/v1/auth/refresh', refreshToken, {
      headers: { 'Content-Type': 'text/plain' },
    }).then((r) => r.data),

  changePassword: (payload) =>
    axiosClient.post('/api/v1/auth/change-password', payload).then((r) => r.data),

  googleAuthUrl: () =>
    axiosClient.get('/api/v1/auth/google/url').then((r) => r.data),

  forgotPassword: (email) =>
    axiosClient.post('/api/v1/users/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, newPassword) =>
    axiosClient.post('/api/v1/users/reset-password', { token, newPassword }).then((r) => r.data),

  getMe: () => axiosClient.get('/api/v1/users/me').then((r) => r.data),

  updateMe: (payload) =>
    axiosClient.put('/api/v1/users/me', payload).then((r) => r.data),
};

export default authApi;
