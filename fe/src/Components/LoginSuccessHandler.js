import { useEffect } from 'react';
import { useToast } from './Toast';

export default function LoginSuccessHandler({ children }) {
  const { loginSuccess, error } = useToast();

  useEffect(() => {
    // Check if there's a login success message stored
    const loginSuccessFlag = sessionStorage.getItem('loginSuccess');
    const loginMessage = sessionStorage.getItem('loginMessage');
    const loginError = sessionStorage.getItem('loginError');

    if (loginSuccessFlag === 'true' && loginMessage) {
      loginSuccess(loginMessage);
      sessionStorage.removeItem('loginSuccess');
      sessionStorage.removeItem('loginMessage');
    }

    if (loginError) {
      error(loginError);
      sessionStorage.removeItem('loginError');
    }
  }, [loginSuccess, error]);

  return children;
}
