import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const OAuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    if (!accessToken || !refreshToken) {
      toast.show('Đăng nhập Google không thành công.', 'error');
      navigate('/auth/login', { replace: true });
      return;
    }
    loginWithOAuth({
      accessToken,
      refreshToken,
      userId: Number(userId),
      username: params.get('username') || '',
      email: params.get('email') || '',
      fullName: params.get('fullName') || '',
      imageUrl: params.get('imageUrl') || '',
      role: params.get('role') || 'USER',
      provider: 'GOOGLE',
    });
    toast.show('Đăng nhập Google thành công!', 'success');
    navigate('/', { replace: true });
  }, [params, loginWithOAuth, navigate, toast]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={40} label="Đang đăng nhập với Google…" />
    </div>
  );
};

export default OAuthCallbackPage;
