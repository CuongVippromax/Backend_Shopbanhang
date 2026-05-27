import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };

    scrollToTop();
  }, [pathname]);

  return null;
};

export default ScrollToTop;
