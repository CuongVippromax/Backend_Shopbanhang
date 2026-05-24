import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { googleCallback } from '../api/endpoints';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('Google callback page loaded', { code: !!code, error });

      // If there's an opener, send message to it
      const sendToOpener = (data) => {
        console.log('Sending to opener:', data);
        if (window.opener) {
          window.opener.postMessage(data, window.location.origin);
        } else {
          // If no opener, store in sessionStorage and redirect
          console.log('No opener found, storing in sessionStorage');
          sessionStorage.setItem('googleLoginData', JSON.stringify(data));
          // Redirect to home page
          window.location.href = '/';
        }
      };

      // Nếu có lỗi từ Google
      if (error) {
        sendToOpener({
          type: 'GOOGLE_LOGIN_ERROR',
          message: 'Người dùng hủy đăng nhập hoặc có lỗi xảy ra.'
        });
        setTimeout(() => window.close(), 2000);
        return;
      }

      // Nếu không có code (popup đã đóng mà không có code)
      if (!code) {
        sendToOpener({
          type: 'GOOGLE_LOGIN_ERROR',
          message: 'Không nhận được mã xác thực từ Google.'
        });
        setTimeout(() => window.close(), 2000);
        return;
      }

      try {
        // Gọi API để đổi code lấy tokens với redirectUri
        const redirectUri = `${window.location.origin}/google-callback`;
        console.log('Calling googleCallback with redirectUri:', redirectUri);
        const response = await googleCallback(code, redirectUri);
        const data = response?.data || response;

        console.log('Google callback response:', data);

        if (data.accessToken) {
          sendToOpener({
            type: 'GOOGLE_LOGIN_SUCCESS',
            data: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              userId: data.userId,
              username: data.username,
              email: data.email,
              fullName: data.fullName,
              imageUrl: data.imageUrl,
              role: data.role,
              provider: data.provider,
              isNewUser: data.isNewUser
            }
          });
        } else {
          sendToOpener({
            type: 'GOOGLE_LOGIN_ERROR',
            message: 'Đăng nhập Google thất bại.'
          });
        }
      } catch (err) {
        console.error('Google callback error:', err);
        sendToOpener({
          type: 'GOOGLE_LOGIN_ERROR',
          message: err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
        });
      }

      setTimeout(() => window.close(), 1000);
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '16px',
        background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4285f4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2 style={{ 
          color: '#333', 
          marginBottom: '10px',
          fontSize: '20px'
        }}>Đang xử lý đăng nhập Google</h2>
        <p style={{ color: '#666', margin: 0 }}>Vui lòng chờ trong giây lát...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GoogleCallbackPage;
